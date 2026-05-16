import { inject, Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class GeneralDataService {
    loading = signal<boolean>(false);
    isDarkMode = signal<boolean>(false);
}
