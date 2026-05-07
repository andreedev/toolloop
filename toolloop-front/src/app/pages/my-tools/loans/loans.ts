import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {faCheck, faCross, faCalendar, faShield, faStar, faHashtag, faArrowLeft, faClock, faArrowsRotate, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
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

@Component({
    selector: 'app-loans',
    imports: [CommonModule, RouterLink, FontAwesomeModule, DialogModule, UnderscoreToSpacePipe],
    templateUrl: './loans.html',
    styleUrl: './loans.scss',
})
export class Loans implements OnInit {
    faCheck = faCheck;
    faCross = faCross;
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
    private readonly dateFormatter = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

    public showModalStep1 = signal<boolean>(false);
    public showModalStep2 = signal<boolean>(false);
    public isMobile = this.viewportService.isMobile;
    public rentalsData = signal<GetRentalsByOwnerResponse | undefined>(undefined);
    public pendingRentals = computed(() => this.filterRentalsByStatus([RentalStatusEnum.PENDIENTE]));
    public upcomingRentals = computed(() => this.filterRentalsByStatus([RentalStatusEnum.APROBADA]));
    public inProgressRentals = computed(() => this.filterRentalsByStatus([RentalStatusEnum.EN_USO]));
    public finishedRentals = computed(() => this.filterRentalsByStatus([RentalStatusEnum.COMPLETADA, RentalStatusEnum.RECHAZADA]));

    async ngOnInit() {
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

    giveReview(): void {
        this.router.navigate(['/app/review'], { queryParams: { type: ReviewType.OWNER_TO_RENTER.getName() } });
    }

    public formatDate(dateString?: string): string {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return Number.isNaN(date.getTime()) ? '-' : this.dateFormatter.format(date);
    }

    public formatDateRange(startDate?: string, endDate?: string): string {
        return `${this.formatDate(startDate)} — ${this.formatDate(endDate)}`;
    }

    public statusBadgeClass(status?: Rental['status']): string {
        const normalizedStatus = RentalStatusEnum.fromString(status ?? '');
        switch (normalizedStatus) {
            case RentalStatusEnum.APROBADA:
                return 'text-blue-500 bg-blue-50';
            case RentalStatusEnum.EN_USO:
                return 'text-green-600 bg-green-50';
            case RentalStatusEnum.COMPLETADA:
                return 'text-gray-500 bg-gray-100';
            case RentalStatusEnum.RECHAZADA:
                return 'text-red-500 bg-red-50';
            case RentalStatusEnum.PENDIENTE:
            default:
                return 'text-orange-500 bg-orange-50';
        }
    }

    public resolveToolPhoto(rental: Rental): string {
        return rental.tool?.photos?.[0]?.photoKey ?? '';
    }

    public getRenterInitial(rental: Rental): string {
        return rental.renter?.name?.charAt(0)?.toUpperCase() || '';
    }

    private filterRentalsByStatus(statuses: RentalStatusEnum[]): Rental[] {
        const normalizedStatusNames = new Set(statuses.map(status => status.getName()));
        return (this.rentalsData()?.rentals ?? []).filter(rental => {
            const normalizedRentalStatus = RentalStatusEnum.fromString(rental.status ?? '');
            return normalizedRentalStatus ? normalizedStatusNames.has(normalizedRentalStatus.getName()) : false;
        });
    }

}
