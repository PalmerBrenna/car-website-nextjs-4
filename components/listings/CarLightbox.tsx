"use client";
import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

export default function CarLightbox({
  images,
  activeCategory,
  setActiveCategory,
  activeIndex,
  setActiveIndex,
  onClose,
  categories,
}: any) {
  const filtered =
    activeCategory === "All"
      ? images
      : images.filter((img: any) => img.category === activeCategory);

  const current = filtered[activeIndex];

  /* ✅ PRELOAD NEXT 3 IMAGES */
  useEffect(() => {
    if (!filtered || filtered.length === 0) return;

    const preloadCount = 3;

    for (let i = 1; i <= preloadCount; i++) {
      const nextIndex = (activeIndex + i) % filtered.length;
      const nextSrc = filtered[nextIndex]?.src;

      if (nextSrc) {
        const img = new window.Image();
        img.src = nextSrc; // cache preloading
      }
    }
  }, [activeIndex, filtered]);

  const next = () =>
    setActiveIndex((prev: number) =>
      prev === filtered.length - 1 ? 0 : prev + 1
    );

  const prev = () =>
    setActiveIndex((prev: number) =>
      prev === 0 ? filtered.length - 1 : prev - 1
    );

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex flex-col">
      {/* 🔹 Top bar */}
      <div className="flex justify-between items-center p-4 text-white text-sm border-b border-white/10">
        <div className="flex gap-6 overflow-x-auto no-scrollbar">
          {categories.map((cat: string) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setActiveIndex(0);
              }}
              className={`${
                cat === activeCategory
                  ? "text-white font-semibold"
                  : "text-gray-400"
              } hover:text-white transition`}
            >
              {cat}
              {cat === "All" && ` (${images.length})`}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <span className="text-gray-400 whitespace-nowrap">
            {activeIndex + 1} of {filtered.length}
          </span>
          <button onClick={onClose}>
            <X size={22} />
          </button>
        </div>
      </div>

      {/* 🔹 Large image area */}
      <div className="flex-1 flex items-center justify-center relative px-4 sm:px-8">
        {/* Prev */}
        <button
          onClick={prev}
          className="absolute left-4 sm:left-8 text-white/70 hover:text-white transition z-50"
        >
          <ChevronLeft size={48} strokeWidth={1.5} />
        </button>

        {/* Image */}
        {current ? (
          <div className="relative w-full max-w-[1800px] h-[90vh] flex items-center justify-center">
            <img
              src={current.src}
              alt={current.alt || ""}
              className="object-contain max-h-[90vh] max-w-full rounded-lg select-none pointer-events-none"
              loading="lazy"
            />
          </div>
        ) : (
          <p className="text-gray-400">No image available</p>
        )}

        {/* Next */}
        <button
          onClick={next}
          className="absolute right-4 sm:right-8 text-white/70 hover:text-white transition z-50"
        >
          <ChevronRight size={48} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
