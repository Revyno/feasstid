"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Pembayaran } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
    Plus, 
    Search, 
    Filter, 
    LayoutGrid, 
    List, 
    MoreHorizontal,
    ChevronDown,
    FileText,
    CheckCircle2,
    Clock,
    AlertCircle,
    Trash2,
    Pencil
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  paid: { 
    label: "PAID", 
    color: "bg-emerald-100 text-emerald-600 border-none dark:bg-emerald-900/30 dark:text-emerald-400", 
    icon: CheckCircle2 
  },
  pending: { 
    label: "PENDING", 
    color: "bg-orange-100 text-orange-600 border-none dark:bg-orange-900/30 dark:text-orange-400", 
    icon: Clock 
  },
  failed: { 
    label: "FAILED", 
    color: "bg-red-100 text-red-600 border-none dark:bg-red-900/30 dark:text-red-400", 
    icon: AlertCircle 
  },
  partial: {
    label: "PARTIAL",
    color: "bg-blue-100 text-blue-600 border-none dark:bg-blue-900/30 dark:text-blue-400",
    icon: Clock
  }
};

const methodMap: Record<string, string> = {
  cash: "CASH",
  transfer: "TRANSFER",
  ewallet: "EWALLET",
  qris: "QRIS",
  debit: "DEBIT",
  credit: "CREDIT"
};

