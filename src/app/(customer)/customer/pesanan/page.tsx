"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { 
  Plus, 
  Search, 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Truck,
  X,
  Package,
  Clock,
  CheckCircle2,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { getCustomerSession } from "@/lib/auth-utils";

const orderStatusMap: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Menunggu", color: "bg-orange-100 text-orange-600 border-orange-200", icon: Clock },
  in_process: { label: "Diproses", color: "bg-blue-100 text-blue-600 border-blue-200", icon: Package },
  ready: { label: "Siap Ambil", color: "bg-yellow-100 text-yellow-600 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900/50", icon: CheckCircle2 },
  completed: { label: "Selesai", color: "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700", icon: CheckCircle2 },
  cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50", icon: X },
};

const paymentStatusMap: Record<string, { label: string; color: string }> = {
  paid: { label: "Lunas", color: "text-emerald-500" },
  pending: { label: "Belum Bayar", color: "text-orange-500" },
  failed: { label: "Gagal", color: "text-red-500" },
  refund: { label: "Refund", color: "text-red-500" },
};

export default function CustomerOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  useEffect(() => {
    async function loadOrders() {
      const customerData = getCustomerSession();
      if (!customerData) { setLoading(false); return; }
      const supabase = createClient();
      const { data } = await supabase
        .from("pesanans")
        .select("*, detail_pesanans(*), pembayarans(*)")
        .eq("customer_id", customerData.id)
        .order("created_at", { ascending: false });
      if (data) {
        setOrders(data.map(d => ({
          ...d,
          status_bayar: d.pembayarans?.[0]?.status_pembayaran || "pending",
          items_count: d.detail_pesanans?.reduce((acc: number, curr: any) => acc + (curr.jumlah_pasang || 1), 0) || 0
        })));
      }
      setLoading(false);
    }
    loadOrders();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.kode_pesanan.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter || order.status_bayar === statusFilter;
    let matchesDate = true;
    if (dateRange.from || dateRange.to) {
      const orderDate = new Date(order.tanggal_pesanan);
      orderDate.setHours(0, 0, 0, 0);
      if (dateRange.from) {
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        if (orderDate < fromDate) matchesDate = false;
      }
      if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(0, 0, 0, 0);
        if (orderDate > toDate) matchesDate = false;
      }
    }
    return matchesSearch && matchesStatus && matchesDate;
  });

  return (
    <div className="space-y-5 md:space-y-6 animate-in fade-in duration-500">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Pesanan Saya</h1>
          <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm mt-0.5">Kelola dan pantau status laundry Anda secara real-time.</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-10 shadow-md hover:scale-105 active:scale-95 transition-all self-start sm:self-auto">
          <Link href="/customer/pesanan/create" className="flex items-center gap-2 px-4">
            <Plus className="w-4 h-4 stroke-[3px]" />
            <span className="font-bold text-sm">New Pesanan</span>
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 p-3 md:p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <div className="flex flex-wrap items-center gap-2 md:gap-3">
          <div className="relative flex-1 min-w-[130px] group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
            <Input
              placeholder="Cari kode..."
              className="pl-9 h-9 md:h-10 border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl text-sm dark:text-gray-100"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
            <SelectTrigger className="h-9 md:h-10 min-w-[120px] rounded-xl border-orange-500 bg-orange-500 text-white font-bold px-3 focus:ring-0 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-gray-100 shadow-xl font-semibold">
              <SelectItem value="all">Semua</SelectItem>
              <SelectItem value="pending">Menunggu</SelectItem>
              <SelectItem value="in_process">Diproses</SelectItem>
              <SelectItem value="ready">Siap Ambil</SelectItem>
              <SelectItem value="completed">Selesai</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn(
                "h-9 md:h-10 px-3 rounded-xl border-orange-500 text-orange-500 font-bold bg-orange-50 hover:bg-orange-100 gap-2 border-2 text-sm",
                (dateRange.from || dateRange.to) && "bg-orange-100"
              )}>
                <CalendarIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {dateRange.from ? (
                    dateRange.to ? <>{format(dateRange.from, "dd MMM")} - {format(dateRange.to, "dd MMM")}</> : format(dateRange.from, "dd MMM yyyy")
                  ) : "Tanggal"}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{ from: dateRange.from, to: dateRange.to }}
                onSelect={(range: any) => setDateRange({ from: range?.from, to: range?.to })}
                numberOfMonths={1}
                className="rounded-2xl border border-gray-100 bg-white dark:bg-gray-900"
              />
            </PopoverContent>
          </Popover>

          {(search || statusFilter !== "all" || dateRange.from || dateRange.to) && (
            <Button
              variant="ghost"
              onClick={() => { setSearch(""); setStatusFilter("all"); setDateRange({ from: undefined, to: undefined }); }}
              className="h-9 md:h-10 px-3 rounded-xl text-gray-400 hover:text-red-500 gap-1.5 font-bold text-sm"
            >
              <X className="w-3.5 h-3.5" /> Reset
            </Button>
          )}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-3">
          {Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-100 dark:border-gray-800 animate-pulse">
              <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filteredOrders.length > 0 ? (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const status = orderStatusMap[order.status];
            const StatusIcon = status?.icon || Clock;
            const payment = paymentStatusMap[order.status_bayar];
            return (
              <div
                key={order.id}
                onClick={() => router.push(`/customer/pesanan/${order.id}`)}
                className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-orange-200 dark:hover:border-orange-900/50 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="p-4 md:p-5">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <Link href={`/customer/pesanan/${order.id}`}>
                        <span className="font-black text-orange-500 group-hover:underline decoration-2 underline-offset-4 text-sm md:text-base">
                          {order.kode_pesanan}
                        </span>
                      </Link>
                      <p className="text-xs text-gray-400 mt-0.5 font-medium">
                        {new Date(order.tanggal_pesanan).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge className={cn("px-2.5 py-0.5 rounded-full font-bold text-[10px] border bg-transparent", status?.color)}>
                        {status?.label || order.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Middle row */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                      {order.metode_pengantaran === 'pickup' ? (
                        <Truck className="w-3.5 h-3.5 text-orange-500" />
                      ) : (
                        <Package className="w-3.5 h-3.5 text-orange-500" />
                      )}
                      <span className="text-xs font-bold capitalize">{order.metode_pengantaran.replace('_', ' ')}</span>
                    </div>
                    <div className="text-xs font-bold text-gray-500 dark:text-gray-400">
                      {order.items_count} item{order.items_count > 1 ? 's' : ''}
                    </div>
                    <div className={cn("text-xs font-bold flex items-center gap-1 ml-auto", payment?.color)}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", order.status_bayar === 'paid' ? "bg-emerald-500" : "bg-orange-500")} />
                      {payment?.label || order.status_bayar}
                    </div>
                  </div>

                  {/* Bottom row */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 dark:border-gray-800">
                    <div>
                      <span className="text-[10px] text-gray-400 font-black uppercase tracking-wide">Total</span>
                      <p className="font-black text-gray-900 dark:text-gray-100 text-sm md:text-base">
                        Rp {order.total_harga.toLocaleString('id-ID')}
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:bg-orange-500 group-hover:text-white transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 py-16 flex flex-col items-center justify-center text-center gap-4">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-full">
            <Search className="w-7 h-7 text-gray-300 dark:text-gray-600" />
          </div>
          <div>
            <p className="font-bold text-gray-700 dark:text-gray-300 text-sm">Belum ada pesanan ditemukan</p>
            <p className="text-gray-400 text-xs mt-1">Coba ubah filter atau buat pesanan baru</p>
          </div>
          <Link href="/customer/pesanan/create">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-10 px-6 font-bold text-sm gap-2 shadow-md">
              <Plus className="w-4 h-4" />
              Buat Pesanan
            </Button>
          </Link>
        </div>
      )}

      {/* Summary footer */}
      {filteredOrders.length > 0 && (
        <div className="text-center">
          <p className="text-gray-400 text-xs font-medium">
            Menampilkan <span className="text-gray-700 dark:text-gray-300 font-bold">{filteredOrders.length}</span> dari <span className="text-gray-700 dark:text-gray-300 font-bold">{orders.length}</span> pesanan
          </p>
        </div>
      )}
    </div>
  );
}
