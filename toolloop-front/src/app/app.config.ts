import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';


export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes),
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
