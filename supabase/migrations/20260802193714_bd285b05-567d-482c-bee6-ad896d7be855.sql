-- Phone normalizer
CREATE OR REPLACE FUNCTION public.normalize_bd_phone(_phone text)
RETURNS text
LANGUAGE sql
IMMUTABLE
SET search_path = public
AS $$
  SELECT CASE
    WHEN d = '' THEN NULL
    WHEN d LIKE '880%' THEN d
    WHEN d LIKE '0%' THEN '88' || d
    WHEN length(d) = 10 AND d LIKE '1%' THEN '880' || d
    ELSE d
  END
  FROM (SELECT regexp_replace(coalesce(_phone,''), '[^0-9]', '', 'g') AS d) s
$$;

CREATE TABLE public.legacy_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name text NOT NULL,
  phone text NOT NULL,
  phone_normalized text GENERATED ALWAYS AS (public.normalize_bd_phone(phone)) STORED,
  address text NOT NULL DEFAULT '',
  items_text text NOT NULL DEFAULT '',
  total numeric NOT NULL DEFAULT 0,
  order_date date,
  note text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT 'notebook',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_legacy_orders_phone ON public.legacy_orders (phone_normalized);
CREATE INDEX idx_legacy_orders_date ON public.legacy_orders (order_date DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.legacy_orders TO authenticated;
GRANT ALL ON public.legacy_orders TO service_role;

ALTER TABLE public.legacy_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view legacy orders" ON public.legacy_orders
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert legacy orders" ON public.legacy_orders
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update legacy orders" ON public.legacy_orders
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete legacy orders" ON public.legacy_orders
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER update_legacy_orders_updated_at
BEFORE UPDATE ON public.legacy_orders
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Index for fast phone lookup on live orders
CREATE INDEX IF NOT EXISTS idx_orders_phone_norm ON public.orders (public.normalize_bd_phone(phone));

-- Combined customer history summary
CREATE OR REPLACE FUNCTION public.get_customer_history(_phone text)
RETURNS TABLE (
  total_orders integer,
  total_spent numeric,
  last_order_date timestamptz,
  last_order_items text,
  first_order_date timestamptz,
  legacy_count integer,
  online_count integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH p AS (SELECT public.normalize_bd_phone(_phone) AS ph),
  combined AS (
    SELECT o.created_at AS dt, o.total,
           (SELECT string_agg(x->>'name' || ' x' || (x->>'quantity'), ', ')
              FROM jsonb_array_elements(o.items) x) AS items_text,
           'online'::text AS src
    FROM public.orders o, p
    WHERE public.normalize_bd_phone(o.phone) = p.ph AND o.status <> 'cancelled'
    UNION ALL
    SELECT coalesce(l.order_date::timestamptz, l.created_at) AS dt, l.total, l.items_text, 'legacy'::text
    FROM public.legacy_orders l, p
    WHERE l.phone_normalized = p.ph
  )
  SELECT
    count(*)::integer,
    coalesce(sum(total), 0),
    max(dt),
    (SELECT items_text FROM combined ORDER BY dt DESC NULLS LAST LIMIT 1),
    min(dt),
    count(*) FILTER (WHERE src = 'legacy')::integer,
    count(*) FILTER (WHERE src = 'online')::integer
  FROM combined
$$;

REVOKE ALL ON FUNCTION public.get_customer_history(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_customer_history(text) TO authenticated, service_role;