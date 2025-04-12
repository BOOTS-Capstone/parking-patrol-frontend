export interface Zone {
    zone_id: number;
    name: string;
    type: 'handicap' | 'fire' | 'custom';
    coordinates: [number, number][]; // Array of [lat, lng] pairs
  }
  