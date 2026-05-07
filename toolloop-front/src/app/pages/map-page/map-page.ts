import { Component, ElementRef, computed, inject, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlass, faSliders, faXmark, faStar } from '@fortawesome/free-solid-svg-icons';
import { HttpErrorResponse } from '@angular/common/http';
import { DecimalPipe } from '@angular/common';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import * as L from 'leaflet';
import { ToolApiService } from '../../core/services/api/tool.api.service';
import { CategoryDataService } from '../../core/services/data/category.data.service';
import { ToolMapItem } from '../../core/models/dto/tool-map-item';
import { Utils } from '../../core/helpers/utils';

@Component({
    selector: 'app-map-page',
    imports: [LeafletModule, FormsModule, RouterLink, FontAwesomeModule, DecimalPipe],
    templateUrl: './map-page.html',
    styleUrl: './map-page.scss',
})
export class MapPage implements OnInit, OnDestroy {
    private toolApiService = inject(ToolApiService);
    public categoryDataService = inject(CategoryDataService);
    protected readonly utils = Utils;

    faMagnifyingGlass = faMagnifyingGlass;
    faSliders = faSliders;
    faXmark = faXmark;
    faStar = faStar;

    tools = signal<ToolMapItem[]>([]);
    markerFilteredTools = signal<ToolMapItem[] | null>(null);
    displayedTools = computed(() => this.markerFilteredTools() ?? this.tools());
    layers = signal<L.Layer[]>([]);
    selectedTool = signal<ToolMapItem | null>(null);
    loading = signal(false);
    filtersOpen = signal(false);

    searchName = '';
    selectedCategoryId: number | null = null;
    maxPrice = 100;

    private searchTimeout: ReturnType<typeof setTimeout> | null = null;
    private map: L.Map | null = null;
    private resizeObserver: ResizeObserver | null = null;
    mapEl = viewChild<ElementRef<HTMLElement>>('mapEl');

    mapOptions: L.MapOptions = {
        layers: [
            L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 18,
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            }),
        ],
        zoom: 14,
        center: L.latLng(40.416775, -3.70379),
    };

    ngOnInit(): void {
        this.loadTools();
    }

    ngOnDestroy(): void {
        if (this.searchTimeout) clearTimeout(this.searchTimeout);
        this.resizeObserver?.disconnect();
    }

    onMapReady(map: L.Map): void {
        this.map = map;
        map.on('click', () => {
            this.markerFilteredTools.set(null);
            this.selectedTool.set(null);
        });
        const el = this.mapEl()?.nativeElement;
        if (!el) return;
        this.resizeObserver = new ResizeObserver(() => {
            map.invalidateSize();
        });
        this.resizeObserver.observe(el);
    }

    async loadTools(): Promise<void> {
        this.markerFilteredTools.set(null);
        this.loading.set(true);
        const response = await this.toolApiService.getToolsForMap({
            name: this.searchName || undefined,
            categoryId: this.selectedCategoryId ?? undefined,
            maxPricePerDay: this.maxPrice,
        });
        this.loading.set(false);
        if (response instanceof HttpErrorResponse) return;

        const tools = response.body?.data ?? [];
        this.tools.set(tools);
        this.buildLayers(tools);
    }

    private buildLayers(tools: ToolMapItem[]): void {
        const newLayers: L.Layer[] = [];
        for (const tool of tools) {
            const color =  '#16a34a';
            const area = L.circle([tool.latitude, tool.longitude], {
                radius: 1000,
                color,
                weight: 1,
                fillColor: color,
                fillOpacity: 0.04,
                interactive: false,
            });
            const marker = L.circleMarker([tool.latitude, tool.longitude], {
                radius: 12,
                fillColor: color,
                color: '#ffffff',
                weight: 2.5,
                fillOpacity: 1,
            });
            marker.on('click', (e) => {
                L.DomEvent.stopPropagation(e);
                const sameLocation = tools.filter(
                    t => t.latitude === tool.latitude && t.longitude === tool.longitude
                );
                this.markerFilteredTools.set(sameLocation);
                this.selectedTool.set(sameLocation[0]);
                this.map?.panTo([tool.latitude, tool.longitude]);
            });
            newLayers.push(area, marker);
        }
        this.layers.set(newLayers);
    }

    selectCategory(id: number | null): void {
        this.selectedCategoryId = id;
        this.loadTools();
    }

    onSearchInput(): void {
        if (this.searchTimeout) clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => this.loadTools(), 500);
    }

    onPriceChange(): void {
        this.loadTools();
    }

    closePopup(): void {
        this.selectedTool.set(null);
    }

    focusTool(tool: ToolMapItem): void {
        this.selectedTool.set(tool);
        this.map?.setView([tool.latitude, tool.longitude], 14);
    }

    applyFilters(): void {
        this.filtersOpen.set(false);
        this.loadTools();
    }


}
