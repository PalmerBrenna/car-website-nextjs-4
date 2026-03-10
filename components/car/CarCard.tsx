"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Car } from "@/lib/types";
import { getCarStatuses } from "@/lib/firestore"; // 🔹 asigură-te că ai funcția asta în lib/firestore.ts

/* 🧠 Helper universal pentru citirea valorilor din schemaData */
function findValue(schemaData: any, key: string) {
  if (!schemaData || typeof schemaData !== "object") return undefined;
  const normalizedKey = key.trim().toLowerCase();

  for (const [sectionName, sectionValue] of Object.entries(schemaData)) {
    if (typeof sectionValue === "object" && sectionValue !== null) {
      for (const [k, v] of Object.entries(sectionValue)) {
        if (k.trim().toLowerCase() === normalizedKey) return v;
      }
    }
  }
  return undefined;
}

/* 🔢 Formatare numere — cu separator de mii, fără zecimale */
function formatNumber(value: any) {
  const num = Number(value);
  if (isNaN(num)) return value;
  return num.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

/* 🧠 Helper: obține imaginea principală */
function getFeaturedImage(car: any): string {
  try {
    // 1️⃣ Încearcă prima imagine din secțiunea "Exterior"
    const exterior = car?.schemaData?.Exterior?.images?.[0]?.src;
    if (exterior) return exterior;

    // 2️⃣ Caută în alte secțiuni care conțin imagini
    if (car?.schemaData) {
      for (const [_, value] of Object.entries(car.schemaData)) {
        if ((value as any)?.images?.length) {
          return (value as any).images[0].src;
        }
      }
    }

    // 3️⃣ Format vechi (legacy)
    const legacy = car?.images?.exterior?.[0];
    if (legacy) return legacy;
  } catch (err) {
    console.error("[CarCard] Eroare la obținerea imaginii:", err);
  }

  // 4️⃣ Fallback
  return "/images/placeholder-car.jpg";
}

interface Props {
  car: Car;
}

export default function CarCard({ car }: Props) {
  const [statusColors, setStatusColors] = useState<Record<string, any>>({});

  useEffect(() => {
    (async () => {
      try {
        const data = await getCarStatuses(); // 🔹 Citim statusurile din Firestore
        setStatusColors(data);
      } catch (err) {
        console.error("❌ Eroare la citirea statusurilor:", err);
      }
    })();
  }, []);

  if (!car) return null;

  const mainImage = getFeaturedImage(car);

  // 🔹 Extragem valorile din schemaData (cu fallback-uri)
  const title =
    findValue(car.schemaData, "Title") ||
    findValue(car.schemaData, "Titlu") ||
    "Titlu necunoscut";

  const price =
    findValue(car.schemaData, "Price") ||
    findValue(car.schemaData, "Preț") ||
    undefined;

  const mileage =
    findValue(car.schemaData, "Mileage") ||
    findValue(car.schemaData, "Kilometraj") ||
    undefined;

  const year =
    findValue(car.schemaData, "Year") ||
    findValue(car.schemaData, "An fabricație") ||
    undefined;

  const location =
    findValue(car.schemaData, "Location") ||
    findValue(car.schemaData, "Locație") ||
    undefined;

  // 🔹 Status logic
  const statusKey = (car.status || "unknown").toLowerCase();
  const statusColor = statusColors[statusKey]?.color || "#777777";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#dfdfdf] bg-[#f7f7f7] shadow-[0_1px_0_rgba(0,0,0,0.03)] transition hover:shadow-md">
      {/* 🖼️ Imagine principală */}
      <Link
        href={`/listings/${car.id}`}
        className="relative block h-52 w-full overflow-hidden"
      >
        <Image
          src={mainImage}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw,
         (max-width: 1024px) 50vw,
         33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          //unoptimized
        />

        {/* 🔹 Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent"></div>

        {/* 🔹 Status Badge — culoare din Firestore */}
        {/* <span
          className="absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1.5 rounded-full tracking-wide shadow-md text-white"
          style={{ backgroundColor: statusColor }}
        >
          {(car.status || "Unknown").toUpperCase()}
        </span>*/}
      </Link>

      {/* 🧾 Informații principale */}
      <div className="p-4">
        {/* Titlu */}
        <Link
          href={`/listings/${car.id}`}
          className="block truncate text-[22px] font-semibold leading-snug text-[#111] transition-colors hover:text-black"
        >
          {title}
        </Link>

        {/* An + kilometraj */}
        <p className="mt-1 text-sm text-gray-500">
          {year ? `${year}` : ""} • {mileage ? `${formatNumber(mileage)} mi` : "—"}
        </p>

        {/* Preț */}
        <p className="mb-3 mt-2 text-2xl font-bold text-[#111]">
          {price ? `$${formatNumber(price)}` : "—"}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          
          <Link href={`/listings/${car.id}`} className="hidden" />
        </div>
      </div>
    </div>
  );
}
