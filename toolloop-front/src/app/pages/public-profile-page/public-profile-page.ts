import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCalendar, faEllipsisVertical, faHouse, faStar, faWrench, faBan, faLockOpen } from '@fortawesome/free-solid-svg-icons';
import { MessageService } from 'primeng/api';
import { PublicProfileViewDTO } from '../../core/models/dto/public-profile-view-dto';
import { UserApiService } from '../../core/services/api/user.api.service';
import { ReviewCard } from '../../shared/components/review-card/review-card';
import { TooltipModule } from 'primeng/tooltip';
import { GeneralDataService } from '../../core/services/data/general.data.service';

@Component({
    selector: 'app-public-profile-page',
    imports: [FontAwesomeModule, RouterLink, DatePipe, CurrencyPipe, DecimalPipe, ReviewCard, TooltipModule],
    templateUrl: './public-profile-page.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicProfilePage implements OnInit {
    public faStar = faStar;
    public faCalendar = faCalendar;
    public faHouse = faHouse;
    public faWrench = faWrench;
    public faEllipsisVertical = faEllipsisVertical;
    public faBan = faBan;
    public faLockOpen = faLockOpen;

    private messageService = inject(MessageService);
    private router = inject(Router);
    private activatedRoute = inject(ActivatedRoute);
    private userApiService = inject(UserApiService);
    private generalDataService = inject(GeneralDataService);

    public isProfileLoading = signal(true);
    public publicProfileView = signal<PublicProfileViewDTO | undefined>(undefined);
    public userId = signal<number | null>(null);


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
        this.userId.set(parseInt(userId));
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

    async blockUser(): Promise<void> {
        try {
            this.generalDataService.loading.set(true);
            const httpResponse = await this.userApiService.blockUser(this.userId()!);
            if (httpResponse instanceof HttpErrorResponse) {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo bloquear el usuario' });
                return;
            }
            this.publicProfileView.update(p => ({ ...p!, isBlockedByCurrentUser: true }));
            this.messageService.add({ severity: 'info', summary: 'Usuario bloqueado', detail: 'Has bloqueado a este usuario. Ya no podrá enviar mensajes ni realizar reservas contigo.' });
        } finally {
            this.generalDataService.loading.set(false);
        }
    }

    async unblockUser(): Promise<void> {
        try {
            this.generalDataService.loading.set(true);
            const httpResponse = await this.userApiService.unblockUser(this.userId()!);
            if (httpResponse instanceof HttpErrorResponse) {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo desbloquear el usuario' });
                return;
            }
            this.publicProfileView.update(p => ({ ...p!, isBlockedByCurrentUser: false }));
            this.messageService.add({ severity: 'info', summary: 'Usuario desbloqueado', detail: 'Has desbloqueado a este usuario. Ahora podrá enviar mensajes y realizar reservas contigo.' });
        } finally {
            this.generalDataService.loading.set(false);
        }
    }
}
