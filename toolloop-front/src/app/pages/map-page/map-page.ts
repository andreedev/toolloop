import { Component, ElementRef, computed, inject, OnDestroy, OnInit, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMagnifyingGlass, faSliders, faXmark, faStar, faHeart } from '@fortawesome/free-solid-svg-icons';
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
    faHeart = faHeart;

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
        const color = '#16a34a';

        const groups = new Map<string, ToolMapItem[]>();
        for (const tool of tools) {
            const key = `${tool.latitude},${tool.longitude}`;
            const list = groups.get(key);
            if (list) list.push(tool);
            else groups.set(key, [tool]);
        }

        for (const group of groups.values()) {
            const first = group[0];
            const count = group.length;

            const area = L.circle([first.latitude, first.longitude], {
                radius: 1000,
                color,
                weight: 1,
                fillColor: color,
                fillOpacity: 0.04,
                interactive: false,
            });

            const badge = count > 1
                ? `<div style="position:absolute;top:-6px;right:-8px;min-width:20px;height:20px;padding:0 5px;border-radius:9999px;background:#dc2626;color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-sizing:border-box;line-height:1;">${count}</div>`
                : '';
            const html = `<div style="position:relative;width:24px;height:24px;">
                <div style="width:24px;height:24px;border-radius:9999px;background:${color};border:2.5px solid #fff;box-sizing:border-box;box-shadow:0 1px 3px rgba(0,0,0,0.25);"></div>
                ${badge}
            </div>`;

            const icon = L.divIcon({
                html,
                className: '',
                iconSize: [24, 24],
                iconAnchor: [12, 12],
            });

            const marker = L.marker([first.latitude, first.longitude], { icon });
            marker.on('click', (e) => {
                L.DomEvent.stopPropagation(e);
                this.markerFilteredTools.set(group);
                this.selectedTool.set(group[0]);
                this.map?.panTo([first.latitude, first.longitude]);
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
