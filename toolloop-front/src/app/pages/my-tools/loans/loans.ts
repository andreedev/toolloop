import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {faCheck, faCross, faCalendar, faShield, faStar, faHashtag } from '@fortawesome/free-solid-svg-icons';
import { ReviewType } from '../../../core/enums/review-type';

@Component({
    selector: 'app-loans',
    imports: [RouterLink, FontAwesomeModule],
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

    private router = inject(Router);

    giveReview(){
        this.router.navigate(['/app/review'], { queryParams: { type: ReviewType.OWNER_TO_RENTER.getName() } });
    }
}
