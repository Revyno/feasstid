"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
  Trash,
  Search,
  LayoutGrid,
  MoreVertical,
  Save
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { toast } from "sonner";
import { getCustomerSession } from "@/lib/auth-utils";
import { ServiceCategory, HARGA_KATEGORI } from "@/types/database";

interface ServiceItem {
  id: string; // unique id for UI tracking
  dbId?: string; // id in the database
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const session = getCustomerSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const supabase = createClient();
      const [layananRes, jenisRes, orderRes] = await Promise.all([
        supabase.from("layanans").select("*").eq("is_active", true),
        supabase.from("jenis_sepatus").select("*").eq("is_active", true),
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
          jumlahPasang: d.jumlah_pasang || 1,
          hargaSatuan: d.harga_satuan || 0,
          biayaTambahan: d.biaya_tambahan || 0,
          subtotal: d.subtotal || 0,
          catatanKhusus: d.catatan_khusus || "",
          fotoUrl: d.foto_sebelum
        }));
        setItems(mappedItems);
      } else {
        toast.error("Pesanan tidak ditemukan");
        router.push("/customer/pesanan");
      }
      
      setLoading(false);
    }
    if (params.id) fetchData();
  }, [params.id, router]);

  const totalPayment = items.filter(i => !i.isDeleted).reduce((acc, curr) => acc + (curr.subtotal || 0), 0);

  const addItem = () => {
    const defaultLayanan = layananList[0];
    const defaultJenis = jenisSepatuList[0];
    const newItem: ServiceItem = {
      id: Math.random().toString(36).substr(2, 9),
      layanan: defaultLayanan?.id || "",
      jenisSepatu: defaultJenis?.id || "",
      jumlahPasang: 1,
      hargaSatuan: defaultLayanan?.harga_dasar || 0,
      biayaTambahan: 0,
      subtotal: defaultLayanan?.harga_dasar || 0,
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
            // Default to HARGA_KATEGORI if no price in DB
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

  const handleDeleteOrder = async () => {
    setIsSubmitting(true);
    try {
      const session = getCustomerSession();
      if (!session) throw new Error("Session not found");

      const supabase = createClient();
      // Ensure we only delete if it belongs to this customer
      const { error } = await supabase
        .from("pesanans")
        .delete()
        .eq("id", params.id)
        .eq("customer_id", session.id);

      if (error) {
        console.error("Delete Error:", error);
        throw new Error(error.message || "Failed to delete order from database");
      }
      
      toast.success("Pesanan berhasil dihapus");
      router.push("/customer/pesanan");
    } catch (error: any) {
      console.error("Delete Exception:", error);
      toast.error(`Gagal menghapus: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      setShowDeleteDialog(false);
    }
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
          tanggal_pesanan: orderData.tanggal_pesanan,
          status: orderData.status,
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
        
        if (item.isDeleted && !item.dbId) {
            continue; // Skip newly added and then deleted items
        }

        let foto_sebelum = item.fotoUrl;
        if (item.foto) {
           foto_sebelum = await uploadImage(item.foto);
        }

        const detailPayload = {
          pesanan_id: params.id,
          layanan_id: item.layanan || null,
          jenis_sepatu_id: item.jenisSepatu || null,
          jumlah_pasang: item.jumlahPasang || 1,
          harga_satuan: item.hargaSatuan || 0,
          biaya_tambahan: item.biayaTambahan || 0,
          subtotal: item.subtotal || 0,
          catatan_khusus: item.catatanKhusus || "",
          foto_sebelum
        };

        if (item.dbId) {
          await supabase.from("detail_pesanans").update(detailPayload).eq("id", item.dbId);
        } else {
          await supabase.from("detail_pesanans").insert(detailPayload);
        }
      }

      toast.success("Pesanan berhasil diperbarui!");
      router.refresh();
      window.location.reload();
    } catch (error: any) {
      toast.error(`Gagal memperbarui: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <p className="font-bold text-gray-500 animate-pulse uppercase tracking-widest text-xs">Mengambil Data Pesanan...</p>
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto pb-16 animate-in fade-in slide-in-from-left-4 duration-700">
      {/* Header & Breadcrumbs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex flex-col gap-3">
           <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <Link href="/customer/pesanan" className="hover:text-orange-500 transition-colors">Pesanan Saya</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900 dark:text-gray-100 uppercase tracking-widest">Edit</span>
          </nav>
          <div className="flex items-center gap-6">
            <h1 className="text-5xl font-black text-gray-900 dark:text-gray-100 tracking-tighter">Edit Pesanan</h1>
            <span className="text-gray-400 font-bold text-sm hidden md:block">#{orderData?.kode_pesanan}</span>
          </div>
        </div>
        <Button 
            variant="destructive" 
            onClick={() => setShowDeleteDialog(true)}
            className="h-12 px-8 rounded-2xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-red-100 transition-all active:scale-95 flex items-center gap-2 self-start md:self-center"
        >
          <Trash className="w-5 h-5" />
          Delete Order
        </Button>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="rounded-[2.5rem] p-10 max-w-md border-none shadow-2xl">
          <DialogHeader className="space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center text-red-500 mx-auto">
              <Trash2 className="w-8 h-8" />
            </div>
            <DialogTitle className="text-3xl font-black text-center text-gray-900 dark:text-gray-100 tracking-tighter">Hapus Pesanan?</DialogTitle>
            <DialogDescription className="text-center text-gray-500 font-medium leading-relaxed">
              Tindakan ini tidak dapat dibatalkan. Seluruh data pesanan <span className="font-black text-gray-900 dark:text-gray-100">#{orderData?.kode_pesanan}</span> dan riwayatnya akan dihapus permanen.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button 
                variant="ghost" 
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1 h-14 rounded-2xl font-black text-gray-500 hover:bg-gray-100"
            >
              Batalkan
            </Button>
            <Button 
                onClick={handleDeleteOrder}
                disabled={isSubmitting}
                className="flex-1 h-14 rounded-2xl font-black bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-100 dark:shadow-none"
            >
              {isSubmitting ? "Menghapus..." : "Ya, Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Desktop: 3-col grid | Mobile: stacked */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* LEFT: Main Form Area (2 cols on desktop) */}
        <div className="xl:col-span-2 space-y-8">
          {/* Order Meta Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white dark:bg-gray-900 p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="space-y-3">
                <Label className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest pl-1">Tanggal Pesanan</Label>
                <div className="relative">
                  <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input 
                    type="date" 
                    value={orderData?.tanggal_pesanan || ""}
                    onChange={(e) => setOrderData({...orderData, tanggal_pesanan: e.target.value})}
                    className="h-14 border-none bg-gray-50 dark:bg-gray-800/50 rounded-2xl pl-12 font-bold focus-visible:ring-orange-500/20"
                  />
                </div>
            </div>
            <div className="space-y-3">
                <Label className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest pl-1">Metode Pengantaran <span className="text-red-500">*</span></Label>
                <Select value={orderData?.metode_pengantaran} onValueChange={(val) => setOrderData({...orderData, metode_pengantaran: val})}>
                  <SelectTrigger className="h-14 border-none bg-gray-50 dark:bg-gray-800/50 rounded-2xl font-bold focus:ring-orange-500/20">
                    <SelectValue placeholder="Pilih metode" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-gray-100 dark:border-gray-800 font-bold overflow-hidden shadow-2xl">
                    <SelectItem value="drop_off" className="py-3">Drop Off (Antar Langsung)</SelectItem>
                    <SelectItem value="pickup" className="py-3">Pickup (Layanan Jemput)</SelectItem>
                    <SelectItem value="delivery" className="py-3">Delivery (Layanan Antar)</SelectItem>
                  </SelectContent>
                </Select>
            </div>
          </div>

          {/* Service Items */}
          <section className="space-y-6">
              <div className="flex items-center gap-4 px-2">
                <div className="w-1 h-6 bg-orange-500 rounded-full" />
                <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest">Pilih Layanan</h2>
              </div>

              <div className="space-y-6">
                {items.filter(i => !i.isDeleted).map((item, index) => (
                  <div key={item.id} className="relative group">
                    <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 hover:border-orange-200 transition-all duration-300">
                      <div className="flex items-center justify-between mb-8 border-b border-gray-50 dark:border-b-gray-800 pb-6">
                        <h3 className="font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest text-sm italic">Item Detail - #{index + 1}</h3>
                        <div className="flex items-center gap-2">
                             <button 
                                onClick={() => removeItem(item.id)}
                                className="p-2 text-gray-300 hover:text-red-500 bg-gray-50 dark:bg-gray-800 rounded-xl transition-all"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                            <ChevronDown className="w-5 h-5 text-gray-300" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Layanan <span className="text-red-500">*</span></Label>
                          <Select value={item.layanan} onValueChange={(val) => updateItem(item.id, 'layanan', val)}>
                            <SelectTrigger className="h-14 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl font-bold">
                              <SelectValue placeholder="Pilih layanan" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl font-bold">
                              {layananList.map(lay => (
                                <SelectItem key={lay.id} value={lay.id}>{lay.nama_layanan} - Rp {(HARGA_KATEGORI[lay.kategori_layanan as ServiceCategory] || 0).toLocaleString('id-ID')}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Jenis Sepatu <span className="text-red-500">*</span></Label>
                          <Select value={item.jenisSepatu} onValueChange={(val) => updateItem(item.id, 'jenisSepatu', val)}>
                            <SelectTrigger className="h-14 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl font-bold">
                              <SelectValue placeholder="Pilih jenis" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl font-bold">
                              {jenisSepatuList.map(j => (
                                <SelectItem key={j.id} value={j.id}>{j.nama_jenis} - {j.merek}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Jumlah Pasang <span className="text-red-500">*</span></Label>
                          <Input 
                            type="number"
                            value={item.jumlahPasang}
                            onChange={(e) => updateItem(item.id, 'jumlahPasang', e.target.value)}
                            className="h-14 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl font-bold px-6"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                         <div className="space-y-3">
                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 font-bold">Kondisi Sepatu <span className="text-red-500">*</span></Label>
                            <Select defaultValue="Ringan">
                                <SelectTrigger className="h-14 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl font-bold">
                                    <SelectValue placeholder="Pilih kondisi" />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl font-bold">
                                    <SelectItem value="Ringan">Ringan</SelectItem>
                                    <SelectItem value="Sedang">Sedang</SelectItem>
                                    <SelectItem value="Berat">Berat</SelectItem>
                                </SelectContent>
                            </Select>
                         </div>
                         <div className="space-y-3">
                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Harga Satuan</Label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs uppercase">Rp</span>
                                <Input 
                                    disabled
                                    value={(item.hargaSatuan || 0).toLocaleString('id-ID')}
                                    className="h-14 border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800 shadow-inner rounded-2xl pl-11 font-black text-gray-900 dark:text-gray-100" 
                                />
                            </div>
                         </div>
                         <div className="space-y-3">
                            <Label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Biaya Tambahan</Label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-xs uppercase">Rp</span>
                                <Input 
                                    type="number"
                                    value={item.biayaTambahan || 0}
                                    onChange={(e) => updateItem(item.id, 'biayaTambahan', e.target.value)}
                                    className="h-14 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl pl-11 font-black text-gray-900 dark:text-gray-100" 
                                />
                            </div>
                         </div>
                         <div className="space-y-3">
                            <Label className="text-[10px] font-black text-orange-500 uppercase tracking-widest pl-1">Subtotal</Label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-orange-400 text-xs uppercase font-black">Rp</span>
                                <Input 
                                    disabled
                                    value={(item.subtotal || 0).toLocaleString('id-ID')}
                                    className="h-14 border-orange-100 dark:border-orange-900/30 bg-orange-50 dark:bg-orange-950/10 rounded-2xl pl-11 font-black text-orange-600 dark:text-orange-400" 
                                />
                            </div>
                         </div>
                      </div>

                      <div className="space-y-6">
                         <div className="space-y-3">
                            <Label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1 italic">Catatan Khusus</Label>
                            <Textarea 
                                placeholder="Detail catatan khusus..."
                                value={item.catatanKhusus || ""}
                                onChange={(e) => updateItem(item.id, 'catatanKhusus', e.target.value)}
                                className="min-h-[100px] border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 rounded-2xl px-6 py-4 focus-visible:ring-orange-500/20 font-medium text-gray-600 dark:text-gray-400 leading-relaxed"
                            />
                         </div>
                         <div className="space-y-3">
                            <Label className="text-xs font-black text-gray-400 uppercase tracking-widest pl-1 italic">Foto Sepatu (Sebelum)</Label>
                            <div className="relative aspect-[4/1] w-full border-2 border-dashed border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/30 hover:bg-orange-50/50 hover:border-orange-300 transition-all rounded-3xl flex flex-col items-center justify-center gap-2 cursor-pointer group/upload overflow-hidden">
                                {item.fotoUrl ? (
                                    <div className="absolute inset-0 flex items-center justify-between px-10 bg-white dark:bg-gray-900">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center text-orange-500">
                                                <ShoppingBag className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-gray-900 dark:text-gray-100">Uploaded Photo</p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500">Preview saved</p>
                                            </div>
                                        </div>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="text-gray-400 hover:text-red-500"
                                            onClick={() => {
                                                updateItem(item.id, 'foto', undefined);
                                                updateItem(item.id, 'fotoUrl', undefined);
                                            }}
                                        >
                                            <X className="w-5 h-5" />
                                        </Button>
                                    </div>
                                ) : (
                                    <>
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
                                        <div className="text-gray-400 text-center space-y-2">
                                            <div className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center mx-auto opacity-50 group-hover/upload:opacity-100 transition-opacity">
                                                <Upload className="w-5 h-5" />
                                            </div>
                                            <p className="text-xs font-black uppercase tracking-widest italic group-hover/upload:text-orange-500 transition-colors">Upload foto kondisi sepatu sebelum dicuci</p>
                                        </div>
                                    </>
                                )}
                            </div>
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="flex justify-center pt-2">
                    <Button variant="ghost" onClick={addItem} className="bg-orange-500 hover:bg-orange-600 text-white font-black px-12 h-16 rounded-[2rem] shadow-xl shadow-orange-100 dark:shadow-none transition-all hover:scale-105 active:scale-95 text-lg flex items-center gap-3">
                        <Plus className="w-5 h-5 stroke-[4px]" />
                        Tambah Item Layanan
                    </Button>
                </div>
              </div>
          </section>
        </div>

        {/* RIGHT: Sticky Sidebar */}
        <div className="xl:col-span-1">
          <div className="xl:sticky xl:top-6 space-y-6">
            {/* Total Card */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-800 border-t-4 border-t-orange-500">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Estimasi Total</h3>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-xl font-black text-orange-500">Rp</span>
                <span className="text-5xl font-black text-gray-900 dark:text-gray-100 tracking-tighter">{totalPayment.toLocaleString('id-ID')}</span>
              </div>
              <div className="space-y-3 pt-4 border-t border-gray-50 dark:border-gray-800">
                <div className="flex justify-between text-xs font-bold text-gray-400">
                  <span>Items</span>
                  <span className="text-gray-900 dark:text-white font-black">{items.filter(i => !i.isDeleted).length} layanan</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-gray-400">
                  <span>Metode</span>
                  <span className="text-gray-900 dark:text-white font-black uppercase text-[10px]">{orderData?.metode_pengantaran?.replace('_', ' ') || '-'}</span>
                </div>
              </div>
            </div>

            {/* Notes Card */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
              <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest italic">Catatan Pesanan Utama</h3>
              <Textarea 
                    placeholder="Tambahkan catatan penting untuk seluruh pesanan ini..."
                    className="min-h-[120px] border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 rounded-[2rem] p-5 focus-visible:ring-orange-500/20 font-medium text-gray-600 dark:text-gray-400 leading-relaxed shadow-inner resize-none"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4">
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-16 w-full rounded-[2rem] font-black text-white bg-orange-500 hover:bg-orange-600 shadow-2xl shadow-orange-100 dark:shadow-none transition-all hover:scale-[1.02] active:scale-[0.98] text-xl flex items-center justify-center gap-3"
              >
                  {isSubmitting ? (
                      <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                      <>
                        <Save className="w-6 h-6" />
                        <span>Save Changes</span>
                      </>
                  )}
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => router.back()}
                className="h-14 w-full rounded-[2rem] font-black text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all text-lg flex items-center justify-center gap-3"
              >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Cancel Changes</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <section className="space-y-10 pt-16 animate-in fade-in duration-500 delay-300">
          <div className="flex items-center gap-4 pl-2">
              <div className="w-1.5 h-8 bg-orange-500 rounded-full" />
              <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 uppercase tracking-widest italic">Detail Pesanan & Foto Sepatu</h2>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-[4rem] shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
             <div className="p-10 pb-6 flex items-center justify-between">
                <div className="relative flex-1 max-w-lg group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                    <Input placeholder="Cari dalam detail..." className="h-14 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl pl-14 font-medium text-gray-600 dark:text-gray-400 focus-visible:ring-orange-500/20" />
                </div>
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" className="h-14 w-14 border-gray-100 dark:border-gray-800 rounded-2xl hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-500 transition-all">
                        <LayoutGrid className="w-6 h-6" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-14 w-14 border-gray-100 dark:border-gray-800 rounded-2xl hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:text-orange-500 transition-all">
                        <MoreVertical className="w-6 h-6" />
                    </Button>
                </div>
             </div>

             <div className="overflow-x-auto">
                <Table className="min-w-[1200px]">
                    <TableHeader>
                        <TableRow className="border-b-gray-100 dark:border-b-gray-800 hover:bg-transparent">
                            <TableHead className="py-8 px-10 text-[12px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Foto Sebelum</TableHead>
                            <TableHead className="py-8 px-6 text-[12px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Layanan</TableHead>
                            <TableHead className="py-8 px-6 text-[12px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Jenis Sepatu</TableHead>
                            <TableHead className="py-8 px-6 text-[12px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">Jumlah</TableHead>
                            <TableHead className="py-8 px-6 text-[12px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-center">Kondisi</TableHead>
                            <TableHead className="py-8 px-6 text-[12px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Harga Satuan</TableHead>
                            <TableHead className="py-8 px-10 text-[12px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest text-right">Subtotal</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.filter(i => !i.isDeleted).map((item) => (
                            <TableRow key={item.id} className="border-b-gray-50 dark:border-b-gray-800 last:border-0 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors group">
                                <TableCell className="py-8 px-10">
                                    <div className="w-20 h-20 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 shadow-sm transition-transform group-hover:scale-110">
                                        {item.fotoUrl ? (
                                            <img src={item.fotoUrl} alt="Item" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300 dark:text-gray-600">
                                                <Camera className="w-8 h-8" />
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="py-8 px-6">
                                    <div className="flex flex-col">
                                        <span className="font-black text-gray-900 dark:text-white uppercase tracking-tight tracking-wide">
                                            {layananList.find(l => l.id === item.layanan)?.nama_layanan || "Layanan Unknown"}
                                        </span>
                                        <span className="text-[10px] font-bold text-orange-500 uppercase">Service Detail</span>
                                    </div>
                                </TableCell>
                                <TableCell className="py-8 px-6 font-bold text-gray-600 dark:text-gray-400">
                                    {jenisSepatuList.find(j => j.id === item.jenisSepatu)?.nama_jenis || "Sepatu Unknown"}
                                </TableCell>
                                <TableCell className="py-8 px-6 text-center">
                                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 font-black text-gray-900 dark:text-white">{item.jumlahPasang || 1}</span>
                                </TableCell>
                                <TableCell className="py-8 px-6 text-center">
                                    <Badge className="bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-950/30 border-none rounded-full px-6 py-1.5 font-black text-[10px] uppercase tracking-widest shadow-sm">RINGAN</Badge>
                                </TableCell>
                                <TableCell className="py-8 px-6 font-black text-gray-900 dark:text-white">
                                    <span className="text-[10px] text-gray-400 mr-2 uppercase">IDR</span>
                                    {(item.hargaSatuan || 0).toLocaleString('id-ID')}
                                </TableCell>
                                <TableCell className="py-8 px-10 text-right">
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center gap-1">
                                            <span className="text-[10px] font-black text-orange-500 uppercase">IDR</span>
                                            <span className="font-black text-xl text-gray-900 dark:text-white tracking-tighter">{(item.subtotal || 0).toLocaleString('id-ID')}</span>
                                        </div>
                                        <Button variant="link" size="sm" className="h-6 p-0 text-blue-500 font-bold text-[10px] hover:text-blue-600 uppercase tracking-widest">Lihat Galeri Foto</Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
             </div>
             
             <div className="p-10 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between text-xs font-black text-gray-400 dark:text-gray-500 tracking-[0.2em] uppercase">
                <div className="flex items-center gap-2">
                    <span>Showing</span>
                    <span className="text-gray-900 dark:text-white italic">{items.filter(i => !i.isDeleted).length}</span>
                    <span>Result</span>
                </div>
                <div className="flex items-center gap-4">
                    <span>Per Page</span>
                    <Select defaultValue="10">
                        <SelectTrigger className="h-10 w-20 border-none bg-orange-500 text-white font-black rounded-xl shadow-lg shadow-orange-100 dark:shadow-none hover:bg-orange-600 transition-all">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="font-bold rounded-xl border-none shadow-2xl">
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
             </div>
          </div>
      </section>
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
