"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { DURASI_HARI_KATEGORI, type ServiceCategory } from "@/types/database";

const KATEGORI_OPTIONS: { value: ServiceCategory; label: string }[] = [
  { value: "basic", label: "Basic Clean (Rp 50.000)" },
  { value: "premium", label: "Premium (Rp 100.000)" },
  { value: "deep", label: "Deep Clean (Rp 150.000)" },
  { value: "unyellowing", label: "Unyellowing (Rp 75.000)" },
  { value: "repaint", label: "Repaint (Rp 200.000)" },
  { value: "repair", label: "Repair (Rp 250.000)" },
];

export default function CreateLayananPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedKategori, setSelectedKategori] = useState<ServiceCategory>("basic");

  const durasi = DURASI_HARI_KATEGORI[selectedKategori];

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      nama_layanan: fd.get("nama_layanan") as string,
      kategori_layanan: selectedKategori,
      deskripsi: (fd.get("deskripsi") as string) || null,
      durasi_hari: durasi,
      is_active: isActive,
    };
    await supabase.from("layanans").insert(payload);
    setSaving(false);
    router.push("/dashboard/layanan");
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
          Tambah Layanan Baru
        </h1>
      </div>

      <form id="create-layanan-form" onSubmit={handleSubmit} className="space-y-5">

        {/* Nama Layanan */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Nama Layanan <span className="text-red-500">*</span>
          </label>
          <input
            name="nama_layanan"
            required
            placeholder="Contoh: Deep Cleaning, Unyellowing"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
          />
        </div>

        {/* Kategori & Durasi Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value as ServiceCategory)}
              className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
            >
              {KATEGORI_OPTIONS.map(k => (
                <option key={k.value} value={k.value}>{k.label}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Estimasi Durasi (Hari) <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <input
                readOnly
                value={durasi}
                className="flex-1 px-3 py-2.5 text-sm border border-r-0 border-gray-200 dark:border-gray-700 rounded-l-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 focus:outline-none"
              />
              <span className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 border border-l-0 border-gray-200 dark:border-gray-700 rounded-r-xl">
                Hari
              </span>
            </div>
          </div>
        </div>

        {/* Deskripsi */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Deskripsi Layanan
          </label>
          <textarea
            name="deskripsi"
            rows={4}
            placeholder="Jelaskan detail layanan yang diberikan..."
            className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition resize-none"
          />
        </div>

        {/* Active Toggle */}
        <div className="flex items-center justify-between px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() => setIsActive(!isActive)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-1 ${isActive ? "bg-orange-500" : "bg-gray-200 dark:bg-gray-700"}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${isActive ? "translate-x-6" : "translate-x-1"}`} />
            </button>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Aktif <span className="text-red-500">*</span>
            </label>
          </div>
          <span className="text-xs text-gray-400">
            Layanan akan muncul di form pesanan pelanggan jika aktif.
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md hover:shadow-orange-200 dark:hover:shadow-orange-900/30 disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Buat Layanan"}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={async () => {
              const form = document.getElementById("create-layanan-form") as HTMLFormElement;
              if (!form) return;
              const fd = new FormData(form);
              const nama = fd.get("nama_layanan") as string;
              if (!nama) { form.reportValidity(); return; }
              setSaving(true);
              await supabase.from("layanans").insert({
                nama_layanan: nama,
                kategori_layanan: selectedKategori,
                deskripsi: (fd.get("deskripsi") as string) || null,
                durasi_hari: durasi,
                is_active: isActive,
              });
              setSaving(false);
              form.reset();
              setSelectedKategori("basic");
              setIsActive(true);
            }}
            className="px-5 py-2.5 bg-orange-400 hover:bg-orange-500 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-60"
          >
            Simpan &amp; Tambah Lagi
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/layanan")}
            className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-all"
          >
            cancel
          </button>
        </div>
      </form>
    </div>
  );
}
