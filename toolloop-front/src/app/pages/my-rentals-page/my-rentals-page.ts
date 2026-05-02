import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faClock, faStar } from '@fortawesome/free-regular-svg-icons';
import { faKey, faShieldCat } from '@fortawesome/free-solid-svg-icons';
import { ReviewType } from '../../core/enums/review-type';

@Component({
    selector: 'app-my-rentals-page',
    imports: [CommonModule, FontAwesomeModule],
    templateUrl: './my-rentals-page.html',
    styleUrl: './my-rentals-page.scss',
})
export class MyRentalsPage {
    faKey = faKey;
    faClock = faClock;
    faShieldCat = faShieldCat;
    faStar = faStar;

    private router = inject(Router);

    giveReview(){
        this.router.navigate(['/app/review'], { queryParams: { type: ReviewType.RENTER_TO_OWNER.getName() } });
    }
}
