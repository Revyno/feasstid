"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { 
  ChevronRight, 
  Trash2, 
  Minus, 
  Plus, 
  Camera,
  Info,
  ShoppingBag,
  Calendar as CalendarIcon,
  X,
  PlusCircle,
  Sparkles,
  ArrowRight,
  LayoutGrid,
  ChevronDown,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

// ── Custom Select for UUID-based options ──────────────────────────────────────
interface CustomSelectOption {
  value: string;
  label: string;
}

function CustomSelect({
  value,
  onChange,
  options,
  placeholder = "Pilih...",
  className,
}: {
  value: string;
  onChange: (val: string) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find((o) => o.value === value)?.label ?? "";

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full h-12 items-center justify-between gap-2 border-none bg-gray-50 dark:bg-gray-800/50 rounded-lg px-4 text-sm font-bold text-gray-900 dark:text-white outline-none cursor-pointer"
      >
        <span className={cn("truncate text-left", !selectedLabel && "font-normal text-gray-400 dark:text-gray-500")}>
          {selectedLabel || placeholder}
        </span>
        <ChevronDown className={cn("w-4 h-4 text-gray-400 shrink-0 transition-transform", open && "rotate-180")} />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-xl bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800 py-1">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-xs text-gray-400 text-center">Tidak ada pilihan</div>
          ) : (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-2 px-4 py-2.5 text-sm font-bold text-left hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors",
                  value === option.value ? "text-orange-500" : "text-gray-800 dark:text-gray-200"
                )}
              >
                <span className="truncate">{option.label}</span>
                {value === option.value && <Check className="w-3.5 h-3.5 shrink-0 text-orange-500" />}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function PesananCreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [layananList, setLayananList] = useState<any[]>([]);
  const [jenisSepatuList, setJenisSepatuList] = useState<any[]>([]);
  const [customer, setCustomer] = useState<any>(null);

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
    const { error: uploadError } = await supabase.storage.from('photos').upload(filePath, file);
    if (uploadError) throw uploadError;
    const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(filePath);
    return publicUrl;
  };

  const generateOrderCode = () => {
    const numbers = Math.floor(1000 + Math.random() * 9000);
    return `FST${numbers}`;
  };

  const handleSubmit = async (createAnother = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const supabase = createClient();
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

      for (const item of items) {
        let foto_sebelum = null;
        if (item.foto) foto_sebelum = await uploadImage(item.foto);
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
      if (createAnother) window.location.reload();
      else router.push("/customer/pesanan");
    } catch (error: any) {
      toast.error(`Gagal membuat pesanan: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build option lists for custom selects
  const layananOptions: CustomSelectOption[] = layananList.map((lay) => ({
    value: lay.id,
    label: `${lay.nama_layanan} — Rp ${(HARGA_KATEGORI[lay.kategori_layanan as ServiceCategory] || 0).toLocaleString('id-ID')}`,
  }));

  const jenisSepatuOptions: CustomSelectOption[] = jenisSepatuList.map((j) => ({
    value: j.id,
    label: `${j.nama_jenis} (${j.merek})`,
  }));

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <p className="font-bold text-gray-500 animate-pulse uppercase tracking-widest text-xs">Menyiapkan Formulir...</p>
    </div>
  );

  return (
    <div className="max-w-[900px] mx-auto space-y-6 pb-44 md:pb-36 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="space-y-3 pt-2">
        <nav className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <Link href="/customer/pesanan" className="hover:text-orange-500 transition-all flex items-center gap-1">
            <ShoppingBag className="w-3 h-3" />
            Orders
          </Link>
          <ChevronRight className="w-3 h-3" />
          <span className="text-gray-900 dark:text-gray-100">Buat Pesanan</span>
        </nav>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tight">Buat Pesanan Baru</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm md:text-base">Pilih layanan pembersihan terbaik untuk koleksi sepatu kesayangan Anda.</p>
      </div>

      {/* Section 1: Info Umum */}
      <div className="bg-white dark:bg-gray-900 p-5 md:p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 space-y-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-orange-50 dark:bg-orange-950/20 rounded-bl-3xl flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-orange-500" />
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center text-orange-500">
            <Info className="w-5 h-5" />
          </div>
          <h2 className="text-base md:text-lg font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide">Informasi Utama</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tanggal Rencana Drop/Pickup</Label>
            <div className="relative">
              <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                type="date" 
                value={tanggalPesanan}
                onChange={(e) => setTanggalPesanan(e.target.value)}
                className="h-12 border-none bg-gray-50 dark:bg-gray-800/50 rounded-xl pl-11 font-bold focus-visible:ring-orange-500/30"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Metode Pengantaran <span className="text-orange-500">*</span></Label>
            <CustomSelect
              value={metodePengantaran}
              onChange={(val) => setMetodePengantaran(val || "drop_off")}
              options={[
                { value: "drop_off", label: "Drop Off (Antar ke Store)" },
                { value: "pickup", label: "Pickup (Layanan Penjemputan)" },
                { value: "delivery", label: "Delivery Service" },
              ]}
              placeholder="Pilih metode"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Pilih Layanan */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center text-orange-500">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <h2 className="text-base md:text-lg font-black text-gray-900 dark:text-gray-100 uppercase tracking-wide">Pilih Layanan</h2>
          </div>
          <Button 
            variant="ghost" 
            onClick={addItem}
            className="bg-orange-500 text-white font-bold h-10 px-4 rounded-xl gap-2 shadow-lg shadow-orange-100 dark:shadow-none hover:bg-orange-600 transition-all text-sm"
          >
            <Plus className="w-4 h-4 stroke-[3px]" /> 
            Tambah
          </Button>
        </div>

        <div className="space-y-6">
          {items.map((item, index) => (
            <div key={item.id} className="relative">
              {/* Item Badge */}
              <div className="absolute -top-3 left-4 z-10">
                <span className="bg-orange-500 text-white px-4 py-1 rounded-full font-black text-[10px] uppercase tracking-widest shadow-md border-2 border-white dark:border-gray-950">
                  ITEM #{index + 1}
                </span>
              </div>

              <div className="bg-white dark:bg-gray-900 pt-7 p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-orange-200 dark:hover:border-orange-900/50 transition-all">
                <button 
                  onClick={() => removeItem(item.id)}
                  className="absolute top-5 right-5 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                {/* Row 1: Layanan + Jenis + Jumlah */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2 sm:col-span-1">
                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Layanan</Label>
                    <CustomSelect
                      value={item.layanan}
                      onChange={(val) => updateItem(item.id, 'layanan', val)}
                      options={layananOptions}
                      placeholder="Pilih layanan"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Jenis Sepatu</Label>
                    <CustomSelect
                      value={item.jenisSepatu}
                      onChange={(val) => updateItem(item.id, 'jenisSepatu', val)}
                      options={jenisSepatuOptions}
                      placeholder="Pilih jenis"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center block">Jumlah Pasang</Label>
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-1.5 h-12">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 rounded-lg text-gray-400 hover:text-orange-500"
                        onClick={() => updateItem(item.id, 'jumlahPasang', Math.max(1, item.jumlahPasang - 1))}
                      >
                        <Minus className="w-4 h-4 stroke-[3px]" />
                      </Button>
                      <span className="flex-1 text-center font-black text-xl text-gray-900 dark:text-white">{item.jumlahPasang}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-9 w-9 rounded-lg text-gray-400 hover:text-orange-500"
                        onClick={() => updateItem(item.id, 'jumlahPasang', item.jumlahPasang + 1)}
                      >
                        <Plus className="w-4 h-4 stroke-[3px]" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Row 2: Harga + Biaya + Subtotal */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Harga Satuan</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs uppercase">Rp</span>
                      <Input 
                        disabled
                        value={(item.hargaSatuan || 0).toLocaleString('id-ID')}
                        className="h-12 border-transparent bg-gray-50 dark:bg-gray-800 rounded-xl pl-10 font-bold text-gray-500 text-sm opacity-70"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Biaya Tambahan</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-orange-300 text-xs uppercase">Rp</span>
                      <Input 
                        type="number"
                        value={item.biayaTambahan || 0}
                        onChange={(e) => updateItem(item.id, 'biayaTambahan', e.target.value)}
                        className="h-12 border-none bg-gray-50 dark:bg-gray-800/50 rounded-xl pl-10 font-bold text-gray-900 dark:text-white text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black text-orange-500 uppercase tracking-widest ">Subtotal</Label>
                    <div className="relative  md:w-60 ">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-orange-500 text-xs uppercase">Rp</span>
                      <Input 
                        disabled
                        value={(item.subtotal || 0).toLocaleString('id-ID')}
                        className="h-12 border-none bg-orange-50 dark:bg-orange-950/20 rounded-xl pl-10 font-black text-orange-500 text-base"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 3: Catatan + Foto */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">Catatan Spesifik</Label>
                    <Textarea 
                      placeholder="Tulis detail noda, bagian sensitif, atau riwayat sepatu..."
                      value={item.catatanKhusus || ""}
                      onChange={(e) => updateItem(item.id, 'catatanKhusus', e.target.value)}
                      className="min-h-[120px] border-none bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4 text-sm text-gray-600 dark:text-gray-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest">Foto Kondisi</Label>
                    <div className="relative">
                      {item.fotoUrl ? (
                        <div className="relative aspect-video w-full rounded-xl overflow-hidden border-2 border-orange-200 dark:border-orange-900/50 group/img">
                          <img src={item.fotoUrl} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-all">
                            <Button 
                              variant="destructive" 
                              size="icon" 
                              className="rounded-full w-12 h-12"
                              onClick={() => { updateItem(item.id, 'foto', undefined); updateItem(item.id, 'fotoUrl', undefined); }}
                            >
                              <X className="w-6 h-6" />
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative aspect-video w-full border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/30 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:border-orange-300 transition-all rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer">
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
                          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 shadow flex items-center justify-center text-orange-400">
                            <Camera className="w-6 h-6" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">Upload Foto Sepatu</p>
                            <p className="text-xs text-gray-400 mt-0.5">Tap untuk memilih (Maks 10MB)</p>
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

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 lg:left-[--sidebar-width,280px] right-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-t border-gray-100 dark:border-gray-800 p-4 md:p-5 z-40 shadow-[0_-8px_30px_-8px_rgba(0,0,0,0.08)]">
        <div className="max-w-[900px] mx-auto">
          {/* Mobile: stacked layout */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Total */}
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Total:</span>
              <span className="text-lg md:text-2xl font-black text-orange-500">Rp</span>
              <span className="text-2xl md:text-4xl font-black text-gray-900 dark:text-gray-100 tracking-tighter">
                {(totalPayment || 0).toLocaleString('id-ID')}
              </span>
            </div>
            
            {/* Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="h-11 md:h-12 flex-1 sm:flex-none sm:px-6 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 text-sm"
              >
                Batal
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className="h-11 md:h-12 flex-1 sm:flex-none sm:px-6 rounded-xl font-bold border-orange-500 text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 border-2 text-sm gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isSubmitting ? "Saving..." : "Buat & Lagi"}</span>
              </Button>
              <Button 
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="h-11 md:h-12 flex-1 sm:flex-none sm:px-8 rounded-xl font-black text-white bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-100 dark:shadow-none text-sm gap-2"
              >
                <span>{isSubmitting ? "Memproses..." : "Buat Order"}</span>
                <ArrowRight className="w-4 h-4 stroke-[3px]" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}