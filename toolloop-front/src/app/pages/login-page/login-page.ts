import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faArrowLeft, faUpload, faEnvelope, faLock, faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { FullLogo } from '../../shared/components/full-logo/full-logo';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

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

    form: FormGroup;
    showPassword = false;

    constructor(private fb: FormBuilder) {
        this.form = this.fb.group({
            email:    ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required]],
        });
    }

    showError(field: string): boolean {
        const c = this.form.get(field);
        return !!c && c.invalid && c.touched && c.dirty;
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

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        const payload = this.form.value;
    }
}
