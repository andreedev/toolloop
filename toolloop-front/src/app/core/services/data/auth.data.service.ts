import {inject, Injectable} from '@angular/core';
import {CookieService} from 'ngx-cookie-service';
import {Constants} from '../../constants/constants';
import {UserDataService} from './user.data.service';

@Injectable({
    providedIn: 'root',
})
export class AuthDataService {
    private cookieService: CookieService = inject(CookieService)
    private userDataService: any = inject(UserDataService);

    createSession(token: string): void{
        const expiresDate = new Date();
        expiresDate.setDate(expiresDate.getDate() + Constants.SESSION_COOKIE_EXPIRATION_DAYS);
        this.cookieService.set(Constants.SESSION_TOKEN_NAME, token, expiresDate, '/', undefined, true);
    }

    deleteSession(): void{
        console.log('Deleting session');
        this.cookieService.delete(Constants.SESSION_TOKEN_NAME, '/');
        this.userDataService.loggedInUser.set(null);
    }
}
