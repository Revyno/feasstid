"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Pesanan } from "@/types/database";
import { getCustomerSession } from "@/lib/auth-utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  ShoppingBag, 
  Clock, 
  Package, 
  CheckCircle2, 
  Plus, 
  ArrowRight,
  Sparkles
} from "lucide-react";

interface Stats {
  totalOrders: number;
  ordersInProcess: number;
  pendingOrders: number;
  readyForPickup: number;
}

const statusColorMap: Record<string, string> = {
  pending: "text-orange-600 border-orange-200 bg-orange-50",
  in_process: "text-blue-600 border-blue-200 bg-blue-50",
  ready: "text-emerald-600 border-emerald-200 bg-emerald-50",
  completed: "text-gray-500 border-gray-200 bg-gray-50 dark:bg-gray-800/50 dark:text-gray-400 dark:border-gray-700",
  cancelled: "text-red-600 border-red-200 bg-red-50",
};

const statusLabelMap: Record<string, string> = {
  pending: "Menunggu",
  in_process: "Diproses",
  ready: "Siap Ambil",
  completed: "Selesai",
  cancelled: "Dibatalkan",
};

export default function CustomerDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    ordersInProcess: 0,
    pendingOrders: 0,
    readyForPickup: 0,
  });
  const [orders, setOrders] = useState<Pesanan[]>([]);
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const customerSession = getCustomerSession();
      if (!customerSession) { setLoading(false); return; }
      setCustomer(customerSession);

      const supabase = createClient();
      const { data: ordersData } = await supabase
        .from("pesanans")
        .select("*")
        .eq("customer_id", customerSession.id)
        .order("created_at", { ascending: false });

      const myOrders = ordersData ?? [];
      setStats({
        totalOrders: myOrders.length,
        ordersInProcess: myOrders.filter((o) => o.status === "in_process").length,
        pendingOrders: myOrders.filter((o) => o.status === "pending").length,
        readyForPickup: myOrders.filter((o) => o.status === "ready").length,
      });
      setOrders(myOrders);
      setLoading(false);
    }
    load();
  }, []);

  const statCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      desc: "Semua Waktu",
      icon: <ShoppingBag className="w-5 h-5" />,
      iconBg: "bg-blue-100 dark:bg-blue-950/30",
      iconColor: "text-blue-500",
      gradient: "from-blue-50 to-white dark:from-blue-950/10 dark:to-gray-900",
    },
    {
      title: "Diproses",
      value: stats.ordersInProcess.toString().padStart(2, '0'),
      icon: <Package className="w-5 h-5" />,
      iconBg: "bg-blue-100 dark:bg-blue-950/30",
      iconColor: "text-blue-500",
      gradient: "from-blue-50 to-white dark:from-blue-950/10 dark:to-gray-900",
    },
    {
      title: "Menunggu",
      value: stats.pendingOrders.toString().padStart(2, '0'),
      icon: <Clock className="w-5 h-5" />,
      iconBg: "bg-orange-100 dark:bg-orange-950/30",
      iconColor: "text-orange-500",
      gradient: "from-orange-50 to-white dark:from-orange-950/10 dark:to-gray-900",
    },
    {
      title: "Siap Ambil",
      value: stats.readyForPickup.toString().padStart(2, '0'),
      icon: <CheckCircle2 className="w-5 h-5" />,
      iconBg: "bg-emerald-100 dark:bg-emerald-950/30",
      iconColor: "text-emerald-500",
      gradient: "from-emerald-50 to-white dark:from-emerald-950/10 dark:to-gray-900",
    },
  ];

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Greeting Banner */}
      {!loading && (
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-5 md:p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
          <div className="absolute bottom-0 right-12 w-16 h-16 bg-white/10 rounded-full -mb-6" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-orange-200" />
              <span className="text-orange-100 text-xs font-bold uppercase tracking-widest">Selamat Datang</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black tracking-tight mb-1">
              Halo, {customer?.name?.split(' ')[0] || 'Customer'}! 👋
            </h2>
            <p className="text-orange-100 text-xs md:text-sm">Pantau semua pesanan laundry sepatu Anda di sini.</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array(4).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse rounded-2xl">
              <CardContent className="p-4">
                <div className="h-3 bg-muted rounded w-2/3 mb-3" />
                <div className="h-7 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {statCards.map((c, i) => (
            <Card key={i} className={cn("rounded-2xl border-none shadow-sm bg-gradient-to-br", c.gradient)}>
              <CardContent className="p-4 md:p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={cn("p-2 rounded-xl", c.iconBg)}>
                    <span className={c.iconColor}>{c.icon}</span>
                  </div>
                  {c.desc && <span className="text-[10px] font-black bg-white dark:bg-gray-800 px-2 py-0.5 rounded-lg text-gray-400 tracking-wide uppercase hidden sm:block">{c.desc}</span>}
                </div>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-0.5 leading-tight">{c.title}</p>
                <p className="text-2xl md:text-3xl font-black text-gray-900 dark:text-gray-100">{c.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Recent Orders */}
      <Card className="rounded-2xl border-none shadow-sm">
        <CardHeader className="p-4 sm:p-5 pb-2 sm:pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm md:text-base font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">Pesanan Terakhir</CardTitle>
            <Link href="/customer/pesanan" className="text-xs font-bold text-orange-500 hover:underline decoration-2">
              Lihat Semua
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-5 pt-2">
          {orders.length > 0 ? (
            <div className="space-y-2.5">
              {orders.slice(0, 5).map((order) => (
                <Link key={order.id} href={`/customer/pesanan/${order.id}`}>
                  <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group cursor-pointer">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center shrink-0">
                      <ShoppingBag className="w-4 h-4 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-orange-500 text-xs md:text-sm group-hover:underline">{order.kode_pesanan}</span>
                        <Badge className={cn("px-2 py-px rounded-full font-bold text-[9px] uppercase border bg-transparent hidden sm:inline-flex", statusColorMap[order.status])}>
                          {statusLabelMap[order.status] || order.status}
                        </Badge>
                      </div>
                      <p className="text-[10px] md:text-xs text-gray-400 font-medium mt-0.5">
                        {new Date(order.tanggal_pesanan).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-gray-900 dark:text-gray-100 text-xs md:text-sm">
                        Rp {order.total_harga.toLocaleString('id-ID')}
                      </p>
                      <Badge className={cn("px-2 py-px rounded-full font-bold text-[9px] uppercase border bg-transparent sm:hidden mt-0.5", statusColorMap[order.status])}>
                        {statusLabelMap[order.status] || order.status}
                      </Badge>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-orange-500 transition-colors shrink-0 hidden sm:block" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="min-h-[240px] flex flex-col items-center justify-center text-center py-8 gap-4">
              <div className="bg-orange-50 dark:bg-orange-950/20 p-5 rounded-2xl">
                <ShoppingBag className="w-8 h-8 text-orange-500" />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900 dark:text-gray-100 mb-1 uppercase tracking-wide">Belum ada pesanan</h3>
                <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm max-w-xs">
                  Mulai hari ini dengan sepatu yang bersih dan wangi!
                </p>
              </div>
              <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl h-11 px-8 font-black shadow-lg shadow-orange-100 dark:shadow-none gap-2">
                <Link href="/customer/pesanan/create">
                  <Plus className="w-4 h-4" />
                  Buat Pesanan
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-gray-400 flex items-center gap-2">
        <span className="text-orange-500 p-1 bg-orange-50 dark:bg-orange-950/20 rounded-full font-bold">!</span>
        Pengerjaan standar 3-4 hari kerja. Express 24 jam tersedia.
      </p>
    </div>
  );
}
