// Core domain types — shaped to match a future Supabase schema 1:1

export type PetType = "dog" | "cat" | "other";
export type PlaceCategory =
  | "cafe"
  | "restaurant"
  | "hotel"
  | "mall"
  | "park"
  | "petshop";
export type SizeLimit = "small" | "medium" | "large" | "any";

export interface PetPolicy {
  indoor_allowed: boolean;
  carrier_required: boolean;
  ac: boolean;
  pet_zone: boolean;
  size_limit: SizeLimit;
  verified: boolean;
}

export interface Place {
  id: string;
  name: string;
  category: PlaceCategory;
  address: string;
  district?: string;
  city?: string;
  lat: number;
  lng: number;
  phone?: string | null;
  hours?: string | null;
  website?: string | null;
  pet_types: PetType[];
  policy: PetPolicy;
  notes?: string | null;
  photos: string[];
  cover_photo?: string | null;
  rating: number;
  review_count: number;
  added_by?: string | null;
  added_at: string; // ISO date
  updated_at?: string;
}

export interface Review {
  id: string;
  place_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  rating: number; // 1..5
  comment: string;
  photos: string[];
  created_at: string;
}

export interface SuggestedEdit {
  id: string;
  place_id: string;
  user_id: string;
  note: string;
  created_at: string;
}

export interface CheckIn {
  id: string;
  place_id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  created_at: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  provider: "google" | "email" | "guest";
  joined_at: string;
}

export interface Filters {
  search: string;
  pet_types: Set<PetType>;
  categories: Set<PlaceCategory>;
  conditions: Set<"no_carrier" | "indoor" | "ac" | "verified" | "pet_zone">;
  sizes: Set<"small" | "medium" | "large">;
  min_rating: number;
  radius_km: number;
}

export type SortBy = "distance" | "rating" | "review_count" | "newest";

export interface Coords {
  lat: number;
  lng: number;
}
