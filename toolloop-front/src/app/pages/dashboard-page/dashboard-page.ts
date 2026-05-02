import {Component,signal, inject} from '@angular/core';
import {AuthDataService} from '../../core/services/data/auth.data.service';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faStar, faHeart, faPlus, faArrowRight } from '@fortawesome/free-solid-svg-icons';

import { AuthApiService } from '../../core/services/api/auth.api.service';
import {UserApiService} from '../../core/services/api/user.api.service';
import {UserDataService} from '../../core/services/data/user.data.service';
import {HttpResponse} from '@angular/common/http';
import {HttpResponseBody} from '../../core/models/dto/http-response-body';
import {DashboardInfo} from '../../core/models/dto/dashboard-info';
import {CommonModule} from '@angular/common';
import { GeneralDataService } from '../../core/services/data/general.data.service';

@Component({
    selector: 'app-dashboard-page',
    imports: [FontAwesomeModule, RouterLink, CommonModule],
    templateUrl: './dashboard-page.html',
    styleUrl: './dashboard-page.scss',
})
export class DashboardPage {
    public faStar = faStar;
    public faHeart = faHeart;
    public faPlus = faPlus;
    public faArrowRight = faArrowRight;

    public authDataService: AuthDataService = inject(AuthDataService);
    private userApiService: UserApiService = inject(UserApiService);
    public userDataService = inject(UserDataService);
    public generalDataService = inject(GeneralDataService);
    private router = inject(Router);

    public loggedInUser = this.userDataService.loggedInUser;
    public dashboardInfo = signal<DashboardInfo | null>(null);

    constructor() {
        this.userDataService.ensureUserLoaded();
        this.loadDashboardInfo();
    }

    async loadDashboardInfo(): Promise<void> {
        this.generalDataService.loading.set(true);
        const httpResponse: HttpResponse<HttpResponseBody<DashboardInfo>> = await this.userApiService.getDashboardInfo();
        this.dashboardInfo.set(httpResponse.body?.data!);
        this.generalDataService.loading.set(false);
    }

    logout(): void {
        this.authDataService.deleteSession();
        void this.router.navigate(['/']);
    }
}
