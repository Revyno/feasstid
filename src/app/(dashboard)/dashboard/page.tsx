"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ReaderIcon,
  PersonIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  CardStackIcon,
} from "@radix-ui/react-icons";
import { LogOut, ChevronLeft, ChevronRight } from "lucide-react";

interface Stats {
  totalOrders: number;
  totalCustomers: number;
  completedOrders: number;
  orderSuccessRate: number;
  paidPayments: number;
  unpaidPayments: number;
  paymentSuccessRate: number;
}

interface ServiceStat {
  nama_layanan: string;
  kategori: string;
  total_pesanan: number;
  total_pasang: number;
  total_pemasukan: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalCustomers: 0,
    completedOrders: 0,
    orderSuccessRate: 0,
    paidPayments: 0,
    unpaidPayments: 0,
    paymentSuccessRate: 0,
  });
  const [serviceStats, setServiceStats] = useState<ServiceStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Admin Laundry");
  const [cabang, setCabang] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const { data: authUser } = await supabase.auth.getUser();
      if (authUser.user) {
        setUserName(
          authUser.user.user_metadata?.username ||
          authUser.user.email?.split("@")[0] ||
          "Admin Laundry"
        );
        // Baca cabang dari tabel users publik berdasarkan email
        if (authUser.user.email) {
          const { data: userData } = await supabase
            .from("users")
            .select("cabang")
            .eq("email", authUser.user.email)
            .single();
          if (userData?.cabang) {
            setCabang(userData.cabang);
          }
        }
      }

      const [ordersRes, customersRes, paymentsRes, detailRes, layanansRes] = await Promise.all([
        supabase.from("pesanans").select("id, status"),
        supabase.from("customers").select("id", { count: "exact", head: true }),
        supabase.from("pembayarans").select("id, status_pembayaran, jumlah_bayar"),
        supabase.from("detail_pesanans").select("id, pesanan_id, jumlah_pasang, subtotal, layanans(nama_layanan, kategori)"),
        supabase.from("layanans").select("id, nama_layanan, kategori"),
      ]);

      const orders = ordersRes.data ?? [];
      const totalOrders = orders.length;
      const completedOrders = orders.filter((o) => ["completed", "delivered"].includes(o.status)).length;
      const orderSuccessRate = totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0;

      const payments = paymentsRes.data ?? [];
      const totalPayments = payments.length;
      const paidPayments = payments.filter((p) => p.status_pembayaran === "paid").length;
      const unpaidPayments = totalPayments - paidPayments;
      const paymentSuccessRate = totalPayments > 0 ? (paidPayments / totalPayments) * 100 : 0;

      setStats({
        totalOrders,
        totalCustomers: customersRes.count ?? 0,
        completedOrders,
        orderSuccessRate,
        paidPayments,
        unpaidPayments,
        paymentSuccessRate,
      });

      // Build service stats from detail_pesanans
      const details = detailRes.data ?? [];
      const layananMap: Record<string, ServiceStat> = {};
      for (const d of details) {
        const layanan = (d.layanans as any);
        if (!layanan) continue;
        const key = layanan.nama_layanan;
        if (!layananMap[key]) {
          layananMap[key] = {
            nama_layanan: layanan.nama_layanan,
            kategori: layanan.kategori ?? "-",
            total_pesanan: 0,
            total_pasang: 0,
            total_pemasukan: 0,
          };
        }
        layananMap[key].total_pesanan += 1;
        layananMap[key].total_pasang += d.jumlah_pasang ?? 0;
        layananMap[key].total_pemasukan += d.subtotal ?? 0;
      }
      setServiceStats(Object.values(layananMap));
      setLoading(false);
    }
    load();
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const statCards = [
    {
      title: "Total Orders",
      value: stats.totalOrders,
      desc: `Total pesanan yang telah dibuat`,
      icon: <ReaderIcon className="w-4 h-4" />,
      color: "text-blue-600",
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers,
      desc: `Total pelanggan terdaftar ${stats.totalCustomers}`,
      icon: <PersonIcon className="w-4 h-4" />,
      color: "text-emerald-600",
    },
    {
      title: "Order Success Rate",
      value: `${stats.orderSuccessRate.toFixed(1)}%`,
      desc: `${stats.completedOrders} dari ${stats.totalOrders} pesanan selesai`,
      icon: <CheckCircledIcon className="w-4 h-4" />,
      color: stats.orderSuccessRate >= 70 ? "text-emerald-600" : "text-red-500",
    },
    {
      title: "Unpaid Payments",
      value: stats.unpaidPayments,
      desc: "Pembayaran yang belum lunas",
      icon: <CrossCircledIcon className="w-4 h-4" />,
      color: "text-orange-500",
    },
    {
      title: "Paid Payments",
      value: stats.paidPayments,
      desc: "Pembayaran yang sudah lunas",
      icon: <CardStackIcon className="w-4 h-4" />,
      color: "text-emerald-600",
    },
    {
      title: "Payment Success Rate",
      value: `${stats.paymentSuccessRate.toFixed(1)}%`,
      desc: `${stats.paidPayments} dari ${stats.paidPayments + stats.unpaidPayments} pembayaran lunas`,
      icon: <CheckCircledIcon className="w-4 h-4" />,
      color: stats.paymentSuccessRate >= 70 ? "text-emerald-600" : "text-red-500",
    },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">
              {userName.slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl md:text-2xl font-black text-gray-900 dark:text-gray-100">Welcome</h1>
              {cabang && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-full text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block"></span>
                  {cabang}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{userName}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-colors self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 md:p-5 h-24 md:h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {statCards.map((c, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 md:p-5 hover:shadow-sm transition-shadow">
              <div className="flex items-center justify-between mb-2 md:mb-3">
                <span className="text-xs md:text-sm font-semibold text-gray-600 dark:text-gray-400 leading-tight">{c.title}</span>
                <span className={cn("p-1 md:p-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 flex-shrink-0", c.color)}>{c.icon}</span>
              </div>
              <div className={cn("text-2xl md:text-3xl font-black mb-1", c.color)}>{c.value}</div>
              <p className={cn("text-xs font-medium hidden sm:block", c.color)}>{c.desc} ⓘ</p>
            </div>
          ))}
        </div>
      )}

      {/* Populer Highlights */}
      {!loading && serviceStats.length > 0 && (
        <div className="space-y-3 md:space-y-4">
             <div className="flex items-center gap-2 px-1">
                <div className="w-1.5 h-4 bg-orange-500 rounded-full" />
                <h2 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">Populer Highlights</h2>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
                {[...serviceStats].sort((a, b) => b.total_pesanan - a.total_pesanan).slice(0, 3).map((s, i) => (
                    <div key={i} className="bg-white dark:bg-gray-900 p-4 md:p-6 rounded-2xl border border-gray-100 dark:border-gray-800 flex items-center gap-4 group hover:border-orange-200 transition-all">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center text-orange-500 font-black text-lg md:text-xl shadow-inner group-hover:scale-110 transition-transform flex-shrink-0">
                            {i+1}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 truncate">{s.kategori} Service</p>
                            <h3 className="font-black text-gray-900 dark:text-gray-100 truncate text-sm md:text-base">{s.nama_layanan}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs font-bold text-orange-600 dark:text-orange-400">{s.total_pesanan} Orders</span>
                                <div className="w-1 h-1 rounded-full bg-gray-200" />
                                <span className="text-xs font-bold text-gray-400">{s.total_pasang} Pairs</span>
                            </div>
                        </div>
                    </div>
                ))}
             </div>
        </div>
      )}

      {/* Service Statistics Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="p-4 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h2 className="text-base md:text-lg font-black text-gray-900 dark:text-gray-100">Statistik Layanan Populer</h2>
            <p className="text-xs text-gray-400 mt-0.5 hidden sm:block">Detailed breakdown of your most requested services</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-orange-300 rounded-lg text-xs font-bold text-orange-500 hover:bg-orange-50 transition-colors">
              ≡ Filter
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 border border-orange-300 rounded-lg text-xs font-bold text-orange-500 hover:bg-orange-50 transition-colors">
              ↓ Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="bg-orange-500 text-white text-xs font-black uppercase tracking-widest">
                <th className="text-left px-4 md:px-6 py-3">Nama Layanan</th>
                <th className="text-left px-3 md:px-4 py-3 hidden sm:table-cell">Kategori</th>
                <th className="text-center px-3 md:px-4 py-3">Pesanan</th>
                <th className="text-center px-3 md:px-4 py-3 hidden md:table-cell">Pasang</th>
                <th className="text-right px-4 md:px-6 py-3">Pemasukan</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-gray-50 dark:border-gray-800">
                    <td colSpan={5} className="px-6 py-4">
                      <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full" />
                    </td>
                  </tr>
                ))
              ) : serviceStats.length > 0 ? (
                serviceStats.map((s, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 md:px-6 py-3 md:py-4 font-semibold text-gray-900 dark:text-gray-100 text-sm">{s.nama_layanan}</td>
                    <td className="px-3 md:px-4 py-3 md:py-4 text-sm text-gray-600 dark:text-gray-400 hidden sm:table-cell">{s.kategori}</td>
                    <td className="px-3 md:px-4 py-3 md:py-4 text-center text-sm font-bold text-gray-900 dark:text-gray-100">{s.total_pesanan}</td>
                    <td className="px-3 md:px-4 py-3 md:py-4 text-center text-sm text-gray-600 dark:text-gray-400 hidden md:table-cell">{s.total_pasang} pasang</td>
                    <td className="px-4 md:px-6 py-3 md:py-4 text-right text-sm font-black text-gray-900 dark:text-gray-100">
                      Rp {s.total_pemasukan.toLocaleString("id-ID")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                    Belum ada data layanan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-4 md:px-6 py-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <span className="text-xs text-gray-400 font-medium">
            {serviceStats.length} Services
          </span>
          <div className="flex items-center gap-1">
            <button className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button className="w-6 h-6 rounded flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
