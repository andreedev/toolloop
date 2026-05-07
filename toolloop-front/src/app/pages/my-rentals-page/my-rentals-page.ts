import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCalendar, faCircleCheck, faClock, faStar } from '@fortawesome/free-regular-svg-icons';
import { faArrowLeft, faArrowsRotate, faCheck, faCross, faHashtag, faKey, faShield, faShieldCat } from '@fortawesome/free-solid-svg-icons';
import { ReviewType } from '../../core/enums/review-type';
import { RentalStatus as RentalStatusEnum } from '../../core/enums/rental-status';
import { UnderscoreToSpacePipe } from '../../core/pipes/underscore-to-space.pipe';
import { UtilService } from '../../core/services/util/util.service';
import { ViewportService } from '../../core/services/util/viewport.service';
import { DialogModule } from 'primeng/dialog';
import { InputOtpModule } from 'primeng/inputotp';
import { GeneralDataService } from '../../core/services/data/general.data.service';
import { RentalApiService } from '../../core/services/api/rental.api.service';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { Rental } from '../../core/models/entity/rental';

@Component({
    selector: 'app-my-rentals-page',
    imports: [CommonModule, FontAwesomeModule, DialogModule, InputOtpModule, FormsModule, UnderscoreToSpacePipe],
    templateUrl: './my-rentals-page.html',
    styleUrl: './my-rentals-page.scss',
})
export class MyRentalsPage implements OnInit {

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
    faKey = faKey;
    faShieldCat = faShieldCat;

    public ownerCode = '';

    private router = inject(Router);
    private viewportService = inject(ViewportService);
    public utilService = inject(UtilService);
    private messageService = inject(MessageService);
    private rentalApiService = inject(RentalApiService);
    private generalDataService = inject(GeneralDataService);
    private readonly dateFormatter = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

    public isMobile = this.viewportService.isMobile;
    public showModalStep1 = signal<boolean>(false);
    public showModalStep2 = signal<boolean>(false);
    public rentals = signal<Rental[] | undefined>(undefined);
    public pendingRentals = computed(() => this.filterRentalsByStatus([RentalStatusEnum.PENDIENTE]));
    public upcomingRentals = computed(() => this.filterRentalsByStatus([RentalStatusEnum.APROBADA]));
    public inUseRentals = computed(() => this.filterRentalsByStatus([RentalStatusEnum.EN_USO]));
    public historyRentals = computed(() => this.filterRentalsByStatus([RentalStatusEnum.COMPLETADA, RentalStatusEnum.RECHAZADA]));

    async ngOnInit() {
        this.loadRentals();
    }

    async loadRentals(): Promise<void> {
        this.generalDataService.loading.set(true);
        try {
            const httpResponse = await this.rentalApiService.getRentalsAsRenter();
            if (httpResponse instanceof HttpErrorResponse) {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load rentals.' });
                return;
            }
            this.rentals.set(httpResponse.body?.data);
        } finally {
            this.generalDataService.loading.set(false);
        }
    }

    giveReview(){
        this.router.navigate(['/app/review'], { queryParams: { type: ReviewType.RENTER_TO_OWNER.getName() } });
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

    public getOwnerInitial(rental: Rental): string {
        return rental.owner?.name?.charAt(0)?.toUpperCase() || '';
    }

    private filterRentalsByStatus(statuses: RentalStatusEnum[]): Rental[] {
        const normalizedStatusNames = new Set(statuses.map(status => status.getName()));
        return (this.rentals() ?? []).filter(rental => {
            const normalizedRentalStatus = RentalStatusEnum.fromString(rental.status ?? '');
            return normalizedRentalStatus ? normalizedStatusNames.has(normalizedRentalStatus.getName()) : false;
        });
    }
}
