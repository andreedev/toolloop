import { Injectable, signal } from '@angular/core';
import { Constants } from '../../constants/constants';

@Injectable({
    providedIn: 'root',
})
export class ViewportService {
    public readonly isMobile = signal<boolean>(this.computeIsMobile());

    constructor() {
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', this.onResize, { passive: true });
        }
    }

    private readonly onResize = () => {
        this.isMobile.set(this.computeIsMobile());
    };

    private computeIsMobile(): boolean {
        return typeof window !== 'undefined' && window.innerWidth < Constants.MOBILE_BREAKPOINT_PX;
    }
}
