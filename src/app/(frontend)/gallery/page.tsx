"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const images = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  alt: `Gallery ${i + 1}`,
}));

export default function GalleryPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <section className="bg-[#444444] py-16 pt-28 min-h-screen">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <Skeleton className="h-14 w-64 mx-auto rounded-full" />
            <Skeleton className="h-6 w-3/4 mx-auto" />
          </div>
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
            {[...Array(9)].map((_, i) => (
              <Skeleton key={i} className={`w-full rounded-xl ${i % 2 === 0 ? "h-64" : "h-80"}`} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#444444] py-16 pt-28">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16" data-aos="zoom-in">
          <span className="inline-block border-2 border-white rounded-full px-6 py-3 text-white text-3xl font-bold uppercase mb-4">
            Our Gallery
          </span>
          <p className="text-white text-lg max-w-3xl mx-auto">
            See the transformation! Before and after photos of our professional shoe cleaning services.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {images.map((img, idx) => {
            const heights = ["h-64", "h-72", "h-80", "h-56"];
            const h = heights[img.id % heights.length];
            return (
              <div
                key={img.id}
                className={`break-inside-avoid ${h} bg-gradient-to-br from-gray-600 to-gray-700 rounded-xl overflow-hidden relative group cursor-pointer`}
                data-aos="fade-up"
                data-aos-delay={idx * 50}
              >
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <span className="text-white font-medium text-sm bg-black/50 px-4 py-2 rounded-full">
                    View
                  </span>
                </div>
                <div className="absolute bottom-3 left-3 text-white/60 text-xs font-medium">
                  Before &amp; After #{img.id}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
