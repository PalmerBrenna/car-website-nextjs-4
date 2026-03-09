"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import CarLightbox from "./CarLightbox";
import { ChevronLeft, ChevronRight, Image as ImageIcon, MapPin } from "lucide-react";

interface CarGalleryProps {
  schemaData: any;
  location?: string;
}

export default function CarGallery({ schemaData, location }: CarGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeIndex, setActiveIndex] = useState(0);

  // 🔹 1. CATEGORII SORTATE STABIL (Exterior primul)
  /* const categories = useMemo(() => {
    if (!schemaData) return [];

    const keys = Object.keys(schemaData).filter(
      (key) => schemaData[key]?.images?.length > 0
    );

    return [
      ...keys.filter((k) => k.toLowerCase() === "exterior"),
      ...keys
        .filter((k) => k.toLowerCase() !== "exterior")
        .sort((a, b) => a.localeCompare(b)),
    ];
  }, [schemaData]);*/
  // 1. Categorii sortate stabil ext primul
  const categories = useMemo(() => {
    if (!schemaData) return [];

    // extrage secțiunile care chiar au imagini
    const keys = Object.keys(schemaData).filter(
      (key) => schemaData[key]?.images?.length > 0
    );


    // ordinea preferată
    const preferred = [
      "exterior",
      "interior",
      "engine",
      "documents",
      "others",
      "other images",
    ];

    // 1️⃣ Secțiuni în ordinea preferată (dacă există)
    const orderedPreferred = preferred
      .map((name) => keys.find((k) => k.toLowerCase() === name))
      .filter(Boolean);

    // 2️⃣ Restul secțiunilor care nu sunt în preferred
    const remaining = keys
      .filter((k) => !preferred.includes(k.toLowerCase()))
      .sort((a, b) => a.localeCompare(b));

    // ORDINEA FINALĂ
    return [...orderedPreferred, ...remaining];
  }, [schemaData]);

  // 🔹 3. COMBINĂM IMAGINILE ÎN ORDINE DETERMINISTĂ
//il readaugam daca nu mai merge schema data in [id]
  /*const allImages = useMemo(() => {
    if (!schemaData) return [];

    return categories.flatMap((cat) =>
      sortImages(schemaData[cat].images).map((img: any) => ({
        ...img,
        category: cat,
      }))
    );
  }, [schemaData, categories]);*/

  const allImages = useMemo(() => {
  if (!schemaData) return [];

  const sortImages = (arr: any[]) =>
    [...arr].sort((a, b) =>
      (a.name || "").localeCompare(b.name || "", undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );

  return categories.flatMap((cat) =>
    sortImages(schemaData[cat].images).map((img: any) => ({
      ...img,
      category: cat,
    }))
  );
}, [categories]);

  const openLightbox = (index: number, category = "All") => {
    setActiveCategory(category);
    setActiveIndex(index);
    setIsOpen(true);
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev + 1) % Math.max(allImages.length, 1));
  };

  const goToPrev = () => {
    setActiveIndex((prev) =>
      (prev - 1 + Math.max(allImages.length, 1)) % Math.max(allImages.length, 1)
    );
  };

  const mainImage = allImages[activeIndex] || allImages[0];
  const sideIndexes = [1, 2, 3].map(
    (offset) => (activeIndex + offset) % Math.max(allImages.length, 1)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full mb-8">
      <div className="lg:col-span-2 relative bg-[#ececec] rounded-2xl overflow-hidden h-[340px] md:h-[520px]">
        <Image
          src={mainImage?.src || "/images/placeholder-car.jpg"}
          alt="Main Image"
          fill
          sizes="100vw"
          className="object-cover cursor-pointer"
          onClick={() => openLightbox(activeIndex, mainImage?.category || "All")}
          priority
        />

        <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
          <span className="inline-flex items-center gap-2 bg-gray-700/55 text-white text-sm px-3 py-1.5 rounded-lg backdrop-blur-sm">
            <ImageIcon size={14} />
            {allImages.length}
          </span>
          <span className="inline-flex items-center gap-2 bg-gray-700/55 text-white text-sm px-3 py-1.5 rounded-lg backdrop-blur-sm">
            <MapPin size={14} />
            {location || "Orlando"}
          </span>
        </div>

        <button
          type="button"
          onClick={goToPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gray-400/40 hover:bg-gray-400/70 text-white flex items-center justify-center z-10"
          aria-label="Previous image"
        >
          <ChevronLeft size={18} />
        </button>

        <button
          type="button"
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gray-400/40 hover:bg-gray-400/70 text-white flex items-center justify-center z-10"
          aria-label="Next image"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 h-[340px] md:h-[520px]">
        <button
          type="button"
          onClick={() => openLightbox(sideIndexes[0], allImages[sideIndexes[0]]?.category || "All")}
          className="col-span-2 relative rounded-2xl overflow-hidden bg-[#ececec]"
        >
          <Image
            src={allImages[sideIndexes[0]]?.src || "/images/placeholder-car.jpg"}
            alt="Top side image"
            fill
            sizes="(max-width:1024px) 100vw, 33vw"
            className="object-cover"
          />
        </button>

        {sideIndexes.slice(1).map((index, idx) => (
          <button
            type="button"
            key={index + idx}
            onClick={() => openLightbox(index, allImages[index]?.category || "All")}
            className="relative rounded-2xl overflow-hidden bg-[#ececec]"
          >
            <Image
              src={allImages[index]?.src || "/images/placeholder-car.jpg"}
              alt={`Side image ${idx + 1}`}
              fill
              sizes="(max-width:1024px) 50vw, 16vw"
              className="object-cover"
            />
          </button>
        ))}
      </div>

      {isOpen && (
        <CarLightbox
          images={allImages}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          activeIndex={activeIndex}
          setActiveIndex={setActiveIndex}
          onClose={() => setIsOpen(false)}
          categories={["All", ...categories]}
        />
      )}
    </div>
  );
}
