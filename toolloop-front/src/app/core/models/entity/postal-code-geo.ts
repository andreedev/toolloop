export interface PostalCodeGeo {
    id?: number;
    postalCode: string;
    latitude: number;
    longitude: number;
    city?: string;
    province?: string;
    community?: string;
}