import { Category } from "./category";
import { User } from "./user";

export interface Tool {
    toolId?: number;
    ownerId?: number;
    categoryId?: number;
    name?: string;
    description?: string;
    price_per_day?: number;
    security_deposit?: number;
    condition?: number;

    // transient: no persisten en la BD
    owner: User;
    category: Category;
}