import type { Place, Review } from "./types";

import bangkokPlaces from "./real-places-bangkok.json";
import bangkokAdditionalPlaces from "./real-places-bangkok-additional.json";
import bangkokResearchedPlaces from "./real-places-bangkok-researched.json";
import phuketPlaces from "./real-places-phuket.json";
import pattayaHuahinSamuiPlaces from "./real-places-pattaya-huahin-samui.json";
import chiangmaiPlaces from "./real-places-chiangmai.json";

export const SEED_PLACES: Place[] = [
  ...(bangkokPlaces as Place[]),
  ...(bangkokAdditionalPlaces as Place[]),
  ...(bangkokResearchedPlaces as Place[]),
  ...(phuketPlaces as Place[]),
  ...(pattayaHuahinSamuiPlaces as Place[]),
  ...(chiangmaiPlaces as Place[]),
];

export const SEED_REVIEWS: Review[] = [];
