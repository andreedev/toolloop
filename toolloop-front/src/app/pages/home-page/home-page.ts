import { HttpResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowRight, faDollarSign, faHashtag, faHeart, faLeaf, faLocationDot, faShield, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FeaturedTool } from '../../core/models/dto/featured-tool';
import { HomeApiService } from '../../core/services/api/home.api.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-home-page',
    imports: [RouterLink, FontAwesomeModule, CommonModule],
    templateUrl: './home-page.html',
    styleUrl: './home-page.scss',
})
export class HomePage implements OnInit {
    faLeaf = faLeaf;
    faArrowRight = faArrowRight;
    faLocationDot = faLocationDot;
    faDollarSign = faDollarSign;
    faUsers = faUsers;
    faHashtag = faHashtag;
    faHeart = faHeart;
    faShield = faShield;
    
    private homeApiService = inject(HomeApiService);
    featuredTools = signal<FeaturedTool[]>([]);

    async ngOnInit() {
        const httpResponse = await this.homeApiService.getFeaturedTools();
        if (httpResponse instanceof HttpResponse && httpResponse.body) {
            this.featuredTools.set(httpResponse.body.data);
        } else {
            console.error('Error fetching featured tools:', httpResponse);
        }
    }
}
