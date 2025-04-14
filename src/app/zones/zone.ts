export interface Zone {
    id: number;
    name: string;
    type: 'handicap' | 'fire' ;
    coordinates: [number, number][]; // Array of [lat, lng] pairs
  }
  