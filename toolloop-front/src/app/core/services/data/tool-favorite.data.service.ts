import { inject, Injectable } from '@angular/core';
import { ToolFavoriteApiService } from '../api/tool-favorite.api.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { HttpResponseBody } from '../../models/dto/http-response-body';
import { ToolFavorite } from '../../models/entity/tool-favorite';

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
