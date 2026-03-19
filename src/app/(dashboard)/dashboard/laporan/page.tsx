"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LaporanLaundry } from "@/types/database";
import { Plus, Search, SlidersHorizontal, Download, Eye, Pencil, Copy, Printer, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const PAGE_SIZES = [10, 25, 50];

export default function LaporanPage() {
  const router = useRouter();
  const [items, setItems] = useState<LaporanLaundry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("laporan_laundries").select("*").order("periode_awal", { ascending: false });
    setItems((data as LaporanLaundry[]) ?? []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function fmt(v: number) { 
    return `Rp ${Number(v).toLocaleString("id-ID")}`; 
  }

  const filtered = items.filter(l => 
    l.periode_awal.includes(search) || 
    l.periode_akhir.includes(search) ||
    l.total_pendapatan.toString().includes(search)
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === paginated.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(paginated.map(i => i.id)));
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus laporan ini?")) return;
    await supabase.from("laporan_laundries").delete().eq("id", id);
    fetchData();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
            Laporan Laundry
          </h1>
          <p className="text-sm text-gray-500 font-medium">
            Pantau performa keuangan dan operasional laundry Anda.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/laporan/create"
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-orange-200 dark:hover:shadow-orange-950/30"
          >
            <Plus className="w-4 h-4" />
            New Laporan
          </Link>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-5 flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari periode, nominal, atau admin..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-orange-400 focus:bg-white dark:focus:bg-gray-700 transition-all placeholder:text-gray-400"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-orange-500 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all">
              <SlidersHorizontal className="w-4 h-4" />
              Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-sm transition-all shadow-orange-100 dark:shadow-none">
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 dark:border-gray-800 text-[10px] font-black tracking-widest text-gray-400 uppercase">
                <th className="w-12 px-6 py-4">
                  <input
                    type="checkbox"
                    checked={paginated.length > 0 && selected.size === paginated.length}
                    onChange={toggleAll}
                    className="rounded border-gray-300 accent-orange-500"
                  />
                </th>
                <th className="text-left px-4 py-4">Periode Awal</th>
                <th className="text-left px-4 py-4">Periode Akhir</th>
                <th className="text-left px-4 py-4">Pendapatan</th>
                <th className="text-left px-4 py-4 text-red-400">Pengeluaran</th>
                <th className="text-left px-4 py-4 text-emerald-400">Profit</th>
                <th className="text-center px-4 py-4">Total Pesanan</th>
                <th className="text-right px-6 py-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="w-4 h-4 bg-gray-100 rounded" /></td>
                    <td colSpan={7} className="px-4 py-4"><div className="h-4 bg-gray-50 rounded w-full" /></td>
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-400 text-sm italic">
                    Belum ada data laporan
                  </td>
                </tr>
              ) : paginated.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selected.has(l.id)}
                      onChange={() => toggleSelect(l.id)}
                      className="rounded border-gray-300 accent-orange-500"
                    />
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">{l.periode_awal}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-gray-700 dark:text-gray-300">{l.periode_akhir}</td>
                  <td className="px-4 py-4 text-sm font-black text-gray-900 dark:text-gray-100">{fmt(l.total_pendapatan)}</td>
                  <td className="px-4 py-4 text-sm font-bold text-red-500">{fmt(l.total_pengeluaran)}</td>
                  <td className="px-4 py-4 text-sm font-black text-emerald-500">{fmt(l.total_profit)}</td>
                  <td className="px-4 py-4 text-center text-sm font-bold text-gray-600 dark:text-gray-400">{l.total_pesanan}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 hover:text-orange-500 transition-colors"><Eye className="w-4 h-4" /></button>
                      <button 
                        onClick={() => router.push(`/dashboard/laporan/${l.id}/edit`)}
                        className="p-1 hover:text-orange-500 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button className="p-1 hover:text-orange-500 transition-colors"><Copy className="w-4 h-4" /></button>
                      <button className="p-1 hover:text-orange-500 transition-colors"><Printer className="w-4 h-4" /></button>
                      <button 
                        onClick={() => handleDelete(l.id)}
                        className="p-1 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-5 flex items-center justify-between bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-50 dark:border-gray-800">
          <p className="text-xs font-bold text-gray-400">
            Menampilkan {paginated.length > 0 ? (page - 1) * pageSize + 1 : 0}-{Math.min(page * pageSize, filtered.length)} dari {filtered.length} laporan
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 text-xs font-black rounded-lg transition-all ${p === page ? "bg-orange-500 text-white shadow-sm" : "text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"}`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 disabled:opacity-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <footer className="text-center py-8">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
          © 2023 FEASTID LAUNDRY ECOSYSTEM. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </div>
  );
}
