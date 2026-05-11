import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faThumbsUp, faStar, faCube, faBusinessTime, faCircleXmark } from '@fortawesome/free-solid-svg-icons';



@Component({
    selector: 'app-notifications-page',
    imports: [FontAwesomeModule, RouterLink],
    templateUrl: './notifications-page.html',
    styleUrl: './notifications-page.scss',
})
export class NotificationsPage {
    faThumbsUp = faThumbsUp;
    faStar = faStar;
    faCube = faCube;
    faBusinessTime = faBusinessTime;
    faCircleXmark = faCircleXmark;
}
