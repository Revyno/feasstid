export type GalleryCategory =
  | "Basic Clean"
  | "Premium Clean"
  | "Deep Clean"
  | "Unyellowing"
  | "Repaint"
  | "Repair";

export type GalleryType = "image" | "video";

export interface GalleryItem {
  id: string;
  url: string;
  type: GalleryType;
  category: GalleryCategory;
  alt: string;
}

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "1",
    url: "/galleries/1.heic",
    type: "image",
    category: "Deep Clean",
    alt: "Deep Clean Transformation 1",
  },
  {
    id: "2",
    url: "/galleries/2.heic",
    type: "image",
    category: "Deep Clean",
    alt: "Deep Clean Transformation 2",
  },
  {
    id: "3",
    url: "/galleries/3.heic",
    type: "image",
    category: "Premium Clean",
    alt: "Premium Clean Result",
  },
  {
    id: "4",
    url: "/galleries/4.heic",
    type: "image",
    category: "Unyellowing",
    alt: "Unyellowing Process",
  },
  {
    id: "5",
    url: "/galleries/5.webp",
    type: "image",
    category: "Repaint",
    alt: "Repaint Job",
  },
  {
    id: "6",
    url: "/galleries/6.heic",
    type: "image",
    category: "Repair",
    alt: "Sole Repair",
  },
  {
    id: "7",
    url: "/galleries/7.heic",
    type: "image",
    category: "Basic Clean",
    alt: "Basic Clean Result",
  },
  {
    id: "v1",
    url: "/galleries/vid1.mp4",
    type: "video",
    category: "Deep Clean",
    alt: "Deep Cleaning Video 1",
  },
  {
    id: "v2",
    url: "/galleries/vid2.mp4",
    type: "video",
    category: "Unyellowing",
    alt: "Unyellowing Video",
  },
  {
    id: "v3",
    url: "/galleries/vid3.mp4",
    type: "video",
    category: "Repaint",
    alt: "Repaint Video",
  },
  {
    id: "v4",
    url: "/galleries/vid4.mp4",
    type: "video",
    category: "Repair",
    alt: "Repair Video",
  },
  {
    id: "v5",
    url: "/galleries/vid5.mp4",
    type: "video",
    category: "Premium Clean",
    alt: "Premium Clean Video",
  },
  {
    id: "v6",
    url: "/galleries/vid6.mp4",
    type: "video",
    category: "Basic Clean",
    alt: "Basic Cleaning Video",
  },
];

export const GALLERY_CATEGORIES: GalleryCategory[] = [
  "Basic Clean",
  "Premium Clean",
  "Deep Clean",
  "Unyellowing",
  "Repaint",
  "Repair",
];
