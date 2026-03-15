import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Our Services — Feast.id",
  description: "Professional shoe, bag, hat & helmet cleaning services with transparent pricing.",
};

/* helper */
function PriceRow({ name, price }: { name: string; price: string }) {
  return (
    <div className="flex justify-between items-center py-4 border-b border-gray-100 last:border-b-0">
      <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
      <span className="text-xl font-bold text-gray-800 whitespace-nowrap ml-4">{price}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-12">
      <div className="bg-white px-8 py-5 border-b">
        <h2 className="text-2xl font-bold text-gray-800 uppercase text-center">{title}</h2>
      </div>
      <div className="p-8">{children}</div>
    </div>
  );
}

export default function ServicesPage() {
  return (
    <section className="bg-[#444444] py-16 pt-28">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block border-2 border-white rounded-full px-6 py-3 text-white text-3xl font-bold uppercase">
            Our Services
          </span>
        </div>

        {/* SHOES TREATMENT */}
        <Section title="Shoes Treatment">
          <PriceRow name="Sepatu Baby" price="20K" />
          <PriceRow name="Sepatu Warna Gelap Hard Clean" price="35K" />
          <PriceRow name="Sepatu Warna Terang Hard Clean" price="40K" />
          <PriceRow name="Sepatu Booth Pendek" price="35K" />
          <PriceRow name="Sepatu Booth UK M" price="40K" />
          <PriceRow name="Sepatu Booth UK L" price="45K" />
          <PriceRow name="Sepatu Flat Cewek" price="25K" />
          <PriceRow name="Sepatu Anak" price="25K" />
          <PriceRow name="Sepatu Putih <35" price="35K" />
          <PriceRow name="Sepatu Warna Gelap <35" price="30K" />
          <PriceRow name="Sepatu Big Size 43+ Nambah" price="5K" />
          <PriceRow name="Sepatu Trail" price="80K" />
          <PriceRow name="Sandal" price="25K" />
        </Section>

        {/* TREATMENT TAS */}
        <Section title="Treatment Tas">
          <PriceRow name="Tas Kanvas Kecil" price="25K" />
          <PriceRow name="Tas Kanvas Sedang" price="35K" />
          <PriceRow name="Tas Kanvas Besar" price="50K" />
          <PriceRow name="Tas Kulit Kecil" price="35K – 50K" />
          <PriceRow name="Tas Kulit Besar" price="80K" />
          <PriceRow name="Tas Cowok Kecil / Waistbag" price="30K" />
          <PriceRow name="Tas Pouch / Dompet" price="20K" />
          <PriceRow name="Tas Gunung Besar / Carrier" price="100K" />
          <PriceRow name="Tas Gunung Sedang / Carrier" price="50K" />
        </Section>

        {/* ADDITIONAL TREATMENT */}
        <Section title="Additional Treatment">
          <PriceRow name="Unyellowing Midsol + Cuci" price="60K" />
          <PriceRow name="Rewhitening Upper + Cuci" price="60K" />
          <PriceRow name="Unyellowing Midsol" price="45K" />
          <PriceRow name="Sepatu Reglue + Jahit Start" price="40K" />
          <PriceRow name="Sepatu Repaint Leather" price="100K – 150K" />
          <PriceRow name="Sepatu Repaint Suede, Canvas" price="120K – 150K" />
        </Section>

        {/* TOPI, HELM & KOPER */}
        <Section title="Topi, Helm & Koper">
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="text-lg font-bold text-gray-700 mb-3 border-b-2 border-gray-300 inline-block">TOPI</h4>
            <PriceRow name="Cuci Segala Topi" price="15K" />
          </div>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="text-lg font-bold text-gray-700 mb-3 border-b-2 border-gray-300 inline-block">HELM</h4>
            <PriceRow name="Helm Full Face" price="35K" />
            <PriceRow name="Helm Half" price="30K" />
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-bold text-gray-700 mb-3 border-b-2 border-gray-300 inline-block">KOPER</h4>
            <PriceRow name="Koper UK S" price="50K" />
            <PriceRow name="Koper UK M" price="70K" />
            <PriceRow name="Koper UK L" price="100K" />
            <PriceRow name="Koper UK XL" price="120K" />
          </div>
        </Section>
      </div>
    </section>
  );
}
