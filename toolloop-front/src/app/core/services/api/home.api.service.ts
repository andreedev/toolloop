import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, catchError, of } from 'rxjs';
import { Utils } from '../../helpers/utils';
import { HttpResponseBody } from '../../models/dto/http-response-body';
import { FeaturedTool } from '../../models/dto/featured-tool';
import { AuthApiService } from './auth.api.service';

@Injectable({
    providedIn: 'root',
})
export class HomeApiService {
    private httpClient: HttpClient = inject(HttpClient);
    private authApiService: AuthApiService = inject(AuthApiService);

    async getFeaturedTools(): Promise<HttpResponse<HttpResponseBody<FeaturedTool[]>> | HttpErrorResponse> {
        const url = Utils.getApiEndpoint('home/featured-tools');
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(
            this.httpClient.get<HttpResponseBody<FeaturedTool[]>>(url, { observe: 'response', headers }).pipe(catchError(error => of(error))));
    }
}
