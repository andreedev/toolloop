import { Component, inject, signal } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHeart, faLocationDot, faStar, faCalendar, faComment, faArrowLeft, faShield, faSquare, faBell, faClock, faCircleExclamation, faEuroSign } from '@fortawesome/free-solid-svg-icons';
import { Tool } from '../../core/models/entity/tool';
import { Rental } from '../../core/models/entity/rental';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { RentalApiService } from '../../core/services/api/rental.api.service';
import { S3ApiService } from '../../core/services/api/s3-api.service';
import { CategoryDataService } from '../../core/services/data/category.data.service';
import { GeneralDataService } from '../../core/services/data/general.data.service';
import { RentalDataService } from '../../core/services/data/rental.data.service';
import { ToolDataService } from '../../core/services/data/tool.data.service';
import { UtilService } from '../../core/services/util/util.service';
import { Utils } from '../../core/helpers/utils';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'rental-requested-page',
    imports: [FontAwesomeModule],
    templateUrl: './rental-requested-page.html',
    styleUrl: './rental-requested-page.scss',
})
export class RentalRequestedPage {
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

    public rental = signal<Rental | null>(null);
    public isLoading = signal<boolean>(true);

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

    constructor() {
        Utils.scrollToTop();
        this.activatedRoute.paramMap.subscribe(async params => {
            this.isLoading.set(true);
            const rentalId = params.get('rentalId');
            if (!rentalId) {
                this.isLoading.set(false);
                this.utilService.navigateBack();
                return;
            }
            await this.loadRentalData(Number(rentalId));
        });
    }

    async loadRentalData(rentalId: number): Promise<void> {
        const httpResponse = await this.rentalApiService.getRentalDetails(rentalId);
        if (httpResponse instanceof HttpResponse) {
            const body = httpResponse.body;
            this.rental.set(body?.data!);
        } else if (httpResponse instanceof HttpErrorResponse) {
            const message = httpResponse.error?.message || 'Error al cargar los detalles de la reserva';
            const didNavigate = await this.router.navigate(['/app']);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
            if (!didNavigate) {
                this.isLoading.set(false);
            }
        }
        this.isLoading.set(false);
    }

}
