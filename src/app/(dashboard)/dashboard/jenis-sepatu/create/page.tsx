"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function CreateJenisSepatuPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      nama_jenis: fd.get("nama_jenis") as string,
      merek: (fd.get("merek") as string) || null,
      bahan: (fd.get("bahan") as string) || null,
      keterangan: (fd.get("keterangan") as string) || null,
      is_active: isActive,
    };
    await supabase.from("jenis_sepatus").insert(payload);
    setSaving(false);
    router.push("/dashboard/jenis-sepatu");
  }

  async function handleSaveAndAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      nama_jenis: fd.get("nama_jenis") as string,
      merek: (fd.get("merek") as string) || null,
      bahan: (fd.get("bahan") as string) || null,
      keterangan: (fd.get("keterangan") as string) || null,
      is_active: isActive,
    };
    await supabase.from("jenis_sepatus").insert(payload);
    setSaving(false);
    // Reset form by reloading
    router.refresh();
    e.currentTarget.reset();
    setIsActive(true);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
          Tambah Jenis Sepatu Baru
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Tambahkan kategori atau jenis sepatu baru ke dalam sistem.
        </p>
      </div>

      <form id="create-form" onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-5 shadow-sm">

          {/* Nama Jenis */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Nama Jenis <span className="text-red-500">*</span>
            </label>
            <input
              name="nama_jenis"
              required
              placeholder="Contoh: Sport, Boots, Formal"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
            />
          </div>

          {/* Merek */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Merek
            </label>
            <input
              name="merek"
              placeholder="Contoh: Nike, Adidas, Vans"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
            />
          </div>

          {/* Bahan */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Bahan
            </label>
            <input
              name="bahan"
              placeholder="Contoh: Canvas, Kulit, Suede"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition"
            />
          </div>

          {/* Keterangan */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Keterangan
            </label>
            <textarea
              name="keterangan"
              rows={4}
              placeholder="Tambahkan keterangan tambahan tentang jenis sepatu ini..."
              className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition resize-none"
            />
          </div>

          {/* Active Toggle */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
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
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-6">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md hover:shadow-orange-200 dark:hover:shadow-orange-900/30 disabled:opacity-60"
          >
            {saving ? "Menyimpan..." : "Buat Jenis Sepatu"}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              const form = document.getElementById("create-form") as HTMLFormElement;
              if (form) {
                const fd = new FormData(form);
                const payload = {
                  nama_jenis: fd.get("nama_jenis") as string,
                  merek: (fd.get("merek") as string) || null,
                  bahan: (fd.get("bahan") as string) || null,
                  keterangan: (fd.get("keterangan") as string) || null,
                  is_active: isActive,
                };
                if (!payload.nama_jenis) { form.reportValidity(); return; }
                setSaving(true);
                supabase.from("jenis_sepatus").insert(payload).then(() => {
                  setSaving(false);
                  form.reset();
                  setIsActive(true);
                });
              }
            }}
            className="px-5 py-2.5 bg-orange-400 hover:bg-orange-500 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-60"
          >
            Simpan &amp; Tambah Lagi
          </button>
          <button
            type="button"
            onClick={() => router.push("/dashboard/jenis-sepatu")}
            className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-all"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
