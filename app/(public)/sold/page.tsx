"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import { getCars } from "@/lib/firestore";
import { Car } from "@/lib/types";
import CarCardSold from "@/components/car/CarCardSold";
import { getUserRole } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { useSearchParams } from "next/navigation";

function findValue(schemaData: any, key: string) {
  if (!schemaData || typeof schemaData !== "object") return undefined;
  const normalized = key.trim().toLowerCase();
  for (const sectionData of Object.values(schemaData)) {
    if (typeof sectionData === "object" && sectionData !== null) {
      for (const [k, v] of Object.entries(sectionData)) {
        if (k.trim().toLowerCase() === normalized) return v;
      }
    }
  }
  return undefined;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function rotateCarsDaily(cars: Car[], itemsPerPage: number) {
  const totalItems = cars.length;
  if (totalItems === 0) return cars;

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return cars;

  const dayIndex = Math.floor(Date.now() / MS_PER_DAY);
  const pageRotations = dayIndex % totalPages;
  if (pageRotations === 0) return cars;

  const offset = (pageRotations * itemsPerPage) % totalItems;
  return [...cars.slice(totalItems - offset), ...cars.slice(0, totalItems - offset)];
}

export default function SoldPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SoldPage />
    </Suspense>
  );
}

function SoldPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({});
  const [page, setPage] = useState(1);
  const [role, setRole] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState("");
  const [content, setContent] = useState({
    heroImage: "/images/hero-sold.jpg",
    heroTitle: "Sold Inventory",
    heroText: "",
  });

  const searchParams = useSearchParams();

  useEffect(() => {
    const q = searchParams.get("query");
    if (q) {
      setFilters((prev: any) => ({ ...prev, query: q }));
    } else {
      setFilters({
        query: "",
        yearFrom: "",
        yearTo: "",
        make: "",
        model: "",
        minPrice: "",
        maxPrice: "",
        sort: "",
      });
    }
  }, [searchParams]);

  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    (async () => {
      try {
        const r = await getUserRole();
        setRole(r);

        const docRef = doc(db, "pages", "Sold");
        const snap = await getDoc(docRef, { source: "server" });
        if (snap.exists()) setContent((prev) => ({ ...prev, ...(snap.data() as any) }));
        else await setDoc(docRef, content);

        setCars(await getCars());
      } catch (e) {
        console.error("❌ Error loading data:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, "pages", "sold"), content);
      setIsEditing(false);
      setStatus("✅ Sold page updated successfully!");
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload-page", { method: "POST", body: formData });
    const data = await res.json();
    if (data.url) setContent((prev) => ({ ...prev, heroImage: data.url }));
  };

  const filteredCars = cars
    .filter((car) => {
      if (!car.status || car.status.toLowerCase() !== "sold") return false;

      const title = findValue(car.schemaData, "Title") || findValue(car.schemaData, "Titlu") || "";
      const year = findValue(car.schemaData, "Year") || findValue(car.schemaData, "An fabricație") || "";
      const make = findValue(car.schemaData, "Make") || findValue(car.schemaData, "Marcă") || car.make || "";
      const model = findValue(car.schemaData, "Model") || car.model || "";
      const price = parseFloat(findValue(car.schemaData, "Price") || findValue(car.schemaData, "Preț") || car.price || 0) || 0;

      if (
        filters.query &&
        !(title.toLowerCase().includes(filters.query.toLowerCase()) || make.toLowerCase().includes(filters.query.toLowerCase()) || model.toLowerCase().includes(filters.query.toLowerCase()))
      ) return false;

      if (filters.yearFrom && parseInt(year) < parseInt(filters.yearFrom)) return false;
      if (filters.yearTo && parseInt(year) > parseInt(filters.yearTo)) return false;
      if (filters.make && !make.toLowerCase().includes(filters.make.toLowerCase())) return false;
      if (filters.model && !model.toLowerCase().includes(filters.model.toLowerCase())) return false;

      const min = parseFloat(filters.minPrice) || 0;
      const max = parseFloat(filters.maxPrice) || Infinity;
      if (price < min || price > max) return false;
      return true;
    })
    .sort((a, b) => {
      const priceA = parseFloat(findValue(a.schemaData, "Price") || findValue(a.schemaData, "Preț") || a.price || 0) || 0;
      const priceB = parseFloat(findValue(b.schemaData, "Price") || findValue(b.schemaData, "Preț") || b.price || 0) || 0;
      if (filters.sort === "price_low") return priceA - priceB;
      if (filters.sort === "price_high") return priceB - priceA;

      const yearA = parseInt(findValue(a.schemaData, "Year") || findValue(a.schemaData, "An fabricație") || a.year || 0) || 0;
      const yearB = parseInt(findValue(b.schemaData, "Year") || findValue(b.schemaData, "An fabricație") || b.year || 0) || 0;
      if (filters.sort === "newest") return yearB - yearA;
      if (filters.sort === "oldest") return yearA - yearB;
      return 0;
    });

  const rotatedCars = rotateCarsDaily(filteredCars, ITEMS_PER_PAGE);
  const totalPages = Math.ceil(rotatedCars.length / ITEMS_PER_PAGE);
  const paginatedCars = rotatedCars.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <main className="min-h-screen bg-[#f2f2f2] text-[#111]">
      <section className="relative h-[44vh] min-h-[360px] w-full overflow-hidden">
        <Image src={content.heroImage} alt="Sold inventory" fill priority sizes="100vw" className="object-cover object-center" />
        <div className="absolute inset-0 bg-black/40" />

        {isEditing && (
          <input
            type="file"
            onChange={(e) => handleImageUpload(e.target.files?.[0] || null)}
            className="absolute bottom-3 left-3 z-10 bg-white/90 text-xs"
          />
        )}

        <div className="absolute inset-0 flex items-center justify-center px-4 text-center">
          {isEditing ? (
            <input
              value={content.heroTitle}
              onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
              className="w-full max-w-xl rounded border p-2 text-center text-4xl font-bold"
            />
          ) : (
            <h1 className="text-5xl font-semibold tracking-tight text-white md:text-6xl">{content.heroTitle}</h1>
          )}
        </div>
      </section>

      <div className="h-12 w-full bg-[#060f25]" />

      <section className="mx-auto w-full max-w-[1900px] px-3 py-8">
        {loading ? (
          <p className="py-20 text-center text-gray-500">Loading listings...</p>
        ) : filteredCars.length === 0 ? (
          <p className="py-20 text-center text-gray-500">No cars match your search.</p>
        ) : (
          <>
            <div className="mb-5 flex items-end justify-between">
              <div>
                <p className="text-xs text-gray-500">Inventory / Sold</p>
                <p className="text-2xl font-semibold">{filteredCars.length} Sold vehicles</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
              {paginatedCars.map((car) => (
                <CarCardSold key={car.id} car={car} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-10 flex flex-wrap justify-center gap-2">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i + 1)}
                    className={`min-w-9 rounded-md px-3 py-2 text-sm ${page === i + 1 ? "bg-[#e6e6e6] text-black" : "text-gray-700 hover:bg-white"}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {role === "superadmin" && (
        <div className="my-8 text-center">
          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className={`rounded-lg px-6 py-2 text-sm font-semibold ${isEditing ? "bg-green-600 text-white" : "bg-gray-700 text-white"}`}
          >
            {isEditing ? "💾 Save Changes" : "✏️ Edit Page"}
          </button>
          {status && <p className="mt-3 text-sm font-medium text-green-600">{status}</p>}
        </div>
      )}
    </main>
  );
}
