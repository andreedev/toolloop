import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { HttpResponseBody } from '../../models/dto/http-response-body';
import { Utils } from '../../helpers/utils';
import {firstValueFrom} from 'rxjs';
import {AuthApiService} from './auth.api.service';

@Injectable({
    providedIn: 'root',
})
export class UserApiService {
    private httpClient: HttpClient = inject(HttpClient);
    private authApiService: AuthApiService = inject(AuthApiService);

    async getUserInfo(): Promise<HttpResponse<HttpResponseBody>> {
        const url = Utils.getApiEndpoint('user');
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(this.httpClient.get<HttpResponseBody>(url, { observe: 'response', headers }));
    }

    async getDashboardInfo(): Promise<HttpResponse<HttpResponseBody>> {
        const url = Utils.getApiEndpoint('user/dashboardInfo');
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(this.httpClient.get<HttpResponseBody>(url, { observe: 'response', headers }));
    }

}
