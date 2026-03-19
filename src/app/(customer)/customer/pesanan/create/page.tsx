"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  ChevronRight, 
  Trash2, 
  Upload, 
  Minus, 
  Plus, 
  Camera,
  Info,
  ArrowLeft,
  ShoppingBag,
  Calendar as CalendarIcon,
  X,
  PlusCircle,
  Sparkles,
  ArrowRight
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
import { ServiceCategory, HARGA_KATEGORI } from "@/types/database";

interface ServiceItem {
  id: string;
  layanan: string;
  jenisSepatu: string;
  jumlahPasang: number;
  hargaSatuan: number;
  biayaTambahan: number;
  subtotal: number;
  catatanKhusus: string;
  foto?: File;
  fotoUrl?: string;
}

export default function PesananCreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [layananList, setLayananList] = useState<any[]>([]);
  const [jenisSepatuList, setJenisSepatuList] = useState<any[]>([]);
  const [customer, setCustomer] = useState<any>(null);

  // Form State
  const [tanggalPesanan, setTanggalPesanan] = useState(new Date().toISOString().split('T')[0]);
  const [metodePengantaran, setMetodePengantaran] = useState("drop_off");
  const [items, setItems] = useState<ServiceItem[]>([]);

  useEffect(() => {
    async function fetchData() {
      const session = getCustomerSession();
      if (!session) {
        router.push("/login");
        return;
      }
      setCustomer(session);

      const supabase = createClient();
      const [layananRes, jenisRes] = await Promise.all([
        supabase.from("layanans").select("*").eq("is_active", true),
        supabase.from("jenis_sepatus").select("*").eq("is_active", true),
      ]);

      if (layananRes.data) setLayananList(layananRes.data);
      if (jenisRes.data) setJenisSepatuList(jenisRes.data);
      
      // Add initial item
      const defaultLayanan = layananRes.data?.[0];
      const defaultJenis = jenisRes.data?.[0];
      
      setItems([{
        id: Math.random().toString(36).substr(2, 9),
        layanan: defaultLayanan?.id || "",
        jenisSepatu: defaultJenis?.id || "",
        jumlahPasang: 1,
        hargaSatuan: HARGA_KATEGORI[defaultLayanan?.kategori_layanan as ServiceCategory] || 0,
        biayaTambahan: 0,
        subtotal: HARGA_KATEGORI[defaultLayanan?.kategori_layanan as ServiceCategory] || 0,
        catatanKhusus: "",
      }]);
      
      setLoading(false);
    }
    fetchData();
  }, [router]);

  const totalPayment = items.reduce((acc, curr) => acc + (curr.subtotal || 0), 0);

  const addItem = () => {
    const defaultLayanan = layananList[0];
    const defaultJenis = jenisSepatuList[0];
    const newItem: ServiceItem = {
      id: Math.random().toString(36).substr(2, 9),
      layanan: defaultLayanan?.id || "",
      jenisSepatu: defaultJenis?.id || "",
      jumlahPasang: 1,
      hargaSatuan: HARGA_KATEGORI[defaultLayanan?.kategori_layanan as ServiceCategory] || 0,
      biayaTambahan: 0,
      subtotal: HARGA_KATEGORI[defaultLayanan?.kategori_layanan as ServiceCategory] || 0,
      catatanKhusus: "",
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    if (items.length === 1) {
      toast.error("Minimal harus ada satu item pesanan");
      return;
    }
    setItems(items.filter(i => i.id !== id));
  };

  const updateItem = (id: string, field: keyof ServiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'layanan') {
            const lay = layananList.find(l => l.id === value);
            updated.hargaSatuan = HARGA_KATEGORI[lay?.kategori_layanan as ServiceCategory] || 0;
        }
        // Recalculate subtotal
        const qty = field === 'jumlahPasang' ? Number(value) : Number(updated.jumlahPasang);
        const price = field === 'hargaSatuan' ? Number(value) : Number(updated.hargaSatuan);
        const extra = field === 'biayaTambahan' ? Number(value) : Number(updated.biayaTambahan);
        updated.subtotal = (isNaN(qty) ? 0 : qty) * (isNaN(price) ? 0 : price) + (isNaN(extra) ? 0 : extra);
        
        return updated;
      }
      return item;
    }));
  };

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

  const generateOrderCode = () => {
    const letters = "FST";
    const numbers = Math.floor(1000 + Math.random() * 9000);
    return `${letters}${numbers}`;
  };

  const handleSubmit = async (createAnother = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    
    try {
      const supabase = createClient();

      // 1. Create Pesanan Header
      const orderCode = generateOrderCode();
      const { data: order, error: orderError } = await supabase
        .from("pesanans")
        .insert({
          customer_id: customer.id,
          kode_pesanan: orderCode,
          tanggal_pesanan: tanggalPesanan,
          total_harga: totalPayment,
          metode_pengantaran: metodePengantaran,
          status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Create Details
      for (const item of items) {
        let foto_sebelum = null;
        if (item.foto) {
          foto_sebelum = await uploadImage(item.foto);
        }

        const { error: detailError } = await supabase
          .from("detail_pesanans")
          .insert({
            pesanan_id: order.id,
            layanan_id: item.layanan || null,
            jenis_sepatu_id: item.jenisSepatu || null,
            jumlah_pasang: item.jumlahPasang || 1,
            harga_satuan: item.hargaSatuan || 0,
            biaya_tambahan: item.biayaTambahan || 0,
            subtotal: item.subtotal || 0,
            catatan_khusus: item.catatanKhusus || "",
            foto_sebelum
          });

        if (detailError) throw detailError;
      }

      toast.success("Pesanan berhasil dibuat!");
      
      if (createAnother) {
        window.location.reload();
      } else {
        router.push("/customer/pesanan");
      }
    } catch (error: any) {
      toast.error(`Gagal membuat pesanan: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <p className="font-bold text-gray-500 animate-pulse uppercase tracking-widest text-xs">Menyiapkan Formulir...</p>
    </div>
  );

  return (
    <div className="max-w-[1200px] mx-auto space-y-10 pb-40 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col gap-6">
        <nav className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
          <Link href="/customer/pesanan" className="hover:text-orange-500 transition-all flex items-center gap-1">
             <ShoppingBag className="w-3 h-3" />
             Orders
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900 dark:text-gray-100 italic">Create New Pesanan</span>
        </nav>
        
        <div className="space-y-2 text-left">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-gray-100 tracking-tighter">Buat Pesanan Baru</h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium text-base md:text-lg max-w-2xl leading-relaxed">Pilih layanan pembersihan terbaik untuk koleksi sepatu kesayangan Anda.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* Section 1: Informasi Umum */}
        <div className="bg-white dark:bg-gray-900 p-6 md:p-10 rounded-[2.5rem] md:rounded-[4rem] shadow-sm border border-gray-100 dark:border-gray-800 space-y-8 md:space-y-10 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 dark:bg-orange-950/20 rounded-bl-[4rem] flex items-center justify-center transition-transform group-hover:scale-110">
              <Sparkles className="w-10 h-10 text-orange-500" />
          </div>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center text-orange-500">
              <Info className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">Informasi Utama</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <Label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">Tanggal Rencana Drop/Pickup</Label>
              <div className="relative group/input">
                <CalendarIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/input:text-orange-500 transition-colors" />
                <Input 
                  type="date" 
                  value={tanggalPesanan}
                  onChange={(e) => setTanggalPesanan(e.target.value)}
                  className="h-16 border-none bg-gray-50 dark:bg-gray-800/50 rounded-2xl pl-14 font-black text-lg focus-visible:ring-orange-500/20"
                />
              </div>
            </div>
            <div className="space-y-4">
              <Label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">Metode Pengantaran <span className="text-orange-500">*</span></Label>
              <Select value={metodePengantaran} onValueChange={(val) => setMetodePengantaran(val || "drop_off")}>
                <SelectTrigger className="h-16 border-none bg-gray-50 dark:bg-gray-800/50 rounded-2xl font-black text-lg px-6 focus:ring-orange-500/20">
                  <SelectValue placeholder="Pilih metode" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none font-bold overflow-hidden shadow-2xl">
                  <SelectItem value="drop_off" className="py-4">Drop Off (Antar ke Store)</SelectItem>
                  <SelectItem value="pickup" className="py-4">Pickup (Layanan Penjemputan)</SelectItem>
                  <SelectItem value="delivery" className="py-4">Delivery Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Section 2: Pilih Layanan */}
        <div className="space-y-10">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center text-orange-500">
                <LayoutGrid className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter">Pilih Layanan</h2>
            </div>
            <Button 
                variant="ghost" 
                onClick={addItem}
                className="bg-orange-500 text-white font-black h-12 px-6 rounded-2xl gap-3 shadow-xl shadow-orange-100 dark:shadow-none hover:bg-orange-600 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-5 h-5 stroke-[4px]" /> 
              TAMBAH ITEM
            </Button>
          </div>

          <div className="space-y-16">
            {items.map((item, index) => (
              <div key={item.id} className="relative group">
                {/* Item Number Badge */}
                <div className="absolute -top-6 -left-4 z-10 transition-transform group-hover:scale-110">
                    <span className="bg-orange-500 text-white px-8 py-3 rounded-full font-black text-xs uppercase tracking-widest shadow-2xl shadow-orange-200 dark:shadow-none border-[6px] border-white dark:border-gray-950">ITEM #{index + 1}</span>
                </div>

                <div className="bg-white dark:bg-gray-900 p-6 md:p-12 rounded-[2.5rem] md:rounded-[4rem] shadow-sm border border-gray-100 dark:border-gray-800 group-hover:border-orange-200 transition-all duration-500">
                  <button 
                    onClick={() => removeItem(item.id)}
                    className="absolute top-10 right-10 p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-2xl transition-all"
                  >
                    <Trash2 className="w-8 h-8" />
                  </button>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-10">
                    <div className="space-y-4">
                      <Label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">Layanan yang Diinginkan</Label>
                      <Select value={item.layanan} onValueChange={(val) => updateItem(item.id, 'layanan', val)}>
                        <SelectTrigger className="h-16 border-none bg-gray-50 dark:bg-gray-800/50 rounded-2xl font-black text-gray-900 dark:text-white px-6">
                          <SelectValue placeholder="Pilih layanan laundry" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none font-bold">
                          {layananList.map(lay => (
                            <SelectItem key={lay.id} value={lay.id} className="py-3">{lay.nama_layanan} - Rp {(HARGA_KATEGORI[lay.kategori_layanan as ServiceCategory] || 0).toLocaleString('id-ID')}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">Model / Jenis Sepatu</Label>
                      <Select value={item.jenisSepatu} onValueChange={(val) => updateItem(item.id, 'jenisSepatu', val)}>
                        <SelectTrigger className="h-16 border-none bg-gray-50 dark:bg-gray-800/50 rounded-2xl font-black text-gray-900 dark:text-white px-6">
                          <SelectValue placeholder="Pilih jenis sepatu" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-none font-bold">
                          {jenisSepatuList.map(j => (
                            <SelectItem key={j.id} value={j.id} className="py-3">{j.nama_jenis} ({j.merek})</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4">
                      <Label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2 text-center block">Jumlah Pasang</Label>
                      <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-2 h-16 shadow-inner">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-12 w-12 rounded-xl text-gray-400 hover:text-orange-500 transition-colors"
                          onClick={() => updateItem(item.id, 'jumlahPasang', Math.max(1, item.jumlahPasang - 1))}
                        >
                          <Minus className="w-5 h-5 stroke-[3px]" />
                        </Button>
                        <span className="flex-1 text-center font-black text-2xl tracking-tighter text-gray-900 dark:text-white">{item.jumlahPasang}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-12 w-12 rounded-xl text-gray-400 hover:text-orange-500 transition-colors"
                          onClick={() => updateItem(item.id, 'jumlahPasang', item.jumlahPasang + 1)}
                        >
                          <Plus className="w-5 h-5 stroke-[3px]" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-12">
                     <div className="space-y-4">
                        <Label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">Harga Satuan</Label>
                        <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-gray-400 text-sm uppercase">Rp</span>
                            <Input 
                                disabled
                                value={(item.hargaSatuan || 0).toLocaleString('id-ID')}
                                className="h-16 border-transparent bg-gray-50 dark:bg-gray-800 shadow-inner rounded-3xl pl-14 font-black text-gray-500 dark:text-gray-400 text-lg opacity-70" 
                            />
                        </div>
                     </div>
                     <div className="space-y-4">
                        <Label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-2">Biaya Tambahan</Label>
                        <div className="relative">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-orange-300 text-sm uppercase">Rp</span>
                            <Input 
                                type="number"
                                value={item.biayaTambahan || 0}
                                onChange={(e) => updateItem(item.id, 'biayaTambahan', e.target.value)}
                                className="h-16 border-none bg-gray-50 dark:bg-gray-800/50 rounded-3xl pl-14 font-black text-gray-900 dark:text-white text-lg focus-visible:ring-orange-500/20" 
                            />
                        </div>
                     </div>
                     <div className="space-y-4">
                        <Label className="text-xs font-black text-orange-500 uppercase tracking-widest pl-2 italic">Subtotal Item</Label>
                        <div className="relative group/subtotal">
                            <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-orange-500 text-sm uppercase">Rp</span>
                            <Input 
                                disabled
                                value={(item.subtotal || 0).toLocaleString('id-ID')}
                                className="h-16 border-none bg-orange-50 dark:bg-orange-950/20 rounded-3xl pl-14 font-black text-orange-500 text-2xl tracking-tighter shadow-lg shadow-orange-100/50 dark:shadow-none transition-transform group-hover/subtotal:scale-[1.02]" 
                            />
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-16">
                     <div className="space-y-6">
                        <div className="flex items-center gap-3 pl-2">
                            <div className="w-2 h-6 bg-orange-500 rounded-full" />
                            <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter">Catatan Spesifik</h3>
                        </div>
                        <Textarea 
                            placeholder="Tulis detail noda, bagian sensitif, atau riwayat sepatu ini..."
                            value={item.catatanKhusus || ""}
                            onChange={(e) => updateItem(item.id, 'catatanKhusus', e.target.value)}
                            className="min-h-[200px] border-none bg-gray-50/50 dark:bg-gray-800/30 rounded-[3rem] p-10 focus-visible:ring-orange-500/20 font-medium text-gray-600 dark:text-gray-400 leading-relaxed text-lg"
                        />
                     </div>
                     <div className="space-y-6">
                        <div className="flex items-center gap-3 pl-2">
                            <div className="w-2 h-6 bg-orange-500 rounded-full" />
                            <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-tighter">Foto Kondisi (Sebelum)</h3>
                        </div>
                        <div className="relative group/upload-zone">
                            {item.fotoUrl ? (
                                <div className="relative aspect-[16/10] w-full rounded-[3.5rem] overflow-hidden border-4 border-orange-100 dark:border-orange-900/50 shadow-2xl group/img">
                                    <img src={item.fotoUrl} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110" />
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all duration-300">
                                        <Button 
                                            variant="destructive" 
                                            size="icon" 
                                            className="rounded-full w-20 h-20 shadow-2xl hover:scale-110 transition-transform"
                                            onClick={() => {
                                                updateItem(item.id, 'foto', undefined);
                                                updateItem(item.id, 'fotoUrl', undefined);
                                            }}
                                        >
                                            <X className="w-10 h-10 stroke-[3px]" />
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="relative aspect-[16/10] w-full border-4 border-dashed border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:border-orange-200 transition-all duration-500 rounded-[3.5rem] flex flex-col items-center justify-center gap-6 cursor-pointer overflow-hidden">
                                    <input 
                                        type="file" 
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                updateItem(item.id, 'foto', file);
                                                updateItem(item.id, 'fotoUrl', URL.createObjectURL(file));
                                            }
                                        }}
                                    />
                                    <div className="w-20 h-20 rounded-3xl bg-white dark:bg-gray-800 shadow-xl flex items-center justify-center text-orange-500 group-hover/upload-zone:rotate-12 transition-transform duration-500">
                                        <Camera className="w-10 h-10 stroke-[1.5px]" />
                                    </div>
                                    <div className="text-center space-y-2 px-8">
                                        <p className="text-xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Abadikan Kondisi Sepatu</p>
                                        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest leading-loose">Tap untuk upload foto detail (Maks 10MB)</p>
                                    </div>
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[10px] font-black text-orange-400 uppercase tracking-widest opacity-0 group-hover/upload-zone:opacity-100 transition-opacity">
                                        Support High Resolution <ArrowRight className="w-3 h-3" />
                                    </div>
                                </div>
                            )}
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer / Summary - Matching Design Sticky Bar */}
      <div className="fixed bottom-0 left-0 lg:left-[280px] right-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur-2xl border-t border-gray-100 dark:border-gray-800 p-6 md:p-8 z-40 shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.05)]">
          <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                  <span className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-1 pl-1">Total Pembayaran</span>
                  <div className="flex items-baseline gap-2">
                      <span className="text-xl md:text-2xl lg:text-3xl font-black text-orange-500 uppercase">Rp</span>
                      <span className="text-4xl md:text-5xl lg:text-7xl font-black text-gray-900 dark:text-gray-100 tracking-tighter leading-none">{(totalPayment || 0).toLocaleString('id-ID')}</span>
                  </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6 w-full md:w-auto">
                  <Button 
                    variant="ghost" 
                    onClick={() => router.back()}
                    className="h-14 md:h-20 w-full sm:w-auto px-12 rounded-[1.5rem] md:rounded-[2rem] font-black text-white bg-red-500 hover:bg-red-600 shadow-2xl shadow-red-100 dark:shadow-none transition-all hover:scale-105 active:scale-95 text-lg md:text-xl"
                  >
                      Cancel
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => handleSubmit(true)}
                    disabled={isSubmitting}
                    className="h-14 md:h-20 w-full sm:w-auto px-8 md:px-12 rounded-[1.5rem] md:rounded-[2rem] font-black border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 border-[3px] transition-all hover:scale-105 active:scale-95 text-lg md:text-xl flex items-center justify-center gap-3"
                  >
                      <PlusCircle className="w-5 h-5 md:w-6 md:h-6" />
                      <span className="whitespace-nowrap">{isSubmitting ? "mendaftarkan..." : "Create & Another"}</span>
                  </Button>
                  <Button 
                    onClick={() => handleSubmit(false)}
                    disabled={isSubmitting}
                    className="h-14 md:h-20 w-full sm:w-auto px-12 md:px-20 rounded-[1.5rem] md:rounded-[2rem] font-black text-white bg-orange-500 hover:bg-orange-600 shadow-2xl shadow-orange-100 dark:shadow-none transition-all hover:scale-110 active:scale-95 text-xl md:text-2xl flex items-center justify-center gap-4"
                  >
                      <span>{isSubmitting ? "Memproses..." : "Create Order"}</span>
                      <ArrowRight className="w-6 h-6 md:w-8 md:h-8 stroke-[3px]" />
                  </Button>
              </div>
          </div>
      </div>
    </div>
  );
}

function LayoutGrid(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect width="7" height="7" x="14" y="14" rx="1" /><rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}