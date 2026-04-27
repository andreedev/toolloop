import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import { Constants } from '../../constants/constants';
import { Utils } from '../../helpers/utils';
import { HttpResponseBody } from '../../models/dto/http-response-body';
import { User } from '../../models/entity/user';
import { GeneralDataService } from '../data/general.data.service';

@Injectable({
    providedIn: 'root',
})
export class AuthApiService {
    // Servicio de Angular para hacer peticiones HTTP
    private httpClient: HttpClient = inject(HttpClient);
    private generalDataService: GeneralDataService = inject(GeneralDataService);

    // Librería para manejar cookies, tiene métodos:
    // set: crea una cookie con un nombre, valor y fecha de expiración
    // get: obtiene el valor de una cookie por su nombre
    // delete: elimina una cookie
    // check: si existe una cookie
    private cookieService: CookieService = inject(CookieService);

    async login(email: string, password: string): Promise<HttpResponse<HttpResponseBody>> {
        const request = {
            email: email,
            password: password,
        };

        return firstValueFrom(
            this.httpClient.post<HttpResponseBody>(
                Utils.getApiEndpoint('auth/login'),
                request,
                {observe: 'response'}
            ).pipe(
                catchError(error => of(error))
            )
        )
    }

    async signup(user: User): Promise<HttpResponse<HttpResponseBody>> {
        const request = user;
        return firstValueFrom(
            this.httpClient.post<HttpResponseBody>(
                Utils.getApiEndpoint('auth/signup'),
                request,
                {observe: 'response'}
            ).pipe(
                catchError(error => of(error))
            )
        )
    }

    async logout(): Promise<HttpResponse<HttpResponseBody>> {
        const headers = this.getAuthHeaders();
        return firstValueFrom(
            this.httpClient.get<HttpResponseBody>(
                Utils.getApiEndpoint('auth/logout'),
                {
                    headers,
                    observe: 'response'
                }
            ).pipe(
                catchError(error => of(error))
            )
        )
    }

    async checkUserIsAuthenticated(): Promise<boolean> {
        if (!this.cookieService.check(Constants.SESSION_TOKEN_NAME)) {
            return false;
        }

        this.generalDataService.loading.set(true);
        const response = await firstValueFrom(
            this.httpClient.get(Utils.getApiEndpoint('auth/checkSession'), {
                headers: this.getAuthHeaders(),
                observe: 'response'
            }).pipe(
                map(response => response.status === 200),
                catchError(() => of(false))
            )
        );
        this.generalDataService.loading.set(false);
        return response;
    }

    getSessionToken(): string {
        return this.cookieService.get(Constants.SESSION_TOKEN_NAME);
    }

    getAuthHeaders(): HttpHeaders {
        return new HttpHeaders()
            .set('Authorization', `Bearer ${this.getSessionToken()}`)
            .set('Content-Type', 'application/json')
    }
}
