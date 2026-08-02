import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Search, Upload, Plus, Trash2, History, Package, ArrowLeft, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LegacyOrder {
  id: string;
  customer_name: string;
  phone: string;
  phone_normalized: string | null;
  address: string;
  items_text: string;
  total: number;
  order_date: string | null;
  note: string;
}

interface HistorySummary {
  total_orders: number;
  total_spent: number;
  last_order_date: string | null;
  last_order_items: string | null;
  first_order_date: string | null;
  legacy_count: number;
  online_count: number;
}

const normalizePhone = (p: string) => {
  const d = (p || "").replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("880")) return d;
  if (d.startsWith("0")) return "88" + d;
  if (d.length === 10 && d.startsWith("1")) return "880" + d;
  return d;
};

const fmtDate = (iso: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return iso.slice(0, 10);
  }
};

const emptyForm = { customer_name: "", phone: "", address: "", items_text: "", total: "", order_date: "", note: "" };

const AdminCustomers = () => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [rows, setRows] = useState<LegacyOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [summary, setSummary] = useState<HistorySummary | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) {
        navigate("/auth", { replace: true });
        return;
      }
      const { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", sess.session.user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!role) {
        toast.error("আপনার অ্যাডমিন অ্যাক্সেস নেই");
        await supabase.auth.signOut();
        navigate("/auth", { replace: true });
        return;
      }
      setIsAdmin(true);
      setAuthChecking(false);
    };
    check();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) navigate("/auth", { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const load = useCallback(async () => {
    setLoading(true);
    let q = supabase.from("legacy_orders").select("*").order("order_date", { ascending: false, nullsFirst: false }).limit(200);
    const ph = normalizePhone(query);
    if (ph.length >= 6) {
      q = supabase
        .from("legacy_orders")
        .select("*")
        .eq("phone_normalized", ph)
        .order("order_date", { ascending: false, nullsFirst: false });
    } else if (query.trim()) {
      q = supabase
        .from("legacy_orders")
        .select("*")
        .ilike("customer_name", `%${query.trim()}%`)
        .order("order_date", { ascending: false, nullsFirst: false })
        .limit(200);
    }
    const { data, error } = await q;
    if (error) toast.error("ডাটা লোড করতে সমস্যা হয়েছে");
    else setRows((data as LegacyOrder[]) || []);
    setLoading(false);
  }, [query]);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const lookupHistory = async () => {
    const ph = normalizePhone(query);
    if (ph.length < 6) {
      toast.error("পূর্ণ ফোন নম্বর দিন");
      return;
    }
    const { data, error } = await supabase.rpc("get_customer_history", { _phone: ph });
    if (error) {
      toast.error("হিস্টোরি আনতে সমস্যা হয়েছে");
      return;
    }
    const row = Array.isArray(data) ? (data[0] as HistorySummary) : (data as HistorySummary);
    setSummary(row || null);
    load();
  };

  const addOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customer_name.trim() || !form.phone.trim()) {
      toast.error("নাম ও ফোন নম্বর দিন");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("legacy_orders").insert({
      customer_name: form.customer_name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
      items_text: form.items_text.trim(),
      total: Number(form.total) || 0,
      order_date: form.order_date || null,
      note: form.note.trim(),
    });
    setSaving(false);
    if (error) {
      toast.error("সেভ করতে সমস্যা হয়েছে");
      return;
    }
    toast.success("পুরনো অর্ডার যোগ হয়েছে");
    setForm(emptyForm);
    load();
  };

  const removeRow = async (id: string) => {
    const { error } = await supabase.from("legacy_orders").delete().eq("id", id);
    if (error) toast.error("মুছতে সমস্যা হয়েছে");
    else {
      setRows((prev) => prev.filter((r) => r.id !== id));
      toast.success("মুছে ফেলা হয়েছে");
    }
  };

  const parseCsv = (text: string): string[][] => {
    const out: string[][] = [];
    let row: string[] = [];
    let cur = "";
    let inQ = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (inQ) {
        if (c === '"' && text[i + 1] === '"') { cur += '"'; i++; }
        else if (c === '"') inQ = false;
        else cur += c;
      } else if (c === '"') inQ = true;
      else if (c === ",") { row.push(cur); cur = ""; }
      else if (c === "\n") { row.push(cur); out.push(row); row = []; cur = ""; }
      else if (c !== "\r") cur += c;
    }
    if (cur || row.length) { row.push(cur); out.push(row); }
    return out.filter((r) => r.some((c) => c.trim()));
  };

  const handleFile = async (file: File) => {
    setImporting(true);
    try {
      const text = await file.text();
      const table = parseCsv(text);
      if (table.length < 2) throw new Error("ফাইলে ডাটা নেই");
      const header = table[0].map((h) => h.trim().toLowerCase());
      const idx = (...names: string[]) => header.findIndex((h) => names.some((n) => h.includes(n)));
      const iName = idx("name", "নাম");
      const iPhone = idx("phone", "mobile", "ফোন", "মোবাইল");
      const iAddr = idx("address", "ঠিকানা");
      const iItems = idx("item", "product", "পণ্য", "ঔষধ");
      const iTotal = idx("total", "amount", "টাকা", "মোট");
      const iDate = idx("date", "তারিখ");
      const iNote = idx("note", "নোট");

      if (iName < 0 || iPhone < 0) throw new Error("CSV-তে name ও phone কলাম থাকতে হবে");

      const records = table.slice(1).map((r) => {
        const rawDate = iDate >= 0 ? (r[iDate] || "").trim() : "";
        const parsed = rawDate ? new Date(rawDate) : null;
        return {
          customer_name: (r[iName] || "").trim(),
          phone: (r[iPhone] || "").trim(),
          address: iAddr >= 0 ? (r[iAddr] || "").trim() : "",
          items_text: iItems >= 0 ? (r[iItems] || "").trim() : "",
          total: iTotal >= 0 ? Number((r[iTotal] || "").replace(/[^\d.]/g, "")) || 0 : 0,
          order_date: parsed && !isNaN(parsed.getTime()) ? parsed.toISOString().slice(0, 10) : null,
          note: iNote >= 0 ? (r[iNote] || "").trim() : "",
        };
      }).filter((r) => r.customer_name && r.phone);

      if (!records.length) throw new Error("বৈধ কোনো সারি পাওয়া যায়নি");

      let inserted = 0;
      for (let i = 0; i < records.length; i += 500) {
        const chunk = records.slice(i, i + 500);
        const { error } = await supabase.from("legacy_orders").insert(chunk);
        if (error) throw new Error(error.message);
        inserted += chunk.length;
      }
      toast.success(`${inserted} টি পুরনো অর্ডার ইমপোর্ট হয়েছে`);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ইমপোর্ট ব্যর্থ হয়েছে");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  if (authChecking) {
    return <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground">লোড হচ্ছে…</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">কাস্টমার হিস্টোরি</h1>
          <p className="text-sm text-muted-foreground">পুরনো (নোটবুক) অর্ডার সংরক্ষণ ও রিপিট কাস্টমার শনাক্তকরণ</p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin/orders"><ArrowLeft className="h-4 w-4 mr-1" /> অর্ডার তালিকা</Link>
        </Button>
      </div>

      {/* Search */}
      <div className="rounded-lg border bg-card p-4 mb-6">
        <Label className="mb-2 block">ফোন নম্বর বা নাম দিয়ে খুঁজুন</Label>
        <div className="flex gap-2 flex-wrap">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="01XXXXXXXXX"
            className="flex-1 min-w-[200px]"
            onKeyDown={(e) => e.key === "Enter" && lookupHistory()}
          />
          <Button onClick={lookupHistory}><Search className="h-4 w-4 mr-1" /> হিস্টোরি দেখুন</Button>
          <Button variant="outline" onClick={() => { setQuery(""); setSummary(null); }}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {summary && (
          <div className="mt-4 rounded-md border bg-muted/40 p-4">
            {summary.total_orders > 0 ? (
              <>
                <Badge className="mb-2">🔁 রিপিট কাস্টমার — {summary.total_orders} টি অর্ডার</Badge>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                  <div>মোট খরচ: <strong>৳{Number(summary.total_spent).toLocaleString()}</strong></div>
                  <div>নোটবুক: {summary.legacy_count} | অনলাইন: {summary.online_count}</div>
                  <div>প্রথম অর্ডার: {fmtDate(summary.first_order_date)}</div>
                  <div>শেষ অর্ডার: {fmtDate(summary.last_order_date)}</div>
                  {summary.last_order_items && (
                    <div className="sm:col-span-2">শেষ পণ্য: {summary.last_order_items}</div>
                  )}
                </div>
              </>
            ) : (
              <Badge variant="secondary">🆕 নতুন কাস্টমার — কোনো পুরনো অর্ডার নেই</Badge>
            )}
          </div>
        )}
      </div>

      {/* CSV import */}
      <div className="rounded-lg border bg-card p-4 mb-6">
        <h2 className="font-semibold mb-1 flex items-center gap-2"><Upload className="h-4 w-4" /> CSV/Excel ইমপোর্ট</h2>
        <p className="text-sm text-muted-foreground mb-3">
          কলাম হেডার: <code>name, phone, address, items, total, date, note</code> — অন্তত <code>name</code> ও <code>phone</code> লাগবে।
        </p>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <Button variant="outline" onClick={() => fileRef.current?.click()} disabled={importing}>
          {importing ? "ইমপোর্ট হচ্ছে…" : "CSV ফাইল নির্বাচন করুন"}
        </Button>
      </div>

      {/* Manual entry */}
      <form onSubmit={addOrder} className="rounded-lg border bg-card p-4 mb-6">
        <h2 className="font-semibold mb-3 flex items-center gap-2"><Plus className="h-4 w-4" /> ম্যানুয়াল এন্ট্রি</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label>কাস্টমারের নাম *</Label>
            <Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} />
          </div>
          <div>
            <Label>ফোন নম্বর *</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" />
          </div>
          <div className="sm:col-span-2">
            <Label>ঠিকানা</Label>
            <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label>পণ্য / ঔষধের বিবরণ</Label>
            <Input value={form.items_text} onChange={(e) => setForm({ ...form, items_text: e.target.value })} />
          </div>
          <div>
            <Label>মোট টাকা</Label>
            <Input type="number" value={form.total} onChange={(e) => setForm({ ...form, total: e.target.value })} />
          </div>
          <div>
            <Label>অর্ডারের তারিখ</Label>
            <Input type="date" value={form.order_date} onChange={(e) => setForm({ ...form, order_date: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <Label>নোট</Label>
            <Textarea rows={2} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
          </div>
        </div>
        <Button type="submit" className="mt-3" disabled={saving}>{saving ? "সেভ হচ্ছে…" : "যোগ করুন"}</Button>
      </form>

      {/* List */}
      <div className="rounded-lg border bg-card p-4">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <History className="h-4 w-4" /> পুরনো অর্ডার ({rows.length})
        </h2>
        {loading ? (
          <p className="text-sm text-muted-foreground">লোড হচ্ছে…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">কোনো পুরনো অর্ডার নেই।</p>
        ) : (
          <ul className="divide-y">
            {rows.map((r) => (
              <li key={r.id} className="py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">{r.customer_name} <span className="text-muted-foreground font-normal">· {r.phone}</span></p>
                  <p className="text-sm text-muted-foreground truncate">
                    <Package className="h-3.5 w-3.5 inline mr-1" />
                    {r.items_text || "বিবরণ নেই"} · ৳{Number(r.total).toLocaleString()} · {fmtDate(r.order_date)}
                  </p>
                  {r.address && <p className="text-xs text-muted-foreground truncate">{r.address}</p>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => removeRow(r.id)} aria-label="মুছুন">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminCustomers;
