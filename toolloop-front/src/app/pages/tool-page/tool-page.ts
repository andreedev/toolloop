import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Tool } from '../../core/models/entity/tool';
import { GeneralDataService } from '../../core/services/data/general.data.service';
import { ToolDataService } from '../../core/services/data/tool.data.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHeart, faLocationDot, faStar, faCalendar, faComment, faArrowLeft, faShield, faSquare, faBell, faClock, faCircleExclamation, faEuroSign } from '@fortawesome/free-solid-svg-icons';
import { Utils } from '../../core/helpers/utils';
import { GalleriaModule } from 'primeng/galleria';

interface GalleryImage {
    itemImageSrc: string;
    thumbnailImageSrc: string;
    alt: string;
}

@Component({
    selector: 'app-tool-page',
    imports: [CommonModule, FontAwesomeModule, RouterLink, GalleriaModule],
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
    protected readonly utils = Utils;
    protected readonly Math = Math;

    public tool: Tool | null = null;
    public images: GalleryImage[] = [];
    public activeIndex = 0;
    public readonly responsiveOptions = [
        { breakpoint: '1400px', numVisible: 3 },
        { breakpoint: '1024px', numVisible: 3 },
        { breakpoint: '768px', numVisible: 3 },
        { breakpoint: '560px', numVisible: 2 },
    ];

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
        this.images = (tool?.photos ?? []).map((photo, index) => ({
            itemImageSrc: photo.photoKey,
            thumbnailImageSrc: photo.photoKey,
            alt: `${tool?.name ?? 'Herramienta'} foto ${index + 1}`,
        }));
        this.activeIndex = 0;
    }

    protected getToolAvailabilityIndicatorClass(): string {
        return this.tool?.isReserved ? 'bg-lime-400 hover:bg-lime-500 text-white' : 'bg-neutral-400 hover:bg-neutral-500 text-gray-600';
    }
}