export default function PembayaranPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const { data } = await supabase
        .from("pembayarans")
        .select(`
            *, 
            pesanan:pesanans(
                kode_pesanan, 
                customer:customers(name)
            )
        `)
        .order("created_at", { ascending: false });
    
    setItems(data ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = items.filter(
    (p) => 
        p.nomor_referensi?.toLowerCase().includes(search.toLowerCase()) || 
        p.pesanan?.kode_pesanan?.toLowerCase().includes(search.toLowerCase()) ||
        p.pesanan?.customer?.name?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleDelete(id: string) {
    const { error } = await supabase.from("pembayarans").delete().eq("id", id);
    if (error) {
        toast.error("Gagal menghapus pembayaran");
    } else {
        toast.success("Pembayaran berhasil dihapus");
        fetchData();
    }
  }

  async function handleConfirmPayment(id: string) {
      const { error } = await supabase.from("pembayarans").update({ status_pembayaran: "paid" }).eq("id", id);
      if (error) toast.error("Gagal konfirmasi");
      else {
          toast.success("Pembayaran dikonfirmasi");
          fetchData();
      }
  }

  async function handleRejectPayment(id: string) {
    const { error } = await supabase.from("pembayarans").update({ status_pembayaran: "failed" }).eq("id", id);
    if (error) toast.error("Gagal menolak");
    else {
        toast.success("Pembayaran ditolak");
        fetchData();
    }
}

  function fmt(v: number) { return `IDR ${Number(v).toLocaleString("id-ID")}.00`; }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1 text-left">
           <nav className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <span>Pembayaran</span>
            <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
            <span className="text-gray-900 dark:text-gray-100">List</span>
          </nav>
          <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tighter">Pembayaran</h1>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditing(null); }}>
          <DialogTrigger render={<Button className="h-12 px-8 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black shadow-lg shadow-orange-100 dark:shadow-none transition-all active:scale-95 flex items-center gap-2" />}>
              <Plus className="w-5 h-5 stroke-[3px]" />
              New Pembayaran
          </DialogTrigger>
          <DialogContent className="max-w-xl rounded-[2.5rem] p-10">
            <DialogHeader>
                <DialogTitle className="text-3xl font-black tracking-tight">{editing ? "Edit" : "New"} Pembayaran</DialogTitle>
            </DialogHeader>
            <p className="text-gray-500 font-medium italic">Payment management form would go here</p>
          </DialogContent>
        </Dialog>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative group flex-1 max-w-md w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
            <Input 
                placeholder="Search..." 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                className="h-12 w-full pl-11 border-none bg-gray-50 dark:bg-gray-800 rounded-xl font-medium focus-visible:ring-1 focus-visible:ring-orange-500/20" 
            />
          </div>
          <div className="flex items-center gap-3">
              <Button variant="outline" size="icon" className="h-12 w-12 rounded-xl border-gray-100 dark:border-gray-800 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-500">
                  <Filter className="w-5 h-5" />
              </Button>
              <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-xl p-1 gap-1">
                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-lg border-none bg-transparent hover:bg-white dark:hover:bg-gray-700 shadow-none text-gray-400">
                      <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-lg border-none bg-white dark:bg-gray-700 shadow-sm text-orange-500">
                      <List className="w-4 h-4" />
                  </Button>
              </div>
          </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="min-w-[1000px]">
              <TableHeader>
                <TableRow className="border-b-gray-100 dark:border-b-gray-800 hover:bg-transparent bg-gray-50/30 dark:bg-gray-800/20">
                  <TableHead className="py-8 px-8 font-black text-gray-900 dark:text-gray-100 text-[11px] uppercase tracking-widest">Kode Pesanan</TableHead>
                  <TableHead className="py-8 px-6 font-black text-gray-900 dark:text-gray-100 text-[11px] uppercase tracking-widest">Customer</TableHead>
                  <TableHead className="py-8 px-6 font-black text-gray-900 dark:text-gray-100 text-[11px] uppercase tracking-widest text-center">Tanggal Bayar</TableHead>
                  <TableHead className="py-8 px-6 font-black text-gray-900 dark:text-gray-100 text-[11px] uppercase tracking-widest text-right">Jumlah</TableHead>
                  <TableHead className="py-8 px-6 font-black text-gray-900 dark:text-gray-100 text-[11px] uppercase tracking-widest text-center">Metode</TableHead>
                  <TableHead className="py-8 px-6 font-black text-gray-900 dark:text-gray-100 text-[11px] uppercase tracking-widest text-center">Status</TableHead>
                  <TableHead className="py-8 px-6 font-black text-gray-900 dark:text-gray-100 text-[11px] uppercase tracking-widest text-center">Bukti</TableHead>
                  <TableHead className="py-8 px-8 font-black text-gray-900 dark:text-gray-100 text-[11px] uppercase tracking-widest text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                    <TableRow><TableCell colSpan={7} className="py-20 text-center text-gray-400 font-bold animate-pulse">Fetching transactions...</TableCell></TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="py-32 text-center text-gray-400 font-bold uppercase tracking-widest italic opacity-50">Belum ada data pembayaran</TableCell></TableRow>
                ) : filtered.map((p) => {
                    const status = statusMap[p.status_pembayaran] || statusMap.pending;
                    return (
                        <TableRow key={p.id} className="border-b-gray-50 dark:border-b-gray-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors group">
                           <TableCell className="py-8 px-8">
                                <span className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-sm italic">{p.pesanan?.kode_pesanan || "EXT-001"}</span>
                            </TableCell>
                            <TableCell className="py-8 px-6 font-bold text-gray-600 dark:text-gray-400">
                                {p.pesanan?.customer?.name || "Walk-in Customer"}
                            </TableCell>
                            <TableCell className="py-8 px-6 text-center font-bold text-gray-600 dark:text-gray-400 text-xs">
                                {new Date(p.tanggal_pembayaran).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </TableCell>
                            <TableCell className="py-8 px-6 text-right font-black text-gray-900 dark:text-white">
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] text-gray-400 font-black tracking-widest opacity-50">TOTAL AMOUNT</span>
                                    <span className="text-sm">{fmt(p.jumlah_dibayar)}</span>
                                </div>
                            </TableCell>
                            <TableCell className="py-8 px-6 text-center">
                                <Badge variant="outline" className="rounded-full px-4 py-1.5 border-none bg-orange-50 text-orange-600 dark:bg-orange-950/20 font-black text-[9px] tracking-widest">
                                    {methodMap[p.metode_pembayaran] || "OTHER"}
                                </Badge>
                            </TableCell>
                            <TableCell className="py-8 px-6 text-center">
                                <Badge className={cn("px-4 py-1.5 rounded-full font-black text-[9px] uppercase tracking-widest shadow-none", status.color)}>
                                    {status.label}
                                </Badge>
                            </TableCell>

                            <TableCell className="py-8 px-6 text-center">
                                <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex items-center justify-center mx-auto transition-transform group-hover:scale-110">
                                    {p.bukti_pembayaran ? (
                                        <img src={p.bukti_pembayaran} alt="Receipt" className="w-full h-full object-cover" />
                                    ) : (
                                        <FileText className="w-6 h-6 text-gray-300" />
                                    )}
                                </div>
                            </TableCell>
                            <TableCell className="py-8 px-8 text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-10 w-10 text-gray-400 hover:text-orange-500 rounded-xl transition-all" />}>
                                        <MoreHorizontal className="w-5 h-5" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-none shadow-2xl bg-orange-500 text-white font-bold">
                                        <DropdownMenuItem className="rounded-xl focus:bg-white focus:text-black cursor-pointer py-3" onClick={() => router.push(`/dashboard/pembayaran/${p.id}/edit`)}>
                                            <Pencil className="w-4 h-4 mr-3" /> Edit Detail
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            className="rounded-xl focus:bg-white focus:text-black cursor-pointer py-3 text-emerald-100"
                                            onClick={() => handleConfirmPayment(p.id)}
                                        >
                                            <CheckCircle2 className="w-4 h-4 mr-3" /> Konfirmasi Pembayaran
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            className="rounded-xl focus:bg-white focus:text-black cursor-pointer py-3 text-red-100"
                                            onClick={() => handleRejectPayment(p.id)}
                                        >
                                            <AlertCircle className="w-4 h-4 mr-3" /> Tolak Pembayaran
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="rounded-xl focus:bg-white focus:text-black cursor-pointer py-3 text-red-200" onClick={() => handleDelete(p.id)}>
                                            <Trash2 className="w-4 h-4 mr-3" /> Delete Permanent
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    );
                })}
              </TableBody>
            </Table>
          </div>
          
          <div className="p-8 border-t border-gray-50 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
                  Showing <span className="text-gray-900 dark:text-white">1 to {filtered.length}</span> of <span className="text-gray-900 dark:text-white">{filtered.length}</span> results
              </div>
              <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-[11px] font-black text-gray-400 uppercase tracking-widest mr-4">
                      Per page
                      <select className="bg-orange-500 text-white rounded-lg px-2 py-1 outline-none">
                          <option>10</option>
                          <option>20</option>
                          <option>50</option>
                      </select>
                  </div>
                  <div className="flex items-center gap-2">
                      <Button variant="outline" className="h-10 px-4 rounded-lg border-gray-100 font-bold text-gray-400 hover:text-orange-500">Prev</Button>
                      <button className="w-10 h-10 rounded-lg bg-orange-500 text-white font-black shadow-lg shadow-orange-100">1</button>
                      <Button variant="outline" className="h-10 px-4 rounded-lg border-gray-100 font-bold text-gray-400 hover:text-orange-500">Next</Button>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
