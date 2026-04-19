import {Component,signal, inject} from '@angular/core';
import {AuthDataService} from '../../core/services/data/auth.data.service';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faStar, faHeart, faPlus, faArrowRight } from '@fortawesome/free-solid-svg-icons';

import { AuthApiService } from '../../core/services/api/auth.api.service';

@Component({
    selector: 'app-dashboard-page',
    imports: [FontAwesomeModule, RouterLink],
    templateUrl: './dashboard-page.html',
    styleUrl: './dashboard-page.scss',
})
export class DashboardPage {
    public authDataService: AuthDataService = inject(AuthDataService);
    private router = inject(Router);
    
    userName = signal<string | null>(this.authDataService.loggedInUser()?.name || null);

    public faStar = faStar;
    public faHeart = faHeart;
    public faPlus = faPlus;
    public faArrowRight = faArrowRight;

    logout(): void {
        this.authDataService.deleteSession();
        void this.router.navigate(['/']);
    }
}
