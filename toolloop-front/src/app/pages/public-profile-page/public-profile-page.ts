import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {faStar, faCalendar, faAward, faHouse, faWrench, faUser} from '@fortawesome/free-solid-svg-icons';


@Component({
    selector: 'app-public-profile-page',
    imports: [FontAwesomeModule, RouterLink],
    templateUrl: './public-profile-page.html',
    styleUrl: './public-profile-page.scss',
})
export class PublicProfilePage {
    public faStar = faStar;
    public faCalendar = faCalendar;
    public faAward = faAward;
    public faHouse = faHouse;
    public faWrench = faWrench;
    public faUser = faUser;
}
