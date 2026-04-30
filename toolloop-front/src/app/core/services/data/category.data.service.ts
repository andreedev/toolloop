import { inject, Injectable } from '@angular/core';
import { Category } from '../../models/entity/category';
import { CategoryApiService } from '../api/category.api.service';

@Injectable({
    providedIn: 'root',
})
export class CategoryDataService {
    private categories: Category[] = [];
    private categoryApiService = inject(CategoryApiService);

    constructor() {
        this.ensureCategoriesAreLoaded();
    }

    public async ensureCategoriesAreLoaded(): Promise<void>{
        const response = await this.categoryApiService.getCategories();
        this.categories = response.body?.data ?? [];
    }
}
