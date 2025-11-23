import type { MetadataRoute } from "next";
import { getCars } from "@/lib/firestore";

export const dynamic = "force-dynamic";  // ⬅⬅⬅ ADĂUGAT

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://dariellamotors.com";

  const staticPages = [
    "/",               
    "/listings",
    "/sold",
    "/finance",
    "/consign",
    "/shipping",
    "/about",
    "/contact",
    "/auth/login",
    "/dashboard/cars/new",
  ];

  const staticRoutes = staticPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1.0 : 0.8,
  }));

  const cars = await getCars();

  const listingRoutes = cars.map((car: any) => ({
    url: `${baseUrl}/listings/${car.id}`,
    lastModified: new Date(car.updatedAt || Date.now()),
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  return [...staticRoutes, ...listingRoutes];
}
