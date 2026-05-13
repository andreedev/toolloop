import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faThumbsUp, faStar, faCube, faBusinessTime, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { UserApiService } from '../../core/services/api/user.api.service';
import { AuthDataService } from '../../core/services/data/auth.data.service';
import { GeneralDataService } from '../../core/services/data/general.data.service';
import { UserDataService } from '../../core/services/data/user.data.service';

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

    public authDataService: AuthDataService = inject(AuthDataService);
    private userApiService: UserApiService = inject(UserApiService);
    public userDataService = inject(UserDataService);
    public generalDataService = inject(GeneralDataService);
    private router = inject(Router);
}
