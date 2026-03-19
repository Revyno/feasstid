"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import type { Pesanan, DetailPesanan, Customer } from "@/types/database";
import { 
  Trash2, 
  Calendar, 
  ChevronDown, 
  Search, 
  SlidersHorizontal, 
  LayoutGrid, 
  Image as ImageIcon,
  Pencil,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Image from "next/image";

export default function EditPesananPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [order, setOrder] = useState<Pesanan | null>(null);
  const [details, setDetails] = useState<DetailPesanan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [orderRes, detailsRes, customersRes] = await Promise.all([
      supabase.from("pesanans").select("*, customer:customers(name, address)").eq("id", id).single(),
      supabase.from("detail_pesanans").select("*, layanan:layanans(nama_layanan), jenis_sepatu:jenis_sepatus(nama_jenis)").eq("pesanan_id", id),
      supabase.from("customers").select("id, name, address")
    ]);

    if (orderRes.data) {
      setOrder(orderRes.data as Pesanan);
    }
    setDetails((detailsRes.data as DetailPesanan[]) ?? []);
    setCustomers((customersRes.data as Customer[]) ?? []);
    setLoading(false);
  }, [id, supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      customer_id: fd.get("customer_id") as string,
      tanggal_pesanan: fd.get("tanggal_pesanan") as string,
      tanggal_selesai: (fd.get("tanggal_selesai") as string) || null,
      status: fd.get("status") as string,
      metode_pengantaran: fd.get("metode_pengantaran") as string,
      alamat_pengantaran: fd.get("alamat_pengantaran") as string,
      catatan: fd.get("catatan") as string,
      total_harga: Number(fd.get("total_harga")),
    };

    await supabase.from("pesanans").update(payload).eq("id", id);
    setSaving(false);
    router.push("/dashboard/pesanan");
  }, [id, supabase, router]);

  async function handleDelete() {
    if (!confirm("Yakin ingin menghapus pesanan ini?")) return;
    await supabase.from("pesanans").delete().eq("id", id);
    router.push("/dashboard/pesanan");
  }

  function formatCurrency(v: number) {
    return Number(v).toLocaleString("id-ID");
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl animate-pulse">
        <div className="h-8 w-48 rounded-xl bg-gray-100 dark:bg-gray-800" />
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 h-96" />
      </div>
    );
  }

  if (!order) {
    return <div className="text-center py-20 text-gray-400">Pesanan tidak ditemukan</div>;
  }

  return (
    <div className="space-y-6 max-w-6xl pb-20">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-1">
            <span className="hover:text-orange-500 cursor-pointer" onClick={() => router.push("/dashboard/pesanan")}>Pesanan</span>
            <span>›</span>
            <span className="text-gray-900 dark:text-gray-100 font-black">Edit</span>
          </nav>
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
            Edit Pesanan
          </h1>
        </div>
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-all shadow-sm"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Customer */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Customer <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="customer_id"
                  required
                  defaultValue={order.customer_id}
                  className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 transition appearance-none"
                >
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Tanggal Pesanan */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Tanggal Pesanan <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  name="tanggal_pesanan"
                  type="date"
                  required
                  defaultValue={order.tanggal_pesanan}
                  className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Tanggal Selesai */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Tanggal Selesai
              </label>
              <div className="relative">
                <input
                  name="tanggal_selesai"
                  type="date"
                  defaultValue={order.tanggal_selesai ?? ""}
                  className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Total Harga */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Total Harga
              </label>
              <div className="flex">
                <span className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-l-xl">
                  Rp
                </span>
                <input
                  name="total_harga"
                  type="number"
                  defaultValue={order.total_harga}
                  className="flex-1 px-4 py-2.5 text-sm border border-l-0 border-gray-200 dark:border-gray-700 rounded-r-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 transition"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Status <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="status"
                  required
                  defaultValue={order.status}
                  className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 transition appearance-none"
                >
                  <option value="pending">Pending</option>
                  <option value="in_process">In Process</option>
                  <option value="completed">Completed</option>
                  <option value="ready">Ready</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Metode Pengantaran */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Metode Pengantaran <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="metode_pengantaran"
                  required
                  defaultValue={order.metode_pengantaran}
                  className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 transition appearance-none"
                >
                  <option value="drop_off">Drop Off</option>
                  <option value="pickup">Pickup</option>
                  <option value="delivery">Delivery</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Alamat Pengantaran */}
            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Alamat Pengantaran
              </label>
              <textarea
                name="alamat_pengantaran"
                rows={3}
                defaultValue={order.alamat_pengantaran ?? ""}
                placeholder="Jl. Contoh No. 123, Jakarta"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 transition resize-none"
              />
              <p className="text-[10px] text-gray-400 font-medium italic">Otomatis diisi dari alamat lengkap customer jika kosong</p>
            </div>

            {/* Catatan */}
            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Catatan
              </label>
              <textarea
                name="catatan"
                rows={3}
                defaultValue={order.catatan ?? ""}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 transition resize-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-8">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-all shadow-sm disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/pesanan")}
              className="px-8 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-all shadow-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>

      {/* Detail Table Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        <div className="p-6 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-black text-gray-900 dark:text-gray-100">
            Detail Pesanan &amp; Foto Sepatu
          </h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                className="pl-9 pr-4 py-1.5 text-xs border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 focus:outline-none"
              />
            </div>
            <button className="p-1.5 rounded-lg border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-orange-500 transition-colors">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 rounded-lg border border-gray-100 dark:border-gray-800 text-gray-400 hover:text-orange-500 transition-colors">
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 dark:border-gray-800">
                <th className="w-12 px-6 py-3">
                  <input type="checkbox" className="rounded accent-orange-500" />
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Foto Sebelum</th>
                <th className="text-left px-4 py-3 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Layanan</th>
                <th className="text-left px-4 py-3 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Jenis Sepatu</th>
                <th className="text-center px-4 py-3 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Jumlah</th>
                <th className="text-center px-4 py-3 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Kondisi</th>
                <th className="text-right px-4 py-3 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Harga Satuan</th>
                <th className="text-right px-4 py-3 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Subtotal</th>
                <th className="text-right px-6 py-3 text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {details.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400 text-sm">Belum ada item pesanan</td>
                </tr>
              ) : details.map((d) => (
                <tr key={d.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <input type="checkbox" className="rounded accent-orange-500" />
                  </td>
                  <td className="px-4 py-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 overflow-hidden flex items-center justify-center border border-gray-100 dark:border-gray-800">
                      {d.foto_sebelum ? (
                        <Image src={d.foto_sebelum} alt="Sepatu" width={40} height={40} className="object-cover w-full h-full" />
                      ) : (
                        <ImageIcon className="w-4 h-4 text-gray-300" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">{(d.layanan as any)?.nama_layanan ?? "-"}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-xs text-gray-600 dark:text-gray-400">{(d.jenis_sepatu as any)?.nama_jenis ?? "-"}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className="text-xs font-bold text-gray-900 dark:text-gray-100">{d.jumlah_pasang}</span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                      d.kondisi_sepatu === 'ringan' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      d.kondisi_sepatu === 'sedang' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                      'bg-red-50 text-red-600 border border-red-100'
                    }`}>
                      {d.kondisi_sepatu}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="text-[10px] text-gray-400 font-bold leading-none">IDR</div>
                    <div className="text-xs font-black text-gray-900 dark:text-gray-100 mt-0.5">{formatCurrency(d.harga_satuan)}</div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="text-[10px] text-gray-400 font-bold leading-none">IDR</div>
                    <div className="text-xs font-black text-gray-900 dark:text-gray-100 mt-0.5">{formatCurrency(d.subtotal)}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button className="flex items-center gap-1.5 text-[10px] font-black text-sky-500 hover:text-sky-600 transition-colors uppercase italic">
                        <ImageIcon className="w-3 h-3" />
                        Lihat Foto
                      </button>
                      <button className="flex items-center gap-1.5 text-[10px] font-black text-orange-500 hover:text-orange-600 transition-colors uppercase italic">
                        <Pencil className="w-3 h-3" />
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between">
          <span className="text-[10px] text-gray-400 font-medium">Showing {details.length} result</span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-[10px] text-gray-400">
              Per page
              <select className="bg-transparent border-none focus:ring-0 text-gray-900 dark:text-gray-100 font-bold p-0">
                <option>10</option>
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button disabled className="w-6 h-6 flex items-center justify-center rounded border border-gray-100 dark:border-gray-800 text-gray-300">
                <ChevronLeft className="w-3 h-3" />
              </button>
              <button className="w-6 h-6 flex items-center justify-center rounded bg-orange-500 text-white text-[10px] font-black">
                1
              </button>
              <button disabled className="w-6 h-6 flex items-center justify-center rounded border border-gray-100 dark:border-gray-800 text-gray-300">
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
