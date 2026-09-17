export interface Location {
  id?: string; // Es opcional (| None)
  name: string;
  lat: number;  // float pasa a number en TS
  lon: number;  // float pasa a number en TS
  status: string;
  dept: string;
  coverage: number; // float pasa a number en TS
}