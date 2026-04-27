import { Component, inject } from '@angular/core';
import { ToolApiService } from '../../core/services/api/tool.api.service';
import { ToolDataService } from '../../core/services/data/tool.data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Tool } from '../../core/models/entity/tool';

@Component({
    selector: 'app-tool-page',
    imports: [],
    templateUrl: './tool-page.html',
    styleUrl: './tool-page.scss',
})
export class ToolPage {
    private toolDataService = inject(ToolDataService);
    private router = inject(Router);
    private activatedRoute = inject(ActivatedRoute);

    public tool: Tool | null = null;

    constructor(){
        this.loadTool();
    }

    async loadTool(): Promise<void> {
        const toolId = this.activatedRoute.snapshot.paramMap.get('id');
        if (!toolId) {
            this.router.navigate(['/tools']);
            return;
        }
        const tool = await this.toolDataService.loadToolById(Number(toolId));
        this.tool = tool;
    }
}
