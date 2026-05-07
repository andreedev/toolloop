import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHeart, faLocationDot, faStar, faCalendar, faComment, faArrowLeft, faShield, faSquare, faBell, faClock, faCircleExclamation, faEuroSign } from '@fortawesome/free-solid-svg-icons';
import { Rental } from '../../core/models/entity/rental';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { RentalApiService } from '../../core/services/api/rental.api.service';
import { CategoryDataService } from '../../core/services/data/category.data.service';
import { UtilService } from '../../core/services/util/util.service';
import { Utils } from '../../core/helpers/utils';
import { HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { UnderscoreToSpacePipe } from '../../core/pipes/underscore-to-space.pipe';

@Component({
    selector: 'rental-requested-page',
    imports: [CommonModule, FontAwesomeModule, RouterLink, UnderscoreToSpacePipe],
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

    public statusBadgeClasses = computed<string>(() => {
        const status = this.rental()?.status;
        switch (status) {
            case 'Aprobada':
            case 'En_Uso':
                return 'bg-green-100 text-green-800';
            case 'Completada':
                return 'bg-neutral-200 text-neutral-700';
            case 'Rechazada':
                return 'bg-red-100 text-red-800';
            case 'Pendiente':
            default:
                return 'bg-orange-100 text-orange-800';
        }
    });

    private messageService = inject(MessageService);
    public categoryDataService = inject(CategoryDataService);
    private router = inject(Router);
    private activatedRoute = inject(ActivatedRoute);
    private rentalApiService = inject(RentalApiService);
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
            this.rental.set(httpResponse.body?.data ?? null);
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

    contactOwner(): void {
        const ownerId = this.rental()?.owner?.id;
        if (ownerId) {
            this.router.navigate(['/app/chat'], { queryParams: { userId: ownerId } });
        } else {
            this.router.navigate(['/app/chat']);
        }
    }
}
