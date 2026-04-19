import {Component, inject} from '@angular/core';
import {AuthDataService} from '../../core/services/data/auth.data.service';
import {Router} from '@angular/router';

@Component({
    selector: 'app-dashboard-page',
    imports: [],
    templateUrl: './dashboard-page.html',
    styleUrl: './dashboard-page.scss',
})
export class DashboardPage {
    private authDataService: AuthDataService = inject(AuthDataService);
    private router = inject(Router);


    logout(): void {
        this.authDataService.deleteSession();
        void this.router.navigate(['/']);
    }
}
