"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  ChevronRight,
  Upload,
  Calendar as CalendarIcon,
  Trash2,
  Save,
  ArrowLeft,
  X,
  FileText
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

export default function EditPembayaranAdminPage() {
  const router = useRouter();
  const params = useParams();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    pesanan_id: "",
    tanggal_pembayaran: new Date().toISOString().split('T')[0],
    jumlah_dibayar: 0,
    metode_pembayaran: "transfer",
    status_pembayaran: "pending",
    nomor_referensi: "",
    catatan: "",
    bukti_pembayaran: "" as string | null
  });

  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch Payment detail
      const { data: payment, error: pError } = await supabase
        .from("pembayarans")
        .select(`
          *,
          pesanan:pesanans(id, kode_pesanan, total_harga, customer:customers(name))
        `)
        .eq("id", params.id)
        .single();

      if (pError || !payment) {
        toast.error("Pembayaran tidak ditemukan");
        router.push("/dashboard/pembayaran");
        return;
      }

      setFormData({
        pesanan_id: payment.pesanan_id,
        tanggal_pembayaran: payment.tanggal_pembayaran,
        jumlah_dibayar: payment.jumlah_dibayar,
        metode_pembayaran: payment.metode_pembayaran,
        status_pembayaran: payment.status_pembayaran,
        nomor_referensi: payment.nomor_referensi || "",
        catatan: payment.catatan || "",
        bukti_pembayaran: payment.bukti_pembayaran
      });
      setFileUrl(payment.bukti_pembayaran);

      // Fetch all Orders for selection
      const { data: pesananList } = await supabase
        .from("pesanans")
        .select("id, kode_pesanan, total_harga, customer:customers(name)")
        .order("created_at", { ascending: false });
      
      setOrders(pesananList || []);
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengambil data");
    } finally {
      setLoading(false);
    }
  }, [params.id, router, supabase]);

  useEffect(() => {
    if (params.id) fetchData();
  }, [params.id, fetchData]);

  const uploadImage = async (file: File) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      let finalBuktiUrl = formData.bukti_pembayaran;
      if (file) {
        finalBuktiUrl = await uploadImage(file);
      }

      const { error } = await supabase
        .from("pembayarans")
        .update({
          pesanan_id: formData.pesanan_id,
          tanggal_pembayaran: formData.tanggal_pembayaran,
          jumlah_dibayar: formData.jumlah_dibayar,
          metode_pembayaran: formData.metode_pembayaran,
          status_pembayaran: formData.status_pembayaran,
          nomor_referensi: formData.nomor_referensi,
          catatan: formData.catatan,
          bukti_pembayaran: finalBuktiUrl
        })
        .eq("id", params.id);

      if (error) throw error;

      toast.success("Pembayaran berhasil diperbarui");
      router.push("/dashboard/pembayaran");
      router.refresh();
    } catch (error: any) {
      console.error(error);
      toast.error(`Gagal memperbarui: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus pembayaran ini?")) return;
    
    try {
      const { error } = await supabase.from("pembayarans").delete().eq("id", params.id);
      if (error) throw error;
      toast.success("Pembayaran berhasil dihapus");
      router.push("/dashboard/pembayaran");
    } catch (error: any) {
      toast.error(`Gagal menghapus: ${error.message}`);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <p className="font-bold text-gray-400 animate-pulse uppercase tracking-widest text-xs">Loading Payment Details...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
           <nav className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <Link href="/dashboard/pembayaran" className="hover:text-orange-500 transition-colors">Pembayaran</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900 dark:text-gray-100 italic">Edit</span>
          </nav>
          <div className="flex flex-col gap-2">
            <h1 className="text-6xl font-black text-gray-900 dark:text-gray-100 tracking-tighter">Edit Pembayaran</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
             <Button variant="ghost" onClick={() => router.back()} className="h-14 px-8 rounded-2xl font-black text-gray-400 hover:text-orange-500 transition-all">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
             </Button>
             <Button 
                variant="destructive" 
                onClick={handleDelete}
                className="h-14 px-10 rounded-2xl font-black text-white bg-red-500 hover:bg-red-600 shadow-2xl shadow-red-100 dark:shadow-none transition-all hover:scale-105 active:scale-95 text-lg flex items-center gap-2"
             >
                <Trash2 className="w-5 h-5" />
                Delete
             </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 p-12 rounded-[4rem] shadow-sm border border-gray-100 dark:border-gray-800">
        <form onSubmit={handleSubmit} className="space-y-12">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {/* Pesanan */}
                <div className="space-y-3">
                    <Label className="text-sm font-black text-gray-900 dark:text-gray-300 uppercase tracking-widest pl-1">
                        Pesanan <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.pesanan_id} 
                      onValueChange={(val: string | null) => setFormData(prev => ({ ...prev, pesanan_id: val || "" }))}
                    >
                        <SelectTrigger className="h-14 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 rounded-2xl focus:ring-1 focus:ring-orange-500/20 font-bold text-gray-900 dark:text-gray-100">
                            <SelectValue placeholder="Pilih Pesanan" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-gray-100 shadow-xl font-bold">
                            {orders.map(order => (
                                <SelectItem key={order.id} value={order.id}>
                                    {order.kode_pesanan} - {order.customer?.name} (Rp {order.total_harga?.toLocaleString('id-ID')})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Tanggal Pembayaran */}
                <div className="space-y-3">
                    <Label className="text-sm font-black text-gray-900 dark:text-gray-300 uppercase tracking-widest pl-1">
                        Tanggal Pembayaran <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                        <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <Input 
                            type="date" 
                            value={formData.tanggal_pembayaran}
                            onChange={(e) => setFormData(prev => ({ ...prev, tanggal_pembayaran: e.target.value }))}
                            className="h-14 pl-12 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 rounded-2xl focus-visible:ring-1 focus-visible:ring-orange-500/20 font-bold" 
                            required
                        />
                    </div>
                </div>

                {/* Jumlah Dibayar */}
                <div className="space-y-3">
                    <Label className="text-sm font-black text-gray-900 dark:text-gray-300 uppercase tracking-widest pl-1">
                        Jumlah Dibayar
                    </Label>
                    <div className="relative group">
                        <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-400 group-focus-within:text-orange-500 transition-colors">Rp</span>
                        <Input 
                            type="number" 
                            value={formData.jumlah_dibayar}
                            onChange={(e) => setFormData(prev => ({ ...prev, jumlah_dibayar: Number(e.target.value) }))}
                            className="h-16 pl-14 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-800 rounded-2xl focus-visible:ring-2 focus-visible:ring-orange-500/10 font-black text-xl text-gray-900 dark:text-white shadow-inner" 
                        />
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium italic pl-1">Jumlah dibayar otomatis diisi berdasarkan total harga pesanan</p>
                </div>

                {/* Metode Pembayaran */}
                <div className="space-y-3">
                    <Label className="text-sm font-black text-gray-900 dark:text-gray-300 uppercase tracking-widest pl-1">
                        Metode Pembayaran <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.metode_pembayaran} 
                      onValueChange={(val: string | null) => setFormData(prev => ({ ...prev, metode_pembayaran: val || "" }))}
                    >
                        <SelectTrigger className="h-14 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 rounded-2xl focus:ring-1 focus:ring-orange-500/20 font-bold">
                            <SelectValue placeholder="Pilih Metode" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-gray-100 shadow-xl font-bold">
                            <SelectItem value="transfer">Bank Transfer</SelectItem>
                            <SelectItem value="cash">Tunai (Cash)</SelectItem>
                            <SelectItem value="ewallet">E-Wallet</SelectItem>
                            <SelectItem value="qris">QRIS</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Status Pembayaran */}
                <div className="space-y-3 md:col-span-2">
                    <Label className="text-sm font-black text-gray-900 dark:text-gray-300 uppercase tracking-widest pl-1">
                        Status Pembayaran <span className="text-red-500">*</span>
                    </Label>
                    <Select 
                      value={formData.status_pembayaran} 
                      onValueChange={(val: string | null) => setFormData(prev => ({ ...prev, status_pembayaran: val || "" }))}
                    >
                        <SelectTrigger className="h-14 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 rounded-2xl focus:ring-1 focus:ring-orange-500/20 font-bold">
                            <SelectValue placeholder="Pilih Status" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-gray-100 shadow-xl font-bold">
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Paid (Lunas)</SelectItem>
                            <SelectItem value="failed">Failed / Rejected</SelectItem>
                            <SelectItem value="partial">Partial (Sebagian)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Bukti Pembayaran */}
            <div className="space-y-4">
                <Label className="text-sm font-black text-gray-900 dark:text-gray-300 uppercase tracking-widest pl-1">Bukti Pembayaran</Label>
                <div className="relative group min-h-[240px] border-4 border-dashed border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 rounded-[3rem] transition-all flex flex-col items-center justify-center p-8 gap-4 overflow-hidden">
                    {fileUrl ? (
                         <div className="relative w-full max-w-lg aspect-video rounded-3xl overflow-hidden shadow-2xl group/preview">
                            <img src={fileUrl} alt="Receipt Preview" className="w-full h-full object-cover transition-transform group-hover/preview:scale-105" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center gap-4">
                               <Button 
                                  type="button" 
                                  variant="outline" 
                                  className="bg-white text-gray-900 rounded-xl font-bold border-none"
                                  onClick={() => {
                                      const input = document.getElementById('file-upload') as HTMLInputElement;
                                      input?.click();
                                  }}
                               >
                                  Change Photo
                               </Button>
                               <Button 
                                  type="button" 
                                  variant="destructive" 
                                  className="rounded-xl font-bold"
                                  onClick={() => {
                                      setFile(null);
                                      setFileUrl(null);
                                  }}
                               >
                                  Remove
                               </Button>
                            </div>
                         </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3 text-center">
                            <div className="w-16 h-16 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                                <Upload className="w-8 h-8" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Upload Bukti Baru</p>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">JPG, PNG, PDF up to 5MB</p>
                            </div>
                        </div>
                    )}
                    <input 
                      id="file-upload"
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                              setFile(f);
                              setFileUrl(URL.createObjectURL(f));
                          }
                      }}
                    />
                </div>
                <p className="text-[10px] text-gray-400 font-medium italic pl-1">Bukti pembayaran otomatis diunggah oleh customer</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="md:col-span-2 space-y-3">
                    <Label className="text-sm font-black text-gray-900 dark:text-gray-300 uppercase tracking-widest pl-1">Nomor Referensi</Label>
                    <Input 
                    placeholder="e.g. TXN-12345678" 
                    value={formData.nomor_referensi}
                    onChange={(e) => setFormData(prev => ({ ...prev, nomor_referensi: e.target.value }))}
                    className="h-14 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 rounded-2xl focus-visible:ring-1 focus-visible:ring-orange-500/20 font-bold"
                    />
                    <p className="text-[10px] text-gray-400 font-medium italic pl-1">Nomor referensi dari gerbang pembayaran</p>
                </div>
            </div>

            {/* Catatan */}
            <div className="space-y-3">
                <Label className="text-sm font-black text-gray-900 dark:text-gray-300 uppercase tracking-widest pl-1">Catatan</Label>
                <Textarea 
                   placeholder="Tambah catatan jika perlu..." 
                   value={formData.catatan}
                   onChange={(e) => setFormData(prev => ({ ...prev, catatan: e.target.value }))}
                   className="min-h-[140px] border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 rounded-[2.5rem] p-8 focus-visible:ring-1 focus-visible:ring-orange-500/20 font-medium shadow-inner"
                />
                <p className="text-[10px] text-gray-400 font-medium italic pl-1">Catatan otomatis diisi oleh customer</p>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
                <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full h-20 rounded-[2rem] bg-orange-500 hover:bg-orange-600 text-white font-black text-2xl shadow-2xl shadow-orange-100 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-4"
                >
                    {isSubmitting ? (
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <>
                            <Save className="w-8 h-8" />
                            SIMPAN PERUBAHAN
                        </>
                    )}
                </Button>
            </div>
        </form>
      </div>
    </div>
  );
}
