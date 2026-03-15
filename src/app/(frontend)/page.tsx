import Link from "next/link";
import type { Metadata } from "next";
import {
  CheckCircledIcon,
  RocketIcon,
  ChatBubbleIcon,
  StarFilledIcon,
  ClockIcon,
  CheckIcon,
} from "@radix-ui/react-icons";

export const metadata: Metadata = {
  title: "Feast.id — Professional Shoe Cleaning Service",
  description:
    "Expert cleaning service that brings your favorite footwear back to life. From sneakers to leathers, we treat them with the professional care they deserve.",
};

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-[#0B1320] border-b border-gray-800 pt-24">
        <div className="mx-auto px-4 py-16 lg:py-24 grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            {/* Rating badge */}
            <div className="flex items-center gap-2 mb-6">
              <span className="bg-blue-50 text-gray-900 px-3 py-1 rounded-md text-sm font-semibold inline-flex items-center gap-1">
                <StarFilledIcon className="w-4 h-4 text-yellow-500" />
                5.0
              </span>
              <span className="text-gray-400 text-sm font-medium">Trusted Customer</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-tight text-white mb-6">
              A better way to <br />
              <span className="text-gray-500 italic">care</span> for your shoes
            </h1>

            <p className="text-gray-400 text-lg lg:text-xl leading-relaxed mb-8 max-w-xl">
              Expert cleaning service that brings your favorite footwear back to life. From sneakers to leathers, we treat them with the professional care they deserve.
            </p>

            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-full font-bold text-base transition-all shadow-lg shadow-gray-800/30"
            >
              <RocketIcon className="w-5 h-5" />
              Book Now
            </Link>

            {/* Stats */}
            <div className="mt-12 flex gap-12 border-t border-gray-700 pt-8">
              {[
                { val: "100%", label: "Satisfaction Rate" },
                { val: "2+", label: "Years Experience" },
                { val: "1K+", label: "Shoes Cleaned" },
              ].map((s) => (
                <div key={s.label}>
                  <h4 className="text-3xl font-bold text-white">{s.val}</h4>
                  <p className="text-sm text-gray-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Phone mockup */}
          <div className="hidden lg:flex lg:col-span-5 justify-center">
            <div className="relative border-gray-900 bg-gray-900  shadow-2xl">
              <div className=" bg-gray-900 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute z-10" />
              <div className="rounded-[2rem] overflow-hidden  from-blue-900 via-gray-900 to-gray-800 flex items-center justify-center">
                <div className="text-center px-6">
                  <RocketIcon className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <p className="text-white font-bold text-xl">Feast.id</p>
                  <p className="text-gray-400 text-sm mt-2">Your Shoe Care Partner</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── About / Discover Us ── */}
      <section className="bg-[#5E5E5E] py-20">
        <div className=" mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block border-2 border-white rounded-full px-6 py-2 text-white text-2xl font-bold uppercase mb-8">
              Discover Us
            </span>
            <p className="text-white text-lg leading-relaxed mb-6">
              Didirikan dengan keyakinan bahwa setiap sepatu favorit layak mendapatkan perawatan terbaik, Feast.id hadir dengan layanan cleaning profesional untuk semua jenis alas kaki.
            </p>
            <p className="text-white text-lg leading-relaxed">
              Mau itu sneakers kesayangan, sepatu formal andalan, atau boots yang sudah menemani banyak langkah — kami siap membuatnya tampak seperti baru lagi!
            </p>
          </div>
          <div className="bg-gray-700 rounded-xl h-80 flex items-center justify-center">
            <span className="text-gray-400 text-lg font-medium">Feast.id Team Photo</span>
          </div>
        </div>
      </section>

      {/* ── Services Overview ── */}
      <section className="bg-[#5E5E5E] py-16">
        <div className=" mx-auto px-4 grid md:grid-cols-3 gap-8">
          {[
            { icon: <CheckCircledIcon className="w-8 h-8" />, title: "Perawatan Profesional", desc: "Layanan cleaning profesional dengan teknik dan produk premium untuk hasil maksimal." },
            { icon: <RocketIcon className="w-8 h-8" />, title: "Layanan Antar-Jemput Gratis", desc: "Kami jemput dan antar sepatu Anda langsung ke lokasi tanpa biaya tambahan." },
            { icon: <ChatBubbleIcon className="w-8 h-8" />, title: "Konsultasi Dukungan Pelanggan", desc: "Tim support kami siap membantu Anda dengan pertanyaan dan konsultasi kapan saja." },
          ].map((s) => (
            <div key={s.title} className="text-center">
              <div className="bg-[#0B1320] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-white">
                {s.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 uppercase">{s.title}</h3>
              <p className="text-white/80">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Shoe Materials ── */}
      <section className="bg-[#5E5E5E] py-16">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block border-2 border-white rounded-full px-6 py-3 text-white text-2xl font-bold uppercase">
              Care For All Shoe Materials
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {["Nubuck", "Fabric", "Leather", "Suede"].map((m) => (
              <div key={m} className="group relative rounded-xl overflow-hidden h-64 bg-gray-700 cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute inset-0 flex items-end p-6">
                  <h3 className="text-white text-2xl font-bold uppercase">{m}</h3>
                </div>
                <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Branch Locations ── */}
      <section className="bg-[#5E5E5E] py-16">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block border-2 border-white rounded-full px-6 py-3 text-white text-2xl font-bold uppercase">
              Branch Locations
            </span>
          </div>
          <div className="bg-[#EEF9FF] rounded-xl p-8 grid lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">SIDOARJO</h3>
              <p className="text-gray-600 mb-2">📍 Feast.id Cuci Sepatu Kilat, Jl. Jatisari 3 No.44, Pepelegi, Kec.&nbsp;Waru, Kabupaten Sidoarjo, Jawa Timur 61256</p>
              <p className="text-gray-600 mb-4">📍 Jl. Aryo Bebangah No.54, Bangah, Kec.&nbsp;Gedangan, Kabupaten Sidoarjo, Jawa Timur 61254</p>
              <div className="mb-4">
                <h4 className="font-semibold text-gray-800 mb-2">Jam Operasional:</h4>
                <ul className="text-gray-600 text-sm space-y-1">
                  <li><strong>Senin – Jumat:</strong> 08:00 – 17:00</li>
                  <li><strong>Sabtu:</strong> 08:00 – 15:00</li>
                  <li><strong>Minggu:</strong> Tutup</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <a href="https://wa.me/6281234567890" className="bg-white border border-gray-300 text-gray-800 px-6 py-2 rounded-full hover:bg-gray-50 transition-all text-sm font-medium">WhatsApp</a>
                <a href="https://maps.app.goo.gl/VbfEmekgdUCTWkFo8" target="_blank" rel="noreferrer" className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-all text-sm font-medium">Google Maps</a>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2028458.4159055245!2d108.52008822500001!3d-6.790184978923435!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd7fb8a85ba549f%3A0xe345db2214716827!2sFeasst.id!5e0!3m2!1sid!2sid"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Customer Reviews ── */}
      <section className="bg-[#5E5E5E] py-16">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block border-2 border-white rounded-full px-6 py-3 text-white text-2xl font-bold uppercase">
              Customer Reviews
            </span>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Mawar Jaka", text: "\"Puass pekerjaannyaaa\"", time: "1 year ago" },
              { name: "Putriana Hudiyanti", text: "\"Bersih bgt kaget, padahal udah hopeless gabakal bisa dibersihin insolenya 🙃\"", time: "1 year ago" },
              { name: "Denis Cool", text: "\"Excellent service! I spilled coffee on my converse, and Fresh Kicks cleaned it — the result is amazing!\"", time: "1 year ago" },
            ].map((r) => (
              <div key={r.name} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold mr-4">
                    {r.name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{r.name}</h4>
                    <div className="flex text-yellow-400 mt-1">
                      {Array(5).fill(0).map((_, i) => (
                        <StarFilledIcon key={i} className="w-4 h-4" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600">{r.text}</p>
                <p className="text-gray-400 text-sm mt-2">{r.time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How To Order ── */}
      <section className="bg-[#5E5E5E] py-16">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block border-2 border-white rounded-full px-6 py-3 text-white text-2xl font-bold uppercase">
              How To Order
            </span>
            <p className="text-white mt-4 max-w-2xl mx-auto">
              Follow these simple steps to get your shoes professionally cleaned and ready to shine!
            </p>
          </div>
          <div className="max-w-3xl mx-auto">
            <ol className="relative border-l border-gray-400 space-y-10">
              {[
                { step: 1, title: "Register or Login", desc: "Create an account or log in to access our customer dashboard.", icon: <CheckIcon className="w-4 h-4" /> },
                { step: 2, title: "Choose Your Services", desc: "Browse our professional cleaning services and select what fits.", icon: <StarFilledIcon className="w-4 h-4" /> },
                { step: 3, title: "Place Your Order", desc: "Fill in your order details including shoe type, quantity, and condition.", icon: <RocketIcon className="w-4 h-4" /> },
                { step: 4, title: "Make Payment", desc: "Complete your payment securely. We accept various payment methods.", icon: <CheckCircledIcon className="w-4 h-4" /> },
                { step: 5, title: "Track & Receive Your Shoes", desc: "Monitor your order status in real-time and receive your cleaned shoes!", icon: <ClockIcon className="w-4 h-4" /> },
              ].map((s) => (
                <li key={s.step} className="ml-6">
                  <span className="absolute flex items-center justify-center w-8 h-8 bg-white rounded-full -left-4 ring-4 ring-[#5E5E5E] text-[#0B1320]">
                    {s.icon}
                  </span>
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-1">
                      <span className="bg-[#0B1320] text-white text-sm font-medium px-2.5 py-0.5 rounded">{s.step}</span>
                      {s.title}
                    </h3>
                    <p className="text-gray-600">{s.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── Fresh Updates ── */}
      <section className="bg-[#5E5E5E] py-16">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block border-2 border-white rounded-full px-6 py-3 text-white text-2xl font-bold uppercase">
              Fresh Updates
            </span>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { text: "Sepatu aja butuh Self healing, makanya kita kasi deep clean. Biar GK stress liat Noda 😉🤔 Bawakan pada kami @feasst.id #cucisepatu" },
              { text: "Promo Cuci 3 Gratis 1 Kembali lagi! Gratis antar jemput daerah Surabaya & Sidoarjo terdekat. Tunggu apalagi! #discon #feasstid" },
              { text: "Kalau manusia rawat tubuh pakai skincare, kalau sepatu pakai @feasst.id shoes care. Biar tetep glowing ✨ #cucisepatu #feasstid " },
            ].map((p, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-lg">
                <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-gray-500 font-medium">
                  Post Image {i + 1}
                </div>
                <div className="p-6">
                  <p className="text-gray-600 text-sm">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
