"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";

// ─── Types ─────
interface ReviewCard {
  name: string;
  avatar: string;
  text: string;
  time: string;
}

interface MaterialCard {
  label: string;
  image: string;
}

interface UpdatePost {
  image: string;
  text: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

// ─── Data ───

const reviews: ReviewCard[] = [
  {
    name: "Mawar Jaka",
    avatar: "/asset/human1.jpg",
    text: "Puass pekerjaannyaaa",
    time: "1 year ago",
  },
  {
    name: "Putriana Hudiyanti",
    avatar: "/asset/pp1.jpg",
    text: "bersih bgt kaget, padahal udh hopeless gabakal bisa dibersihin insolenya karna nyoba sikat sendiri di rumah gaada hasil 🙃",
    time: "1 year ago",
  },
  {
    name: "Denis Cool",
    avatar: "/asset/pp2.jpg",
    text: "Excellent service! I spilled coffee to my converse, and not hoping much for it to be clean ever again. Fresh Kicks cleaned it, and the end result is so amazing and smells good…",
    time: "1 year ago",
  },
];

const materials: MaterialCard[] = [
  { label: "NUBUCK", image: "/asset/nubuck.jpg" },
  { label: "FABRIC", image: "/asset/fabric.jpg" },
  { label: "LEATHER", image: "/asset/leather.jpg" },
  { label: "SUEDE", image: "/asset/3suede.heic" },
];

const updates: UpdatePost[] = [
  {
    image: "/asset/fresh1.heic",
    text: `Sepatu aja butuh Self healing, makanya kita kasi deep clean. Biar GK stresss liat Noda 😉🤔
Jika sepatu kesayangan mu sudah kotor, bawakan saja pada kami @feasst.id the best Cleaning ‼️
Kami ada di 📍Jl Aryo Bebangah no 54 📍Jl Jatisari 3 no 44 Pepelegi
#cucisepatu #cucisepatusidoarjo #bestcleaning`,
  },
  {
    image: "/asset/fresh2.heic",
    text: "Promo Cuci 3 Gratis 1 Kembali lagi\nGratis antar jemput daerah Surabaya & Sidoarjo terdekat\nTunggu apalagi Drop Sepatu Kotor mu sekarang !!\n#discon #cucisepatu #feasstid #cucisepatumurah",
  },
  {
    image: "/asset/fresh3.heic",
    text: "Kalau manusia rawat tubuh pakai skincare, kalau sepatu pakai @feasst.id shoes care. Biar badan sepatumu tetep glowing ✨\n#cucisepatu #cucisepatusidoarjo #feasstid\n#cucisepatumurah",
  },
];

const faqs: FAQItem[] = [
  {
    question: "Berapa lama proses pengerjaan cuci sepatu?",
    answer: "Proses pengerjaan standar kami adalah 3-4 hari kerja. Namun, kami juga menyediakan layanan kilat (Express) yang bisa selesai dalam 24 jam.",
  },
  {
    question: "Apakah Feast.id menyediakan layanan antar jemput?",
    answer: "Ya, kami menyediakan layanan antar jemput gratis untuk wilayah Sidoarjo dan Surabaya area tertentu dengan minimal order tertentu.",
  },
  {
    question: "Jenis sepatu apa saja yang bisa dicuci di Feast.id?",
    answer: "Kami melayani hampir semua jenis sepatu, mulai dari Sneakers, Leather (Kulit), Suede, Canvas, hingga sepatu olahraga dan high heels.",
  },
  {
    question: "Apakah noda kuning (unyellowing) bisa dihilangkan?",
    answer: "Kami memiliki layanan khusus Unyellowing untuk mengembalikan warna asli sol sepatu yang menguning akibat oksidasi.",
  },
  {
    question: "Bagaimana cara melakukan pembayaran?",
    answer: "Pembayaran dapat dilakukan melalui transfer bank, dompet digital (E-wallet), atau tunai saat pengambilan/pengantaran sepatu.",
  },
];

const orderSteps = [
  {
    number: "1",
    title: "Register or Login",
    description:
      "Create an account or log in to access our customer dashboard where you can place orders, track progress, and manage your services.",
    actions: (
      <div className="flex gap-3 flex-wrap">
        <Link
          href="/register"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#0B1320] hover:bg-[#374151] rounded-lg transition-colors"
        >
          Sign Up
          <svg className="w-3.5 h-3.5 ml-2" fill="none" viewBox="0 0 14 10">
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M1 5h12m0 0L9 1m4 4L9 9"
            />
          </svg>
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-[#0B1320] bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
        >
          Login
        </Link>
      </div>
    ),
  },
  {
    number: "2",
    title: "Choose Your Services",
    description:
      "Browse our professional cleaning services. Select the type of cleaning that best fits your shoes' condition and material.",
    actions: (
      <Link
        href="/services"
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#0B1320] hover:bg-[#374151] rounded-lg transition-colors"
      >
        View Services
        <svg className="w-3.5 h-3.5 ml-2" fill="none" viewBox="0 0 14 10">
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M1 5h12m0 0L9 1m4 4L9 9"
          />
        </svg>
      </Link>
    ),
  },
  {
    number: "3",
    title: "Place Your Order",
    description:
      "Fill in your order details including shoe type, quantity, condition, and upload photos. Choose pickup or delivery options.",
    actions: (
      <div className="flex flex-wrap gap-3">
        <span className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
              clipRule="evenodd"
            />
          </svg>
          Upload Photos
        </span>
        <span className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
          </svg>
          Free Delivery
        </span>
      </div>
    ),
  },
  {
    number: "4",
    title: "Make Payment",
    description:
      "Complete your payment securely through our system. We accept various payment methods for your convenience.",
    actions: (
      <span className="flex items-center text-sm text-gray-600">
        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
        Secure Payment
      </span>
    ),
  },
  {
    number: "5",
    title: "Track & Receive Your Shoes",
    description:
      "Monitor your order status in real-time through your dashboard. Receive your professionally cleaned shoes ready to wear!",
    actions: (
      <div className="flex flex-wrap gap-3">
        <span className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              clipRule="evenodd"
            />
          </svg>
          Real-time Tracking
        </span>
        <span className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Quality Guarantee
        </span>
      </div>
    ),
  },
];

// ─── Sub-components ────

function StarRating() {
  return (
    <div className="flex text-yellow-400 gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-2 border-white rounded-full px-6 py-3 inline-block">
      <h2 className="text-3xl font-bold text-white uppercase">{children}</h2>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="relative mx-auto border-gray-900 bg-gray-900 border-[14px] rounded-[2.5rem] h-[600px] w-[300px] shadow-2xl">
      {/* Notch */}
      <div className="w-[148px] h-[18px] bg-gray-900 top-0 rounded-b-[1rem] left-1/2 -translate-x-1/2 absolute z-10" />
      {/* Side buttons */}
      <div className="h-[32px] w-[3px] bg-gray-900 absolute -left-[17px] top-[72px] rounded-l-lg" />
      <div className="h-[46px] w-[3px] bg-gray-900 absolute -left-[17px] top-[124px] rounded-l-lg" />
      <div className="h-[46px] w-[3px] bg-gray-900 absolute -left-[17px] top-[178px] rounded-l-lg" />
      <div className="h-[64px] w-[3px] bg-gray-900 absolute -right-[17px] top-[142px] rounded-r-lg" />
      {/* Screen */}
      <div className="rounded-[2rem] overflow-hidden w-[272px] h-[572px] bg-white relative">
        <video
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/asset/hero1.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
}

function PhoneMockupMobile() {
  return (
    <div className="relative mx-auto border-gray-900 bg-gray-900 border-[8px] rounded-[2rem] h-[400px] w-[200px] shadow-xl">
      <div className="w-[100px] h-[12px] bg-gray-900 top-0 rounded-b-[0.5rem] left-1/2 -translate-x-1/2 absolute z-10" />
      <div className="rounded-[1.5rem] overflow-hidden w-full h-full bg-white">
        <video className="w-full h-full object-cover" autoPlay loop muted playsInline>
          <source src="/asset/hero1.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
}

function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section id="faq" className="bg-[#5E5E5E] py-16 text-white" data-aos="fade-up">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <SectionBadge>FREQUENTLY ASKED QUESTIONS</SectionBadge>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-xl overflow-hidden shadow-md transition-all duration-300"
            >
              <button
                className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none"
                onClick={() => toggleFAQ(index)}
              >
                <span className="text-lg font-semibold text-gray-800">
                  {faq.question}
                </span>
                <svg
                  className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${
                    activeIndex === index ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div
                className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                  activeIndex === index ? "max-h-60 py-4 border-t border-gray-100" : "max-h-0"
                }`}
              >
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Main Page ───

export default function Home() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation after mount
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* ── Hero ─── */}
      <section className="bg-[#0B1320] border-b border-gray-800 pt-24">
        <div className="grid max-w-screen-xl px-4 py-8 mx-auto gap-8 lg:py-16 lg:grid-cols-12 items-center">
          {/* Left copy */}
          <div
            className={`mr-auto place-self-center lg:col-span-7 transition-all duration-700 ${
              visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            {/* Rating badge */}
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-blue-50 text-black px-3 py-1 rounded-md text-sm font-semibold flex items-center gap-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                5.0
              </div>
              <span className="text-gray-300 font-medium text-sm">Trusted Customer</span>
            </div>

            <h1 className="max-w-2xl mb-6 text-5xl font-extrabold tracking-tight leading-tight md:text-6xl text-white">
              A better way to <br />
              <span className="text-gray-500 italic">care</span> for your shoes
            </h1>

            <p className="max-w-xl mb-8 font-normal text-gray-500 text-lg lg:text-xl leading-relaxed">
              Expert cleaning service that brings your favorite footwear back to life. From sneakers
              to leathers, we treat them with the professional care they deserve.
            </p>

            <div className="flex flex-col space-y-4 sm:flex-row sm:justify-start sm:space-y-0 sm:space-x-4">
              <Link
                href="/register"
                className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-center text-white rounded-full bg-gray-700 hover:bg-gray-600 focus:ring-4 focus:ring-blue-300 transition-all shadow-lg shadow-gray-600/30"
              >
                <svg
                  className="w-6 h-6"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6.03v13m0-13c-2.819-.831-4.715-1.076-8.029-1.023A.99.99 0 0 0 3 6v11c0 .563.466 1.014 1.03 1.007 3.122-.043 5.018.212 7.97 1.023m0-13c2.819-.831 4.715-1.076 8.029-1.023A.99.99 0 0 1 21 6v11c0 .563-.466 1.014-1.03 1.007-3.122-.043-5.018.212-7.97 1.023"
                  />
                </svg>
                <p className="ml-2">Book Now</p>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-12 flex gap-12 border-t border-gray-700 pt-8" data-aos="fade-up" data-aos-delay="400">
              {[
                { value: "100%", label: "Satisfaction Rate" },
                { value: "2+", label: "Years Experience" },
                { value: "1K+", label: "Shoes Cleaned" },
              ].map((stat) => (
                <div key={stat.label}>
                  <h4 className="text-3xl font-bold text-white">{stat.value}</h4>
                  <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right phone – desktop */}
          <div
            className={`hidden lg:mt-6 lg:col-span-5 lg:flex justify-center relative transition-all duration-700 delay-200 ${
              visible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <PhoneMockup />
          </div>

          {/* Phone – mobile */}
          <div className="lg:hidden mt-8 flex justify-center">
            <PhoneMockupMobile />
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="bg-[#5E5E5E] py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <div className="border-2 border-white rounded-full px-6 py-3 inline-block mb-8" data-aos="zoom-in">
                <h2 className="text-3xl font-bold text-white uppercase text-center">DISCOVER US</h2>
              </div>
              <div className="text-white space-y-6" data-aos="fade-right">
                <p className="text-lg leading-relaxed">
                  Didirikan dengan keyakinan bahwa setiap sepatu favorit layak mendapatkan perawatan
                  terbaik, Feast.id hadir dengan layanan cleaning profesional untuk semua jenis alas
                  kaki. Tim ahli kami menggunakan teknik dan produk premium untuk mengatasi mulai dari
                  kotoran sehari-hari hingga noda membandel, tanpa merusak bahan atau warna sepatumu.
                </p>
                <p className="text-lg leading-relaxed">
                  Mau itu sneakers kesayangan, sepatu formal andalan, atau boots yang sudah menemani
                  banyak langkah, kami siap membuatnya tampak seperti baru lagi. Feast.id bikin sepatu
                  selalu bersih, wangi, dan siap tampil percaya diri di setiap langkahmu!
                </p>
              </div>
            </div>
            <div className="lg:w-1/2" data-aos="fade-left">
              <Image
                src="/asset/1.heic"
                alt="About Us"
                width={600}
                height={400}
                className="w-full rounded-lg shadow-lg object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ── */}
      <section id="services" className="bg-[#5E5E5E] py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                ),
                title: "Perawatan Profesional",
                desc: "Layanan cleaning profesional with teknik dan produk premium untuk hasil maksimal.",
              },
              {
                icon: (
                  <>
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1V8a1 1 0 00-1-1h-3z" />
                  </>
                ),
                title: "Layanan Antar-Jemput Gratis",
                desc: "Kami jemput dan antar sepatu Anda langsung ke lokasi tanpa biaya tambahan.",
              },
              {
                icon: (
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                ),
                title: "Konsultasi Dukungan Pelanggan",
                desc: "Tim support kami siap membantu Anda dengan pertanyaan dan konsultasi kapan saja.",
              },
            ].map((s, idx) => (
              <div key={s.title} className="text-center" data-aos="fade-up" data-aos-delay={idx * 100}>
                <div className="bg-[#0B1320] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                    {s.icon}
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 uppercase">{s.title}</h3>
                <p className="text-white">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Materials ─────────────────────────────────────────────────── */}
      <section id="materials" className="bg-[#5E5E5E] py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <SectionBadge>CARE FOR ALL SHOE MATERIALS</SectionBadge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {materials.map((m, idx) => (
              <div key={m.label} className="relative group cursor-pointer" data-aos="zoom-in" data-aos-delay={idx * 100}>
                <Image
                  src={m.image}
                  alt={m.label}
                  width={400}
                  height={256}
                  className="w-full h-64 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center rounded-lg">
                  <h3 className="text-white text-2xl font-bold uppercase">{m.label}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Branch Locations ──────────────────────────────────────────── */}
      <section id="locations" className="bg-[#5E5E5E] py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <SectionBadge>BRANCH LOCATIONS</SectionBadge>
          </div>
          <div className="bg-[#EEF9FF] rounded-lg p-8" data-aos="fade-up">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Info */}
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">SIDOARJO</h3>
                <div className="flex items-start gap-2 mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6 shrink-0 mt-0.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  <p className="text-gray-600 text-sm">
                    Feast.id Cuci Sepatu Kilat, Jl. Jatisari 3 No.44, Pepelegi, Kec. Waru, Kabupaten
                    Sidoarjo, Jawa Timur 61256
                  </p>
                </div>
                <div className="flex items-start gap-2 mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-6 h-6 shrink-0 mt-0.5"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                  <p className="text-gray-600 text-sm">
                    Jl. Aryo Bebangah No.54, Dusun Bangah Barat, Bangah, Kec. Gedangan, Kabupaten
                    Sidoarjo, Jawa Timur 61254
                  </p>
                </div>
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Jam Operasional:</h4>
                  <ul className="text-gray-600 text-sm space-y-1">
                    <li>
                      <strong>Senin - Jumat:</strong> 08:00 - 17:00
                    </li>
                    <li>
                      <strong>Sabtu:</strong> 08:00 - 15:00
                    </li>
                    <li>
                      <strong>Minggu:</strong> Tutup
                    </li>
                  </ul>
                </div>
                <div className="flex gap-4">
                  <a
                    href="https://wa.me/6282132897760"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white border border-gray-300 text-gray-800 px-6 py-2 rounded-full hover:bg-gray-50 transition duration-300 text-sm font-medium"
                  >
                    WhatsApp
                  </a>
                  <a
                    href="https://maps.app.goo.gl/VbfEmekgdUCTWkFo8"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition duration-300 text-sm font-medium"
                  >
                    Google Maps
                  </a>
                </div>
              </div>

              {/* Map */}
              <div>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2028458.4159055245!2d108.52008822500001!3d-6.790184978923435!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2dd7fb8a85ba549f%3A0xe345db2214716827!2sFeasst.id!5e0!3m2!1sid!2sid!4v1767110611423!5m2!1sid!2sid"
                  width="100%"
                  height="300"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Customer Reviews ──────────────────────────────────────────── */}
      <section className="bg-[#5E5E5E] py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <SectionBadge>CUSTOMER REVIEWS</SectionBadge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((r, idx) => (
              <div key={r.name} className="bg-white rounded-lg shadow-lg p-6" data-aos="fade-up" data-aos-delay={idx * 100}>
                <div className="flex items-center mb-4">
                  <Image
                    src={r.avatar}
                    alt={r.name}
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover ring-2 mr-4"
                  />
                  <div>
                    <h4 className="font-bold text-gray-800">{r.name}</h4>
                    <StarRating />
                  </div>
                </div>
                <p className="text-gray-600">{r.text}</p>
                <p className="text-gray-400 text-sm mt-2">{r.time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How to Order ──────────────────────────────────────────────── */}
      <section className="bg-[#5E5E5E] py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <SectionBadge>HOW TO ORDER</SectionBadge>
            <p className="text-white mt-4 max-w-2xl mx-auto">
              Follow these simple steps to get your shoes professionally cleaned and ready to shine!
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <ol className="relative border-l border-gray-400">
              {orderSteps.map((step, idx) => (
                <li key={step.number} className="mb-10 ml-6 last:mb-0" data-aos="fade-left" data-aos-delay={idx * 100}>
                  <span className="absolute flex items-center justify-center w-8 h-8 bg-white rounded-full -left-4 ring-4 ring-[#5E5E5E]">
                    <svg
                      className="w-3.5 h-3.5 text-[#0B1320]"
                      fill="none"
                      viewBox="0 0 16 12"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M1 5.917 5.724 10.5 15 1.5"
                      />
                    </svg>
                  </span>
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                    <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900">
                      <span className="bg-[#0B1320] text-white text-sm font-medium mr-2 px-2.5 py-0.5 rounded">
                        {step.number}
                      </span>
                      {step.title}
                    </h3>
                    <p className="mb-4 text-base font-normal text-gray-700">{step.description}</p>
                    {step.actions}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── Fresh Updates ─────────────────────────────────────────────── */}
      <section className="bg-[#5E5E5E] py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <SectionBadge>FRESH UPDATES</SectionBadge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {updates.map((post, i) => (
              <div key={i} className="bg-white rounded-lg overflow-hidden shadow-lg" data-aos="fade-up" data-aos-delay={i * 100}>
                <Image
                  src={post.image}
                  alt={`Update ${i + 1}`}
                  width={600}
                  height={256}
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <p className="text-gray-600 whitespace-pre-line text-sm">{post.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <FAQSection />
    </>
  );
}
