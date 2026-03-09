"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { getCars } from "@/lib/firestore";

export default function CarFilters({
  onFilter,
}: {
  onFilter: (filters: any) => void;
}) {
  const [filters, setFilters] = useState({
    query: "",
    yearFrom: "",
    yearTo: "",
    make: "",
    model: "",
    minPrice: "",
    maxPrice: "",
    sort: "",
  });

  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [carsData, setCarsData] = useState<any[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>("make");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cars = await getCars();
        setCarsData(cars);

        const allMakes = new Set<string>();
        const allModels = new Set<string>();

        cars.forEach((car: any) => {
          const make = car.make || car.schemaData?.Details?.Make || undefined;
          const model = car.model || car.schemaData?.Details?.Model || undefined;

          if (make && typeof make === "string" && make.trim() !== "") allMakes.add(make.trim());
          if (model && typeof model === "string" && model.trim() !== "") allModels.add(model.trim());
        });

        setMakes(Array.from(allMakes).sort());
        setModels(Array.from(allModels).sort());
      } catch (err) {
        console.error("❌ Eroare la încărcarea filtrelor:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!filters.make) {
      const allModels = new Set<string>();
      carsData.forEach((car) => {
        const model =
          car.model ||
          car.schemaData?.General?.Model ||
          car.schemaData?.Detalii?.Model ||
          car.schemaData?.["Specificații"]?.Model ||
          undefined;

        if (model && typeof model === "string" && model.trim() !== "") allModels.add(model.trim());
      });
      setModels(Array.from(allModels).sort());
      return;
    }

    const filteredModels = new Set<string>();

    carsData.forEach((car) => {
      const make = car.make || car.schemaData?.Details?.Make || undefined;
      const model = car.model || car.schemaData?.Details?.Model || undefined;

      if (
        make &&
        model &&
        typeof make === "string" &&
        typeof model === "string" &&
        make.trim().toLowerCase() === filters.make.trim().toLowerCase()
      ) {
        filteredModels.add(model.trim());
      }
    });

    setModels(Array.from(filteredModels).sort());
  }, [filters.make, carsData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let updated = { ...filters, [name]: value };

    if (name === "make") updated = { ...updated, model: "" };

    setFilters(updated);
    onFilter(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(filters);
  };

  const sectionButton = (key: string, label: string) => (
    <button
      type="button"
      onClick={() => setOpenDropdown((prev) => (prev === key ? null : key))}
      className="flex w-full items-center justify-between py-3 text-left text-sm font-semibold text-[#121212]"
    >
      {label}
      <ChevronDown className={`h-4 w-4 text-gray-500 transition ${openDropdown === key ? "rotate-180" : ""}`} />
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-[#e4e4e4] bg-white p-5 shadow-sm">
      <p className="mb-4 text-lg font-semibold text-[#111]">Filtre</p>

      <div className="mb-4 flex items-center rounded-xl border border-[#e5e5e5] bg-[#f7f7f7] px-3">
        <Search className="h-4 w-4 text-gray-500" />
        <input
          type="text"
          name="query"
          value={filters.query}
          onChange={handleChange}
          placeholder="Search by make, model or year"
          className="w-full bg-transparent px-2 py-2.5 text-sm outline-none"
        />
      </div>

      <div className="border-t border-[#ececec]">{sectionButton("make", "MAKE")}</div>
      {openDropdown === "make" && (
        <div className="space-y-2 pb-3">
          <select name="make" value={filters.make} onChange={handleChange} className="w-full rounded-lg border border-[#e3e3e3] bg-white px-2 py-2 text-sm outline-none">
            <option value="">All Makes</option>
            {loading ? <option disabled>Loading...</option> : makes.map((make) => <option key={make} value={make}>{make}</option>)}
          </select>
          <input type="text" name="make" placeholder="Custom make" value={filters.make} onChange={handleChange} className="w-full rounded-lg border border-[#e3e3e3] px-2 py-2 text-sm outline-none" />
        </div>
      )}

      <div className="border-t border-[#ececec]">{sectionButton("model", "MODEL")}</div>
      {openDropdown === "model" && (
        <div className="space-y-2 pb-3">
          <select name="model" value={filters.model} onChange={handleChange} className="w-full rounded-lg border border-[#e3e3e3] bg-white px-2 py-2 text-sm outline-none">
            <option value="">All Models</option>
            {loading ? <option disabled>Loading...</option> : models.map((model) => <option key={model} value={model}>{model}</option>)}
          </select>
          <input type="text" name="model" placeholder="Custom model" value={filters.model} onChange={handleChange} className="w-full rounded-lg border border-[#e3e3e3] px-2 py-2 text-sm outline-none" />
        </div>
      )}

      <div className="border-t border-[#ececec]">{sectionButton("years", "YEAR")}</div>
      {openDropdown === "years" && (
        <div className="grid grid-cols-2 gap-2 pb-3">
          <select name="yearFrom" value={filters.yearFrom || "1900"} onChange={handleChange} className="rounded-lg border border-[#e3e3e3] bg-white px-2 py-2 text-sm outline-none">
            {Array.from({ length: 127 }, (_, i) => 1900 + i).map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
          <select name="yearTo" value={filters.yearTo || "2026"} onChange={handleChange} className="rounded-lg border border-[#e3e3e3] bg-white px-2 py-2 text-sm outline-none">
            {Array.from({ length: 127 }, (_, i) => 1900 + i).map((year) => <option key={year} value={year}>{year}</option>)}
          </select>
        </div>
      )}

      <div className="border-t border-[#ececec]">{sectionButton("price", "PRICE")}</div>
      {openDropdown === "price" && (
        <div className="grid grid-cols-2 gap-2 pb-3">
          <input type="number" name="minPrice" placeholder="Min" value={filters.minPrice} onChange={handleChange} className="rounded-lg border border-[#e3e3e3] px-2 py-2 text-sm outline-none" />
          <input type="number" name="maxPrice" placeholder="Max" value={filters.maxPrice} onChange={handleChange} className="rounded-lg border border-[#e3e3e3] px-2 py-2 text-sm outline-none" />
        </div>
      )}

      <div className="border-t border-b border-[#ececec]">{sectionButton("sort", "SORT")}</div>
      {openDropdown === "sort" && (
        <div className="pt-3">
          <select name="sort" value={filters.sort} onChange={handleChange} className="w-full rounded-lg border border-[#e3e3e3] bg-white px-2 py-2 text-sm outline-none">
            <option value="">Default</option>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price_low">Price (Low → High)</option>
            <option value="price_high">Price (High → Low)</option>
          </select>
        </div>
      )}

      <button type="submit" className="mt-5 w-full rounded-full bg-[#f6c62f] px-4 py-2.5 text-sm font-semibold text-black hover:bg-[#e7ba2f]">
        Apply Filters
      </button>
    </form>
  );
}
