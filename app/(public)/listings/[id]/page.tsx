"use client";
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import CarGallery from "@/components/listings/CarGallery";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import CarPricingBox from "@/components/car/CarPricingBox";
import {
  Calendar,
  CarFront,
  Cog,
  Factory,
  FileText,
  Gauge,
  Hash,
  MapPin,
  Palette,
  UserRound,
  Waypoints,
} from "lucide-react";

/* 🧠 Recursive deep search in schemaData */
function deepFindValue(obj: any, key: string): any {
  if (!obj || typeof obj !== "object") return undefined;
  const normalized = key.trim().toLowerCase();
  for (const [k, v] of Object.entries(obj)) {
    if (k.trim().toLowerCase() === normalized) return v;
    if (typeof v === "object") {
      const found = deepFindValue(v, key);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

/* 🔢 Format numbers with commas */
function formatNumber(value: any) {
  const num = Number(value);
  if (isNaN(num)) return value;
  return num.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

export default function CarDetailsPage() {
  const { id } = useParams();
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [statuses, setStatuses] = useState<
    Record<string, { color: string; name: string }>
  >({});
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLogged(!!user); // true dacă e logat, false dacă nu
    });

    return () => unsubscribe();
  }, []);

  /* 🔹 Fetch car data + status colors */
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        // 1️⃣ Mașina
        const docRef = doc(db, "cars", id as string);
        const snap = await getDoc(docRef, { source: "server" });
        if (snap.exists()) setCar({ id, ...snap.data() });

        // 2️⃣ Statusuri cu culori
        const statusSnap = await getDocs(
          collection(db, "settings", "car_statuses", "list")
        );
        const map: Record<string, { color: string; name: string }> = {};
        statusSnap.forEach((s) => {
          const data = s.data();
          if (data.name)
            map[data.name.toLowerCase().trim()] = {
              name: data.name,
              color: data.color || "#999999",
            };
        });
        setStatuses(map);
      } catch (err) {
        console.error("[CarDetails] Error loading car or statuses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading)
    return (
      <p className="text-center mt-6 text-gray-600">Loading car details...</p>
    );

  if (!car)
    return <p className="text-center text-red-500 mt-6">Car not found.</p>;

  // 🔹 Extract details
  const title = deepFindValue(car.schemaData, "Title") || "Unknown Title";
  const price = deepFindValue(car.schemaData, "Price") || undefined;
  const make = deepFindValue(car.schemaData, "Make") || "—";
  const model = deepFindValue(car.schemaData, "Model") || "—";
  const year = deepFindValue(car.schemaData, "Year") || undefined;
  const mileage = deepFindValue(car.schemaData, "Mileage") || undefined;
  //const stockSection = deepFindValue(car.schemaData, "Stock");
  const stock = findStockValue(car.schemaData) || "—";

  // 🔹 Status styling din Firestore
  const normalizedStatus = (car.status || "unknown").trim().toLowerCase();
  const statusData = statuses[normalizedStatus];
  const statusColor = statusData?.color || "#999";
  const statusName = statusData?.name || car.status || "Unknown";

  const pickPdfItem = (items: any[] | undefined) => {
    if (!Array.isArray(items) || items.length === 0) return null;

    const imageDelivery = items.find(
      (item) =>
        typeof item?.src === "string" &&
        (item?.resource_type === "image" || item.src.includes("/image/upload/"))
    );

    if (imageDelivery) return imageDelivery;

    return items.find(
      (item) => typeof item?.src === "string" && item.src.length > 0
    );
  };

  const files = car.schemaData["Files"]?.files;
  const pdf = car.schemaData["PDF"]?.files;
  const pdfItem = pickPdfItem(files) || pickPdfItem(pdf);
  const pdfFile = pdfItem?.src;
  const pdfHref = pdfFile
    ? pdfItem?.public_id
      ? `/api/files/view?publicId=${encodeURIComponent(pdfItem.public_id)}&format=pdf&src=${encodeURIComponent(pdfFile)}`
      : pdfFile
    : null;

  return (
    <div className="max-w-[1600px] mx-auto p-6 bg-[#f5f5f5]">
      <div className="mb-6">
        <h1 className="text-5xl font-semibold text-[#161b33]">{title}</h1>
        <p className="text-gray-600 mt-2 text-lg">
          {year || "N/A"} • {mileage ? `${formatNumber(mileage)} miles` : "—"} •{" "}
          {stock ? `Stock: ${stock}` : "—"}
        </p>
      </div>

      {/* 🖼️ GALLERY */}
      <div className="mb-6">
        <CarGallery schemaData={car.schemaData} />
      </div>

      {/* 💰 PRICING BOX */}
      <div className="mt-6 mb-6">
        <CarPricingBox title={title} price={price} views={car.views || 0} />
      </div>

      {/* 🧩 SECTIONS */}
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-200 mt-10">
        {car.schemaData && (
          <DynamicSections schemaData={car.schemaData} pdfHref={pdfHref} />
        )}
      </div>
    </div>
  );

  function findStockValue(schemaData: any) {
    if (!schemaData || typeof schemaData !== "object") return null;

    for (const [sectionName, sectionValue] of Object.entries(schemaData)) {
      if (
        typeof sectionValue === "object" &&
        sectionValue !== null &&
        "stock" in sectionValue
      ) {
        return sectionValue.stock;
      }
    }

    return null;
  }

  /* 🧩 Component that applies schema_order from Firestore */
  /* 🧩 Component that applies schema_order from Firestore */
  function DynamicSections({
    schemaData,
    pdfHref,
  }: {
    schemaData: any;
    pdfHref: string | null;
  }) {
    const [schemaOrder, setSchemaOrder] = useState<
      { name: string; active: boolean }[] | null
    >(null);

    const [schemaStructure, setSchemaStructure] = useState<any>(null);
    useEffect(() => {
      const fetchSchemaOrder = async () => {
        try {
          const ref = doc(db, "settings", "schema_order");
          const snap = await getDoc(ref);
          if (snap.exists()) {
            setSchemaOrder(snap.data().sections || []);
          } else {
            setSchemaOrder([]); // fallback if missing
          }
        } catch (err) {
          console.error("Error loading schema order:", err);
        }
      };
      fetchSchemaOrder();
    }, []);

    useEffect(() => {
      const loadSchema = async () => {
        const snap = await getDocs(collection(db, "car_schemas"));
        const map: any = {};

        snap.forEach((doc) => {
          const data = doc.data();
          const name = data.title;
          map[name] = {
            fields: (data.fields || [])
              .filter((f: any) => f.active !== false)
              .sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)),
          };
        });

        setSchemaStructure(map);
      };

      loadSchema();
    }, []);

    if (!schemaOrder)
      return (
        <p className="text-gray-500 text-center mt-10">
          Loading section structure...
        </p>
      );

    // 🔹 Extrage doar secțiunile active și adaugă fallback pentru cele noi
    const orderedSections = schemaOrder
      .filter((s) => s.active)
      .map((s) => s.name)
      .filter((name) => !!schemaData[name]);

    const definedNames = schemaOrder.map((s) => s.name.toLowerCase());
    const remaining = Object.keys(schemaData).filter(
      (key) => !definedNames.includes(key.toLowerCase())
    );

    const finalSections = Array.from(
      new Map(
        [...orderedSections, ...remaining].map((name) => [
          name.toLowerCase(),
          name,
        ])
      ).values()
    );

    // ✅ Funcție robustă pentru extragerea ID-ului YouTube din orice format
    const renderYouTubeEmbed = (url: string) => {
      try {
        const cleanUrl = url.trim();

        // regex robust care prinde toate formele
        const videoIdMatch = cleanUrl.match(
          /(?:v=|\/embed\/|\/shorts\/|youtu\.be\/)([A-Za-z0-9_-]{11})/
        );
        const videoId = videoIdMatch ? videoIdMatch[1] : null;

        // 🧩 DEBUG: vezi exact ce link e procesat și ce ID s-a extras
       /* console.log(
          "%c🎬 YouTube debug",
          "background: #222; color: #4af; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
          "\nURL:",
          cleanUrl,
          "\nVideo ID:",
          videoId
        );*/

        if (!videoId) {
          console.warn("⚠️ Nu s-a putut extrage ID YouTube din:", url);
          return (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              {url}
            </a>
          );
        }

        return (
          <div className="mt-4 mb-6 aspect-video rounded-xl overflow-hidden shadow-lg border border-gray-200">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        );
      } catch (err) {
        console.error("❌ Invalid YouTube link:", url, err);
        return null;
      }
    };

    // 🔹 Detectează dacă un string e un link YouTube
    const isYouTubeLink = (value: any): value is string =>
      typeof value === "string" &&
      (value.includes("youtube.com") || value.includes("youtu.be"));

    const fieldIcon = (name: string) => {
      const normalized = name.trim().toLowerCase();
      if (normalized.includes("year")) return <Calendar size={16} />;
      if (normalized.includes("make")) return <Factory size={16} />;
      if (normalized.includes("model")) return <CarFront size={16} />;
      if (normalized.includes("mileage") || normalized.includes("mile"))
        return <Gauge size={16} />;
      if (normalized.includes("engine")) return <Cog size={16} />;
      if (normalized.includes("transmission")) return <Waypoints size={16} />;
      if (normalized.includes("drivetrain") || normalized.includes("traction"))
        return <CarFront size={16} />;
      if (
        normalized.includes("exterior") ||
        normalized.includes("interior") ||
        normalized.includes("color")
      )
        return <Palette size={16} />;
      if (normalized.includes("vin") || normalized.includes("stock"))
        return <Hash size={16} />;
      if (normalized.includes("location")) return <MapPin size={16} />;
      if (normalized.includes("seller")) return <UserRound size={16} />;
      return <FileText size={16} />;
    };

    return (
      <>
        {finalSections.map((section) => {
          const data = schemaData[section];
          if (!data) return null;

          // 🧽 Curățăm array-urile (eliminăm golurile, spațiile, punctele, newline-urile)
          let cleanedArray = null;
          if (Array.isArray(data)) {
            cleanedArray = data
              .map((item) => (typeof item === "string" ? item.trim() : item))
              .filter(
                (item) =>
                  item &&
                  typeof item === "string" &&
                  item.length > 1 &&
                  item !== "." &&
                  item !== "·"
              );
          }

          // 🛑 Ascunde secțiunile complet goale (obiecte)
          if (
            typeof data === "object" &&
            !Array.isArray(data) &&
            Object.values(data).every(
              (v) => v === null || v === "" || v === undefined
            )
          ) {
            return null;
          }

          // 🛑 Ascunde Highlights dacă e gol chiar și după curățare
          if (
            section.toLowerCase() === "highlights" &&
            Array.isArray(data) &&
            cleanedArray.length === 0
          ) {
            return null;
          }

          const isArray = Array.isArray(data);
          const isObject = typeof data === "object" && !isArray;
          const skipFields = ["tempId", "createdAt", "updatedAt"];
          if (skipFields.includes(section)) return null;

          return (
            <section
              key={section}
              className="border-b border-gray-200 pb-10 last:border-0 last:pb-0"
            >
              {/* ASCUNDE TITLUL SECȚIUNII DACĂ TOATE VALORILE SUNT VIDEO */}
              {!Object.values(data).every(
                (v) => typeof v === "string" && isYouTubeLink(v)
              ) && (
                <h2 className="text-3xl font-semibold mb-6 text-gray-900 tracking-tight uppercase">
                  {section}
                </h2>
              )}

              {/* 🔹 Liste simple */}
{isArray && (
  <ul
    className={`
      grid gap-y-3 text-gray-800 text-[15px] leading-relaxed
      ${
        ["highlights", "modifications"].includes(section.toLowerCase())
          ? "grid-cols-1"      // ⚡ Highlights + Modifications → UN RAND
          : section.toLowerCase() === "equipment"
          ? "sm:grid-cols-3"
          : "sm:grid-cols-2"
      }
    `}
  >
    {cleanedArray.length > 0 ? (
      cleanedArray.map((item: string, i: number) => {
        const trimmed = item.trim();

        // ✔ Titluri speciale fără bullet
        const isTitle =
          ["Mechanical:", "Exterior:", "Interior:", "Other:"].includes(trimmed);

        // ✔ YouTube → full width
        if (isYouTubeLink(item)) {
          return (
            <li key={i} className="col-span-full">
              {renderYouTubeEmbed(item)}
            </li>
          );
        }

        return (
          <li key={i} className="flex items-start gap-2">
            {/* ❌ NU afișa bullet pentru titluri */}
            {!isTitle && (
              <span className="mt-1 text-blue-600 text-lg leading-none">•</span>
            )}
            
            {/* ✔ Titlurile sunt îngroșate */}
            <span
              className={`text-[15px] ${
                isTitle ? "font-semibold uppercase text-gray-900" : ""
              }`}
            >
              {item}
            </span>
          </li>
        );
      })
    ) : (
      <li className="text-gray-400 italic">No data available</li>
    )}
  </ul>
)}

              {/* 🔹 Obiecte structurate */}
              {isObject && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
                    {/* Dacă structura schema încă nu e încărcată, nu afișăm nimic */}
                    {!schemaStructure
                      ? null
                      : (() => {
                          // 1️⃣ Ordinea câmpurilor definită în schema builder
                          const orderedFields =
                            schemaStructure[section]?.fields?.map(
                              (f: any) => f.name
                            ) || [];

                          // 2️⃣ Câmpuri care exista în schemaData dar nu sunt definite în schema builder
                          const fallbackFields = Object.keys(data).filter(
                            (key) =>
                              ![
                                "content",
                                "images",
                                "tempId",
                                "createdAt",
                                "updatedAt",
                              ].includes(key) && !orderedFields.includes(key)
                          );

                          // 3️⃣ Ordinea finală a câmpurilor
                          const finalFields = [
                            ...orderedFields,
                            ...fallbackFields,
                          ];

                          return finalFields.map((fieldName: string) => {
                            const fieldValue = data[fieldName];
                            if (!fieldValue) return null;

                            // -------------------------
                            // YouTube handling
                            // -------------------------
                            if (isYouTubeLink(fieldValue)) {
                              return (
                                <div
                                  key={fieldName}
                                  className="col-span-3 w-full"
                                >
                                  {renderYouTubeEmbed(fieldValue)}
                                </div>
                              );
                            }

                            // -------------------------
                            // FORMAT NUMBERS
                            // -------------------------
                           /* const formatIfNumber = (
                              val: any,
                              keyName: string
                            ) => {
                              if (val === null || val === undefined) return "";

                              // year nu se formatează
                              if (keyName.trim().toLowerCase() === "year") {
                                return String(val);
                              }

                              const num = Number(val);
                              return isNaN(num)
                                ? String(val)
                                : formatNumber(num);
                            };*/

                            const formatIfNumber = (val: any, keyName: string) => {
  if (val === null || val === undefined) return "";

  const normalized = keyName.trim().toLowerCase();

  // year & vin nu se formatează
  if (normalized === "year" || normalized === "vin") {
    return String(val);
  }

  const num = Number(val);
  return isNaN(num) ? String(val) : formatNumber(num);
};

                            const displayValue = Array.isArray(fieldValue)
                              ? fieldValue
                                  .map((v) => formatIfNumber(v, fieldName))
                                  .join(", ")
                              : formatIfNumber(fieldValue, fieldName);

                            // -------------------------
                            // UI Card Value
                            // -------------------------
                            return (
                              <div
                                key={fieldName}
                                className="flex flex-col bg-[#f6f6f6] border border-gray-200 rounded-xl p-4"
                              >
                                <span className="text-xs font-semibold uppercase text-gray-500 tracking-wide flex items-center gap-2">
                                  <span className="text-gray-500">
                                    {fieldIcon(fieldName)}
                                  </span>
                                  {fieldName.replace(/_/g, " ")}
                                </span>

                                <span className="text-gray-900 font-medium text-base mt-1">
                                  {displayValue}
                                </span>
                              </div>
                            );
                          });
                        })()}
                  </div>

                  {section.toLowerCase() === "details" && pdfHref && (
                    <a
                      href={pdfHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mb-6"
                    >
                      <img
                        src="/images/carfax-logo.jpg"
                        alt="Show me the Carfax"
                        className="w-52 rounded-xl border border-gray-300 hover:opacity-80 transition"
                      />
                    </a>
                  )}

                  {/* 🔹 Content + imagini */}
                  {data.content && (
                    <div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-[15px]">
                      {data.content}
                    </div>
                  )}

                  {/* 🔹 Imagini — sortate + prima imagine exterior afișată prima */}
                  {data.images &&
                    Array.isArray(data.images) &&
                    data.images.length > 0 &&
                    (() => {
                      // 🔸 Sortează imaginile după nume (alfabetic sau numeric)
                      const sortedImages = [...data.images].sort((a, b) => {
                        const aName = a.name?.toLowerCase() || "";
                        const bName = b.name?.toLowerCase() || "";

                        // dacă numele sunt numerice (ex: "1.jpg", "10.jpg"), sortează numeric
                        const aNum = parseInt(aName);
                        const bNum = parseInt(bName);
                        if (!isNaN(aNum) && !isNaN(bNum)) return aNum - bNum;

                        // altfel sortare alfabetică naturală
                        return aName.localeCompare(bName, undefined, {
                          numeric: true,
                        });
                      });

                      // 🔸 dacă e secțiunea "Exterior", marchează prima imagine drept featured
                      const featuredFirst =
                        section.toLowerCase() === "exterior"
                          ? [sortedImages[0], ...sortedImages.slice(1)]
                          : sortedImages;

                      return (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                          {featuredFirst.map((img: any, i: number) => (
                            <div
                              key={i}
                              className={`relative overflow-hidden rounded-xl border border-gray-200 shadow-sm group ${
                                section.toLowerCase() === "exterior" && i === 0
                                  ? "ring-2 ring-blue-500 ring-offset-2"
                                  : ""
                              }`}
                            >
                              <img
                                src={img.src}
                                alt={`${section} ${i + 1}`}
                                className={`object-cover w-full h-44 transition-transform duration-300 group-hover:scale-105 ${
                                  section.toLowerCase() === "exterior" &&
                                  i === 0
                                    ? "h-60 md:h-72"
                                    : ""
                                }`}
                                loading="lazy"
                              />

                              {/* 🔸 Badge vizual opțional */}
                              {section.toLowerCase() === "exterior" &&
                                i === 0 && (
                                  <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-md shadow">
                                    Featured
                                  </span>
                                )}
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                </>
              )}
            </section>
          );
        })}
      </>
    );
  }
}
