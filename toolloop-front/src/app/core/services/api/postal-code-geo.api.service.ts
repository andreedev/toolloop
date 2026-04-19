import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { HttpResponseBody } from '../../models/dto/http-response-body';
import { Utils } from '../../helpers/utils';
import { first, firstValueFrom, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PostalCodeGeoApiService {
    private httpClient: HttpClient = inject(HttpClient);

    buscarCodigosPostales(query: string): Observable<HttpResponse<HttpResponseBody>> {
        const url = Utils.getApiEndpoint('postalCodeGeo/search') + `?query=${encodeURIComponent(query)}`;
        return this.httpClient.get<HttpResponseBody>(url, { observe: 'response' });
    }

}
