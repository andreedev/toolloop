import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Tool } from '../../models/entity/tool';
import { ToolApiService } from '../api/tool.api.service';

@Injectable({
    providedIn: 'root',
})
export class ToolDataService {

    private toolApiService = inject(ToolApiService);

    async loadToolById(toolId: number): Promise<Tool | null> {
        const httpReponse = await this.toolApiService.getToolById(toolId);
        if (httpReponse instanceof HttpErrorResponse) {
            return null;
        }
        return httpReponse.body?.data || null;
    }
    
}
