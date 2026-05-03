import { inject, Injectable } from '@angular/core';
import { ToolFavoriteApiService } from '../api/tool-favorite.api.service';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class ToolFavoriteDataService {
    private toolFavoriteApiService = inject(ToolFavoriteApiService);

    async toggleFavorite(toolId: number): Promise<boolean> {
        const response = await this.toolFavoriteApiService.toggleFavorite(toolId);
        if (response instanceof HttpErrorResponse) {
            return false;
        }
        return true;
    }
}
