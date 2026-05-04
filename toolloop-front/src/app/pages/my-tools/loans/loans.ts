import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {faCheck, faCross, faCalendar, faShield, faStar, faHashtag, faArrowLeft, faClock, faArrowsRotate, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { ReviewType } from '../../../core/enums/review-type';
import { DialogModule } from 'primeng/dialog';

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

    public showModalStep1 = signal<boolean>(false);
    public showModalStep2 = signal<boolean>(false);

    public isMobile = signal<boolean>(this.getIsMobile());

    private getIsMobile(): boolean {
        return typeof window !== 'undefined' && window.innerWidth < 768;
    }

    @HostListener('window:resize')
    onWindowResize(): void {
        this.isMobile.set(this.getIsMobile());
    }

    giveReview(){
        this.router.navigate(['/app/review'], { queryParams: { type: ReviewType.OWNER_TO_RENTER.getName() } });
    }
}
