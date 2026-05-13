import { HttpClient, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, catchError, of } from 'rxjs';
import { Utils } from '../../helpers/utils';
import { HttpResponseBody } from '../../models/dto/http-response-body';
import { AuthApiService } from './auth.api.service';

@Injectable({
    providedIn: 'root',
})
export class NotificationApiService {
    
    private httpClient: HttpClient = inject(HttpClient);
    private authApiService: AuthApiService = inject(AuthApiService);

    async getNotifications(): Promise<HttpResponse<HttpResponseBody<Notification[]>> | HttpErrorResponse> {
        const url = Utils.getApiEndpoint(`notifications`);
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(this.httpClient.get<HttpResponseBody<Notification[]>>(url, { headers, observe: 'response' })
            .pipe(catchError(error => of(error))));
    }

    async markAsRead(notificationId: number): Promise<HttpResponse<HttpResponseBody> | HttpErrorResponse> {
        const url = Utils.getApiEndpoint(`notifications/${notificationId}/read`);
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(this.httpClient.post<HttpResponseBody>(url, null, { headers, observe: 'response' })
            .pipe(catchError(error => of(error))));
    }

    async markAllAsRead(): Promise<HttpResponse<HttpResponseBody> | HttpErrorResponse> {
        const url = Utils.getApiEndpoint(`notifications/mark-all-read`);
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(this.httpClient.post<HttpResponseBody>(url, null, { headers, observe: 'response' })
            .pipe(catchError(error => of(error))));
    }
}
