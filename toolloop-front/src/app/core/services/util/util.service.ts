import { Location } from '@angular/common';
import { inject, Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class UtilService {
    private location = inject(Location);

    public navigateBack() {
        this.location.back();
    }
}
