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
import { ToolFavoriteDataService } from '../../core/services/data/tool-favorite.data.service';
import { MapStateDataService } from '../../core/services/data/map-state.data.service';
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
    private toolFavoriteDataService = inject(ToolFavoriteDataService);
    private mapStateService = inject(MapStateDataService);
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
    maxPrice = 200;

    private searchTimeout: ReturnType<typeof setTimeout> | null = null;
    private moveTimeout: ReturnType<typeof setTimeout> | null = null;
    private suppressNextMoveEnd = false;
    private map: L.Map | null = null;
    private resizeObserver: ResizeObserver | null = null;
    mapEl = viewChild<ElementRef<HTMLElement>>('mapEl');

    mapOptions: L.MapOptions = {
        layers: [
            L.tileLayer('https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
                maxZoom: 20,
                subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
                attribution: '&copy; Google Maps',
            }),
        ],
        zoom: 14,
        center: L.latLng(40.416775, -3.70379),
    };

    ngOnInit(): void {}

    ngOnDestroy(): void {
        if (this.searchTimeout) clearTimeout(this.searchTimeout);
        if (this.moveTimeout) clearTimeout(this.moveTimeout);
        this.resizeObserver?.disconnect();
    }

    onMapReady(map: L.Map): void {
        this.map = map;
        map.on('click', () => {
            this.markerFilteredTools.set(null);
            this.selectedTool.set(null);
        });
        map.on('moveend', () => {
            const c = map.getCenter();
            this.mapStateService.save(c.lat, c.lng, map.getZoom());
            if (this.suppressNextMoveEnd) {
                this.suppressNextMoveEnd = false;
                return;
            }
            if (this.moveTimeout) clearTimeout(this.moveTimeout);
            this.moveTimeout = setTimeout(() => this.loadTools(), 400);
        });
        const el = this.mapEl()?.nativeElement;
        if (el) {
            this.resizeObserver = new ResizeObserver(() => {
                map.invalidateSize();
            });
            this.resizeObserver.observe(el);
        }
        const saved = this.mapStateService.viewState();
        if (saved) {
            this.suppressNextMoveEnd = true;
            map.setView([saved.centerLat, saved.centerLng], saved.zoom);
        }
        this.loadTools();
    }

    async loadTools(): Promise<void> {
        this.markerFilteredTools.set(null);
        this.loading.set(true);
        const bounds = this.map?.getBounds();
        const response = await this.toolApiService.getToolsForMap({
            name: this.searchName || undefined,
            categoryId: this.selectedCategoryId ?? undefined,
            maxPricePerDay: this.maxPrice,
            boundNorth: bounds?.getNorth(),
            boundSouth: bounds?.getSouth(),
            boundEast: bounds?.getEast(),
            boundWest: bounds?.getWest(),
        });
        this.loading.set(false);
        if (response instanceof HttpErrorResponse) return;

        const tools = response.body?.data ?? [];
        this.tools.set(tools);
        this.buildLayers(tools);
    }

    private buildLayers(tools: ToolMapItem[]): void {
        const newLayers: L.Layer[] = [];
        const color = '#06b6d4';

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

            const inner = count > 1
                ? `<div class="w-10 h-10 rounded-full border-[2.5px] border-white box-border shadow-[0_1px_3px_rgba(0,0,0,0.25)] bg-cyan-500/70 text-white text-[14px] font-bold flex items-center justify-center leading-none">
                        ${count}
                    </div>`
                : first.category?.iconKey
                    ? `<div class="w-10 h-10 rounded-full border-[2.5px] border-white box-border shadow-[0_1px_3px_rgba(0,0,0,0.25)] bg-cyan-100/70 flex items-center justify-center overflow-hidden">
                            <img src="${first.category.iconKey}" alt="" class="w-6 h-6 object-contain" />
                        </div>`
                    : `<div class="w-10 h-10 rounded-full border-[2.5px] border-white box-border shadow-[0_1px_3px_rgba(0,0,0,0.25)]" style="background: ${color};"></div>`;

            const html = `<div class="relative w-10 h-10">${inner}</div>`;

            const icon = L.divIcon({
                html,
                className: '',
                iconSize: [40, 40],
                iconAnchor: [20, 20],
            });

            const marker = L.marker([first.latitude, first.longitude], { icon });
            marker.on('click', (e) => {
                L.DomEvent.stopPropagation(e);
                this.markerFilteredTools.set(group);
                this.selectedTool.set(group[0]);
                this.suppressNextMoveEnd = true;
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
        this.suppressNextMoveEnd = true;
        this.map?.setView([tool.latitude, tool.longitude], 14);
    }

    async toggleFavorite(tool: ToolMapItem, event: MouseEvent): Promise<void> {
        event.stopPropagation();
        this.toolFavoriteDataService.toggleFavorite(tool.toolId);
        tool.isFavorited = !tool.isFavorited;
    }

    applyFilters(): void {
        this.filtersOpen.set(false);
        this.loadTools();
    }


}
