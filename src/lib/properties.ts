import img1 from "@/assets/property-1.jpg";
import img2 from "@/assets/property-2.jpg";
import img3 from "@/assets/property-3.jpg";
import img4 from "@/assets/property-4.jpg";
import type { Property } from "./agent-types";

export const PROPERTIES: Property[] = [
  {
    id: "TN-1041",
    title: "Sunlit 3-room apartment, Lac 2",
    price: 268000,
    currency: "TND",
    location: "Lac 2, Tunis",
    rooms: 3,
    baths: 2,
    size: 118,
    type: "Apartment",
    image: img1,
    status: "available",
    lat: 36.84,
    lng: 10.27,
  },
  {
    id: "TN-2277",
    title: "Sea-view penthouse with terrace",
    price: 295000,
    currency: "TND",
    location: "La Marsa, Tunis",
    rooms: 4,
    baths: 2,
    size: 143,
    type: "Penthouse",
    image: img3,
    status: "new",
    lat: 36.88,
    lng: 10.32,
  },
  {
    id: "TN-3390",
    title: "Garden duplex near the medina",
    price: 232000,
    currency: "TND",
    location: "Sidi Bou Said, Tunis",
    rooms: 4,
    baths: 3,
    size: 156,
    type: "Duplex",
    image: img4,
    status: "available",
    lat: 36.87,
    lng: 10.35,
  },
  {
    id: "TN-4812",
    title: "Villa with pool, gated residence",
    price: 640000,
    currency: "TND",
    location: "Gammarth, Tunis",
    rooms: 6,
    baths: 4,
    size: 310,
    type: "Villa",
    image: img2,
    status: "reserved",
    lat: 36.92,
    lng: 10.29,
  },
];

export const formatPrice = (value: number, currency: string) =>
  `${new Intl.NumberFormat("en-US").format(value)} ${currency}`;
