import { inject, Injectable } from '@angular/core';
import { Tool } from '../../models/entity/tool';
import { Rental } from '../../models/entity/rental';
import { AuthApiService } from './auth.api.service';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { firstValueFrom, catchError, of } from 'rxjs';
import { Utils } from '../../helpers/utils';
import { HttpResponseBody } from '../../models/dto/http-response-body';
import { GenericInitialRentalRequest } from '../../models/dto/generic-initial-rental-request';

@Injectable({
    providedIn: 'root',
})
export class RentalApiService {
    private httpClient: HttpClient = inject(HttpClient);
    private authApiService: AuthApiService = inject(AuthApiService);

    async getRentalPreview(request: GenericInitialRentalRequest): Promise<HttpResponse<HttpResponseBody<Rental>> | HttpErrorResponse> {
        const url = Utils.getApiEndpoint(`rental/preview`);
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(this.httpClient.post<HttpResponseBody<Rental>>(url, request, { headers, observe: 'response' })
            .pipe(catchError(error => of(error))));
    }

    async createRental(request: GenericInitialRentalRequest): Promise<HttpResponse<HttpResponseBody<Rental>> | HttpErrorResponse> {
        const url = Utils.getApiEndpoint(`rental/confirm`);
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(this.httpClient.post<HttpResponseBody<Rental>>(url, request, { headers, observe: 'response' })
            .pipe(catchError(error => of(error))));
    }

    async getRentalDetails(rentalId: number): Promise<HttpResponse<HttpResponseBody<Rental>> | HttpErrorResponse> {
        const url = Utils.getApiEndpoint(`rental/${rentalId}`);
        const headers = this.authApiService.getAuthHeaders();
        return firstValueFrom(this.httpClient.get<HttpResponseBody<Rental>>(url, { headers, observe: 'response' })
            .pipe(catchError(error => of(error))));
    }


}
