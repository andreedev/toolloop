import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faStar, faCalendar, faHouse, faWrench } from '@fortawesome/free-solid-svg-icons';
import { HttpErrorResponse } from '@angular/common/http';
import { MessageService } from 'primeng/api';
import { UserApiService } from '../../core/services/api/user.api.service';
import { PublicProfileViewDTO } from '../../core/models/dto/public-profile-view-dto';
import { ReviewCard } from '../../shared/components/review-card/review-card';

@Component({
    selector: 'app-public-profile-page',
    imports: [FontAwesomeModule, RouterLink, DatePipe, CurrencyPipe, DecimalPipe, ReviewCard],
    templateUrl: './public-profile-page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicProfilePage implements OnInit {
    public faStar = faStar;
    public faCalendar = faCalendar;
    public faHouse = faHouse;
    public faWrench = faWrench;

    private messageService = inject(MessageService);
    private router = inject(Router);
    private activatedRoute = inject(ActivatedRoute);
    private userApiService = inject(UserApiService);

    public isProfileLoading = signal(true);
    public publicProfileView = signal<PublicProfileViewDTO | undefined>(undefined);

    ngOnInit(): void {
        this.loadPublicProfile();
    }

    async loadPublicProfile(): Promise<void> {
        const userId = this.activatedRoute.snapshot.paramMap.get('id');
        if (!userId) {
            this.isProfileLoading.set(false);
            void this.router.navigate(['/tools']);
            return;
        }
        try {
            const httpResponse = await this.userApiService.getPublicProfile(userId);
            if (httpResponse instanceof HttpErrorResponse) {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el perfil público' });
                return;
            }
            this.publicProfileView.set(httpResponse.body?.data);
        } finally {
            this.isProfileLoading.set(false);
        }
    }
}
