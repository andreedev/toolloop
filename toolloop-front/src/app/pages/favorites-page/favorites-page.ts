import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHeart, faStar, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ToolFavoriteApiService } from '../../core/services/api/tool-favorite.api.service';
import { ToolFavorite } from '../../core/models/entity/tool-favorite';
import { HttpResponseBody } from '../../core/models/dto/http-response-body';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-favorites-page',
    imports: [FontAwesomeModule, RouterLink, CommonModule],
    templateUrl: './favorites-page.html',
    styleUrl: './favorites-page.scss',
})
export class FavoritesPage {
    public faHeart = faHeart;
    public faStar = faStar;
    public faLocationDot = faLocationDot;

    private toolFavoriteApiService = inject(ToolFavoriteApiService);

    public favorites = signal<ToolFavorite[]>([]);
    public loading = signal(true);

    constructor() {
        this.loadFavorites();
    }

    async loadFavorites(): Promise<void> {
        this.loading.set(true);
        const response: HttpResponse<HttpResponseBody<ToolFavorite[]>> | HttpErrorResponse =
            await this.toolFavoriteApiService.listFavoriteTools();
        if (response instanceof HttpResponse) {
            this.favorites.set(response.body?.data ?? []);
        }
        this.loading.set(false);
    }

    async toggleFavorite(toolId: number): Promise<void> {
        await this.toolFavoriteApiService.toggleFavorite(toolId);
        await this.loadFavorites();
    }
}
