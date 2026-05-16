import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class GeneralDataService {
    loading = signal<boolean>(false);
    isDarkMode = signal<boolean>(false);

    constructor() {
        const saved = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const dark = saved ? saved === 'dark' : prefersDark;
        this.isDarkMode.set(dark);
        this._applyClasses(dark);
    }

    toggleTheme(): void {
        const next = !this.isDarkMode();
        this.isDarkMode.set(next);
        localStorage.setItem('theme', next ? 'dark' : 'light');
        this._applyClasses(next);
    }

    private _applyClasses(dark: boolean): void {
        document.documentElement.classList.toggle('dark', dark);
        document.documentElement.classList.toggle('p-dark', dark);
    }
}
