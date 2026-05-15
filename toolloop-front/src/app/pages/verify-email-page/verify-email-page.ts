import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEnvelope, faCircleCheck, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { AuthApiService } from '../../core/services/api/auth.api.service';
import { HttpErrorResponse } from '@angular/common/http';

type VerifyState = 'waiting' | 'loading' | 'success' | 'error';

@Component({
    selector: 'app-verify-email-page',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, FontAwesomeModule, RouterLink],
    templateUrl: './verify-email-page.html',
})
export class VerifyEmailPage implements OnInit {
    faEnvelope = faEnvelope;
    faCircleCheck = faCircleCheck;
    faCircleXmark = faCircleXmark;

    state = signal<VerifyState>('waiting');
    errorMessage = signal<string>('El enlace es inválido o ha expirado');

    private route = inject(ActivatedRoute);
    private authApiService = inject(AuthApiService);

    async ngOnInit(): Promise<void> {
        const token = this.route.snapshot.queryParams['token'];
        if (!token) {
            this.state.set('waiting');
            return;
        }
        this.state.set('loading');
        const response = await this.authApiService.verifyEmail(token);
        if (response instanceof HttpErrorResponse) {
            const msg = response.error?.message;
            if (msg) this.errorMessage.set(msg);
            this.state.set('error');
            return;
        }
        this.state.set('success');
    }
}
