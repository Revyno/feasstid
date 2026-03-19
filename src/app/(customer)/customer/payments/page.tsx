"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  CreditCard, 
  ChevronRight, 
  Search, 
  MoreVertical,
  Plus,
  Wallet,
  Smartphone,
  Banknote,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Eye,
  Download,
  Trash2,
  Trash
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getCustomerSession } from "@/lib/auth-utils";
import { toast } from "sonner";

const statusMap: Record<string, { label: string; color: string; icon: any }> = {
  paid: { 
    label: "Paid", 
    color: "bg-emerald-100 text-emerald-600 border-none dark:bg-emerald-900/30 dark:text-emerald-400", 
    icon: CheckCircle2 
  },
  pending: { 
    label: "Pending", 
    color: "bg-orange-100 text-orange-600 border-none dark:bg-orange-900/30 dark:text-orange-400", 
    icon: Clock 
  },
  failed: { 
    label: "Failed", 
    color: "bg-red-100 text-red-600 border-none dark:bg-red-900/30 dark:text-red-400", 
    icon: AlertCircle 
  },
};

const methodMap: Record<string, { label: string; icon: any; color: string }> = {
  transfer: { label: "Transfer", icon: Wallet, color: "text-blue-500" },
  qris: { label: "QRIS", icon: Smartphone, color: "text-purple-500" },
  cash: { label: "Cash", icon: Banknote, color: "text-emerald-500" },
  ewallet: { label: "E-wallet", icon: Smartphone, color: "text-indigo-500" },
};

