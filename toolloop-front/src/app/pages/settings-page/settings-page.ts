import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthDataService } from '../../core/services/data/auth.data.service';
import { UserDataService } from '../../core/services/data/user.data.service';
import { GeneralDataService } from '../../core/services/data/general.data.service';
import { Router } from '@angular/router';
import { UserApiService } from '../../core/services/api/user.api.service';
import { AuthApiService } from '../../core/services/api/auth.api.service';
import { HttpErrorResponse } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCamera, faUser, faEnvelope, faLocationDot, faLock, faBell, faTrashCan, faArrowRightFromBracket, faAngleRight, faUserClock, faHeart, faPen, faCheck } from "@fortawesome/free-solid-svg-icons";
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UserNotificationConfig } from '../../core/models/entity/user-notification-config';
import { MessageService } from 'primeng/api';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-settings-page',
    imports: [ReactiveFormsModule, FontAwesomeModule, ToggleSwitchModule, RouterLink, CommonModule, FormsModule, TooltipModule],
    templateUrl: './settings-page.html',
    styleUrl: './settings-page.scss',
})
export class SettingsPage implements OnInit {
    public faCamera = faCamera;
    public faUser = faUser;
    public faEnvelope = faEnvelope;
    public faLocationDot = faLocationDot
    public faLock = faLock;
    public faBell = faBell
    public faTrashCan = faTrashCan;
    public faArrowRightFromBracket = faArrowRightFromBracket;
    public faAngleRight = faAngleRight;
    public faUserClock = faUserClock;
    public faHeart = faHeart;
    public faPen = faPen;
    public faCheck = faCheck;

    public authDataService: AuthDataService = inject(AuthDataService);
    private userApiService: UserApiService = inject(UserApiService);
    public userDataService = inject(UserDataService);
    public generalDataService = inject(GeneralDataService);
    private router = inject(Router);
    private messageService = inject(MessageService);
    private authApiService = inject(AuthApiService);

    sendingVerification = signal(false);

    public availabilityDescriptionForm: FormGroup;
    editingAvailability = signal(false);

    constructor(private fb: FormBuilder) {
        this.availabilityDescriptionForm = this.fb.group({
            availabilityDescription:[''],
        });
    }

    ngOnInit(): void {
        this.userDataService.ensureUserLoaded().then(user => {
            if (user && user.availabilityDescription) {
                this.availabilityDescriptionForm.patchValue({ availabilityDescription: user.availabilityDescription });
            }
        });
    }

    logout(): void {
        this.authDataService.deleteSession();
        void this.router.navigate(['/']);
    }

    openDeleteAccountDialog(): void {
    }

    async sendVerificationEmail(): Promise<void> {
        this.sendingVerification.set(true);
        const response = await this.authApiService.sendVerificationEmail();
        this.sendingVerification.set(false);
        if (response instanceof HttpErrorResponse) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo enviar el email. Inténtalo de nuevo.' });
        } else {
            this.messageService.add({ severity: 'success', summary: 'Email enviado', detail: 'Revisa tu bandeja de entrada y haz clic en el enlace.' });
        }
    }

    updateNotifConfig(field: keyof UserNotificationConfig, value: boolean): void {
        const user = this.userDataService.loggedInUser();
        if (!user?.userNotificationConfig) return;
        const updated: UserNotificationConfig = { ...user.userNotificationConfig, [field]: value };
        this.userDataService.loggedInUser.update(u => u ? { ...u, userNotificationConfig: updated } : u);
        void this.userApiService.updateNotificationConfig(updated);
        this.messageService.add({ severity: 'success', summary: 'Configuración actualizada', detail: 'Tus preferencias de notificaciones han sido actualizadas.' });
    }

    async saveAvailabilityDescription(): Promise<void> {
        if (this.availabilityDescriptionForm.valid) {
            const description = this.availabilityDescriptionForm.value.availabilityDescription;
            const user = this.userDataService.loggedInUser();
            if (user) {
                const updatedUser = { ...user, availabilityDescription: description };
                this.userDataService.loggedInUser.set(updatedUser);
                void this.userApiService.updateAvailabilityDescription(description);
                this.editingAvailability.set(false);
                this.messageService.add({ severity: 'success', summary: 'Disponibilidad actualizada', detail: 'Tu descripción de disponibilidad ha sido actualizada.' });
            }
        }
    }

}
