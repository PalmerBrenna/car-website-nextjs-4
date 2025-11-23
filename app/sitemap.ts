import type { MetadataRoute } from "next";
import { getCars } from "@/lib/firestore";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const cars = await getCars();

  const carUrls = cars.map((car: any) => ({
    url: `https://dariellamotors.com/listings/${car.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    {
      url: "https://dariellamotors.com/",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: "https://dariellamotors.com/listings",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...carUrls,
  ];
}
