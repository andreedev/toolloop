import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { HttpResponseBody } from '../../models/dto/http-response-body';
import { Utils } from '../../helpers/utils';
import { catchError, firstValueFrom, throwError } from 'rxjs';

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
        const body = {
            email: email,
            password: password,
        };

        return firstValueFrom(
            this.httpClient.post<HttpResponseBody>(
                Utils.getApiEndpoint('login'),
                body,
                {observe: 'response'}
            ).pipe(
                catchError(error => throwError(() => error))
            )
        )
    }

    async signin()
}
