import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {faStar, faCalendar, faAward, faHouse, faWrench, faUser} from '@fortawesome/free-solid-svg-icons';
import { MessageService } from 'primeng/api';
import { RentalApiService } from '../../core/services/api/rental.api.service';
import { CategoryDataService } from '../../core/services/data/category.data.service';
import { UtilService } from '../../core/services/util/util.service';
import { UserApiService } from '../../core/services/api/user.api.service';
import { PublicProfileViewDTO } from '../../core/models/dto/public-profile-view-dto';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
    selector: 'app-public-profile-page',
    imports: [FontAwesomeModule],
    templateUrl: './public-profile-page.html',
    styleUrl: './public-profile-page.scss',
})
export class PublicProfilePage implements OnInit {
    public faStar = faStar;
    public faCalendar = faCalendar;
    public faAward = faAward;
    public faHouse = faHouse;
    public faWrench = faWrench;
    public faUser = faUser;

    private messageService = inject(MessageService);
    private router = inject(Router);
    private activatedRoute = inject(ActivatedRoute);
    protected utilService = inject(UtilService);
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
        try{
            const httpResponse = await this.userApiService.getPublicProfile(userId);
            if (httpResponse instanceof HttpErrorResponse){
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo cargar el perfil público' });
                return;
            }
            const publicProfileView = httpResponse.body?.data;
            this.publicProfileView.set(publicProfileView);
        } finally{
            this.isProfileLoading.set(false);
        }
        
    }
    
}
