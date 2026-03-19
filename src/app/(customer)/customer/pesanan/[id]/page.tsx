"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  ChevronRight, 
  ArrowLeft,
  ShoppingBag,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  Package,
  Truck,
  CreditCard,
  FileText,
  Edit3,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getCustomerSession } from "@/lib/auth-utils";

const orderStatusMap: Record<string, { label: string; color: string; icon: any; desc: string }> = {
  pending: { 
    label: "Menunggu", 
    color: "text-orange-600 bg-orange-50 border-orange-200", 
    icon: Clock,
    desc: "Pesanan Anda telah diterima dan sedang menunggu antrean." 
  },
  in_process: { 
    label: "Diproses", 
    color: "text-blue-600 bg-blue-50 border-blue-200", 
    icon: Package,
    desc: "Sepatu Anda sedang dalam tahap pembersihan profesional." 
  },
  ready: { 
    label: "Siap Ambil", 
    color: "text-emerald-600 bg-emerald-50 border-emerald-200", 
    icon: CheckCircle2,
    desc: "Pesanan Anda sudah selesai dan siap untuk diambil/dikirim." 
  },
  completed: { 
    label: "Selesai", 
    color: "text-gray-500 bg-gray-50 border-gray-200", 
    icon: CheckCircle2,
    desc: "Pesanan telah diselesaikan dan diterima dengan baik." 
  },
  cancelled: { 
    label: "Dibatalkan", 
    color: "text-red-600 bg-red-50 border-red-200", 
    icon: XIcon,
    desc: "Pesanan ini telah dibatalkan." 
  },
};

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    async function fetchData() {
      const session = getCustomerSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const supabase = createClient();
      const { data, error } = await supabase
        .from("pesanans")
        .select("*, detail_pesanans(*, layanans(*), jenis_sepatus(*)), pembayarans(*)")
        .eq("id", params.id)
        .single();

      if (error || !data) {
        console.error("Error fetching order:", error);
        router.push("/customer/pesanan");
        return;
      }

      setOrder(data);
      setLoading(false);
    }
    if (params.id) fetchData();
  }, [params.id, router]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <p className="font-bold text-gray-500 animate-pulse uppercase tracking-widest text-xs">Loading Details...</p>
    </div>
  );

  const status = orderStatusMap[order.status] || orderStatusMap.pending;
  const paymentStatus = order.pembayarans?.[0]?.status_pembayaran || "pending";

  return (
    <div className="max-w-[1200px] mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
           <nav className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <Link href="/customer/pesanan" className="hover:text-orange-500 transition-colors">Pesanan Saya</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900 dark:text-gray-100">{order.kode_pesanan}</span>
          </nav>
          <div className="flex flex-col gap-2">
            <h1 className="text-6xl font-black text-gray-900 dark:text-gray-100 tracking-tighter">Order Detail</h1>
            <div className="flex items-center gap-4">
              <Badge className={cn("px-4 py-1.5 rounded-full font-black text-[10px] uppercase border shadow-sm", status.color)}>
                {status.label}
              </Badge>
              <span className="text-gray-400 font-bold text-sm tracking-wide bg-gray-50 dark:bg-gray-800 px-3 py-1 rounded-lg">ID: {order.id.split('-')[0].toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
             <Button variant="ghost" onClick={() => router.back()} className="h-14 px-8 rounded-2xl font-black text-gray-400 hover:text-orange-500 transition-all">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to List
             </Button>
             <Link href={`/customer/pesanan/${order.id}/edit`}>
                <Button className="h-14 px-10 rounded-2xl font-black text-white bg-orange-500 hover:bg-orange-600 shadow-2xl shadow-orange-100 dark:shadow-none transition-all hover:scale-105 active:scale-95 text-lg flex items-center gap-2">
                    <Edit3 className="w-5 h-5" />
                    Edit Order
                </Button>
             </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left Column: Order Progress & Info */}
        <div className="lg:col-span-2 space-y-10">
           {/* Current Status Card */}
           <div className="bg-white dark:bg-gray-900 p-10 rounded-[4rem] shadow-sm border border-gray-100 dark:border-gray-800 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 dark:bg-orange-950/20 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110" />
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                  <div className={cn("w-24 h-24 rounded-[2rem] flex items-center justify-center shadow-lg", status.color.replace('bg-', 'bg-').split(' ')[1])}>
                      <status.icon className="w-10 h-10" />
                  </div>
                  <div className="space-y-2 text-center md:text-left">
                      <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight uppercase tracking-widest">{status.label}</h2>
                      <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed max-w-md">{status.desc}</p>
                  </div>
              </div>
           </div>

           {/* Items Table */}
           <div className="bg-white dark:bg-gray-900 rounded-[4rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden px-4 md:px-0">
              <div className="p-10 pb-6 flex items-center gap-4">
                <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
                <h2 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest italic">Item Laundry</h2>
              </div>
              <div className="overflow-x-auto">
                <Table className="min-w-full">
                    <TableHeader>
                        <TableRow className="border-b-gray-50 dark:border-b-gray-800 hover:bg-transparent">
                            <TableHead className="py-6 px-10 text-[10px] font-black text-gray-400 uppercase tracking-widest">Sepatu</TableHead>
                            <TableHead className="py-6 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Layanan</TableHead>
                            <TableHead className="py-6 px-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Jumlah</TableHead>
                            <TableHead className="py-6 px-10 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Subtotal</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {order.detail_pesanans.map((item: any) => (
                            <TableRow key={item.id} className="border-b-gray-50 dark:border-b-gray-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
                                <TableCell className="py-8 px-10 flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 shadow-sm transition-transform group-hover:scale-105">
                                        {item.foto_sebelum ? (
                                            <img src={item.foto_sebelum} alt="Shoe" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                                                <ShoppingBag className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-black text-gray-900 dark:text-gray-100 uppercase text-xs">{item.jenis_sepatus?.nama_jenis || "Generic Shoe"}</span>
                                        <span className="text-[10px] text-gray-400 font-bold uppercase">{item.jenis_sepatus?.merek || "-"}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-8 px-6">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-gray-700 dark:text-gray-300">{item.layanans?.nama_layanan}</span>
                                        <span className="text-[10px] text-orange-500 font-black uppercase tracking-widest italic">{item.layanans?.kategori_layanan} Service</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-8 px-6 text-center">
                                    <span className="font-black text-gray-900 dark:text-gray-100 px-4 py-1.5 rounded-full bg-gray-50 dark:bg-gray-800">{item.jumlah_pasang}</span>
                                </TableCell>
                                <TableCell className="py-8 px-10 text-right">
                                    <div className="flex flex-col items-end">
                                        <span className="font-black text-gray-900 dark:text-gray-100">Rp {(item.subtotal || 0).toLocaleString('id-ID')}</span>
                                        <span className="text-[9px] text-gray-400 font-bold uppercase">Incl. Extra Fees</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
              </div>
           </div>
        </div>

        {/* Right Column: Order Summary & Actions */}
        <div className="space-y-10">
            {/* Summary Card */}
            <div className="bg-white dark:bg-gray-900 p-10 rounded-[4rem] shadow-sm border border-gray-100 dark:border-gray-800 space-y-10 border-t-[10px] border-t-orange-500">
                <div className="space-y-1 text-center">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Total Pembayaran</h3>
                    <div className="flex items-baseline justify-center gap-1">
                        <span className="text-xl font-black text-orange-500 uppercase">Rp</span>
                        <span className="text-5xl font-black text-gray-900 dark:text-gray-100 tracking-tighter">{(order.total_harga || 0).toLocaleString('id-ID')}</span>
                    </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-gray-50 dark:border-gray-800">
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-400 uppercase tracking-widest">Payment Status</span>
                        <Badge className={cn("px-4 py-1 rounded-full font-black text-[9px] uppercase tracking-widest border border-transparent shadow-none",
                            paymentStatus === 'paid' ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"
                        )}>
                            {paymentStatus === 'paid' ? "Sudah Bayar" : "Menunggu Bayar"}
                        </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-gray-400 uppercase tracking-widest">Metode Antar</span>
                        <span className="font-black text-gray-900 dark:text-gray-100 uppercase  flex items-center gap-2">
                            {order.metode_pengantaran === 'pickup' ? <Truck className="w-4 h-4 text-orange-500" /> : <Package className="w-4 h-4 text-orange-500" />}
                            {order.metode_pengantaran}
                        </span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-2">
                        <span className="font-bold text-gray-400 uppercase tracking-widest">Tanggal Pesan</span>
                        <span className="font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter">
                            {new Date(order.tanggal_pesanan).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                    </div>
                    {order.pembayarans?.some((p: any) => p.nomor_resi) && (
                        <div className="flex flex-col gap-2 pt-4 mt-4 border-t border-dashed border-orange-100 dark:border-orange-900/30 group/resi">
                            <span className="font-black text-[10px] text-orange-500 uppercase tracking-[0.2em]">Nomor Resi / Pelacakan</span>
                            <div className="bg-orange-50 dark:bg-orange-950/20 p-4 rounded-2xl flex items-center justify-between border border-orange-100 dark:border-orange-900/30 group-hover/resi:border-orange-500 transition-colors duration-500">
                                <span className="font-black text-lg text-gray-900 dark:text-white tracking-widest uppercase italic">
                                    {order.pembayarans.find((p: any) => p.nomor_resi)?.nomor_resi}
                                </span>
                                <FileText className="w-5 h-5 text-orange-500" />
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-4">
                    {paymentStatus !== 'paid' ? (
                        <Link href={`/customer/payments/create?orderId=${order.id}`} className="block">
                            <Button className="w-full h-16 rounded-[1.5rem] font-black text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-100 dark:shadow-none transition-all active:scale-95 text-lg flex items-center gap-3">
                                <CreditCard className="w-6 h-6 border-2 border-white rounded-full p-0.5" />
                                Bayar Sekarang
                            </Button>
                        </Link>
                    ) : (
                        <Button variant="outline" className="w-full h-16 rounded-[1.5rem] font-black text-emerald-600 border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400 transition-all uppercase tracking-widest">
                            Pembayaran Lunas
                        </Button>
                    )}
                </div>
            </div>

            {/* Support Box */}
            <div className="bg-gray-900 p-8 rounded-[3rem] shadow-sm text-white space-y-4">
                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center text-orange-500">
                    <FileText className="w-5 h-5 font-black" />
                </div>
                <h4 className="text-xl font-black  tracking-tight uppercase tracking-widest">Butuh Bantuan?</h4>
                <p className="text-xs text-gray-400 font-medium leading-relaxed">
                    Hubungi tim support kami melalui WhatsApp jika ada kesalahan data atau ingin mengubah metode pengantaran.
                </p>
                <a 
                    href={`https://wa.me/6282132897760?text=${encodeURIComponent(`Halo Feast.id, saya ingin bertanya tentang pesanan saya dengan kode ${order.kode_pesanan}`)}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block w-full"
                >
                    <Button variant="outline" className="w-full h-12 rounded-xl font-bold border-gray-700  text-black hover:bg-white hover:text-gray-600 transition-all flex items-center justify-center gap-2">
                        Chat CS WhatsApp
                        <ExternalLink className="w-3 h-3" />
                    </Button>
                </a>
            </div>
        </div>
      </div>
    </div>
  );
}

function XIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  );
}
