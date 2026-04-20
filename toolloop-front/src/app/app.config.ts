import {ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import localeEs from '@angular/common/locales/es';
import {registerLocaleData} from '@angular/common';

registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes),
        { provide: LOCALE_ID, useValue: 'es' },
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
