import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHeart, faStar, faLocationDot } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-favorites-page',
    imports: [FontAwesomeModule, RouterLink],
    templateUrl: './favorites-page.html',
    styleUrl: './favorites-page.scss',
})
export class FavoritesPage {
    public faHeart = faHeart;
    public faStar = faStar;
    public faLocationDot = faLocationDot;
}
