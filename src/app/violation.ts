export interface Violation {
    id: number,
    timestamp: string,
    plate_number: string,
    plate_state: string,
    gps_lat: number,
    gps_long: number,
    resolved: boolean,
}
