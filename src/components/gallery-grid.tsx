"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { 
  GALLERY_ITEMS, 
  GALLERY_CATEGORIES, 
  GalleryCategory, 
  GalleryType,
  GalleryItem
} from "@/lib/gallery-data";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, Play, Maximize2 } from "lucide-react";

const ITEMS_PER_PAGE = 6;

export function GalleryGrid() {
  const [selectedCategory, setSelectedCategory] = useState<GalleryCategory | "All">("All");
  const [selectedType, setSelectedType] = useState<GalleryType | "All">("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const filteredItems = useMemo(() => {
    return GALLERY_ITEMS.filter((item: GalleryItem) => {
      const categoryMatch = selectedCategory === "All" || item.category === selectedCategory;
      const typeMatch = selectedType === "All" || item.type === selectedType;
      return categoryMatch && typeMatch;
    });
  }, [selectedCategory, selectedType]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  return (
    <div className="space-y-12">
      {/* Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white/10 p-6 rounded-2xl backdrop-blur-sm border border-white/10">
        <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <Tabs 
            value={selectedCategory} 
            onValueChange={(val) => {
              setSelectedCategory(val as any);
              setCurrentPage(1);
            }} 
            className="w-full"
          >
            <TabsList className="bg-transparent h-auto p-0 flex flex-nowrap space-x-2">
              <TabsTrigger 
                value="All" 
                className="px-6 py-2 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white border border-white/20 text-white/70"
              >
                All
              </TabsTrigger>
              {GALLERY_CATEGORIES.map((cat: GalleryCategory) => (
                <TabsTrigger 
                  key={cat} 
                  value={cat}
                  className="px-6 py-2 rounded-full data-[state=active]:bg-primary data-[state=active]:text-white border border-white/20 text-white/70 whitespace-nowrap"
                >
                  {cat}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex gap-2">
          {(["All", "image", "video"] as const).map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setSelectedType(type);
                setCurrentPage(1);
              }}
              className="rounded-full px-5 border-white/20 text-white bg-white/5 hover:bg-white/10 transition-all capitalize"
            >
              {type === "image" ? "Images" : type === "video" ? "Videos" : "All Media"}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {paginatedItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedItems.map((item: GalleryItem, idx: number) => (
            <div
              key={item.id}
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl bg-gray-800 border border-white/10 cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
              onClick={() => setSelectedItem(item)}
              data-aos="fade-up"
              data-aos-delay={idx * 100}
            >
              {item.type === "image" ? (
                <img
                  src={item.url}
                  alt={item.alt}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&q=80"; // Fallback for HEIC if not supported
                  }}
                />
              ) : (
                <div className="relative h-full w-full">
                  <video
                    src={item.url}
                    className="h-full w-full object-cover"
                    muted
                    loop
                    playsInline
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Play className="text-white fill-white w-8 h-8 ml-1" />
                    </div>
                  </div>
                </div>
              )}

              {/* Overlays */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Badge className="mb-2 bg-primary/80 backdrop-blur-md border-0">{item.category}</Badge>
                <p className="text-white font-semibold text-lg">{item.alt}</p>
              </div>
              
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="p-2 bg-black/50 backdrop-blur-md rounded-full text-white">
                  <Maximize2 className="w-5 h-5" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/20">
          <p className="text-white/60 text-xl font-medium italic">No media found for the selected filters.</p>
          <Button 
            variant="link" 
            onClick={() => {
              setSelectedCategory("All");
              setSelectedType("All");
            }}
            className="text-primary mt-2"
          >
            Clear Filters
          </Button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-12 py-8 pt-12 border-t border-white/10">
          <Button
            variant="ghost"
            size="icon"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
            className="text-white hover:bg-white/10"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          
          <div className="flex items-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "ghost"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 rounded-full ${
                  currentPage === page ? "bg-primary" : "text-white/60 hover:bg-white/10"
                }`}
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon"
            disabled={currentPage === totalPages}
            onClick={() => handlePageChange(currentPage + 1)}
            className="text-white hover:bg-white/10"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      )}

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-5xl bg-black/95 border-white/10 p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="p-4 absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
            <DialogTitle className="text-white/90 font-medium pointer-events-auto">
              {selectedItem?.category} - {selectedItem?.alt}
            </DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center w-full min-h-[50vh] max-h-[85vh]">
            {selectedItem?.type === "image" ? (
              <img
                src={selectedItem.url}
                alt={selectedItem.alt}
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=1200&q=80";
                }}
              />
            ) : (
              <video
                src={selectedItem?.url}
                className="max-w-full max-h-full"
                controls
                autoPlay
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
