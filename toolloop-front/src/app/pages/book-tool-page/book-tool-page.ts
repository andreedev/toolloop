import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHeart, faLocationDot, faStar, faCalendar, faComment, faArrowLeft, faShield, faSquare, faBell, faClock, faCircleExclamation, faEuroSign } from '@fortawesome/free-solid-svg-icons';
import { Tool } from '../../core/models/entity/tool';
import { MessageService } from 'primeng/api';
import { CategoryDataService } from '../../core/services/data/category.data.service';
import { ActivatedRoute, Router } from '@angular/router';
import { S3ApiService } from '../../core/services/api/s3-api.service';
import { ToolApiService } from '../../core/services/api/tool.api.service';
import { GeneralDataService } from '../../core/services/data/general.data.service';

@Component({
    selector: 'app-book-tool-page',
    imports: [FontAwesomeModule],
    templateUrl: './book-tool-page.html',
    styleUrl: './book-tool-page.scss',
})
export class BookToolPage {
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

    private toolId = signal<number | null>(null);
    public tool = signal<Tool | null>(null);
    
    private messageService = inject(MessageService);
    public categoryDataService = inject(CategoryDataService);
    private router = inject(Router);
    private activatedRoute = inject(ActivatedRoute);
    private toolApiService = inject(ToolApiService);
    private generalDataService = inject(GeneralDataService);
    private s3ApiService: S3ApiService = inject(S3ApiService);
    private changeDetectorRef = inject(ChangeDetectorRef); 

    constructor() {
        this.activatedRoute.paramMap.subscribe(params => {
            const toolId = params.get('toolId');
            const startDate = params.get('startDate');
            const endDate = params.get('endDate');
            if (toolId) {
                this.toolId.set(parseInt(toolId));
            }
        });
    }

}