export default function PaymentsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    const session = getCustomerSession();
    if (!session) {
      router.push("/login");
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("pembayarans")
      .select(`
        *,
        pesanans (
          id,
          kode_pesanan,
          customer_id
        )
      `)
      .eq("pesanans.customer_id", session.id)
      .order("tanggal_pembayaran", { ascending: false });

    if (error) {
      console.error("Error fetching payments:", error);
    } else {
      setPayments(data?.filter(p => p.pesanans) || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [router]);

  const handleDeletePayment = async (id: string, status: string) => {
    if (status === "paid") {
      toast.error("Pembayaran yang sudah dikonfirmasi tidak dapat dihapus.");
      return;
    }

    const confirmed = window.confirm("Apakah Anda yakin ingin menghapus data pembayaran ini? Tindakan ini tidak dapat dibatalkan.");
    if (!confirmed) return;

    const supabase = createClient();
    const { error } = await supabase.from("pembayarans").delete().eq("id", id);
    
    if (error) {
      toast.error("Gagal menghapus pembayaran: " + error.message);
    } else {
      toast.success("Pembayaran berhasil dihapus.");
      fetchData();
    }
  };

  const filtered = payments.filter(p => 
    p.pesanans?.kode_pesanan.toLowerCase().includes(search.toLowerCase()) ||
    p.nomor_referensi?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-medium text-gray-500 animate-pulse">Loading payments...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <nav className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <Link href="/customer" className="hover:text-gray-900 transition-colors">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 dark:text-gray-100 italic">Pembayarans</span>
          </nav>
          <div className="pt-4">
             <h1 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Pembayarans</h1>
             <p className="text-sm text-gray-500 font-medium">Manage and track your laundry service transactions.</p>
          </div>
        </div>
        
        <Link href="/customer/payments/create" className={cn(buttonVariants({ variant: "default" }), "h-12 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-200 dark:shadow-none transition-all active:scale-95 flex items-center gap-2")}>
            <Plus className="w-5 h-5" />
            New pembayaran
        </Link>
      </div>

      {/* Search Bar */}
      <div className="relative group max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
        <Input 
            placeholder="Search transactions, order IDs..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-12 rounded-xl border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 pl-11 font-medium focus-visible:ring-1 focus-visible:ring-orange-500 transition-all shadow-sm"
        />
      </div>

      {/* Table Section */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 dark:bg-gray-800/50 border-b-gray-100 dark:border-b-gray-800 hover:bg-transparent">
              <TableHead className="py-5 px-6 font-bold text-gray-800 dark:text-gray-200 text-[11px] uppercase tracking-wider">Kode Pesanan</TableHead>
              <TableHead className="py-5 px-4 font-bold text-gray-800 dark:text-gray-200 text-[11px] uppercase tracking-wider">Tanggal Bayar</TableHead>
              <TableHead className="py-5 px-4 font-bold text-gray-800 dark:text-gray-200 text-[11px] uppercase tracking-wider">Jumlah</TableHead>
              <TableHead className="py-5 px-4 font-bold text-gray-800 dark:text-gray-200 text-[11px] uppercase tracking-wider">Metode</TableHead>
              <TableHead className="py-5 px-4 font-bold text-gray-800 dark:text-gray-200 text-[11px] uppercase tracking-wider">Status</TableHead>
              <TableHead className="py-5 px-4 font-bold text-gray-800 dark:text-gray-200 text-[11px] uppercase tracking-wider">Bukti</TableHead>
              <TableHead className="py-5 px-6 font-bold text-gray-800 dark:text-gray-200 text-[11px] uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length > 0 ? (
              filtered.map((item) => {
                const status = statusMap[item.status_pembayaran] || statusMap.pending;
                const method = methodMap[item.metode_pembayaran] || { label: item.metode_pembayaran, icon: FileText, color: "text-gray-400" };
                return (
                  <TableRow key={item.id} className="border-b-gray-50 dark:border-b-gray-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
                    <TableCell className="py-6 px-6">
                       <Link href={`/customer/pesanan/${item.pesanans?.id}`} className="font-bold text-orange-500 hover:underline underline-offset-4 decoration-2">
                         #{item.pesanans?.kode_pesanan}
                       </Link>
                    </TableCell>
                    <TableCell className="py-6 px-4 font-medium text-gray-600 dark:text-gray-400">
                      {new Date(item.tanggal_pembayaran).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace('.', ':')}
                    </TableCell>
                    <TableCell className="py-6 px-4 font-black text-gray-900 dark:text-white">
                      Rp {item.jumlah_dibayar.toLocaleString('id-ID')}
                    </TableCell>
                    <TableCell className="py-6 px-4">
                      <div className="flex items-center gap-2">
                        <method.icon className={cn("w-4 h-4", method.color)} />
                        <span className="font-medium text-gray-700 dark:text-gray-300">{method.label}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-6 px-4">
                      <Badge className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-none", status.color)}>
                        {status.label}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-6 px-4">
                      <div className="w-10 h-10 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                        {item.bukti_pembayaran ? (
                          <img src={item.bukti_pembayaran} alt="Bukti" className="w-full h-full object-cover" />
                        ) : (
                          <FileText className="w-5 h-5 text-gray-300" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-6 px-6 text-right font-medium">
                        <DropdownMenu>
                            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all" />}>
                                <MoreVertical className="w-5 h-5" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 p-2 rounded-xl border border-gray-100 dark:border-gray-800 shadow-xl bg-white dark:bg-gray-900">
                                <DropdownMenuItem className="rounded-lg py-2.5 cursor-pointer text-gray-600 dark:text-gray-300 gap-3" onClick={() => router.push(`/customer/pesanan/${item.pesanans?.id}`)}>
                                    <Eye className="w-4 h-4 text-orange-500" /> View Order
                                </DropdownMenuItem>
                                {item.bukti_pembayaran && (
                                    <DropdownMenuItem className="rounded-lg py-2.5 cursor-pointer text-gray-600 dark:text-gray-300 gap-3" onClick={() => window.open(item.bukti_pembayaran, '_blank')}>
                                        <Eye className="w-4 h-4 text-blue-500" /> Lihat Bukti Bayar
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="rounded-lg py-2.5 cursor-pointer text-gray-600 dark:text-gray-300 gap-3" onClick={() => router.push(`/customer/payments/${item.id}/resi`)}>
                                    <Download className="w-4 h-4 text-emerald-500" /> Download Invoice
                                </DropdownMenuItem>
                                <div className="h-px bg-gray-50 dark:bg-gray-800 my-1" />
                                <DropdownMenuItem 
                                    className="rounded-lg py-2.5 cursor-pointer text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 gap-3"
                                    onClick={() => handleDeletePayment(item.id, item.status_pembayaran)}
                                >
                                    <Trash2 className="w-4 h-4" /> Delete Record
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="py-20 text-center text-gray-500 font-medium">
                   No payments found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        
        {/* Pagination Footer */}
        <div className="px-8 py-5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
           <div>
             SHOWING 1 TO {filtered.length} OF {filtered.length} RESULTS
           </div>
           <div className="flex items-center gap-2">
              <Button variant="ghost" disabled size="sm" className="font-bold hover:bg-transparent">Prev</Button>
              <div className="flex items-center gap-1">
                 <button className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 border border-orange-500/20">1</button>
                 <button className="w-8 h-8 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">2</button>
              </div>
              <Button variant="ghost" size="sm" className="font-bold hover:text-orange-500">Next</Button>
           </div>
        </div>
      </div>
    </div>
  );
}