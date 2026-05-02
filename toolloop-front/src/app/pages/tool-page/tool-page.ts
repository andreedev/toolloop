import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Tool } from '../../core/models/entity/tool';
import { GeneralDataService } from '../../core/services/data/general.data.service';
import { ToolDataService } from '../../core/services/data/tool.data.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHeart, faLocationDot, faStar, faCalendar, faComment, faArrowLeft, faShield, faSquare, faBell, faClock, faCircleExclamation, faEuroSign } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-tool-page',
    imports: [CommonModule, FontAwesomeModule, RouterLink],
    templateUrl: './tool-page.html',
    styleUrl: './tool-page.scss',
})
export class ToolPage {
    public faHeart = faHeart;
    public faLocationDot = faLocationDot;
    public faStar = faStar;
    public faCalendar = faCalendar;
    public faComment = faComment;
    public faArrowLeft = faArrowLeft;
    public faShield = faShield;
    public faSquare = faSquare;
    public faBell = faBell;
    public faClock = faClock;
    public faCircleExclamation = faCircleExclamation;
    public faEuroSign = faEuroSign;

    private toolDataService = inject(ToolDataService);
    private router = inject(Router);
    private activatedRoute = inject(ActivatedRoute);
    private generalDataService = inject(GeneralDataService);
    protected readonly Math = Math;

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

    protected getToolAvailabilityIndicatorClass(): string {
        return this.tool?.isReserved ? 'bg-lime-400 hover:bg-lime-500 text-white' : 'bg-neutral-400 hover:bg-neutral-500 text-gray-600';
    }
}
