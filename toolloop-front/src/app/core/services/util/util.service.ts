import { Location } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class UtilService {
    private router = inject(Router);
    private location = inject(Location);

    public navigateBack() {
        this.location.back();
    }
}
