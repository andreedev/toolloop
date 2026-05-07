import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {faCheck, faCross, faCalendar, faShield, faStar, faHashtag, faArrowLeft, faClock, faArrowsRotate, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { ReviewType } from '../../../core/enums/review-type';
import { DialogModule } from 'primeng/dialog';
import { ViewportService } from '../../../core/services/util/viewport.service';
import { MessageService } from 'primeng/api';
import { RentalApiService } from '../../../core/services/api/rental.api.service';
import { CategoryDataService } from '../../../core/services/data/category.data.service';
import { UtilService } from '../../../core/services/util/util.service';
import { HttpErrorResponse } from '@angular/common/http';
import { Rental } from '../../../core/models/entity/rental';
import { GetRentalsByOwnerResponse } from '../../../core/models/dto/get-rentals-by-owner-response';
import { GeneralDataService } from '../../../core/services/data/general.data.service';

@Component({
    selector: 'app-loans',
    imports: [RouterLink, FontAwesomeModule, DialogModule],
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
    public categoryDataService = inject(CategoryDataService);
    private activatedRoute = inject(ActivatedRoute);
    private rentalApiService = inject(RentalApiService);
    protected utilService = inject(UtilService);
    private generalDataService = inject(GeneralDataService);

    public showModalStep1 = signal<boolean>(false);
    public showModalStep2 = signal<boolean>(false);
    public isMobile = this.viewportService.isMobile;
    public rentalsData = signal<GetRentalsByOwnerResponse | undefined>(undefined);

    async ngOnInit() {
        this.loadLoans();
    }

    async loadLoans(): Promise<void> {
        this.generalDataService.loading.set(true);
        const httpResponse = await this.rentalApiService.getRentalsAsOwner();
        if (httpResponse instanceof HttpErrorResponse) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to load rentals.' });
            return;
        }
        this.rentalsData.set(httpResponse.body?.data);
        this.generalDataService.loading.set(false);
    }

    giveReview(): void {
        this.router.navigate(['/app/review'], { queryParams: { type: ReviewType.OWNER_TO_RENTER.getName() } });
    }

    
}
