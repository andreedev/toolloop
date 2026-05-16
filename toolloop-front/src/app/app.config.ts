import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding, withViewTransitions } from '@angular/router';

import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import Aura from '@primeuix/themes/aura';
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';

registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes,  withViewTransitions(), withComponentInputBinding()),
        { provide: LOCALE_ID, useValue: 'es' },
        provideZonelessChangeDetection(),
        MessageService,
        providePrimeNG({
            theme: {
                preset: Aura,
                options: {
                    darkModeSelector: '.p-dark'
                }
            },
            translation: {
                emptySearchMessage: 'No se encontraron resultados',
                emptyFilterMessage: 'No se encontraron resultados',
                emptyMessage: 'No se encontraron resultados'
            }
        })
    ]
};
