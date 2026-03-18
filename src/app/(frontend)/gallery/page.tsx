"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { GalleryGrid } from "@/components/gallery-grid";

export default function GalleryPage() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <section className="bg-[#444444] py-16 pt-28 min-h-screen">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <Skeleton className="h-14 w-64 mx-auto rounded-full bg-white/10" />
            <Skeleton className="h-6 w-1/2 mx-auto bg-white/10" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="w-full aspect-[4/5] rounded-2xl bg-white/10" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#444444] py-16 pt-28 min-h-screen">
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

        {/* Dynamic Gallery Grid */}
        <GalleryGrid />
      </div>
    </section>
  );
}
