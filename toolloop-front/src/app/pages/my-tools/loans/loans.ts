import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {faCheck, faCross, faCalendar, faShield, faStar, faHashtag } from '@fortawesome/free-solid-svg-icons';

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
}
