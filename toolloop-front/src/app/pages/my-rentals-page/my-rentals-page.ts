import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';
import {CommonModule} from '@angular/common';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faKey, faShieldCat} from '@fortawesome/free-solid-svg-icons';
import {faClock, faStar} from '@fortawesome/free-regular-svg-icons';

@Component({
    selector: 'app-my-rentals-page',
    imports: [RouterLink, CommonModule, FontAwesomeModule],
    templateUrl: './my-rentals-page.html',
    styleUrl: './my-rentals-page.scss',
})
export class MyRentalsPage {
    faKey = faKey;
    faClock = faClock;
    faShieldCat = faShieldCat;
    faStar = faStar;
}
