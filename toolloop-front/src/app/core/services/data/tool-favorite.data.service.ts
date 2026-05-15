import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { ToolFavoriteApiService } from '../api/tool-favorite.api.service';
import { MessageService } from 'primeng/api';

@Injectable({
    providedIn: 'root',
})
export class ToolFavoriteDataService {
    private toolFavoriteApiService = inject(ToolFavoriteApiService);
    private messageService = inject(MessageService);

    async toggleFavorite(toolId: number): Promise<boolean> {
        const response = await this.toolFavoriteApiService.toggleFavorite(toolId);
        if (response instanceof HttpErrorResponse) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el favorito' });
            return false;
        }
        this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Favorito actualizado' });
        return true;
    }
}
