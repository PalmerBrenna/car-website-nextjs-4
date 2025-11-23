import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
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

  return staticPages.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1.0 : 0.8,
  }));
}
