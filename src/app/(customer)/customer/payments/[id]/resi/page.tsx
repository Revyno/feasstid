"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ArrowLeft, Download, Printer, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCustomerSession } from "@/lib/auth-utils";

const STATUS_LABEL: Record<string, string> = {
  paid: "Lunas",
  pending: "Menunggu Konfirmasi",
  failed: "Gagal",
  partial: "Sebagian Dibayar",
};

const METHOD_LABEL: Record<string, string> = {
  transfer: "Bank Transfer",
  qris: "QRIS",
  cash: "Cash",
  ewallet: "E-Wallet (OVO/Gopay/Dana)",
  debit: "Kartu Debit",
  credit: "Kartu Kredit",
};

export default function PrintInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<any>(null);
  const [details, setDetails] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const session = getCustomerSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const supabase = createClient();

      // Fetch payment + order + customer
      const { data, error } = await supabase
        .from("pembayarans")
        .select(`
          *,
          pesanan:pesanans (
            id,
            kode_pesanan,
            total_harga,
            metode_pengantaran,
            tanggal_pesanan,
            catatan,
            customer:customers (
              name,
              email,
              phone,
              address
            ),
            detail_pesanans (
              id,
              jumlah_pasang,
              harga_satuan,
              biaya_tambahan,
              subtotal,
              catatan_khusus,
              layanan:layanans ( nama_layanan ),
              jenis_sepatu:jenis_sepatus ( nama_jenis, merek )
            )
          )
        `)
        .eq("id", params.id)
        .single();

      if (error || !data) {
        console.error("Error fetching invoice data:", error);
        router.push("/customer/payments");
        return;
      }

      setPayment(data);
      setDetails(data.pesanan?.detail_pesanans || []);
      setLoading(false);
    }

    if (params.id) fetchData();
  }, [params.id, router]);

  const handlePrint = () => window.print();

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm font-bold text-gray-500 animate-pulse uppercase tracking-widest">Menyiapkan Invoice...</p>
    </div>
  );

  const invoiceNumber = payment.nomor_referensi || payment.id.split('-')[0].toUpperCase();
  const customer = payment.pesanan?.customer;
  const order = payment.pesanan;
  const printDate = new Date().toLocaleString('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit'
  });

  return (
    <>
      {/* Global print styles */}
      <style>{`
        @media print {
          /* Hide everything first */
          body * { visibility: hidden; }
          
          /* Only show the invoice area */
          #invoice-area, #invoice-area * { visibility: visible; }
          
          /* Position the invoice area at the top-left corner */
          #invoice-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
            border-radius: 0 !important;
          }

          /* Remove browser headers and footers by setting margin to 0 */
          @page {
            margin: 0.5cm;
            size: A4;
          }

          /* Hide UI elements that are still visible (like in layouts) */
          .no-print, header, nav, aside, footer, [role="navigation"] {
             display: none !important;
             visibility: hidden !important;
          }

          /* Ensure body background is clean white */
          body { 
            background: white !important; 
          }
        }
      `}</style>

      {/* Screen nav & buttons */}
      <div className="max-w-3xl mx-auto space-y-6 pb-16 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
          <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <Link href="/customer/payments" className="hover:text-orange-500 transition-colors">Pembayaran</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900 dark:text-gray-100 font-black">Print Invoice</span>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => router.back()}
              className="h-10 px-5 rounded-xl font-bold text-gray-500 hover:text-orange-500 flex items-center gap-2 text-sm">
              <ArrowLeft className="w-4 h-4" /> Kembali
            </Button>
            <Button onClick={handlePrint}
              className="h-10 px-6 rounded-xl font-black bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-2 text-sm shadow-lg shadow-orange-200">
              <Download className="w-4 h-4" /> Download / Print
            </Button>
          </div>
        </div>

        {/* INVOICE DOCUMENT */}
        <div
          id="invoice-area"
          className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden font-sans"
          style={{ fontFamily: "'Segoe UI', Arial, sans-serif", color: "#222" }}
        >
          {/* Top: Logo + Title */}
          <div className="flex flex-col items-center pt-10 pb-6 px-10 border-b border-gray-100">
            {/* Logo placeholder */}
            <div className="w-16 h-16 rounded-2xl bg-orange-500 flex items-center justify-center mb-4 shadow-md">
              <img src="/logo/1.jpg" alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl font-black text-gray-900 tracking-wide uppercase">INVOICE PEMBAYARAN</h1>
            <p className="text-sm text-gray-500 mt-1">No. Invoice: <span className="font-bold text-gray-800">{invoiceNumber}</span></p>
          </div>

          {/* Body */}
          <div className="px-10 py-8 space-y-8">

            {/* Customer & Invoice Info */}
            <div className="grid grid-cols-2 gap-10">
              {/* Customer Info */}
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 border-b pb-2">Informasi Customer</p>
                <div className="space-y-1.5 text-sm">
                  <div><span className="text-gray-400 text-xs">Nama:</span><br/><span className="font-semibold text-gray-800">{customer?.name || '-'}</span></div>
                  <div><span className="text-gray-400 text-xs">Email:</span><br/><span className="text-gray-700">{customer?.email || '-'}</span></div>
                  <div><span className="text-gray-400 text-xs">Telepon:</span><br/><span className="text-gray-700">{customer?.phone || '-'}</span></div>
                  {customer?.address && (
                    <div><span className="text-gray-400 text-xs">Alamat:</span><br/><span className="text-gray-700">{customer.address}</span></div>
                  )}
                </div>
              </div>

              {/* Invoice Detail */}
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 border-b pb-2">Detail Invoice</p>
                <div className="space-y-1.5 text-sm">
                  <div><span className="text-gray-400 text-xs">No. Invoice:</span><br/><span className="font-semibold text-gray-800">{invoiceNumber}</span></div>
                  <div><span className="text-gray-400 text-xs">Kode Pesanan:</span><br/>
                    <span className="font-bold text-orange-500 text-xs tracking-widest">{order?.kode_pesanan || '-'}</span>
                  </div>
                  <div><span className="text-gray-400 text-xs">Tanggal Pembayaran:</span><br/>
                    <span className="text-gray-700">{new Date(payment.tanggal_pembayaran).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                  </div>
                  <div><span className="text-gray-400 text-xs">Metode Pembayaran:</span><br/>
                    <span className="text-gray-700">{METHOD_LABEL[payment.metode_pembayaran] || payment.metode_pembayaran}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Detail Pesanan Table */}
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3 border-b pb-2">Detail Pesanan</p>
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-600">
                    <th className="text-left py-2.5 px-3 text-xs font-black uppercase tracking-wider rounded-l-lg">Layanan / Jml Sepatu</th>
                    <th className="text-center py-2.5 px-3 text-xs font-black uppercase tracking-wider">Jumlah</th>
                    <th className="text-right py-2.5 px-3 text-xs font-black uppercase tracking-wider">Harga Satuan</th>
                    <th className="text-right py-2.5 px-3 text-xs font-black uppercase tracking-wider rounded-r-lg">Harga Akhir</th>
                  </tr>
                </thead>
                <tbody>
                  {details.length > 0 ? details.map((d: any, i: number) => (
                    <tr key={d.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}>
                      <td className="py-3 px-3 align-top">
                        <div className="font-semibold text-gray-800">{d.layanan?.nama_layanan || 'Layanan'}</div>
                        <div className="text-xs text-gray-400">{d.jenis_sepatu?.nama_jenis} {d.jenis_sepatu?.merek ? `— ${d.jenis_sepatu.merek}` : ''}</div>
                        {d.catatan_khusus && <div className="text-xs text-gray-400 italic mt-0.5">{d.catatan_khusus}</div>}
                      </td>
                      <td className="py-3 px-3 text-center text-gray-700">{d.jumlah_pasang || 1} pasang</td>
                      <td className="py-3 px-3 text-right text-gray-700">Rp {(d.harga_satuan || 0).toLocaleString('id-ID')}</td>
                      <td className="py-3 px-3 text-right font-bold text-gray-900">Rp {(d.subtotal || 0).toLocaleString('id-ID')}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="py-4 px-3 text-center text-gray-400 text-xs italic">Detail layanan tidak tersedia</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200">
                    <td colSpan={3} className="py-3 px-3 text-right text-sm font-black text-gray-600 uppercase tracking-wider">Total Pesanan</td>
                    <td className="py-3 px-3 text-right font-black text-gray-800">Rp {(order?.total_harga || 0).toLocaleString('id-ID')}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="py-2 px-3 text-right text-sm font-black text-gray-600 uppercase tracking-wider">Jumlah Dibayar</td>
                    <td className="py-2 px-3 text-right font-black text-orange-500 text-base">Rp {(payment.jumlah_dibayar || 0).toLocaleString('id-ID')}</td>
                  </tr>
                  {(order?.total_harga - payment.jumlah_dibayar) > 0 && (
                    <tr>
                      <td colSpan={3} className="py-2 px-3 text-right text-xs font-black text-red-400 uppercase tracking-wider">Sisa Tagihan</td>
                      <td className="py-2 px-3 text-right font-black text-red-500 text-sm">Rp {(order?.total_harga - payment.jumlah_dibayar).toLocaleString('id-ID')}</td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>

            {/* Status */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-black uppercase tracking-wider text-gray-400">Status Pembayaran:</span>
              <span className={`text-xs font-black uppercase px-3 py-1 rounded-full border ${
                payment.status_pembayaran === 'paid' 
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                  : payment.status_pembayaran === 'failed'
                  ? 'bg-red-50 text-red-500 border-red-200'
                  : 'bg-orange-50 text-orange-500 border-orange-200'
              }`}>
                {STATUS_LABEL[payment.status_pembayaran] || payment.status_pembayaran}
              </span>
            </div>

            {/* Nomor Resi (tracking) */}
            {payment.nomor_resi && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl px-5 py-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-orange-400">Nomor Resi / Pelacakan</p>
                  <p className="text-base font-black text-gray-800 tracking-widest mt-0.5">{payment.nomor_resi}</p>
                </div>
                <div className="text-xs text-orange-400 font-bold text-right max-w-[140px] leading-relaxed">
                  Gunakan nomor ini untuk melacak pesanan Anda
                </div>
              </div>
            )}

            {/* Notes */}
            {payment.catatan && (
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Catatan</p>
                <p className="text-sm text-gray-600 italic border-l-4 border-orange-300 pl-4">{payment.catatan}</p>
              </div>
            )}

            {/* Thank you */}
            <div className="text-center py-4 border-t border-dashed border-gray-200">
              <p className="text-sm font-semibold text-gray-600">Terima kasih telah menggunakan layanan laundry kami!</p>
              <p className="text-xs text-gray-400 mt-1">Dicetak pada: {printDate}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="px-10 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <p className="text-[10px] text-gray-400">Ini adalah invoice otomatis dari sistem Feast.id Laundry. Sah tanpa tanda tangan.</p>
            <p className="text-[10px] text-gray-300 font-mono">{payment.id}</p>
          </div>
        </div>

        {/* Bottom CTA buttons (hidden on print) */}
        <div className="flex flex-col sm:flex-row gap-3 no-print">
          <Button onClick={handlePrint}
            className="flex-1 h-14 rounded-2xl font-black bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-100 flex items-center justify-center gap-3 text-base">
            <Printer className="w-5 h-5" /> Print Invoice
          </Button>
          <Button onClick={handlePrint} variant="outline"
            className="flex-1 h-14 rounded-2xl font-black border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-3 text-base">
            <Download className="w-5 h-5" /> Download PDF
          </Button>
        </div>
      </div>
    </>
  );
}
