import { Category } from '../entity/category';
import { ToolPhoto } from '../entity/tool-photo';
import { User } from '../entity/user';

export interface ToolMapItem {
    toolId: number;
    name: string;
    pricePerDay: number;
    isReserved: boolean;
    photos: ToolPhoto[];
    category: Category;
    owner: User;
    latitude: number;
    longitude: number;
    distanceMeters?: number;
}
