import { Routes } from '@angular/router';
import { MainLayout } from './shared/layouts/main-layout/main-layout';
import { AuthLayout } from './shared/layouts/auth-layout/auth-layout';
import { authenticatedGuard } from './core/guards/authenticated-guard';
import { guestGuard } from './core/guards/guest-guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/home-page/home-page').then(m => m.HomePage),
        canActivate: [guestGuard]
    },
    {
        path: 'app',
        component: MainLayout,
        children: [
            {
                path: 'dashboard',
                loadComponent: () => import('./pages/dashboard-page/dashboard-page').then(m => m.DashboardPage)
            },
            {
                path: 'map',
                loadComponent: () => import('./pages/map-page/map-page').then(m => m.MapPage)
            },
            { path: '', pathMatch: "full", redirectTo: 'dashboard' }
        ],
        canActivate: [authenticatedGuard]

    },
    {
        path: 'auth',
        component: AuthLayout,
        children: [
            {
                path: 'login',
                loadComponent: () => import('./pages/login-page/login-page').then(m => m.LoginPage)
            },
            {
                path: 'signin',
                loadComponent: () => import('./pages/signin-page/signup-page').then(m => m.SignupPage)
            },
            { path: '', pathMatch: "full", redirectTo: 'login' }
        ],
        canActivate: [guestGuard]
    },
    { path: "**", redirectTo: '' }
];
