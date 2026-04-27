import { Category } from "./category";
import { User } from "./user";
import {ToolPhoto} from './tool-photo';

export interface Tool {
    toolId?: number;
    ownerId?: number;
    categoryId?: number;
    name?: string;
    description?: string;
    pricePerDay?: number;
    securityDeposit?: number;
    condition?: number;

    // transient: no persisten en la BD
    owner?: User;
    category?: Category;
    photos?: ToolPhoto[];
    isReserved?: boolean;
    reviewCount?: number;
    isFavorited?: boolean;
}
