import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowRight, faHeart, faPlus, faStar } from '@fortawesome/free-solid-svg-icons';
import { AuthDataService } from '../../core/services/data/auth.data.service';

import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { DashboardInfo } from '../../core/models/dto/dashboard-info';
import { HttpResponseBody } from '../../core/models/dto/http-response-body';
import { UserApiService } from '../../core/services/api/user.api.service';
import { GeneralDataService } from '../../core/services/data/general.data.service';
import { UserDataService } from '../../core/services/data/user.data.service';

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
}
