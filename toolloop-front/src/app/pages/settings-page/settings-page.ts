import { Component, inject } from '@angular/core';
import { AuthDataService } from '../../core/services/data/auth.data.service';
import { UserDataService } from '../../core/services/data/user.data.service';
import { GeneralDataService } from '../../core/services/data/general.data.service';
import { Router } from '@angular/router';
import { UserApiService } from '../../core/services/api/user.api.service';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCamera, faUser, faEnvelope, faLocationDot, faLock, faBell, faTrashCan, faArrowRightFromBracket, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-settings-page',
    imports: [FaIconComponent, FontAwesomeModule, ToggleSwitchModule, RouterLink],
    templateUrl: './settings-page.html',
    styleUrl: './settings-page.scss',
})
export class SettingsPage {

    public authDataService: AuthDataService = inject(AuthDataService);
    private userApiService: UserApiService = inject(UserApiService);
    public userDataService = inject(UserDataService);
    public generalDataService = inject(GeneralDataService);
    private router = inject(Router);

    constructor() {}

    logout(): void {
        this.authDataService.deleteSession();
        void this.router.navigate(['/']);
    }

    public faCamera = faCamera;
    public faUser = faUser;
    public faEnvelope = faEnvelope;
    public faLocationDot = faLocationDot
    public faLock = faLock;
    public faBell = faBell
    public faTrashCan = faTrashCan;
    public faArrowRightFromBracket = faArrowRightFromBracket;
    public faAngleRight = faAngleRight;
}
