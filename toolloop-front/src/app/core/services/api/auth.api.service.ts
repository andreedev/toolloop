import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { HttpResponseBody } from '../../models/dto/http-response-body';
import { Utils } from '../../helpers/utils';
import { catchError, firstValueFrom, throwError } from 'rxjs';
import { User } from '../../models/entity/user';
import { Constants } from '../../constants/constants';

@Injectable({
    providedIn: 'root',
})
export class AuthApiService {
    // Servicio de Angular para hacer peticiones HTTP
    private httpClient: HttpClient = inject(HttpClient);

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
                Utils.getApiEndpoint('login'),
                request,
                {observe: 'response'}
            ).pipe(
                catchError(error => throwError(() => error))
            )
        )
    }

    async signin(user: User): Promise<HttpResponse<HttpResponseBody>> {
        const request = user;
        return firstValueFrom(
            this.httpClient.post<HttpResponseBody>(
                Utils.getApiEndpoint('signin'),
                request,
                {observe: 'response'}
            ).pipe(
                catchError(error => throwError(() => error))
            )
        )
    }

    async logout(): Promise<HttpResponse<HttpResponseBody>> {
        const headers = this.getAuthHeaders();
        return firstValueFrom(
            this.httpClient.get<HttpResponseBody>(
                Utils.getApiEndpoint('logout'),
                {
                    headers,
                    observe: 'response'
                }
            ).pipe(
                catchError(error => throwError(() => error))
            )
        )
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
