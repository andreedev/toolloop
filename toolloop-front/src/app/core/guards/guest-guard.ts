import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AppRoutes} from '../constants/app-routes';
import {AuthApiService} from '../services/api/auth.api.service';

export const guestGuard: CanActivateFn = async (route, state) => {
    const authService: AuthApiService = inject(AuthApiService);
    const router: Router = inject(Router);
    const isAuthenticated = await authService.checkUserIsAuthenticated();
    if (!isAuthenticated) {
        return true;
    }
    void router.navigate([AppRoutes.DASHBOARD_ROUTE_NAME]);
    return false;
};


