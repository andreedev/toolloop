import { inject, Injectable } from '@angular/core';
import { ToolApiService } from '../api/tool.api.service';
import { Tool } from '../../models/entity/tool';
import { HttpResponseBody } from '../../models/dto/http-response-body';
import { HttpResponse } from '@angular/common/http';

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
