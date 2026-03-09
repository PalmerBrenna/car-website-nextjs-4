"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Car } from "@/lib/types";
import { getCarStatuses } from "@/lib/firestore";

function findValue(schemaData: any, key: string) {
  if (!schemaData || typeof schemaData !== "object") return undefined;
  const normalizedKey = key.trim().toLowerCase();

  for (const sectionValue of Object.values(schemaData)) {
    if (typeof sectionValue === "object" && sectionValue !== null) {
      for (const [k, v] of Object.entries(sectionValue)) {
        if (k.trim().toLowerCase() === normalizedKey) return v;
      }
    }
  }
  return undefined;
}

function formatNumber(value: any) {
  const num = Number(value);
  if (isNaN(num)) return value;
  return num.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function getFeaturedImage(car: any): string {
  try {
    const exterior = car?.schemaData?.Exterior?.images?.[0]?.src;
    if (exterior) return exterior;

    if (car?.schemaData) {
      for (const value of Object.values(car.schemaData)) {
        if ((value as any)?.images?.length) return (value as any).images[0].src;
      }
    }

    const legacy = car?.images?.exterior?.[0];
    if (legacy) return legacy;
  } catch (err) {
    console.error("[CarCardSold] Error loading image:", err);
  }

  return "/images/placeholder-car.jpg";
}

interface Props {
  car: Car;
}

export default function CarCardSold({ car }: Props) {
  const [, setStatusColors] = useState<Record<string, any>>({});

  useEffect(() => {
    (async () => {
      try {
        const data = await getCarStatuses();
        setStatusColors(data);
      } catch (err) {
        console.error("❌ Error loading statuses:", err);
      }
    })();
  }, []);

  if (!car) return null;

  const mainImage = getFeaturedImage(car);

  const title =
    findValue(car.schemaData, "Title") ||
    findValue(car.schemaData, "Titlu") ||
    "Unknown Title";

  const year =
    findValue(car.schemaData, "Year") ||
    findValue(car.schemaData, "An fabricație") ||
    undefined;

  const mileage =
    findValue(car.schemaData, "Mileage") ||
    findValue(car.schemaData, "Kilometraj") ||
    undefined;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#dfdfdf] bg-[#f7f7f7] shadow-[0_1px_0_rgba(0,0,0,0.03)] select-none">
      <div className="relative h-52 w-full overflow-hidden cursor-default">
        <Image
          src={mainImage}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
        />

        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="absolute top-1/2 h-16 w-[220%] -translate-y-1/2 rotate-[-24deg] bg-white/75 shadow-lg flex items-center justify-center">
            <span className="text-4xl font-extrabold tracking-widest text-red-600 md:text-5xl">SOLD</span>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
      </div>

      <div className="p-4 cursor-default">
        <p className="truncate text-[22px] font-semibold leading-snug text-[#111]">{title}</p>
        <p className="mt-1 text-sm text-gray-500">
          {year ? `${year}` : ""} • {mileage ? `${formatNumber(mileage)} miles` : "—"}
        </p>
      </div>
    </div>
  );
}
