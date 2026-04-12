import {CanActivateFn, Router} from '@angular/router';
import {inject} from '@angular/core';
import {AppRoutes} from '../constants/app-routes';

export const guestGuard: CanActivateFn = async (route, state) => {
  const router: Router = inject(Router);
  // TODO: Crear la lógica de validacion si está autenticado o no
  const isAuthenticated = true;
  if (!isAuthenticated) {
    return true;
  }
  void router.navigate([AppRoutes.DASHBOARD_ROUTE_NAME]);
  return false;
};


