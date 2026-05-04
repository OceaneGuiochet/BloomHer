import { LOCATIONIQ_API_KEY } from "@/src/config/locationiq";

export type Place = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
};

export async function searchPlaces(query: string): Promise<Place[]> {
  if (!query.trim()) {
    return [];
  }

  if (!LOCATIONIQ_API_KEY) {
    throw new Error("Clé API LocationIQ manquante");
  }

  const url =
    "https://api.locationiq.com/v1/autocomplete" +
    "?key=" +
    encodeURIComponent(LOCATIONIQ_API_KEY) +
    "&q=" +
    encodeURIComponent(query) +
    "&limit=5" +
    "&countrycodes=fr" +
    "&normalizecity=1" +
    "&format=json";

  const response = await fetch(url);

  if (!response.ok) {
    const message = await response.text();
    console.log("Erreur LocationIQ :", message);
    throw new Error("Erreur API LocationIQ");
  }

  const data = await response.json();

  return data.map((item: any) => ({
    id: String(item.place_id),
    name: item.display_place || item.name || item.display_name?.split(",")[0] || "Lieu",
    address: item.display_name || "Adresse inconnue",
    latitude: Number(item.lat),
    longitude: Number(item.lon),
  }));
}