import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { HttpResponseBody } from '../../models/dto/http-response-body';
import { catchError, firstValueFrom, of } from 'rxjs';
import { Utils } from '../../helpers/utils';
import { AuthApiService } from './auth.api.service';

@Injectable({
    providedIn: 'root',
})
export class ToolFavoriteApiService {
    private httpClient: HttpClient = inject(HttpClient);
    private authApiService: AuthApiService = inject(AuthApiService);

    async toggleFavorite(toolId: number): Promise<HttpResponse<HttpResponseBody> | HttpErrorResponse> {
        const url = Utils.getApiEndpoint(`toolFavorite/${toolId}/toggle`);
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(this.httpClient.post<HttpResponseBody>(url, null, { headers, observe: 'response' })
            .pipe(catchError(error => of(error))));
    }
}
