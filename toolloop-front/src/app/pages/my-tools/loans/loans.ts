import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {faCheck, faCross, faCalendar, faShield, faStar, faHashtag, faArrowLeft, faClock, faArrowsRotate, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { ReviewType } from '../../../core/enums/review-type';
import { DialogModule } from 'primeng/dialog';
import { ViewportService } from '../../../core/services/util/viewport.service';

@Component({
    selector: 'app-loans',
    imports: [RouterLink, FontAwesomeModule, DialogModule],
    templateUrl: './loans.html',
    styleUrl: './loans.scss',
})
export class Loans {
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

    public showModalStep1 = signal<boolean>(false);
    public showModalStep2 = signal<boolean>(false);

    public isMobile = this.viewportService.isMobile;

    giveReview(){
        this.router.navigate(['/app/review'], { queryParams: { type: ReviewType.OWNER_TO_RENTER.getName() } });
    }

    
}
