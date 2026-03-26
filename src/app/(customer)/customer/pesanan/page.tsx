"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar"
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Truck,
  Download,
  X
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

const orderStatusMap: Record<string, { label: string; color: string; icon?: any }> = {
  pending: { label: "Menunggu", color: "bg-orange-100 text-orange-600 border-orange-200" },
  in_process: { label: "Diproses", color: "bg-blue-100 text-blue-600 border-blue-200" },
  ready: { label: "Penjemputan", color: "bg-yellow-100 text-yellow-600 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900/50" },
  completed: { label: "Selesai", color: "bg-gray-100 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700" },
  cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50" },
};

const paymentStatusMap: Record<string, { label: string; color: string }> = {
  paid: { label: "Lunas", color: "text-emerald-500" },
  pending: { label: "Menunggu", color: "text-orange-500" },
  failed: { label: "Gagal", color: "text-red-500" },
  refund: { label: "Refund", color: "text-red-500" },
};

import { getCustomerSession } from "@/lib/auth-utils";

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
      if (!customerData) {
        setLoading(false);
        return;
      }

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
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 md:gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Pesanan Saya</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm md:text-lg">Kelola dan pantau status laundry Anda secara real-time.</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white rounded-2xl h-10 md:h-12 p-0 shadow-lg transition-all hover:scale-105 active:scale-95 overflow-hidden self-start sm:self-auto">
          <Link href="/customer/pesanan/create" className="flex items-center gap-2 px-4 md:px-6 h-full">
            <Plus className="w-4 h-4 md:w-5 md:h-5 stroke-[3px]" />
            <span className="font-bold text-sm md:text-base">New Pesanan</span>
          </Link>
        </Button>
      </div>

      <div className="bg-white dark:bg-gray-900 p-2 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {/* Filters Area */}
        <div className="p-3 md:p-6 pb-2 flex flex-wrap items-center gap-2 md:gap-4">
          <div className="relative flex-1 min-w-[140px] group">
            <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
            <Input
              placeholder="Cari kode..."
              className="pl-9 md:pl-12 h-10 md:h-12 border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl md:rounded-2xl focus-visible:ring-orange-500/20 focus-visible:border-orange-500 transition-all text-sm md:text-base dark:text-gray-100"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || "all")}>
            <SelectTrigger className="h-10 md:h-12 min-w-[130px] md:min-w-[160px] rounded-xl md:rounded-2xl border-orange-500 bg-orange-500 text-white font-bold px-3 md:px-5 focus:ring-0 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-gray-100 shadow-xl">
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="pending">Menunggu</SelectItem>
              <SelectItem value="in_process">Diproses</SelectItem>
              <SelectItem value="ready">Penjemputan</SelectItem>
              <SelectItem value="completed">Selesai</SelectItem>
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn(
                "h-10 md:h-12 px-3 md:px-5 rounded-xl md:rounded-2xl border-orange-500 text-orange-500 font-bold bg-orange-50 hover:bg-orange-100 gap-2 border-2 text-sm",
                (dateRange.from || dateRange.to) && "bg-orange-100"
              )}>
                <CalendarIcon className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {dateRange.from ? (
                    dateRange.to ? (
                      <>{format(dateRange.from, "dd MMM")} - {format(dateRange.to, "dd MMM")}</>
                    ) : (
                      format(dateRange.from, "dd MMM yyyy")
                    )
                  ) : (
                    "Tanggal"
                  )}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 rounded-2xl border-none shadow-2xl" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(range: any) => setDateRange({ from: range?.from, to: range?.to })}
                numberOfMonths={1}
                className="rounded-2xl border border-gray-100 bg-white dark:bg-gray-900"
              />
            </PopoverContent>
          </Popover>

          {(search || statusFilter !== "all" || dateRange.from || dateRange.to) && (
            <Button
              variant="ghost"
              onClick={() => {
                setSearch("");
                setStatusFilter("all");
                setDateRange({ from: undefined, to: undefined });
              }}
              className="h-10 md:h-12 px-3 md:px-4 rounded-xl text-gray-400 hover:text-red-500 gap-2 font-bold text-sm"
            >
              <X className="w-4 h-4" /> Reset
            </Button>
          )}
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto">
          <Table className="min-w-[1000px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b-gray-100 dark:border-b-gray-800">
                <TableHead className="py-6 px-8 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50">Kode Pesanan</TableHead>
                <TableHead className="py-6 px-4 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50">Tanggal Pesan</TableHead>
                <TableHead className="py-6 px-4 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 text-center">Estimasi Selesai</TableHead>
                <TableHead className="py-6 px-4 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50">Pengantaran</TableHead>
                <TableHead className="py-6 px-4 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 text-center">Items</TableHead>
                <TableHead className="py-6 px-4 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50">Total Harga</TableHead>
                <TableHead className="py-6 px-4 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 text-center">Status</TableHead>
                <TableHead className="py-6 px-8 text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest bg-gray-50/50 dark:bg-gray-800/50 text-center">Status Bayar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array(4).fill(0).map((_, i) => (
                  <TableRow key={i} className="animate-pulse border-b-gray-50">
                    <TableCell colSpan={8} className="py-8 px-8"><div className="h-4 bg-gray-100 rounded w-full" /></TableCell>
                  </TableRow>
                ))
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <TableRow 
                    key={order.id} 
                    onClick={() => router.push(`/customer/pesanan/${order.id}`)}
                    className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors border-b-gray-50 dark:border-b-gray-800 last:border-0 cursor-pointer"
                  >
                    <TableCell className="py-6 px-8">
                       <Link href={`/customer/pesanan/${order.id}`}>
                        <span className="font-black text-orange-500 group-hover:underline decoration-2 underline-offset-4">{order.kode_pesanan}</span>
                       </Link>
                    </TableCell>
                    <TableCell className="py-6 px-4 font-semibold text-gray-600 dark:text-gray-400">
                        {new Date(order.tanggal_pesanan).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="py-6 px-4 font-semibold text-gray-600 dark:text-gray-400 text-center">
                        {order.tanggal_selesai ? new Date(order.tanggal_selesai).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : "-"}
                    </TableCell>
                    <TableCell className="py-6 px-4">
                        <div className="flex items-center gap-3 text-gray-900 dark:text-gray-100 font-bold">
                            {order.metode_pengantaran === 'pickup' ? (
                                <><Truck className="w-5 h-5 text-orange-500" /> Pickup</>
                            ) : (
                                <><div className="w-5 h-5 rounded-md bg-orange-100 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-900/50 flex items-center justify-center"><Plus className="w-3 h-3 text-orange-500" /></div> Drop off</>
                            )}
                        </div>
                    </TableCell>
                    <TableCell className="py-6 px-4 font-bold text-gray-900 dark:text-gray-100 text-center">
                        <div className="flex flex-col items-center">
                            <span>{order.items_count}</span>
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-tighter">Items</span>
                        </div>
                    </TableCell>
                    <TableCell className="py-6 px-4">
                        <div className="flex flex-col">
                            <span className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase">TOTAL</span>
                            <span className="font-black text-gray-900 dark:text-gray-100">Rp {order.total_harga.toLocaleString('id-ID')}</span>
                        </div>
                    </TableCell>
                    <TableCell className="py-6 px-4 text-center">
                        <Badge className={cn("px-4 py-1.5 rounded-full font-bold text-xs border bg-transparent", orderStatusMap[order.status]?.color)}>
                            {orderStatusMap[order.status]?.label || order.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="py-6 px-8 text-center">
                        <div className="flex items-center justify-center gap-2">
                             <div className={cn("w-2 h-2 rounded-full", order.status_bayar === 'paid' ? "bg-emerald-500" : "bg-orange-500")} />
                             <span className={cn("font-bold text-sm", paymentStatusMap[order.status_bayar]?.color)}>
                                {paymentStatusMap[order.status_bayar]?.label || order.status_bayar}
                             </span>
                        </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="py-20 text-center text-gray-400 font-medium h-[400px]">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-full"><Search className="w-8 h-8 text-gray-300 dark:text-gray-600" /></div>
                        Belum ada pesanan ditemukan.
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        <div className="p-8 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <p className="text-gray-500 dark:text-gray-400 font-medium">
                Menampilkan <span className="text-gray-900 dark:text-gray-100 font-bold">{filteredOrders.length}</span> dari <span className="text-gray-900 dark:text-gray-100 font-bold">{orders.length}</span> pesanan
            </p>
            
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-orange-500">
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="flex items-center gap-1">
                    <Button className="w-10 h-10 rounded-xl bg-orange-500 text-white font-bold shadow-lg">1</Button>
                    <Button variant="ghost" className="w-10 h-10 rounded-xl text-gray-400 font-bold hover:text-orange-500">2</Button>
                    <Button variant="ghost" className="w-10 h-10 rounded-xl text-gray-400 font-bold hover:text-orange-500">3</Button>
                    <span className="text-gray-300 px-1">...</span>
                </div>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-orange-500">
                    <ChevronRight className="w-5 h-5" />
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}

function ChevronDown(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m6 9 6 6 6-6" />
        </svg>
    )
}
