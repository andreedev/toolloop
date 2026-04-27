import { inject, Injectable } from '@angular/core';
import { ToolApiService } from '../api/tool.api.service';
import { Tool } from '../../models/entity/tool';

@Injectable({
    providedIn: 'root',
})
export class ToolDataService {

    private toolApiService = inject(ToolApiService);

    constructor(){
        
    }

    async loadToolById(toolId: number): Promise<Tool | null> {
        const httpReponse = await this.toolApiService.getToolById(toolId);
        return httpReponse.body?.data || null;
    }
    
}
