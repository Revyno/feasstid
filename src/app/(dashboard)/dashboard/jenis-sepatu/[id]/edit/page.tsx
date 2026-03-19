"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import type { JenisSepatu } from "@/types/database";
import { Trash2 } from "lucide-react";

export default function EditJenisSepatuPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClient();

  const [data, setData] = useState<JenisSepatu | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: res } = await supabase
        .from("jenis_sepatus")
        .select("*")
        .eq("id", id)
        .single();
      if (res) {
        setData(res as JenisSepatu);
        setIsActive((res as JenisSepatu).is_active ?? true);
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
      nama_jenis: fd.get("nama_jenis") as string,
      merek: (fd.get("merek") as string) || null,
      bahan: (fd.get("bahan") as string) || null,
      keterangan: (fd.get("keterangan") as string) || null,
      is_active: isActive,
    };
    await supabase.from("jenis_sepatus").update(payload).eq("id", id);
    setSaving(false);
    router.push("/dashboard/jenis-sepatu");
  }

  async function handleDelete() {
    if (!confirm("Yakin ingin menghapus jenis sepatu ini?")) return;
    await supabase.from("jenis_sepatus").delete().eq("id", id);
    router.push("/dashboard/jenis-sepatu");
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-3xl animate-pulse">
        <div className="h-8 w-48 rounded-xl bg-gray-100 dark:bg-gray-800" />
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-5">
          {Array(4).fill(0).map((_, i) => (
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
    return (
      <div className="text-center py-20 text-gray-400">Jenis sepatu tidak ditemukan</div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Page Title */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
            Edit Jenis Sepatu
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tambahkan kategori atau jenis sepatu baru ke dalam sistem.
          </p>
        </div>
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-all"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 space-y-5 shadow-sm">

          {/* Nama Jenis */}
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Nama Jenis <span className="text-red-500">*</span>
            </label>
            <input
              name="nama_jenis"
              required
              defaultValue={data.nama_jenis}
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
              defaultValue={data.merek ?? ""}
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
              defaultValue={data.bahan ?? ""}
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
              defaultValue={data.keterangan ?? ""}
              placeholder="Tambahkan keterangan tambahan..."
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
            {saving ? "Menyimpan..." : "Save changes"}
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
