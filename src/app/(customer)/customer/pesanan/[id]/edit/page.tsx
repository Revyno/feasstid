"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  ChevronRight, 
  Trash2, 
  X,
  Upload, 
  Minus, 
  Plus, 
  Camera,
  MoreVertical,
  Save,
  Info,
  ArrowLeft,
  ChevronDown,
  ShoppingBag
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

interface ServiceItem {
  id: string;
  dbId?: string;
  layanan: string;
  jenisSepatu: string;
  jumlahPasang: number;
  hargaSatuan: number;
  biayaTambahan: number;
  subtotal: number;
  catatanKhusus: string;
  foto?: File;
  fotoUrl?: string;
  isDeleted?: boolean;
}

export default function EditOrderPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [layananList, setLayananList] = useState<any[]>([]);
  const [jenisSepatuList, setJenisSepatuList] = useState<any[]>([]);
  const [orderData, setOrderData] = useState<any>(null);
  const [items, setItems] = useState<ServiceItem[]>([]);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const [layananRes, jenisRes, orderRes] = await Promise.all([
        supabase.from("layanans").select("*"),
        supabase.from("jenis_sepatus").select("*"),
        supabase.from("pesanans").select("*, detail_pesanans(*)").eq("id", params.id).single()
      ]);

      if (layananRes.data) setLayananList(layananRes.data);
      if (jenisRes.data) setJenisSepatuList(jenisRes.data);
      
      if (orderRes.data) {
        setOrderData(orderRes.data);
        const mappedItems = orderRes.data.detail_pesanans.map((d: any) => ({
          id: d.id,
          dbId: d.id,
          layanan: d.layanan_id,
          jenisSepatu: d.jenis_sepatu_id || "",
          jumlahPasang: d.jumlah_pasang,
          hargaSatuan: d.harga_satuan,
          biayaTambahan: d.biaya_tambahan,
          subtotal: d.subtotal,
          catatanKhusus: d.catatan_khusus || "",
          fotoUrl: d.foto_sebelum
        }));
        setItems(mappedItems);
      }
      
      setLoading(false);
    }
    if (params.id) fetchData();
  }, [params.id]);

  const totalPayment = items.filter(i => !i.isDeleted).reduce((acc, curr) => acc + curr.subtotal, 0);

  const uploadImage = async (file: File) => {
    const supabase = createClient();
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `orders/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;
    
    const { data: { publicUrl } } = supabase.storage
      .from('photos')
      .getPublicUrl(filePath);
      
    return publicUrl;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const supabase = createClient();

      // 1. Update Pesanan Header
      const { error: orderError } = await supabase
        .from("pesanans")
        .update({
          total_harga: totalPayment,
          metode_pengantaran: orderData.metode_pengantaran,
          catatan: orderData.catatan,
          updated_at: new Date().toISOString()
        })
        .eq("id", params.id);

      if (orderError) throw orderError;

      // 2. Handle Details
      for (const item of items) {
        if (item.isDeleted && item.dbId) {
          await supabase.from("detail_pesanans").delete().eq("id", item.dbId);
          continue;
        }

        let foto_sebelum = item.fotoUrl;
        if (item.foto) {
           foto_sebelum = await uploadImage(item.foto);
        }

        const detailPayload = {
          pesanan_id: params.id,
          layanan_id: item.layanan,
          jenis_sepatu_id: item.jenisSepatu || null,
          jumlah_pasang: item.jumlahPasang,
          harga_satuan: item.hargaSatuan,
          biaya_tambahan: item.biayaTambahan,
          subtotal: item.subtotal,
          catatan_khusus: item.catatanKhusus,
          foto_sebelum
        };

        if (item.dbId) {
          await supabase.from("detail_pesanans").update(detailPayload).eq("id", item.dbId);
        } else {
          await supabase.from("detail_pesanans").insert(detailPayload);
        }
      }

      toast.success("Pesanan berhasil diperbarui!");
      router.push(`/customer/pesanan/${params.id}`);
    } catch (error: any) {
      toast.error(`Gagal memperbarui: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addItem = () => {
    const defaultLayanan = layananList[0];
    const newItem: ServiceItem = {
      id: Math.random().toString(36).substr(2, 9),
      layanan: defaultLayanan?.id || "",
      jenisSepatu: jenisSepatuList[0]?.id || "",
      jumlahPasang: 1,
      hargaSatuan: 50000,
      biayaTambahan: 0,
      subtotal: 50000,
      catatanKhusus: "",
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.map(i => i.id === id ? { ...i, isDeleted: true } : i));
  };

  const updateItem = (id: string, field: keyof ServiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'layanan') {
            const lay = layananList.find(l => l.id === value);
            updated.hargaSatuan = lay?.harga_dasar || 0;
        }
        if (['layanan', 'jumlahPasang', 'hargaSatuan', 'biayaTambahan'].includes(field)) {
            updated.subtotal = (Number(updated.jumlahPasang) * Number(updated.hargaSatuan)) + Number(updated.biayaTambahan);
        }
        return updated;
      }
      return item;
    }));
  };

  if (loading) return <div className="p-20 text-center font-black text-orange-500 animate-pulse">Memuat data...</div>;

  return (
    <div className="space-y-8 animate-in slide-in-from-left-4 duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-4">
          <nav className="flex items-center gap-2 text-sm font-medium text-gray-400 dark:text-gray-500">
            <Link href={`/customer/pesanan/${params.id}`} className="hover:text-orange-500 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> Detail
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 dark:text-gray-100 font-bold underline decoration-2 underline-offset-4 decoration-orange-500/30">Edit</span>
          </nav>
          <h1 className="text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Edit Pesanan</h1>
        </div>
        <div className="flex items-center gap-3">
            <Button variant="ghost" className="h-12 px-6 rounded-2xl font-black text-gray-400 dark:text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={() => router.back()}>
                Batal
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="h-12 px-8 rounded-2xl font-black text-white bg-orange-500 hover:bg-orange-600 shadow-xl shadow-orange-100 dark:shadow-none">
                {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="space-y-3">
              <Label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Metode Pengantaran</Label>
              <Select value={orderData.metode_pengantaran} onValueChange={(val) => setOrderData({...orderData, metode_pengantaran: val})}>
                <SelectTrigger className="h-14 border-none bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl focus:ring-0 font-bold dark:text-gray-100">
                    <SelectValue placeholder="Pilih metode" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-gray-100 dark:border-gray-800 shadow-xl font-bold dark:bg-gray-900">
                    <SelectItem value="pickup">Pickup (Layanan Jemput)</SelectItem>
                    <SelectItem value="drop_off">Drop Off (Antar Sendiri)</SelectItem>
                </SelectContent>
              </Select>
          </div>
          <div className="space-y-3">
              <Label className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Estimasi Harga Total</Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 dark:text-gray-600 uppercase text-[10px]">IDR</span>
                <Input value={totalPayment.toLocaleString('id-ID')} readOnly className="h-14 border-none bg-orange-50/50 dark:bg-orange-950/20 rounded-2xl font-black text-orange-500 focus-visible:ring-0 pl-12 text-lg" />
              </div>
          </div>
      </div>

      <section className="space-y-6">
          <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-3 italic">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-500">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  Item Detail
              </h2>
              <Button variant="ghost" onClick={addItem} className="text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 font-black gap-2">
                  <Plus className="w-4 h-4 stroke-[3px]" /> TAMBAH ITEM
              </Button>
          </div>
          
          <div className="space-y-8">
              {items.filter(i => !i.isDeleted).map((item, index) => (
                  <div key={item.id} className="relative group animate-in zoom-in-95 duration-300">
                      <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 group-hover:border-orange-200 dark:group-hover:border-orange-900/50 transition-all">
                          <button onClick={() => removeItem(item.id)} className="absolute top-8 right-8 p-2 text-gray-300 dark:text-gray-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl">
                              <Trash2 className="w-5 h-5" />
                          </button>

                          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                             <div className="md:col-span-3 space-y-4">
                                <Label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-4">FOTO SEBELUM</Label>
                                <div className="relative w-full aspect-square rounded-[2rem] bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center overflow-hidden group/upload cursor-pointer hover:bg-orange-50/30 dark:hover:bg-orange-950/20 hover:border-orange-200 dark:hover:border-orange-900/50">
                                   {item.fotoUrl ? (
                                     <>
                                        <img src={item.fotoUrl} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/upload:opacity-100 transition-opacity flex items-center justify-center">
                                            <Upload className="w-8 h-8 text-white" />
                                        </div>
                                     </>
                                   ) : (
                                     <div className="flex flex-col items-center gap-2">
                                        <Camera className="w-8 h-8 text-gray-300" />
                                        <span className="text-[10px] font-bold text-gray-400">UPLOAD FOTO</span>
                                     </div>
                                   )}
                                   <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                                       const file = e.target.files?.[0];
                                       if (file) {
                                           updateItem(item.id, 'foto', file);
                                           updateItem(item.id, 'fotoUrl', URL.createObjectURL(file));
                                       }
                                   }} />
                                </div>
                             </div>

                             <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-8">
                                 <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Layanan</Label>
                                    <Select value={item.layanan} onValueChange={(val) => updateItem(item.id, 'layanan', val)}>
                                        <SelectTrigger className="h-12 border-none bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl focus:ring-0 font-bold dark:text-gray-100">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-gray-100 dark:border-gray-800 shadow-xl dark:bg-gray-900">
                                            {layananList.map(lay => (
                                                <SelectItem key={lay.id} value={lay.id}>{lay.nama_layanan}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                 <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Jenis Sepatu</Label>
                                    <Select value={item.jenisSepatu} onValueChange={(val) => updateItem(item.id, 'jenisSepatu', val)}>
                                        <SelectTrigger className="h-12 border-none bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl focus:ring-0 font-bold dark:text-gray-100">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-gray-100 dark:border-gray-800 shadow-xl dark:bg-gray-900">
                                            {jenisSepatuList.map(j => (
                                                <SelectItem key={j.id} value={j.id}>{j.nama_jenis} - {j.merek}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                 <div className="space-y-2">
                                    <Label className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">Jumlah Pasang</Label>
                                    <div className="flex items-center gap-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-2xl p-1 h-12">
                                        <Button variant="ghost" size="icon" className="h-10 w-10 text-orange-500 dark:hover:bg-orange-950/40" onClick={() => updateItem(item.id, 'jumlahPasang', Math.max(1, item.jumlahPasang - 1))}>
                                            <Minus className="w-4 h-4 stroke-[3px]" />
                                        </Button>
                                        <span className="flex-1 text-center font-black text-gray-900 dark:text-gray-100">{item.jumlahPasang}</span>
                                        <Button variant="ghost" size="icon" className="h-10 w-10 text-orange-500 dark:hover:bg-orange-950/40" onClick={() => updateItem(item.id, 'jumlahPasang', item.jumlahPasang + 1)}>
                                            <Plus className="w-4 h-4 stroke-[3px]" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                   <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Subtotal Item</Label>
                                   <div className="relative">
                                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs uppercase">Rp</span>
                                      <Input value={item.subtotal.toLocaleString('id-ID')} readOnly className="h-12 border-none bg-orange-50/30 rounded-2xl font-black text-gray-900 focus-visible:ring-0 pl-11 text-right pr-4" />
                                   </div>
                                </div>
                                <div className="md:col-span-2 space-y-2">
                                    <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Catatan Khusus</Label>
                                    <Textarea value={item.catatanKhusus} onChange={(e) => updateItem(item.id, 'catatanKhusus', e.target.value)} className="min-h-[100px] border-none bg-gray-50/50 rounded-2xl p-4 focus-visible:ring-orange-500/20 font-medium text-gray-600 sm" />
                                </div>
                             </div>
                          </div>
                      </div>
                  </div>
              ))}
          </div>
      </section>

      <div className="pt-8 border-t border-gray-100 flex flex-col gap-4">
        <Label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1 italic">Catatan Pesanan Utama</Label>
        <Textarea value={orderData.catatan || ""} onChange={(e) => setOrderData({...orderData, catatan: e.target.value})} className="min-h-[120px] border-none bg-white rounded-[2.5rem] p-8 focus-visible:ring-orange-500/20 font-medium text-gray-600 shadow-sm" />
      </div>
    </div>
  );
}
