"use client";
export const dynamic = "force-dynamic";
import Image from "next/image";
import { useEffect, useState, Suspense } from "react";
import { getCars } from "@/lib/firestore";
import { Car } from "@/lib/types";
import CarCard from "@/components/car/CarCard";
import CarFilters from "@/components/filters/CarFilters";
import { getUserRole } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";

import { useSearchParams, useRouter } from "next/navigation";
import { MapPin } from "lucide-react";

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

export default function ListingsPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ListingsPage />
    </Suspense>
  );
}

function ListingsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({});
  const [page, setPage] = useState(1);
  const [role, setRole] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState("");
  const [content, setContent] = useState({
    heroImage: "/images/hero-listings.jpg",
    heroTitle: "Used cars for sale",
    heroText: "",
  });

  const searchParams = useSearchParams();
  const router = useRouter();
  useEffect(() => {
    if (searchParams.get("reset") === "1") setPage(1);
  }, [searchParams]);

  useEffect(() => {
    const q = searchParams.get("query");

    if (!q) return;

    setFilters((prev) => ({ ...prev, query: q }));

    setTimeout(() => {
      window.history.replaceState({}, "", "/listings");
    }, 0);
  }, []);

  const ITEMS_PER_PAGE = 15;

  useEffect(() => {
    (async () => {
      try {
        const r = await getUserRole();
        setRole(r);

        const docRef = doc(db, "pages", "listings");
        const snap = await getDoc(docRef, { source: "server" });
        if (snap.exists())
          setContent((prev) => ({ ...prev, ...(snap.data() as any) }));
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
      await updateDoc(doc(db, "pages", "listings"), content);
      setIsEditing(false);
      setStatus("✅ Listings page updated successfully!");
      setTimeout(() => setStatus(""), 3000);
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const filteredCars = cars
    .filter((car) => {
      if (
        car.status &&
        ["sold", "pending", "rejected", "draft"].includes(
          car.status.toLowerCase(),
        )
      )
        return false;

      const title =
        findValue(car.schemaData, "Title") ||
        findValue(car.schemaData, "Titlu") ||
        "";
      const year =
        findValue(car.schemaData, "Year") ||
        findValue(car.schemaData, "An fabricație") ||
        "";
      const make =
        findValue(car.schemaData, "Make") ||
        findValue(car.schemaData, "Marcă") ||
        car.make ||
        "";
      const model = findValue(car.schemaData, "Model") || car.model || "";
      const price =
        parseFloat(
          findValue(car.schemaData, "Price") ||
            findValue(car.schemaData, "Preț") ||
            car.price ||
            0,
        ) || 0;

      if (
        filters.query &&
        !(
          title.toLowerCase().includes(filters.query.toLowerCase()) ||
          make.toLowerCase().includes(filters.query.toLowerCase()) ||
          model.toLowerCase().includes(filters.query.toLowerCase())
        )
      )
        return false;

      if (filters.yearFrom && parseInt(year) < parseInt(filters.yearFrom))
        return false;
      if (filters.yearTo && parseInt(year) > parseInt(filters.yearTo))
        return false;
      if (
        filters.make &&
        !make.toLowerCase().includes(filters.make.toLowerCase())
      )
        return false;
      if (
        filters.model &&
        !model.toLowerCase().includes(filters.model.toLowerCase())
      )
        return false;

      const min = parseFloat(filters.minPrice) || 0;
      const max = parseFloat(filters.maxPrice) || Infinity;
      if (price < min || price > max) return false;

      return true;
    })
    .sort((a, b) => {
      const priceA =
        parseFloat(
          findValue(a.schemaData, "Price") ||
            findValue(a.schemaData, "Preț") ||
            a.price ||
            0,
        ) || 0;
      const priceB =
        parseFloat(
          findValue(b.schemaData, "Price") ||
            findValue(b.schemaData, "Preț") ||
            b.price ||
            0,
        ) || 0;

      if (filters.sort === "price_low") return priceA - priceB;
      if (filters.sort === "price_high") return priceB - priceA;

      const yearA =
        parseInt(
          findValue(a.schemaData, "Year") ||
            findValue(a.schemaData, "An fabricație") ||
            a.year ||
            0,
        ) || 0;
      const yearB =
        parseInt(
          findValue(b.schemaData, "Year") ||
            findValue(b.schemaData, "An fabricație") ||
            b.year ||
            0,
        ) || 0;

      if (filters.sort === "newest") return yearB - yearA;
      if (filters.sort === "oldest") return yearA - yearB;
      return 0;
    });

  const totalPages = Math.ceil(filteredCars.length / ITEMS_PER_PAGE);
  const paginatedCars = filteredCars.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  return (
    <main className="min-h-screen bg-[#f2f2f2] text-[#111]">
      <section className="mx-auto grid w-full max-w-[1900px] grid-cols-1 gap-6 px-3 py-6 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <CarFilters onFilter={setFilters} />
        </aside>

        <section>
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs text-gray-500">Used / Cars</p>
              {isEditing ? (
                <input
                  value={content.heroTitle}
                  onChange={(e) =>
                    setContent({ ...content, heroTitle: e.target.value })
                  }
                  className="mt-1 rounded border px-2 py-1 text-3xl font-semibold"
                />
              ) : (
                <h1 className="text-5xl font-semibold tracking-tight">
                  {content.heroTitle || "Used cars for sale"}
                </h1>
              )}
              <p className="mt-2 text-xl text-gray-600">
                {filteredCars.length} Found
              </p>
            </div>
          </div>

          {loading ? (
            <p className="py-20 text-center text-gray-500">
              Loading listings...
            </p>
          ) : filteredCars.length === 0 ? (
            <p className="py-20 text-center text-gray-500">
              No cars match your search.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
                {paginatedCars.map((car) => (
                  <CarCard key={car.id} car={car} />
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
      </section>

      {role === "superadmin" && (
        <div className="my-8 text-center">
          <button
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
            className={`rounded-lg px-6 py-2 text-sm font-semibold ${isEditing ? "bg-green-600 text-white" : "bg-gray-700 text-white"}`}
          >
            {isEditing ? "💾 Save Changes" : "✏️ Edit Page"}
          </button>
          {status && (
            <p className="mt-3 text-sm font-medium text-green-600">{status}</p>
          )}
        </div>
      )}
    </main>
  );
}
