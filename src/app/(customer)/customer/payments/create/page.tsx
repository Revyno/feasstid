"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  CreditCard, 
  ChevronRight,
  Info,
  Upload,
  Calendar as CalendarIcon,
  Link as LinkIcon,
  Lock,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";

import { getCustomerSession } from "@/lib/auth-utils";
import { X } from "lucide-react";

export default function RegisterPaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [method, setMethod] = useState("transfer");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrders() {
      const customer = getCustomerSession();
      if (!customer) {
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data } = await supabase
        .from("pesanans")
        .select("*")
        .eq("customer_id", customer.id)
        .neq("status", "cancelled")
        .order("created_at", { ascending: false });
      
      if (data) setOrders(data);
      setLoading(false);
    }
    fetchOrders();
  }, []);

  const uploadImage = async (file: File) => {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `payments/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type
      });

    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath);
      
    return publicUrl;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    try {
      if (!selectedOrder || !amount) {
        toast.error("Mohon lengkapi data pembayaran");
        return;
      }

      setIsSubmitting(true);
      const customer = getCustomerSession();
      if (!customer) {
        toast.error("Anda harus login kembali");
        router.push("/login");
        return;
      }

      const supabase = createClient();
      
      let bukti_pembayaran = null;
      if (file) {
        try {
          bukti_pembayaran = await uploadImage(file);
        } catch (e) {
          console.error("Upload failed", e);
          toast.error("Gagal mengunggah bukti pembayaran");
          setIsSubmitting(false);
          return;
        }
      }

      const { error } = await supabase
        .from("pembayarans")
        .insert({
          pesanan_id: selectedOrder,
          tanggal_pembayaran: date,
          jumlah_dibayar: Number(amount.replace(/\D/g, '')),
          metode_pembayaran: method,
          status_pembayaran: "pending",
          nomor_referensi: reference,
          catatan: notes,
          bukti_pembayaran
        });

      if (error) throw error;

      toast.success("Pembayaran berhasil didaftarkan. Menunggu konfirmasi admin.");
      router.push("/customer/payments");
    } catch (error: any) {
      console.error(error);
      toast.error(`Gagal mendaftarkan pembayaran: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 md:space-y-8 animate-in slide-in-from-right-4 duration-500 pb-20">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm font-medium text-gray-400 dark:text-gray-500 pt-4 md:pt-5 flex-wrap">
        <Link href="/customer" className="hover:text-orange-500 transition-colors">Dashboard</Link>
        <ChevronRight className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
        <Link href="/customer/payments" className="hover:text-orange-500 transition-colors">Payments</Link>
        <ChevronRight className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
        <span className="text-gray-900 dark:text-gray-100 font-bold underline decoration-2 underline-offset-4 decoration-orange-500/30">Create</span>
      </nav>

      <div className="space-y-1.5 md:space-y-2">
        <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight leading-tight">Register New Payment</h1>
        <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium">Please fill in the details below to confirm your transaction.</p>
      </div>

      <div className="bg-white dark:bg-gray-900 p-5 md:p-10 rounded-2xl md:rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-800 max-w-5xl">
        <div className="space-y-7 md:space-y-12">
            {/* Transaction Details Header */}
            <div className="flex items-center gap-2.5 md:gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500 shrink-0">
                    <Info className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <h2 className="text-lg md:text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Transaction Details</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 md:gap-y-10">
                <div className="space-y-2 md:space-y-3">
                    <Label className="text-xs md:text-sm font-black text-gray-900 dark:text-gray-300 uppercase tracking-widest pl-1">Select Order</Label>
                    <Select value={selectedOrder} onValueChange={(val) => {
                        setSelectedOrder(val || "");
                        const order = orders.find(o => o.id === val);
                        if (order) {
                            setAmount(order.total_harga.toLocaleString('id-ID'));
                        }
                    }}>
                        <SelectTrigger className="w-full h-12 md:h-14 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 rounded-xl md:rounded-2xl focus:ring-0 font-bold text-gray-900 dark:text-gray-100 text-sm md:text-base">
                            <SelectValue placeholder="Select an active order" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-gray-100 shadow-xl font-bold">
                            {orders.map(order => (
                                <SelectItem key={order.id} value={order.id} className="text-sm">
                                    {order.kode_pesanan} - Rp {order.total_harga.toLocaleString('id-ID')}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2 md:space-y-3">
                    <Label className="text-xs md:text-sm font-black text-gray-900 dark:text-gray-300 uppercase tracking-widest pl-1">Payment Date</Label>
                    <div className="relative">
                        <CalendarIcon className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400 dark:text-gray-500" />
                        <Input 
                            type="date" 
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="h-12 md:h-14 pl-10 md:pl-12 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 rounded-xl md:rounded-2xl focus-visible:ring-orange-500/20 focus-visible:border-orange-500 font-bold text-gray-900 dark:text-gray-100 text-sm md:text-base" 
                        />
                    </div>
                </div>

                <div className="space-y-2 md:space-y-3">
                    <Label className="text-xs md:text-sm font-black text-gray-900 dark:text-gray-300 uppercase tracking-widest pl-1">Amount Paid</Label>
                    <div className="relative">
                        <span className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 font-black text-gray-900 dark:text-gray-100 text-sm md:text-base">RP</span>
                        <Input 
                            placeholder="0.00" 
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="h-12 md:h-14 pl-10 md:pl-11 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl focus-visible:ring-orange-500/20 focus-visible:border-orange-500 font-black text-gray-900 dark:text-gray-100 text-base md:text-lg shadow-inner" 
                        />
                    </div>
                </div>

                <div className="space-y-2 md:space-y-3">
                    <Label className="text-xs md:text-sm font-black text-gray-900 dark:text-gray-300 uppercase tracking-widest pl-1">Payment Status</Label>
                    <div className="relative group">
                        <Lock className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 dark:text-gray-600" />
                        <Input readOnly value="Pending Confirmation" className="h-12 md:h-14 border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl md:rounded-2xl font-bold text-gray-900 dark:text-gray-100 cursor-not-allowed pr-10 text-sm md:text-base" />
                    </div>
                </div>
            </div>

            <div className="h-px bg-gray-100 dark:bg-gray-800 w-full" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 md:gap-y-10">
                <div className="space-y-5 md:space-y-8">
                    <div className="space-y-2 md:space-y-3">
                        <Label className="text-xs md:text-sm font-black text-gray-900 dark:text-gray-300 uppercase tracking-widest pl-1">Payment Method</Label>
                        <Select value={method} onValueChange={(val) => setMethod(val || "transfer")}>
                            <SelectTrigger className="w-full h-12 md:h-14 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 rounded-xl md:rounded-2xl focus:ring-0 font-bold dark:text-gray-100 text-sm md:text-base">
                                <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-gray-100 shadow-xl font-bold">
                                <SelectItem value="transfer" className="text-sm">Bank Transfer</SelectItem>
                                <SelectItem value="qris" className="text-sm">QRIS</SelectItem>
                                <SelectItem value="ewallet" className="text-sm">E-Wallet (OVO/Gopay/Dana)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2 md:space-y-3">
                        <div className="flex items-center gap-2 pl-1">
                            <Label className="text-xs md:text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">Reference Number</Label>
                            <span className="text-[10px] font-black text-orange-400 tracking-tighter uppercase">(Optional)</span>
                        </div>
                        <Input 
                            placeholder="TXN-99887766" 
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            className="h-12 md:h-14 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 rounded-xl md:rounded-2xl focus-visible:ring-orange-500/20 focus-visible:border-orange-500 font-bold text-gray-900 dark:text-gray-100 text-sm md:text-base" 
                        />
                    </div>
                </div>

                <div className="space-y-2 md:space-y-3">
                    <Label className="text-xs md:text-sm font-black text-gray-900 dark:text-gray-300 uppercase tracking-widest pl-1">Proof of Payment</Label>
                    <div className="relative h-full min-h-[160px] md:min-h-[180px] border-4 border-dashed border-orange-200 dark:border-orange-900/50 bg-orange-100/5 dark:bg-orange-950/10 hover:bg-orange-500 dark:hover:bg-orange-600 font-black group transition-all duration-300 rounded-2xl md:rounded-[2.5rem] flex flex-col items-center justify-center gap-3 md:gap-4 cursor-pointer overflow-hidden group-hover:border-orange-500">
                        {fileUrl ? (
                          <div className="relative w-full h-full group/preview">
                            <img src={fileUrl} alt="Preview" className="w-full h-full object-cover" />
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setFile(null);
                                setFileUrl(null);
                              }}
                              className="absolute top-3 right-3 md:top-4 md:right-4 p-1.5 md:p-2 bg-red-500 text-white rounded-xl opacity-0 group-hover/preview:opacity-100 transition-opacity z-20"
                            >
                              <X className="w-4 h-4 md:w-5 md:h-5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <input 
                              type="file" 
                              accept="image/*"
                              className="absolute inset-0 opacity-0 cursor-pointer z-10"
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) {
                                  setFile(f);
                                  setFileUrl(URL.createObjectURL(f));
                                }
                              }}
                            />
                            <div className="absolute inset-0 bg-orange-500 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
                            <div className="relative z-10 flex flex-col items-center gap-2 group-hover:text-white transition-colors duration-300">
                                <div className="w-11 h-11 md:w-14 md:h-14 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 group-hover:bg-white/20 group-hover:text-white transition-all">
                                    <Upload className="w-5 h-5 md:w-7 md:h-7" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm md:text-base font-black uppercase tracking-tight">Upload bukti pembayaran</p>
                                    <p className="text-[10px] font-medium opacity-60">JPG, PNG, PDF UP TO 5MB</p>
                                </div>
                            </div>
                          </>
                        )}
                    </div>
                </div>
            </div>

            <div className="space-y-2 md:space-y-3">
                <div className="flex items-center gap-2 pl-1">
                    <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4 text-orange-500" />
                    <Label className="text-xs md:text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">Notes</Label>
                    <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 tracking-tighter uppercase">(Optional)</span>
                </div>
                <Textarea 
                    placeholder="Add any specific details about this payment..." 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[110px] md:min-h-[140px] border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl md:rounded-[2rem] p-4 md:p-6 focus-visible:ring-orange-500/20 font-medium text-gray-600 dark:text-gray-400 focus-visible:border-orange-500 transition-all text-sm md:text-base" 
                />
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 md:gap-4 pt-2 md:pt-4">
                <Button 
                    variant="ghost" 
                    className="h-12 md:h-14 px-6 md:px-10 rounded-xl md:rounded-2xl font-bold text-red-500 dark:text-red-500 hover:text-white hover:bg-red-400 dark:hover:bg-red-400 transition-all w-full sm:w-auto"
                    onClick={() => router.back()}
                >
                    Cancel
                </Button>
                <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="h-12 md:h-14 px-8 md:px-12 rounded-xl md:rounded-2xl font-black text-white bg-orange-500 hover:bg-orange-600 shadow-xl transition-all hover:scale-105 active:scale-95 text-base md:text-lg w-full sm:w-auto"
                >
                    {isSubmitting ? "Submitting..." : "Submit Payment"}
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
