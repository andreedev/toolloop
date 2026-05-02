import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faArrowRight, faArrowUpFromBracket, faCheck, faCircle, faEuroSign, faSquare, faX, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { MessageService } from 'primeng/api';
import { CategoryDataService } from '../../core/services/data/category.data.service';
import { InputNumberModule } from 'primeng/inputnumber';
import { FileUploadModule } from 'primeng/fileupload';
import { Constants } from '../../core/constants/constants';
import { ToolCondition } from '../../core/enums/tool-condition';
import { ToolAvailability } from '../../core/enums/tool-availability';
import { Router } from '@angular/router';
import { ToolDataService } from '../../core/services/data/tool.data.service';
import { GeneralDataService } from '../../core/services/data/general.data.service';
import { ToolApiService } from '../../core/services/api/tool.api.service';
import { AddToolRequest } from '../../core/models/dto/add-tool-request';
import { HttpResponseBody } from '../../core/models/dto/http-response-body';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { AddToolResponse } from '../../core/models/dto/add-tool-response';
import { S3ApiService } from '../../core/services/api/s3-api.service';
import { Utils } from '../../core/helpers/utils';


@Component({
    selector: 'app-add-tool-page',
    imports: [FontAwesomeModule, FormsModule, InputNumberModule, FileUploadModule],
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
    faLocationDot = faLocationDot;

    step: number = 1;
    selectedCategoryId?: number;
    name: string = '';
    description: string = '';
    pricePerDay: number = 1;
    securityDeposit: number = 0;
    selectedState?: ToolCondition;
    images: File[] = [];
    imagePreviews: string[] = [];

    selectedAvailability?: ToolAvailability;
    calendarMonth: number = new Date().getMonth();
    calendarYear: number = new Date().getFullYear();
    customExceptions: Map<string, boolean> = new Map();

    readonly maxImages = Constants.TOOL_MAX_IMAGES;
    readonly availabilityOptions = ToolAvailability.values();
    readonly weekdayLabels = Constants.weekdayLabels;

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
    private toolDataService = inject(ToolDataService);
    private toolApiService = inject(ToolApiService);
    private generalDataService = inject(GeneralDataService);
    private s3ApiService: S3ApiService = inject(S3ApiService);

    constructor() {
        this.loadCategories();
    }

    async loadCategories(): Promise<void> {
        this.generalDataService.loading.set(true);
        await this.categoryDataService.ensureCategoriesAreLoaded();
        this.generalDataService.loading.set(false);
    }

    previousStep() {
        this.step--;
        if (this.step < 1) {
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
                detail: 'Introduce el nombre de la herramienta',
            });
            return false;
        }
        if (trimmed.length < 3) {
            this.messageService.add({
                severity: 'error',
                summary: 'Nombre muy corto',
                detail: 'El nombre debe tener al menos 3 caracteres',
            });
            return false;
        }
        if (this.selectedCategoryId == null) {
            this.messageService.add({
                severity: 'error',
                summary: 'Categoría requerida',
                detail: 'Selecciona una categoría',
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
                detail: 'Introduce una descripción de la herramienta',
            });
            return false;
        }
        if (this.description.length < this.descriptionMinLength) {
            this.messageService.add({
                severity: 'error',
                summary: 'Descripción muy corta',
                detail: `La descripción debe tener al menos ${this.descriptionMinLength} caracteres`,
            });
            return false;
        }
        if (trimmed.length > this.descriptionMaxLength) {
            this.messageService.add({
                severity: 'error',
                summary: 'Descripción muy larga',
                detail: `La descripción no puede superar ${this.descriptionMaxLength} caracteres`,
            });
            return false;
        }
        if (!this.selectedState) {
            this.messageService.add({
                severity: 'error',
                summary: 'Estado requerido',
                detail: 'Selecciona el estado de la herramienta',
            });
            return false;
        }
        if (this.pricePerDay == null || this.pricePerDay <= 0) {
            this.messageService.add({
                severity: 'error',
                summary: 'Precio inválido',
                detail: 'El precio por día debe ser mayor que 0€',
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
                detail: `Solo se pueden subir ${this.maxImages} imágenes`,
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
                detail: 'Añade al menos una imagen de la herramienta',
            });
            return false;
        }
        return true;
    }

    private validateStep4(): boolean {
        if (!this.selectedAvailability) {
            this.messageService.add({
                severity: 'error',
                summary: 'Disponibilidad requerida',
                detail: 'Selecciona la disponibilidad de la herramienta',
            });
            return false;
        }
        return true;
    }

    selectAvailability(option: ToolAvailability): void {
        this.selectedAvailability = option;
        this.customExceptions.clear();
    }

    isAvailabilitySelected(option: ToolAvailability): boolean {
        return this.selectedAvailability === option;
    }

    getAvailabilityRowClass(option: ToolAvailability): string {
        const base = 'p-3 border flex flex-row items-center text-base rounded-2xl gap-3 transition-all cursor-pointer';
        return this.isAvailabilitySelected(option)
            ? `${base} border-green-700 bg-green-100`
            : `${base} border-neutral-300 hover:border-neutral-400`;
    }

    prevMonth(): void {
        if (this.calendarMonth === 0) {
            this.calendarMonth = 11;
            this.calendarYear--;
        } else {
            this.calendarMonth--;
        }
    }

    nextMonth(): void {
        if (this.calendarMonth === 11) {
            this.calendarMonth = 0;
            this.calendarYear++;
        } else {
            this.calendarMonth++;
        }
    }

    getMonthName(): string {
        const date = new Date(this.calendarYear, this.calendarMonth, 1);
        const name = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(date);
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    private formatDateKey(d: Date): string {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    getMonthGrid(): { date: Date; inMonth: boolean; key: string; weekday: number }[] {
        const firstOfMonth = new Date(this.calendarYear, this.calendarMonth, 1);
        const jsWeekday = firstOfMonth.getDay();
        const mondayIndex = (jsWeekday + 6) % 7;
        const cells: { date: Date; inMonth: boolean; key: string; weekday: number }[] = [];
        const daysInMonth = new Date(this.calendarYear, this.calendarMonth + 1, 0).getDate();
        for (let i = 0; i < mondayIndex; i++) {
            cells.push({ date: new Date(0), inMonth: false, key: `pad-start-${i}`, weekday: i });
        }
        for (let d = 1; d <= daysInMonth; d++) {
            const date = new Date(this.calendarYear, this.calendarMonth, d);
            const wkday = (date.getDay() + 6) % 7;
            cells.push({ date, inMonth: true, key: this.formatDateKey(date), weekday: wkday });
        }
        while (cells.length % 7 !== 0) {
            cells.push({ date: new Date(0), inMonth: false, key: `pad-end-${cells.length}`, weekday: cells.length % 7 });
        }
        return cells;
    }

    private isCellAvailable(cell: { date: Date; inMonth: boolean; key: string; weekday: number }): boolean {
        if (!this.selectedAvailability) {
            return false;
        }
        if (this.selectedAvailability === ToolAvailability.Personalizado) {
            return this.customExceptions.get(cell.key) ?? true;
        }
        return this.selectedAvailability.isAvailableOnWeekday(cell.weekday);
    }

    getDayClass(cell: { date: Date; inMonth: boolean; key: string; weekday: number }): string {
        const base = 'aspect-square rounded-lg flex items-center justify-center text-sm font-semibold transition-colors';
        if (!cell.inMonth) {
            return `${base} invisible`;
        }
        const interactive = this.selectedAvailability === ToolAvailability.Personalizado ? 'cursor-pointer' : '';
        const available = this.isCellAvailable(cell);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isPast = cell.date.getTime() < today.getTime();
        const colorClass = available
            ? `bg-green-700 text-white ${isPast ? 'opacity-60' : ''}`
            : 'bg-gray-300 text-gray-600';
        return `${base} ${colorClass} ${interactive}`;
    }

    toggleCustomDay(cell: { date: Date; inMonth: boolean; key: string; weekday: number }): void {
        if (this.selectedAvailability !== ToolAvailability.Personalizado || !cell.inMonth) {
            return;
        }
        const current = this.customExceptions.get(cell.key) ?? true;
        this.customExceptions.set(cell.key, !current);
    }

    async publishTool(): Promise<void> {
        if (!this.validateStep4()) {
            return;
        }
        const isCustom: boolean = this.selectedAvailability === ToolAvailability.Personalizado;
        const photoKeys: string[] = this.images.map(file => file.name);
        const payload: AddToolRequest = {
            name: this.name.trim(),
            description: this.description.trim(),
            pricePerDay: this.pricePerDay,
            securityDeposit: this.securityDeposit,
            categoryId: this.selectedCategoryId!,
            condition: this.selectedState!.getName(),
            photoKeys,
            availability: {
                ruleType: isCustom ? null : this.selectedAvailability!.getName(),
                exceptions: isCustom
                    ? [...this.customExceptions.entries()].map(([date, isAvailable]) => ({ date, isAvailable }))
                    : [],
            }
        };
        this.generalDataService.loading.set(true);
        try {
            const httpResponse = await this.toolApiService.addTool(payload);
            if (httpResponse instanceof HttpErrorResponse) {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error de validación',
                    detail: httpResponse.error?.message,
                });
                return;
            }
            if (httpResponse.status === 200) {
                const { preSignedUrls } = httpResponse.body!.data;
                await Promise.all(
                    preSignedUrls.map((url, i) => this.s3ApiService.putObject(url, this.images[i], true))
                );
                this.messageService.add({
                    severity: 'success',
                    summary: 'Herramienta publicada',
                    detail: 'Tu herramienta ha sido publicada correctamente',
                });
                Utils.sleep(500).then(() => this.router.navigate(['/app/my-tools']));
                return;
            }
        } finally {
            this.generalDataService.loading.set(false);
        }
    }

}
