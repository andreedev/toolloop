import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Tool } from '../../core/models/entity/tool';
import { GeneralDataService } from '../../core/services/data/general.data.service';
import { ToolDataService } from '../../core/services/data/tool.data.service';

@Component({
    selector: 'app-tool-page',
    imports: [CommonModule],
    templateUrl: './tool-page.html',
    styleUrl: './tool-page.scss',
})
export class ToolPage {
    private toolDataService = inject(ToolDataService);
    private router = inject(Router);
    private activatedRoute = inject(ActivatedRoute);
    private generalDataService = inject(GeneralDataService);

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
        this.generalDataService.loading.set(true);
        const tool: Tool | null = await this.toolDataService.loadToolById(Number(toolId));
        this.generalDataService.loading.set(false);
        this.tool = tool;
    }
}
