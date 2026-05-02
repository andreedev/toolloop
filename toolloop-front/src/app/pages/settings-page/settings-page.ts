import { Component, inject } from '@angular/core';
import { AuthDataService } from '../../core/services/data/auth.data.service';
import { UserDataService } from '../../core/services/data/user.data.service';
import { GeneralDataService } from '../../core/services/data/general.data.service';
import { Router } from '@angular/router';
import { UserApiService } from '../../core/services/api/user.api.service';

@Component({
    selector: 'app-settings-page',
    imports: [],
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
}
