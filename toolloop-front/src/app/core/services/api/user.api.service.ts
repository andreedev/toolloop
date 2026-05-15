import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, firstValueFrom, of } from 'rxjs';
import { Utils } from '../../helpers/utils';
import { HttpResponseBody } from '../../models/dto/http-response-body';
import { PublicProfileViewDTO } from '../../models/dto/public-profile-view-dto';
import { UserNotificationConfig } from '../../models/entity/user-notification-config';
import { AuthApiService } from './auth.api.service';

@Injectable({
    providedIn: 'root',
})
export class UserApiService {
    private httpClient: HttpClient = inject(HttpClient);
    private authApiService: AuthApiService = inject(AuthApiService);

    async getUserInfo(): Promise<HttpResponse<HttpResponseBody>> {
        const url = Utils.getApiEndpoint('user');
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(this.httpClient.get<HttpResponseBody>(url, { observe: 'response', headers }).pipe(catchError(error => of(error))));
    }

    async getDashboardInfo(): Promise<HttpResponse<HttpResponseBody>> {
        const url = Utils.getApiEndpoint('user/dashboard-info');
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(this.httpClient.get<HttpResponseBody>(url, { observe: 'response', headers }).pipe(catchError(error => of(error))));
    }

    async getPublicProfile(userId: string): Promise<HttpResponse<HttpResponseBody<PublicProfileViewDTO>>> {
        const url = Utils.getApiEndpoint(`user/${userId}/public-profile`);
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(this.httpClient.get<HttpResponseBody<PublicProfileViewDTO>>(url, { observe: 'response', headers }).pipe(catchError(error => of(error))));
    }

    async updateNotificationConfig(config: UserNotificationConfig): Promise<HttpResponse<HttpResponseBody>> {
        const url = Utils.getApiEndpoint('user/notification-config');
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(this.httpClient.put<HttpResponseBody>(url, config, { observe: 'response', headers }).pipe(catchError(error => of(error))));
    }

}
