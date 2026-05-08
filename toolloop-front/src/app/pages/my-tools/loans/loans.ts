import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheck, faXmark, faCalendar, faShield, faStar, faHashtag, faArrowLeft, faClock, faArrowsRotate, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { ReviewType } from '../../../core/enums/review-type';
import { DialogModule } from 'primeng/dialog';
import { ViewportService } from '../../../core/services/util/viewport.service';
import { MessageService } from 'primeng/api';
import { RentalApiService } from '../../../core/services/api/rental.api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Rental } from '../../../core/models/entity/rental';
import { GetRentalsByOwnerResponse } from '../../../core/models/dto/get-rentals-by-owner-response';
import { GeneralDataService } from '../../../core/services/data/general.data.service';
import { RentalStatus as RentalStatusEnum } from '../../../core/enums/rental-status';
import { UnderscoreToSpacePipe } from '../../../core/pipes/underscore-to-space.pipe';
import { formatDate, formatDateRange, resolveToolPhoto, statusBadgeClass } from '../../../core/utils/rental-display.utils';

@Component({
    selector: 'app-loans',
    imports: [CommonModule, RouterLink, FontAwesomeModule, DialogModule, UnderscoreToSpacePipe],
    templateUrl: './loans.html',
    styleUrl: './loans.scss',
})
export class Loans implements OnInit {
    public RentalStatusEnum = RentalStatusEnum;

    faCheck = faCheck;
    faXmark = faXmark;
    faCalendar = faCalendar;
    faShield = faShield;
    faStar = faStar;
    faHashtag = faHashtag;
    faArrowLeft = faArrowLeft;
    faClock = faClock;
    faArrowsRotate = faArrowsRotate;
    faCircleCheck = faCircleCheck;

    private router = inject(Router);
    private viewportService = inject(ViewportService);
    private messageService = inject(MessageService);
    private rentalApiService = inject(RentalApiService);
    private generalDataService = inject(GeneralDataService);

    public showModalStep1 = signal<boolean>(false);
    public showModalStep2 = signal<boolean>(false);
    public isMobile = this.viewportService.isMobile;
    public rentalsData = signal<GetRentalsByOwnerResponse | undefined>(undefined);
    public pendingRentals = computed(() => this.filterRentalsByStatus([RentalStatusEnum.PENDIENTE]));
    public upcomingRentals = computed(() => this.filterRentalsByStatus([RentalStatusEnum.APROBADA]));
    public inProgressRentals = computed(() => this.filterRentalsByStatus([RentalStatusEnum.EN_USO]));
    public finishedRentals = computed(() => this.filterRentalsByStatus([RentalStatusEnum.COMPLETADA, RentalStatusEnum.RECHAZADA]));

    ngOnInit() {
        this.loadLoans();
    }

    async loadLoans(): Promise<void> {
        this.generalDataService.loading.set(true);
        try {
            const httpResponse = await this.rentalApiService.getRentalsAsOwner();
            if (httpResponse instanceof HttpErrorResponse) {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load rentals.' });
                return;
            }
            this.rentalsData.set(httpResponse.body?.data);
        } finally {
            this.generalDataService.loading.set(false);
        }
    }

    async acceptRental(rentalId: number): Promise<void> {
        this.generalDataService.loading.set(true);
        try {
            const httpResponse = await this.rentalApiService.confirmRental(rentalId);
            if (httpResponse instanceof HttpErrorResponse) {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al confirmar la solicitud de préstamo.' });
                return;
            }
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Solicitud de préstamo confirmada.' });
        await this.loadLoans();
        } finally {
            this.generalDataService.loading.set(false);
        }
    }

    async rejectRental(rentalId: number): Promise<void> {
        this.generalDataService.loading.set(true);
        try {
            const httpResponse = await this.rentalApiService.rejectRental(rentalId);
            if (httpResponse instanceof HttpErrorResponse) {
                const message = httpResponse.error?.message || 'Error al rechazar la solicitud de préstamo.';
                this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
                return;
            }
            this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Solicitud de préstamo rechazada.' });
            await this.loadLoans();
        } finally {
            this.generalDataService.loading.set(false);
        }
    }

    giveReview(): void {
        this.router.navigate(['/app/review'], { queryParams: { type: ReviewType.OWNER_TO_RENTER.getName() } });
    }

    public formatDate = formatDate;
    public formatDateRange = formatDateRange;
    public statusBadgeClass = statusBadgeClass;
    public resolveToolPhoto = resolveToolPhoto;

    public getRenterInitial(rental: Rental): string {
        return rental.renter?.name?.charAt(0)?.toUpperCase() || '';
    }

    private filterRentalsByStatus(statuses: RentalStatusEnum[]): Rental[] {
        const statusNames = new Set(statuses.map(s => s.getName()));
        return (this.rentalsData()?.rentals ?? []).filter(r => r.status != null && statusNames.has(r.status));
    }

}
