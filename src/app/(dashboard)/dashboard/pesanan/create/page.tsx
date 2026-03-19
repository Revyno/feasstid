"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import type { Customer } from "@/types/database";
import { 
  Calendar, 
  ChevronDown 
} from "lucide-react";

export default function CreatePesananPage() {
  const router = useRouter();
  const supabase = createClient();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("customers").select("id, name, address");
    setCustomers((data as Customer[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const customerId = fd.get("customer_id") as string;
    
    // Generate a code
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const { count } = await supabase.from("pesanans").select("id", { count: "exact", head: true });
    const kode = `LND-${dateStr}-${String((count ?? 0) + 1).padStart(3, "0")}`;

    const payload = {
      customer_id: customerId,
      kode_pesanan: kode,
      tanggal_pesanan: fd.get("tanggal_pesanan") as string,
      status: "pending",
      metode_pengantaran: fd.get("metode_pengantaran") as string,
      alamat_pengantaran: fd.get("alamat_pengantaran") as string,
      catatan: fd.get("catatan") as string,
      total_harga: 0,
    };

    const { data, error } = await supabase.from("pesanans").insert(payload).select().single();
    if (!error && data) {
      router.push(`/dashboard/pesanan/${data.id}/edit`);
    } else {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
          Tambah Pesanan Baru
        </h1>
        <p className="text-sm text-gray-500 mt-1">Langkah 1: Masukkan data customer & detail antar-jemput</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Customer <span className="text-red-500">*</span></label>
              <div className="relative">
                <select
                  name="customer_id"
                  required
                  className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 appearance-none"
                >
                  <option value="">Pilih Customer...</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Tanggal Pesanan */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Tanggal Pesanan <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  name="tanggal_pesanan"
                  type="date"
                  required
                  defaultValue={new Date().toISOString().slice(0, 10)}
                  className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400"
                />
              </div>
            </div>

            {/* Metode Pengantaran */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Metode Pengantaran <span className="text-red-500">*</span></label>
              <div className="relative">
                <select
                  name="metode_pengantaran"
                  required
                  defaultValue="drop_off"
                  className="w-full pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 appearance-none"
                >
                  <option value="drop_off">Drop Off</option>
                  <option value="pickup">Pickup</option>
                  <option value="delivery">Delivery</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Alamat */}
            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Alamat Pengantaran</label>
              <textarea
                name="alamat_pengantaran"
                rows={3}
                placeholder="Jl. Contoh No. 123, Jakarta"
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 transition resize-none"
              />
            </div>

            {/* Catatan */}
            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Catatan</label>
              <textarea
                name="catatan"
                rows={3}
                className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-400 transition resize-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-all shadow-sm"
            >
              {saving ? "Creating..." : "Next: Add Services"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/dashboard/pesanan")}
              className="px-8 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold transition-all shadow-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
