import { Injectable, signal } from '@angular/core';

export interface MapViewState {
    centerLat: number;
    centerLng: number;
    zoom: number;
}

@Injectable({
    providedIn: 'root',
})
export class MapStateDataService {
    public viewState = signal<MapViewState | null>(null);

    public save(centerLat: number, centerLng: number, zoom: number): void {
        this.viewState.set({ centerLat, centerLng, zoom });
    }
}
