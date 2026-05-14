import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, firstValueFrom, of } from 'rxjs';
import { Utils } from '../../helpers/utils';
import { HttpResponseBody } from '../../models/dto/http-response-body';
import { Review } from '../../models/entity/review';
import { AuthApiService } from './auth.api.service';

@Injectable({
    providedIn: 'root',
})
export class ReviewApiService {
    private httpClient: HttpClient = inject(HttpClient);
    private authApiService: AuthApiService = inject(AuthApiService);

    async getReviewContext(rentalId: number): Promise<HttpResponse<HttpResponseBody<Review>> | HttpErrorResponse> {
        const url = Utils.getApiEndpoint(`review/context/${rentalId}`);
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(this.httpClient.get<HttpResponseBody<Review>>(url, { headers, observe: 'response' })
            .pipe(catchError(error => of(error))));
    }

    async submitReview(reviewData: Review): Promise<HttpResponse<HttpResponseBody<any>> | HttpErrorResponse> {
        const url = Utils.getApiEndpoint('review');
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(this.httpClient.post<HttpResponseBody<any>>(url, reviewData, { headers, observe: 'response' })
            .pipe(catchError(error => of(error))));
    }
}
