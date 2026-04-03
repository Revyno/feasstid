"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  ChevronRight, 
  ArrowLeft,
  ShoppingBag,
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
import { cn } from "@/lib/utils";
import Link from "next/link";
import { getCustomerSession } from "@/lib/auth-utils";

const orderStatusMap: Record<string, { label: string; color: string; bgColor: string; icon: any; desc: string }> = {
  pending: { 
    label: "Menunggu", 
    color: "text-orange-600 border-orange-200 bg-orange-50",
    bgColor: "bg-orange-100 dark:bg-orange-950/30",
    icon: Clock,
    desc: "Pesanan Anda telah diterima dan sedang menunggu antrean." 
  },
  in_process: { 
    label: "Diproses", 
    color: "text-blue-600 border-blue-200 bg-blue-50",
    bgColor: "bg-blue-100 dark:bg-blue-950/30",
    icon: Package,
    desc: "Sepatu Anda sedang dalam tahap pembersihan profesional." 
  },
  ready: { 
    label: "Siap Ambil", 
    color: "text-emerald-600 border-emerald-200 bg-emerald-50",
    bgColor: "bg-emerald-100 dark:bg-emerald-950/30",
    icon: CheckCircle2,
    desc: "Pesanan Anda sudah selesai dan siap untuk diambil/dikirim." 
  },
  completed: { 
    label: "Selesai", 
    color: "text-gray-500 border-gray-200 bg-gray-50",
    bgColor: "bg-gray-100 dark:bg-gray-800",
    icon: CheckCircle2,
    desc: "Pesanan telah diselesaikan dan diterima dengan baik." 
  },
  cancelled: { 
    label: "Dibatalkan", 
    color: "text-red-600 border-red-200 bg-red-50",
    bgColor: "bg-red-100 dark:bg-red-950/30",
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
      if (!session) { router.push("/login"); return; }
      const supabase = createClient();
      const { data, error } = await supabase
        .from("pesanans")
        .select("*, detail_pesanans(*, layanans(*), jenis_sepatus(*)), pembayarans(*)")
        .eq("id", params.id)
        .single();
      if (error || !data) { router.push("/customer/pesanan"); return; }
      setOrder(data);
      setLoading(false);
    }
    if (params.id) fetchData();
  }, [params.id, router]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <p className="font-bold text-gray-500 animate-pulse uppercase tracking-widest text-xs">Loading Details...</p>
    </div>
  );

  const status = orderStatusMap[order.status] || orderStatusMap.pending;
  const paymentStatus = order.pembayarans?.[0]?.status_pembayaran || "pending";

  return (
    <div className="max-w-[1000px] mx-auto space-y-6 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <nav className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <Link href="/customer/pesanan" className="hover:text-orange-500 transition-colors">Pesanan Saya</Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900 dark:text-gray-100">{order.kode_pesanan}</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Order Detail</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge className={cn("px-3 py-1 rounded-full font-bold text-[10px] uppercase border shadow-sm", status.color)}>
                {status.label}
              </Badge>
              <span className="text-gray-400 font-bold text-xs tracking-wide bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg">
                ID: {order.id.split('-')[0].toUpperCase()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.back()} className="h-10 px-4 rounded-xl font-bold text-gray-400 hover:text-orange-500 text-sm gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <Link href={`/customer/pesanan/${order.id}/edit`}>
              <Button className="h-10 px-5 rounded-xl font-bold text-white bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-100 dark:shadow-none text-sm gap-2">
                <Edit3 className="w-4 h-4" />
                Edit
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-5">
          {/* Status Card */}
          <div className={cn("p-5 md:p-6 rounded-2xl relative overflow-hidden", status.bgColor)}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/60 dark:bg-white/10 flex items-center justify-center shrink-0">
                <status.icon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
              </div>
              <div>
                <h2 className="text-base font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide">{status.label}</h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-0.5 leading-relaxed">{status.desc}</p>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-5 pb-0 flex items-center gap-3">
              <div className="w-1 h-5 bg-orange-500 rounded-full" />
              <h2 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">Item Laundry</h2>
            </div>
            
            <div className="divide-y divide-gray-50 dark:divide-gray-800 mt-4">
              {order.detail_pesanans.map((item: any) => (
                <div key={item.id} className="p-4 md:p-5 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 shadow-sm shrink-0">
                      {item.foto_sebelum ? (
                        <img src={item.foto_sebelum} alt="Shoe" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-black text-gray-900 dark:text-gray-100 text-sm uppercase">{item.jenis_sepatus?.nama_jenis || "Generic Shoe"}</p>
                          <p className="text-[11px] text-gray-400 font-bold uppercase">{item.jenis_sepatus?.merek || "-"}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-black text-gray-900 dark:text-gray-100 text-sm">Rp {(item.subtotal || 0).toLocaleString('id-ID')}</p>
                          <p className="text-[10px] text-gray-400 font-bold">Incl. Extra</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-lg">{item.layanans?.nama_layanan}</span>
                        <span className="text-[10px] text-orange-500 font-black uppercase px-2 py-0.5 bg-orange-50 dark:bg-orange-950/20 rounded-lg">{item.layanans?.kategori_layanan}</span>
                        <span className="text-[10px] text-gray-400 font-bold ml-auto">{item.jumlah_pasang} pasang</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-5">
          {/* Summary Card */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden border-t-4 border-t-orange-500">
            <div className="p-5 space-y-5">
              <div className="text-center">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">Total Pembayaran</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-base font-black text-orange-500">Rp</span>
                  <span className="text-3xl md:text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tighter">{(order.total_harga || 0).toLocaleString('id-ID')}</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-50 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Status Bayar</span>
                  <Badge className={cn("px-3 py-0.5 rounded-full font-black text-[9px] uppercase border-none",
                    paymentStatus === 'paid' ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"
                  )}>
                    {paymentStatus === 'paid' ? "Sudah Bayar" : "Menunggu"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Metode Antar</span>
                  <span className="font-black text-gray-900 dark:text-gray-100 uppercase text-xs flex items-center gap-1.5">
                    {order.metode_pengantaran === 'pickup' ? <Truck className="w-3.5 h-3.5 text-orange-500" /> : <Package className="w-3.5 h-3.5 text-orange-500" />}
                    {order.metode_pengantaran}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Tanggal</span>
                  <span className="font-black text-gray-900 dark:text-gray-100 uppercase text-xs">
                    {new Date(order.tanggal_pesanan).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>

                {order.pembayarans?.some((p: any) => p.nomor_resi) && (
                  <div className="pt-3 mt-3 border-t border-dashed border-orange-100 dark:border-orange-900/30">
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-wide mb-2">Nomor Resi</p>
                    <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-xl flex items-center justify-between border border-orange-100 dark:border-orange-900/30">
                      <span className="font-black text-sm text-gray-900 dark:text-white uppercase">
                        {order.pembayarans.find((p: any) => p.nomor_resi)?.nomor_resi}
                      </span>
                      <FileText className="w-4 h-4 text-orange-500" />
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2">
                {paymentStatus !== 'paid' ? (
                  <Link href={`/customer/payments/create?orderId=${order.id}`} className="block">
                    <Button className="w-full h-12 rounded-xl font-black text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 dark:shadow-none gap-2">
                      <CreditCard className="w-5 h-5" />
                      Bayar Sekarang
                    </Button>
                  </Link>
                ) : (
                  <Button variant="outline" className="w-full h-12 rounded-xl font-black text-emerald-600 border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400 uppercase tracking-widest text-xs">
                    ✓ Pembayaran Lunas
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="bg-gray-900 p-5 rounded-2xl text-white">
            <div className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center text-orange-500 mb-3">
              <FileText className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-black uppercase tracking-wide mb-2">Butuh Bantuan?</h4>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">
              Hubungi tim support kami melalui WhatsApp jika ada kesalahan data atau ingin mengubah pesanan.
            </p>
            <a 
              href={`https://wa.me/6282132897760?text=${encodeURIComponent(`Halo Feast.id, saya ingin bertanya tentang pesanan saya dengan kode ${order.kode_pesanan}`)}`}
              target="_blank" 
              rel="noopener noreferrer"
              className="block"
            >
              <Button variant="outline" className="w-full h-10 rounded-xl font-bold border-gray-700 text-white hover:bg-white hover:text-gray-900 transition-all gap-2 text-sm">
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
