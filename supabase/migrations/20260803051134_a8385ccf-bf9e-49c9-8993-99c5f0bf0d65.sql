CREATE OR REPLACE FUNCTION public.get_customer_history(_phone text)
 RETURNS TABLE(total_orders integer, total_spent numeric, last_order_date timestamp with time zone, last_order_items text, first_order_date timestamp with time zone, legacy_count integer, online_count integer)
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'not authorized';
  END IF;

  RETURN QUERY
  WITH p AS (SELECT public.normalize_bd_phone(_phone) AS ph),
  combined AS (
    SELECT o.created_at AS dt, o.total AS amt,
           (SELECT string_agg(x->>'name' || ' x' || (x->>'quantity'), ', ')
              FROM jsonb_array_elements(o.items) x) AS itxt,
           'online'::text AS src
    FROM public.orders o, p
    WHERE public.normalize_bd_phone(o.phone) = p.ph AND o.status <> 'cancelled'
    UNION ALL
    SELECT coalesce(l.order_date::timestamptz, l.created_at), l.total, l.items_text, 'legacy'::text
    FROM public.legacy_orders l, p
    WHERE l.phone_normalized = p.ph AND l.source <> 'online'
  )
  SELECT
    count(*)::integer,
    coalesce(sum(amt), 0),
    max(dt),
    (SELECT itxt FROM combined ORDER BY dt DESC NULLS LAST LIMIT 1),
    min(dt),
    count(*) FILTER (WHERE src = 'legacy')::integer,
    count(*) FILTER (WHERE src = 'online')::integer
  FROM combined;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.get_customer_history(text) TO authenticated;