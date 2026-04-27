import { inject, Injectable } from '@angular/core';
import { ToolApiService } from '../api/tool.api.service';

@Injectable({
    providedIn: 'root',
})
export class ToolDataService {

    private toolApiService = inject(ToolApiService);

    constructor(){
        
    }

    async loadToolById(toolId: number): Promise<any> {
        const httpReponse = await this.toolApiService.getToolById(toolId);
    }
    
}
