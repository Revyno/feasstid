"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import type { Layanan } from "@/types/database";
import { HARGA_KATEGORI, DURASI_HARI_KATEGORI, type ServiceCategory } from "@/types/database";
import { Trash2 } from "lucide-react";

const KATEGORI_OPTIONS: { value: ServiceCategory; label: string }[] = [
  { value: "basic", label: "Basic Clean (Rp 50.000)" },
  { value: "premium", label: "Premium (Rp 100.000)" },
  { value: "deep", label: "Deep Clean (Rp 150.000)" },
  { value: "unyellowing", label: "Unyellowing (Rp 75.000)" },
  { value: "repaint", label: "Repaint (Rp 200.000)" },
  { value: "repair", label: "Repair (Rp 250.000)" },
];

export default function EditLayananPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [data, setData] = useState<Layanan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [selectedKategori, setSelectedKategori] = useState<ServiceCategory>("basic");

  useEffect(() => {
    async function load() {
      const { data: res } = await supabase
        .from("layanans")
        .select("*")
        .eq("id", id)
        .single();
      if (res) {
        const layanan = res as Layanan;
        setData(layanan);
        setIsActive(layanan.is_active ?? true);
        setSelectedKategori(layanan.kategori_layanan);
      }
      setLoading(false);
    }
    load();
  }, [id, supabase]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      nama_layanan: fd.get("nama_layanan") as string,
      kategori_layanan: selectedKategori,
      deskripsi: (fd.get("deskripsi") as string) || null,
      durasi_hari: DURASI_HARI_KATEGORI[selectedKategori],
      is_active: isActive,
    };
    await supabase.from("layanans").update(payload).eq("id", id);
    setSaving(false);
    router.push("/dashboard/layanan");
  }

  async function handleDelete() {
    if (!confirm("Yakin ingin menghapus layanan ini?")) return;
    await supabase.from("layanans").delete().eq("id", id);
    router.push("/dashboard/layanan");
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl animate-pulse">
        <div className="h-8 w-40 rounded-xl bg-gray-100 dark:bg-gray-800" />
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-5">
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="space-y-1.5">
              <div className="h-4 w-24 rounded bg-gray-100 dark:bg-gray-800" />
              <div className="h-10 w-full rounded-xl bg-gray-100 dark:bg-gray-800" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-20 text-gray-400">Layanan tidak ditemukan</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
            Edit Layanan
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-5 shadow-sm">
          {/* Card Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-widest">
              Service Details
            </h2>
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>

          {/* Nama Layanan */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Nama Layanan <span className="text-red-500">*</span>
            </label>
            <input
              name="nama_layanan"
              required
              defaultValue={data.nama_layanan}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
            />
          </div>

          {/* Kategori */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Kategori <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={selectedKategori}
                onChange={(e) => setSelectedKategori(e.target.value as ServiceCategory)}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition appearance-none"
              >
                {KATEGORI_OPTIONS.map(k => (
                  <option key={k.value} value={k.value}>{k.label}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▾</div>
            </div>
          </div>

          {/* Deskripsi */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Deskripsi
            </label>
            <textarea
              name="deskripsi"
              rows={4}
              defaultValue={data.deskripsi ?? ""}
              placeholder="Jelaskan detail layanan yang diberikan..."
              className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition resize-none"
            />
          </div>

          {/* Durasi (readonly) */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Durasi (Hari)
            </label>
            <input
              readOnly
              value={DURASI_HARI_KATEGORI[selectedKategori]}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-100 dark:bg-gray-800/70 text-gray-500 dark:text-gray-400 focus:outline-none cursor-default"
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Status Aktif <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1 ${isActive ? "bg-orange-500" : "bg-gray-200 dark:bg-gray-700"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${isActive ? "translate-x-6" : "translate-x-1"}`} />
              </button>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {isActive ? "Aktif" : "Nonaktif"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-6">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md hover:shadow-orange-200 dark:hover:shadow-orange-900/30 disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Save changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/layanan")}
            className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
