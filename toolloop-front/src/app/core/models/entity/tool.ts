import { Category } from "./category";
import { User } from "./user";
import {ToolPhoto} from './tool-photo';
import { Review } from "./review";

export interface Tool {
    toolId?: number;
    ownerId?: number;
    categoryId?: number;
    name?: string;
    description?: string;
    pricePerDay?: number;
    securityDeposit?: number;
    condition?: string;

    // transient: no persisten en la BD
    owner?: User;
    category?: Category;
    photos?: ToolPhoto[];
    isReserved?: boolean;
    reviewCount?: number;
    isFavorited?: boolean;
    averageRating?: number;
    distanceMeters?: number;
    reviews?: Review[];
}
