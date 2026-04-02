export const FOCUS_MAP_POINT_EVENT = "captain-guiness:focus-map-point";

export type FocusMapPointDetail = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  averageRating: number;
  ratingCount: number;
};