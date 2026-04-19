import {Component, inject} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faArrowLeft, faUpload, faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FullLogo } from '../../shared/components/full-logo/full-logo';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {AuthApiService} from '../../core/services/api/auth.api.service';
import {HttpErrorResponse, HttpResponse} from '@angular/common/http';
import {HttpResponseBody} from '../../core/models/dto/http-response-body';
import {AuthDataService} from '../../core/services/data/auth.data.service';
import {GeneralDataService} from '../../core/services/data/general.data.service';

@Component({
    selector: 'app-login-page',
    imports: [FontAwesomeModule, FullLogo, RouterLink, ReactiveFormsModule],
    templateUrl: './login-page.html',
    styleUrl: './login-page.scss',
})
export class LoginPage {
    public faCheckCircle = faCheckCircle;
    public faArrowLeft = faArrowLeft;
    public faUpload = faUpload;
    public faEnvelope = faEnvelope;
    public faLock = faLock;
    public faEye = faEye;
    public faEyeSlash = faEyeSlash;

    public form: FormGroup;
    public showPassword = false;
    public loginErrorMessage: string | null = null;

    private authApiService = inject(AuthApiService);
    private authDataService = inject(AuthDataService);
    private generalDataService = inject(GeneralDataService);
    private router = inject(Router);

    constructor(private fb: FormBuilder) {
        this.form = this.fb.group({
            email:    ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required]],
        });
    }

    showError(field: string): boolean {
        const c = this.form.get(field);
        return !!c && c.invalid && c.touched && c.dirty && this.getError(field) !== null;
    }

    getError(field: string): string | null {
        const c = this.form.get(field);
        if (!c?.errors) return null;
        if (c.errors['required'])         return 'Este campo es obligatorio';
        if (c.errors['email'])            return 'El email no es válido';
        if (c.errors['minlength'])        return `Mínimo ${c.errors['minlength'].requiredLength} caracteres`;
        return null;
    }

    borderClass(field: string): string {
        const c = this.form.get(field);
        if (!c || (!c.touched && !c.dirty)) return 'border-gray-200 focus-within:border-green-300';
        if (c.invalid && c.touched && c.dirty) return 'border-red-400 focus-within:border-red-400';
        if (c.valid)                           return 'border-green-400 focus-within:border-green-400';
        return 'border-gray-200 focus-within:border-green-300';
    }

    async onSubmit(): Promise<void> {
        this.loginErrorMessage = null;
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        try {
            this.generalDataService.loading.set(true);
            const httpResponse: HttpResponse<HttpResponseBody> = await this.authApiService.login(this.form.value.email, this.form.value.password);
            this.generalDataService.loading.set(false);
            if (httpResponse.status === 401) {
                this.applyInvalidCredentialsError(httpResponse.body?.message ?? null);
                return;
            }
            // login exitoso
            const data = httpResponse.body?.data;
            this.authDataService.createSession(data.sessionToken);
            void this.router.navigate(['/app/dashboard']);
        } catch (error: unknown) {
            if (error instanceof HttpErrorResponse && error.status === 401) {
                this.applyInvalidCredentialsError(this.getBackendErrorMessage(error));
                return;
            }
            throw error;
        }
    }

    clearLoginError(): void {
        if (!this.loginErrorMessage) return;
        this.loginErrorMessage = null;
        this.clearInvalidCredentialsError('email');
        this.clearInvalidCredentialsError('password');
    }

    private applyInvalidCredentialsError(message: string | null): void {
        this.loginErrorMessage = message ?? 'Credenciales inválidas';
        this.form.get('password')?.setErrors({invalidCredentials: true});
        this.form.get('password')?.markAsTouched();
        this.form.get('password')?.markAsDirty();
        this.form.get('email')?.setErrors({invalidCredentials: true});
        this.form.get('email')?.markAsTouched();
        this.form.get('email')?.markAsDirty();
    }

    private getBackendErrorMessage(error: HttpErrorResponse): string | null {
        if (typeof error.error === 'string' && error.error.trim().length > 0) {
            return error.error;
        }
        if (error.error && typeof error.error === 'object' && 'message' in error.error) {
            const backendMessage = (error.error as {message?: unknown}).message;
            if (typeof backendMessage === 'string' && backendMessage.trim().length > 0) {
                return backendMessage;
            }
        }
        return null;
    }

    private clearInvalidCredentialsError(field: 'email' | 'password'): void {
        const control = this.form.get(field);
        if (!control?.errors?.['invalidCredentials']) return;
        const {invalidCredentials: _ignored, ...remainingErrors} = control.errors;
        control.setErrors(Object.keys(remainingErrors).length > 0 ? remainingErrors : null);
    }
}
