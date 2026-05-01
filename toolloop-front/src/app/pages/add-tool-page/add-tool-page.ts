import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faArrowRight, faArrowUpFromBracket, faCheck, faCircle, faEuroSign, faSquare, faX } from '@fortawesome/free-solid-svg-icons';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CategoryDataService } from '../../core/services/data/category.data.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { FileUploadModule } from 'primeng/fileupload';
import { Constants } from '../../core/constants/constants';
import { ToolCondition } from '../../core/enums/tool-condition';
import { Router } from '@angular/router';


@Component({
    selector: 'app-add-tool-page',
    imports: [FontAwesomeModule, FormsModule, ToastModule, InputNumberModule, FileUploadModule],
    providers: [MessageService],
    templateUrl: './add-tool-page.html',
    styleUrl: './add-tool-page.scss',
})
export class AddToolPage {
    faArrowRight = faArrowRight;
    faArrowLeft = faArrowLeft;
    faEuroSign = faEuroSign;
    faArrowUpFromBracket = faArrowUpFromBracket;
    faX = faX;
    faCheck = faCheck;
    faCircle = faCircle;
    faSquare = faSquare;

    step: number = 1;
    selectedCategoryId?: number;
    name: string = '';
    description: string = '';
    pricePerDay: number = 1;
    deposit: number = 0;
    selectedState?: ToolCondition;
    images: File[] = [];
    imagePreviews: string[] = [];

    readonly maxImages = Constants.TOOL_MAX_IMAGES;

    readonly toolStates = ToolCondition.values();
    private readonly stepTitles: Record<number, string> = {
        1: 'Información básica',
        2: 'Descripción y precio',
        3: 'Fotos',
        4: 'Disponibilidad',
    };

    get stepTitle(): string {
        return this.stepTitles[this.step] ?? '';
    }

    readonly descriptionMaxLength = Constants.TOOL_DESCRIPTION_MAX_LENGTH;
    readonly descriptionMinLength = Constants.TOOL_DESCRIPTION_MIN_LENGTH;

    private messageService = inject(MessageService);
    public categoryDataService = inject(CategoryDataService);
    private router = inject(Router);

    previousStep() {
        if (this.step > 1) {
            this.step--;
        }
        if (this.step === 1) {
            this.router.navigate(['/app/my-tools']);
        }
    }

    nextStep() {
        if (this.step < 4) {
            this.step++;
        }
    }

    isCategorySelected(categoryId: number): boolean {
        return this.selectedCategoryId === categoryId;
    }

    selectCategory(categoryId: number): void {
        if (this.isCategorySelected(categoryId)) {
            this.selectedCategoryId = undefined;
        } else {
            this.selectedCategoryId = categoryId;
        }
    }

    getCategoryContainerClass(categoryId: number): string {
        const baseClass = 'flex flex-row justify-between items-center border-2 rounded-full sm:rounded-2xl cursor-pointer transition-all duration-400';
        const selectedClass = 'border-lime-500 bg-green-50 hover:bg-green-100';
        const unselectedClass = 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-100';
        return this.isCategorySelected(categoryId) ? `${baseClass} ${selectedClass}` : `${baseClass} ${unselectedClass}`;
    }

    goToNextStep(): void {
        if (this.step === 1) {
            if (!this.validateStep1()) {
                return;
            }
        }
        if (this.step === 2) {
            if (!this.validateStep2()) {
                return;
            }
        }
        if (this.step === 3) {
            if (!this.validateStep3()) {
                return;
            }
        }
        if (this.step === 4) {
            if (!this.validateStep4()) {
                return;
            }
        }
        this.nextStep();
    }

    private validateStep1(): boolean {
        const trimmed = this.name.trim();
        if (trimmed.length === 0) {
            this.messageService.add({
                severity: 'error',
                summary: 'Nombre requerido',
                detail: 'Introduce el nombre de la herramienta.',
            });
            return false;
        }
        if (trimmed.length < 3) {
            this.messageService.add({
                severity: 'error',
                summary: 'Nombre muy corto',
                detail: 'El nombre debe tener al menos 3 caracteres.',
            });
            return false;
        }
        if (this.selectedCategoryId == null) {
            this.messageService.add({
                severity: 'error',
                summary: 'Categoría requerida',
                detail: 'Selecciona una categoría.',
            });
            return false;
        }
        return true;
    }

    selectState(state: ToolCondition): void {
        this.selectedState = state;
    }

    isStateSelected(state: ToolCondition): boolean {
        return this.selectedState === state;
    }

    getStateClass(state: ToolCondition): string {
        const base = 'py-2 px-4 border rounded-full cursor-pointer transition-all';
        return this.isStateSelected(state)
            ? `${base} border-green-700 bg-green-100`
            : `${base} border-neutral-300 hover:border-neutral-400`;
    }

    private validateStep2(): boolean {
        const trimmed = this.description.trim();
        if (trimmed.length === 0) {
            this.messageService.add({
                severity: 'error',
                summary: 'Descripción requerida',
                detail: 'Introduce una descripción de la herramienta.',
            });
            return false;
        }
        if (this.description.length < this.descriptionMinLength) {
            this.messageService.add({
                severity: 'error',
                summary: 'Descripción muy corta',
                detail: `La descripción debe tener al menos ${this.descriptionMinLength} caracteres.`,
            });
            return false;
        }
        if (trimmed.length > this.descriptionMaxLength) {
            this.messageService.add({
                severity: 'error',
                summary: 'Descripción muy larga',
                detail: `La descripción no puede superar ${this.descriptionMaxLength} caracteres.`,
            });
            return false;
        }
        if (!this.selectedState) {
            this.messageService.add({
                severity: 'error',
                summary: 'Estado requerido',
                detail: 'Selecciona el estado de la herramienta.',
            });
            return false;
        }
        if (this.pricePerDay == null || this.pricePerDay <= 0) {
            this.messageService.add({
                severity: 'error',
                summary: 'Precio inválido',
                detail: 'El precio por día debe ser mayor que 0€.',
            });
            return false;
        }
        return true;
    }

    onImagesSelected(event: { files: File[] }, uploader: { clear: () => void }): void {
        const incoming = Array.from(event.files ?? []);
        const remaining = this.maxImages - this.images.length;
        if (remaining <= 0) {
            uploader.clear();
            return;
        }
        const accepted = incoming.slice(0, remaining);
        accepted.forEach(file => {
            this.images.push(file);
            this.imagePreviews.push(URL.createObjectURL(file));
        });
        if (incoming.length > remaining) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Límite alcanzado',
                detail: `Solo se pueden subir ${this.maxImages} imágenes.`,
            });
        }
        uploader.clear();
    }

    removeImage(index: number): void {
        const url = this.imagePreviews[index];
        if (url?.startsWith('blob:')) {
            URL.revokeObjectURL(url);
        }
        this.images.splice(index, 1);
        this.imagePreviews.splice(index, 1);
    }

    private validateStep3(): boolean {
        if (this.images.length < 1) {
            this.messageService.add({
                severity: 'error',
                summary: 'Imágenes requeridas',
                detail: 'Añade al menos una imagen de la herramienta.',
            });
            return false;
        }
        return true;
    }

    private validateStep4(): boolean {
        return true;
    }

}
