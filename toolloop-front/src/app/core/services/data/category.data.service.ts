import { inject, Injectable, signal } from '@angular/core';
import { Category } from '../../models/entity/category';
import { CategoryApiService } from '../api/category.api.service';

@Injectable({
    providedIn: 'root',
})
export class CategoryDataService {
    public categories = signal<Category[]>([]);
    private categoryApiService = inject(CategoryApiService);

    constructor() {
        this.ensureCategoriesAreLoaded();
    }

    public async ensureCategoriesAreLoaded(): Promise<void>{
        const response = await this.categoryApiService.getCategories();
        this.categories.set(response.body?.data ?? []);
    }
}
