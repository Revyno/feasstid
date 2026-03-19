"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { JenisSepatu } from "@/types/database";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, SlidersHorizontal, LayoutGrid, CheckCircle2, XCircle, MoreVertical, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZES = [10, 25, 50];

export default function JenisSepatuPage() {
  const router = useRouter();
  const [items, setItems] = useState<JenisSepatu[]>([]);
  const [usageCounts, setUsageCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const supabase = createClient();

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [jenisRes, detailRes] = await Promise.all([
      supabase.from("jenis_sepatus").select("*").order("created_at", { ascending: false }),
      supabase.from("detail_pesanans").select("jenis_sepatu_id"),
    ]);

    const jenisData = (jenisRes.data as JenisSepatu[]) ?? [];
    setItems(jenisData);

    // Count usage per jenis sepatu
    const counts: Record<string, number> = {};
    for (const d of detailRes.data ?? []) {
      if (d.jenis_sepatu_id) {
        counts[d.jenis_sepatu_id] = (counts[d.jenis_sepatu_id] ?? 0) + 1;
      }
    }
    setUsageCounts(counts);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Close dropdown on outside click
  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest(".action-menu-container")) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const filtered = items.filter((j) =>
    j.nama_jenis.toLowerCase().includes(search.toLowerCase()) ||
    (j.merek ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus jenis sepatu ini?")) return;
    await supabase.from("jenis_sepatus").delete().eq("id", id);
    fetchData();
  }

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
      setSelected(new Set(paginated.map(j => j.id)));
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
          Jenis Sepatu
        </h1>
        <Link
          href="/dashboard/jenis-sepatu/create"
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-bold transition-all shadow-sm hover:shadow-md hover:shadow-orange-200 dark:hover:shadow-orange-900/30"
        >
          <Plus className="w-4 h-4" />
          New Jenis Sepatu
        </Link>
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm">
        {/* Table Toolbar */}
        <div className="px-5 py-4 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-colors">
              <SlidersHorizontal className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-orange-300 hover:text-orange-500 transition-colors">
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="w-10 px-5 py-3">
                  <input
                    type="checkbox"
                    checked={paginated.length > 0 && selected.size === paginated.length}
                    onChange={toggleAll}
                    className="rounded border-gray-300 accent-orange-500"
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  Nama Jenis
                  <span className="ml-1 text-gray-300 dark:text-gray-600">⇅</span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  Status
                  <span className="ml-1 text-gray-300 dark:text-gray-600">⇅</span>
                </th>
                <th className="text-left px-4 py-3 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  Digunakan
                  <span className="ml-1 text-gray-300 dark:text-gray-600">⇅</span>
                </th>
                <th className="text-right px-5 py-3 text-xs font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50 dark:border-gray-800/50 animate-pulse">
                    <td className="px-5 py-4"><div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-800" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-32 rounded bg-gray-100 dark:bg-gray-800" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-8 rounded bg-gray-100 dark:bg-gray-800" /></td>
                    <td className="px-4 py-4"><div className="h-4 w-8 rounded bg-gray-100 dark:bg-gray-800" /></td>
                    <td className="px-5 py-4 text-right"><div className="h-4 w-4 rounded bg-gray-100 dark:bg-gray-800 ml-auto" /></td>
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 text-sm">
                    Belum ada data jenis sepatu
                  </td>
                </tr>
              ) : paginated.map((j) => {
                const used = usageCounts[j.id] ?? 0;
                const isSelected = selected.has(j.id);
                return (
                  <tr
                    key={j.id}
                    onClick={() => router.push(`/dashboard/jenis-sepatu/${j.id}/edit`)}
                    className={`border-b border-gray-50 dark:border-gray-800/50 hover:bg-orange-50/30 dark:hover:bg-orange-950/10 transition-colors cursor-pointer ${isSelected ? "bg-orange-50/50 dark:bg-orange-950/20" : ""}`}
                  >
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => { e.stopPropagation(); toggleSelect(j.id); }}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-gray-300 accent-orange-500"
                      />
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-sm font-semibold ${!j.is_active ? "text-orange-500" : "text-gray-800 dark:text-gray-200"}`}>
                        {j.nama_jenis}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {j.is_active ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`text-sm font-bold ${used === 0 ? "text-orange-400" : "text-gray-700 dark:text-gray-300"}`}>
                        {used}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            router.push(`/dashboard/jenis-sepatu/${j.id}/edit`);
                          }}
                          className="h-9 w-9 text-blue-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            handleDelete(j.id);
                          }}
                          className="h-9 w-9 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
          <span className="text-xs text-gray-400 font-medium">
            Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>Per page</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-orange-400"
              >
                {PAGE_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 disabled:opacity-40 hover:border-orange-300 hover:text-orange-500 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${p === page ? "bg-orange-500 text-white" : "border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-orange-300 hover:text-orange-500"}`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 disabled:opacity-40 hover:border-orange-300 hover:text-orange-500 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
