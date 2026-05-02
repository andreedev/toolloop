import { Category } from '../entity/category';
import { ToolPhoto } from '../entity/tool-photo';

export interface ToolMapItem {
    toolId: number;
    name: string;
    pricePerDay: number;
    isReserved: boolean;
    photos: ToolPhoto[];
    category: Category;
    owner: { name: string; averageRating: number };
    latitude: number;
    longitude: number;
    distanceMeters?: number;
}
