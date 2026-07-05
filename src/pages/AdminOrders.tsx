import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Unlock, Package, Truck, XCircle, Clock, CheckCircle, Filter, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type OrderStatus = "pending" | "confirmed" | "delivered" | "cancelled";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  order_id: string;
  customer_name: string;
  phone: string;
  address: string;
  note: string;
  items: OrderItem[];
  subtotal: number;
  delivery_charge: number;
  total: number;
  status: OrderStatus;
  locked: boolean;
  created_at: string;
  updated_at: string;
}

const statusConfig: Record<OrderStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "পেন্ডিং", color: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: <Clock className="h-3.5 w-3.5" /> },
  confirmed: { label: "কনফার্মড", color: "bg-blue-100 text-blue-800 border-blue-300", icon: <CheckCircle className="h-3.5 w-3.5" /> },
  delivered: { label: "ডেলিভার্ড", color: "bg-green-100 text-green-800 border-green-300", icon: <Truck className="h-3.5 w-3.5" /> },
  cancelled: { label: "ক্যান্সেলড", color: "bg-red-100 text-red-800 border-red-300", icon: <XCircle className="h-3.5 w-3.5" /> },
};

const ORDERS_PER_PAGE = 10;

const ADMIN_PASSWORD = "bismillah2025";

const AdminOrders = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleLogin = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem("admin_auth", "true");
    } else {
      toast.error("পাসওয়ার্ড ভুল হয়েছে!");
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem("admin_auth") === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("অর্ডার লোড করতে সমস্যা হয়েছে");
      console.error(error);
    } else {
      setOrders((data as unknown as Order[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchOrders();
  }, []);

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    const { error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("order_id", orderId);
    if (error) {
      toast.error("স্ট্যাটাস আপডেট করতে সমস্যা হয়েছে");
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.order_id === orderId ? { ...o, status, updated_at: new Date().toISOString() } : o))
      );
      toast.success("স্ট্যাটাস আপডেট হয়েছে");
    }
  };

  const toggleLock = async (orderId: string) => {
    const order = orders.find((o) => o.order_id === orderId);
    if (!order) return;
    const { error } = await supabase
      .from("orders")
      .update({ locked: !order.locked, updated_at: new Date().toISOString() })
      .eq("order_id", orderId);
    if (error) {
      toast.error("লক আপডেট করতে সমস্যা হয়েছে");
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.order_id === orderId ? { ...o, locked: !o.locked } : o))
      );
    }
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const totalPages = Math.ceil(filtered.length / ORDERS_PER_PAGE);
  const paginatedOrders = filtered.slice((currentPage - 1) * ORDERS_PER_PAGE, currentPage * ORDERS_PER_PAGE);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const counts = {
    all: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("bn-BD", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="container py-20 flex flex-col items-center gap-4">
        <Lock className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-bold text-foreground">অ্যাডমিন লগইন</h2>
        <input
          type="password"
          placeholder="পাসওয়ার্ড দিন"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          className="border border-border rounded-lg px-4 py-2 w-64 text-center bg-card text-foreground"
        />
        <Button onClick={handleLogin}>প্রবেশ করুন</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container py-20 text-center">
        <RefreshCw className="mx-auto h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">অর্ডার লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!loading && orders.length === 0) {
    return (
      <div className="container py-20 text-center">
        <Package className="mx-auto h-16 w-16 text-muted-foreground/50" />
        <h2 className="mt-4 text-xl font-bold text-foreground">কোনো অর্ডার নেই</h2>
        <p className="mt-2 text-sm text-muted-foreground">এখনো কোনো অর্ডার আসেনি।</p>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Package className="h-6 w-6 text-primary" />
          অর্ডার ম্যানেজমেন্ট
        </h1>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={fetchOrders} className="text-xs">
            <RefreshCw className="h-3 w-3 mr-1" /> রিফ্রেশ
          </Button>
          <span className="text-sm text-muted-foreground">মোট: {orders.length}টি</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        {(["all", "pending", "confirmed", "delivered", "cancelled"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
              filter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-muted-foreground border-border hover:bg-accent"
            }`}
          >
            {f === "all" ? <Filter className="h-3 w-3" /> : statusConfig[f].icon}
            {f === "all" ? "সব" : statusConfig[f].label}
            <span className="ml-1 rounded-full bg-background/20 px-1.5 text-[10px]">{counts[f]}</span>
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {paginatedOrders.map((order) => {
          const isExpanded = expandedId === order.id;
          const cfg = statusConfig[order.status];

          return (
            <div
              key={order.id}
              className={`rounded-xl border bg-card overflow-hidden transition-all ${
                order.locked ? "border-yellow-400/50 bg-yellow-50/5" : "border-border"
              }`}
            >
              {/* Header - always visible */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-primary">{order.order_id}</span>
                    {order.locked && <Lock className="h-3 w-3 text-yellow-600" />}
                  </div>
                  <p className="text-sm font-semibold text-foreground truncate">{order.customer_name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(order.created_at)}
                    </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${cfg.color}`}>
                    {cfg.icon} {cfg.label}
                  </span>
                      <span className="text-sm font-bold text-primary">৳{Number(order.total)}</span>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="border-t border-border px-4 pb-4 pt-3 space-y-4">
                  {/* Customer info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">📞 ফোন</p>
                      <a href={`tel:${order.phone}`} className="font-medium text-primary underline">{order.phone}</a>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">📍 ঠিকানা</p>
                      <p className="font-medium text-foreground">{order.address}</p>
                    </div>
                    {order.note && (
                      <div className="sm:col-span-2 space-y-1">
                        <p className="text-xs text-muted-foreground">📝 নোট</p>
                        <p className="font-medium text-foreground">{order.note}</p>
                      </div>
                    )}
                  </div>

                  {/* Products */}
                  <div className="rounded-lg bg-muted/30 p-3 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">📦 পণ্যসমূহ</p>
                    {order.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-foreground">{item.name} × {item.quantity}</span>
                        <span className="font-medium text-foreground">৳{item.price * item.quantity}</span>
                      </div>
                    ))}
                    <div className="border-t border-border pt-2 mt-2 space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">সাবটোটাল</span>
                        <span>৳{Number(order.subtotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">ডেলিভারি</span>
                        <span>{Number(order.delivery_charge) === 0 ? "ফ্রি" : `৳${Number(order.delivery_charge)}`}</span>
                      </div>
                      <div className="flex justify-between font-bold text-base">
                        <span>মোট</span>
                        <span className="text-primary">৳{Number(order.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground">⚡ অ্যাকশন</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant={order.locked ? "default" : "outline"}
                        onClick={() => toggleLock(order.order_id)}
                        className="text-xs"
                      >
                        {order.locked ? <Lock className="h-3.5 w-3.5 mr-1" /> : <Unlock className="h-3.5 w-3.5 mr-1" />}
                        {order.locked ? "লক আছে" : "লক করুন"}
                      </Button>

                      {!order.locked && (
                        <>
                          {order.status !== "confirmed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(order.order_id, "confirmed")}
                              className="text-xs border-blue-300 text-blue-700 hover:bg-blue-50"
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-1" /> কনফার্ম
                            </Button>
                          )}
                          {order.status !== "delivered" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(order.order_id, "delivered")}
                              className="text-xs border-green-300 text-green-700 hover:bg-green-50"
                            >
                              <Truck className="h-3.5 w-3.5 mr-1" /> ডেলিভার্ড
                            </Button>
                          )}
                          {order.status !== "cancelled" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateStatus(order.order_id, "cancelled")}
                              className="text-xs border-red-300 text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" /> ক্যান্সেল
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                    {order.locked && (
                      <p className="text-xs text-yellow-600">🔒 অর্ডার লক আছে। স্ট্যাটাস পরিবর্তন করতে আনলক করুন।</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6 pb-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="text-xs"
          >
            ← আগের
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`h-8 w-8 rounded-full text-xs font-medium transition-colors ${
                currentPage === page
                  ? "bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground border border-border hover:bg-accent"
              }`}
            >
              {page}
            </button>
          ))}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="text-xs"
          >
            পরের →
          </Button>
        </div>
      )}

      <p className="text-center text-xs text-muted-foreground pb-4">
        মোট {filtered.length}টি অর্ডারের মধ্যে {(currentPage - 1) * ORDERS_PER_PAGE + 1}-{Math.min(currentPage * ORDERS_PER_PAGE, filtered.length)}টি দেখাচ্ছে
      </p>
    </div>
  );
};

export default AdminOrders;
