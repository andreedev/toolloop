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
            { path: '', pathMatch: "full", redirectTo: 'dashboard' },
            {
                path: 'myTools',
                loadComponent: () => import('./pages/my-tools-page/my-tools-page').then(m => m.MyToolsPage)
            },
            { path: '', pathMatch: "full", redirectTo: 'myTools' },
            {
                path: 'myRentals',
                loadComponent: () => import('./pages/my-rentals-page/my-rentals-page').then(m => m.MyRentalsPage)
            },
            { path: '', pathMatch: "full", redirectTo: 'myRentals' },
            {
                path: 'toolDetails/:id',
                loadComponent: () => import('./pages/tool-details-page/tool-details-page').then(m => m.ToolDetailsPage)
            },
            { path: '', pathMatch: "full", redirectTo: 'toolDetails' },
            {
                path: 'favorites',
                loadComponent: () => import('./pages/favorites-page/favorites-page').then(m => m.FavoritesPage)
            },
            {
                path: '', pathMatch: "full", redirectTo: 'favorites'
            },
            {
                path: 'addTool',
                loadComponent: () => import('./pages/add-tool-page/add-tool-page').then(m => m.AddToolPage)
            },{
                path: '', pathMatch: "full", redirectTo: 'addTool'
            }
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
                path: 'signup',
                loadComponent: () => import('./pages/signin-page/signup-page').then(m => m.SignupPage)
            },
            { path: '', pathMatch: "full", redirectTo: 'login' }
        ],
        canActivate: [guestGuard]
    },
    { path: "**", redirectTo: '' }
];
