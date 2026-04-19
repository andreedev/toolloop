import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faArrowLeft, faLock, faEnvelope, faUser, faEye, faEyeSlash, faUpload } from '@fortawesome/free-solid-svg-icons';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, } from '@angular/forms';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { PostalCodeGeo } from '../../core/models/entity/postal-code-geo';
import { PostalCodeGeoApiService } from '../../core/services/api/postal-code-geo.api.service';
import { HttpResponse } from '@angular/common/http';
import { HttpResponseBody } from '../../core/models/dto/http-response-body';
import { FullLogo } from '../../shared/components/full-logo/full-logo';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password        = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    if (password && confirmPassword && password !== confirmPassword) {
        control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
    }
    return null;
}

@Component({
    selector: 'app-signup-page',
    standalone: true,
    imports: [FontAwesomeModule, RouterLink, ReactiveFormsModule, AutoCompleteModule, FullLogo],
    templateUrl: './signup-page.html',
    styleUrl: './signup-page.scss',
})
export class SignupPage {
    faCheckCircle = faCheckCircle;
    faArrowLeft   = faArrowLeft;
    faLock        = faLock;
    faEnvelope    = faEnvelope;
    faUser        = faUser;
    faEye         = faEye;
    faEyeSlash    = faEyeSlash;
    faUpload      = faUpload;

    showPassword        = false;
    showConfirmPassword = false;
    photoPreview: string | null = null;

    form: FormGroup;

    codigosPostales: PostalCodeGeo[] = [];

    private postalCodeGeoApiService: PostalCodeGeoApiService = inject(PostalCodeGeoApiService);

    private cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

    constructor(private fb: FormBuilder) {
        this.form = this.fb.group({
            name:            ['', [Validators.required]],
            email:           ['', [Validators.required, Validators.email]],
            password:        ['', [Validators.required, Validators.minLength(8)]],
            confirmPassword: ['', [Validators.required]],
            postalCode:      ['', [Validators.required]],
        }, { validators: passwordMatchValidator });
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
        if (c.errors['passwordMismatch']) return 'Las contraseñas no coinciden';
        return null;
    }

    borderClass(field: string): string {
        const c = this.form.get(field);
        if (!c || (!c.touched && !c.dirty)) return 'border-gray-200 focus-within:border-green-300';
        if (c.invalid && c.touched && c.dirty) return 'border-red-400 focus-within:border-red-400';
        if (c.valid)                           return 'border-green-400 focus-within:border-green-400';
        return 'border-gray-200 focus-within:border-green-300';
    }

    onPhotoSelected(event: Event): void {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = () => this.photoPreview = reader.result as string;
        reader.readAsDataURL(file);
    }

    onPhotoDragOver(event: DragEvent): void { event.preventDefault(); }

    onPhotoDrop(event: DragEvent): void {
        event.preventDefault();
        const file = event.dataTransfer?.files?.[0];
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = () => this.photoPreview = reader.result as string;
        reader.readAsDataURL(file);
    }

    onSubmit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        const seleccion = this.form.get('postalCode')?.value;
        const payload = {
            ...this.form.value,
            postalCode: seleccion.postalCode
        };
        console.log('Payload a enviar al backend:', payload);
    }

    buscarCodigosPostales(event: any): void {
        const query = event.query;
        if (query.length < 3) {
            this.codigosPostales = [];
            return;
        }
        this.postalCodeGeoApiService.buscarCodigosPostales(query).subscribe({
            next: (httpResponse) => {
                if (httpResponse.status === 200 && httpResponse.body?.data) {
                    this.codigosPostales = [...httpResponse.body.data as PostalCodeGeo[]];
                    this.cdr.markForCheck();
                } else {
                    this.codigosPostales = [];
                }
            },
            error: () => this.codigosPostales = []
        });
    }

    formatPostalLabel = (item: PostalCodeGeo): string => {
        return item ? `${item.city}, ${item.postalCode}` : '';
    };
}
