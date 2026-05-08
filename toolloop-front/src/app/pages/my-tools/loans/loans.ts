import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
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
export class Loans implements OnInit, OnDestroy {
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

    activeCodeModal = signal<{ rental: Rental; type: 'handover' | 'return' } | null>(null);
    showCodeModal   = signal(false);
    showCodeSuccess = signal(false);
    generatedCode   = signal<string | null>(null);
    codeCountdown   = signal(180);
    codeGenerating  = signal(false);

    private countdownInterval: ReturnType<typeof setInterval> | null = null;

    public isMobile = this.viewportService.isMobile;
    public rentalsData = signal<GetRentalsByOwnerResponse | undefined>(undefined);
    public pendingRentals = computed(() => this.filterRentalsByStatus([RentalStatusEnum.PENDIENTE]));
    public upcomingRentals = computed(() => this.filterRentalsByStatus([RentalStatusEnum.APROBADA]));
    public inProgressRentals = computed(() => this.filterRentalsByStatus([RentalStatusEnum.EN_USO]));
    public finishedRentals = computed(() => this.filterRentalsByStatus([RentalStatusEnum.COMPLETADA, RentalStatusEnum.RECHAZADA]));

    ngOnInit() {
        this.loadLoans();
    }

    ngOnDestroy() {
        if (this.countdownInterval) clearInterval(this.countdownInterval);
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

    openHandoverModal(rental: Rental): void {
        this.activeCodeModal.set({ rental, type: 'handover' });
        this.showCodeModal.set(true);
        this.showCodeSuccess.set(false);
        this.generateCode();
    }

    openReturnModal(rental: Rental): void {
        this.activeCodeModal.set({ rental, type: 'return' });
        this.showCodeModal.set(true);
        this.showCodeSuccess.set(false);
        this.generateCode();
    }

    async generateCode(): Promise<void> {
        const ctx = this.activeCodeModal();
        if (!ctx) return;
        this.codeGenerating.set(true);
        const res = ctx.type === 'handover'
            ? await this.rentalApiService.generateHandoverCode(ctx.rental.rentalId!)
            : await this.rentalApiService.generateReturnCode(ctx.rental.rentalId!);
        this.codeGenerating.set(false);
        if (res instanceof HttpErrorResponse) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo generar el código.' });
            return;
        }
        this.generatedCode.set(res.body?.data ?? null);
        this.startCountdown();
    }

    private startCountdown(): void {
        if (this.countdownInterval) clearInterval(this.countdownInterval);
        this.codeCountdown.set(180);
        this.countdownInterval = setInterval(() => {
            const remaining = this.codeCountdown() - 1;
            if (remaining <= 0) {
                this.generateCode();
            } else {
                this.codeCountdown.set(remaining);
            }
        }, 1000);
    }

    closeCodeModal(): void {
        this.showCodeModal.set(false);
        this.activeCodeModal.set(null);
        this.generatedCode.set(null);
        this.showCodeSuccess.set(false);
        if (this.countdownInterval) clearInterval(this.countdownInterval);
    }

    formatCountdown(seconds: number): string {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
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
