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
import { UtilService } from '../../core/services/util/util.service';
import { ToolDataService } from '../../core/services/data/tool.data.service';
import { CommonModule } from '@angular/common';
import { Utils } from '../../core/helpers/utils';
import { RentalDataService } from '../../core/services/data/rental.data.service';
import { RentalApiService } from '../../core/services/api/rental.api.service';
import { GenericInitialRentalRequest } from '../../core/models/dto/generic-initial-rental-request';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Rental } from '../../core/models/entity/rental';

@Component({
    selector: 'app-book-tool-page',
    imports: [FontAwesomeModule, CommonModule],
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

    public isLoading = signal<boolean>(true);
    public rental = signal<Rental | null>(null);
    
    private messageService = inject(MessageService);
    public categoryDataService = inject(CategoryDataService);
    private router = inject(Router);
    private activatedRoute = inject(ActivatedRoute);
    private toolDataService = inject(ToolDataService);
    private rentalDataService = inject(RentalDataService);
    private rentalApiService = inject(RentalApiService);
    private generalDataService = inject(GeneralDataService);
    private s3ApiService: S3ApiService = inject(S3ApiService);
    protected utilService = inject(UtilService);
    private request = signal<GenericInitialRentalRequest | null>(null);

    constructor() {
        Utils.scrollToTop();
        this.activatedRoute.queryParamMap.subscribe(async params => {
            this.isLoading.set(true);
            const toolId = params.get('toolId');
            const startDate = params.get('startDate');
            const endDate = params.get('endDate');
            if (!toolId || !startDate || !endDate) {
                this.isLoading.set(false);
                this.utilService.navigateBack();
                return;
            }
            this.request.set({
                toolId: parseInt(toolId),
                startDate,
                endDate
            });
            await this.loadRentalPreviewData();
        });
    }

    async loadRentalPreviewData(): Promise<void> {
        this.isLoading.set(true);
        
        const httpResponse = await this.rentalApiService.getRentalPreview(this.request()!);
        if (httpResponse instanceof HttpResponse) {
            const body = httpResponse.body;
            this.rental.set(body?.data!);
        } else if (httpResponse instanceof HttpErrorResponse) {
            const message = httpResponse.error?.message || 'Error al cargar la vista previa de la reserva';
            const didNavigate = await this.router.navigate(['/app/tool', this.request()!.toolId]);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
            if (!didNavigate) {
                this.isLoading.set(false);
            }
            return;
        }
        this.isLoading.set(false);
    }

    async sendBookingRequest() {
        this.isLoading.set(true);
        const httpResponse = await this.rentalApiService.createRental(this.request()!);
        if (httpResponse instanceof HttpResponse) {
            const body = httpResponse.body;
            const rental = body?.data!;
            this.router.navigate(['/app/rental', rental.rentalId, 'requested']);
        } else if (httpResponse instanceof HttpErrorResponse) {
            const message = httpResponse.error?.message || 'Error al crear la reserva';
            this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
        }
        this.isLoading.set(false);
    }

}
