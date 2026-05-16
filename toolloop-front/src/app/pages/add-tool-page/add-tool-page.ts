import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faArrowRight, faArrowUpFromBracket, faCheck, faCircle, faEuroSign, faLocationDot, faSquare, faX } from '@fortawesome/free-solid-svg-icons';
import { MessageService } from 'primeng/api';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { Constants } from '../../core/constants/constants';
import { ToolAvailability } from '../../core/enums/tool-availability';
import { ToolCondition } from '../../core/enums/tool-condition';
import { Utils } from '../../core/helpers/utils';
import { AddToolRequest } from '../../core/models/dto/add-tool-request';
import { ToolCalendarResponse } from '../../core/models/dto/tool-calendar-response';
import { UpdateToolRequest } from '../../core/models/dto/update-tool-request';
import { S3ApiService } from '../../core/services/api/s3-api.service';
import { ToolApiService } from '../../core/services/api/tool.api.service';
import { CategoryDataService } from '../../core/services/data/category.data.service';
import { GeneralDataService } from '../../core/services/data/general.data.service';
import { UtilService } from '../../core/services/util/util.service';


@Component({
    selector: 'app-add-tool-page',
    imports: [FontAwesomeModule, FormsModule, InputNumberModule, FileUploadModule],
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
    existingImagePreviews: string[] = [];

    selectedAvailability?: ToolAvailability;
    calendarMonth: number = new Date().getMonth();
    calendarYear: number = new Date().getFullYear();
    customExceptions: Map<string, boolean> = new Map();
    toolId = signal<number | null>(null);
    mode = computed<'add' | 'edit'>(() => this.toolId() == null ? 'add' : 'edit');
    rentedDays = signal<Set<string>>(new Set());

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

    get totalPhotosCount(): number {
        return this.existingImagePreviews.length + this.imagePreviews.length;
    }

    readonly descriptionMaxLength = Constants.TOOL_DESCRIPTION_MAX_LENGTH;
    readonly descriptionMinLength = Constants.TOOL_DESCRIPTION_MIN_LENGTH;

    private messageService = inject(MessageService);
    public categoryDataService = inject(CategoryDataService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private toolApiService = inject(ToolApiService);
    private generalDataService = inject(GeneralDataService);
    private s3ApiService: S3ApiService = inject(S3ApiService);
    private changeDetectorRef = inject(ChangeDetectorRef);
    public utilService = inject(UtilService);

    constructor() {
        this.loadCategories();
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (!id) {
                this.toolId.set(null);
                this.resetForAddMode();
                return;
            }

            const parsedId = Number(id);
            if (Number.isNaN(parsedId)) {
                this.toolId.set(null);
                this.resetForAddMode();
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo identificar la herramienta a editar.',
                });
                return;
            }

            this.toolId.set(parsedId);
            void this.loadTool(parsedId);
        });
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
        const selectedClass = 'border-lime-500 bg-green-50 dark:bg-green-900 dark:border-green-600 hover:bg-green-100 dark:hover:bg-green-800';
        const unselectedClass = 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700';
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
            ? `${base} border-green-700 bg-green-100 dark:bg-green-900 dark:border-green-600 dark:text-green-300`
            : `${base} border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-400`;
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
        const remaining = this.maxImages - this.totalPhotosCount;
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
        if (this.mode() === 'edit') {
            return true;
        }
        if (this.totalPhotosCount < 1) {
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
            ? `${base} border-green-700 bg-green-100 dark:bg-green-800 dark:border-green-600 dark:text-white`
            : `${base} border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-400`;
    }

    prevMonth(): void {
        if (this.calendarMonth === 0) {
            this.calendarMonth = 11;
            this.calendarYear--;
        } else {
            this.calendarMonth--;
        }

        const toolId = this.toolId();
        if (this.mode() === 'edit' && toolId != null) {
            void this.loadCalendarForCurrentMonth(toolId);
        }
    }

    nextMonth(): void {
        if (this.calendarMonth === 11) {
            this.calendarMonth = 0;
            this.calendarYear++;
        } else {
            this.calendarMonth++;
        }

        const toolId = this.toolId();
        if (this.mode() === 'edit' && toolId != null) {
            void this.loadCalendarForCurrentMonth(toolId);
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
        if (this.rentedDays().has(cell.key)) {
            return `${base} bg-yellow-400 text-yellow-900 cursor-not-allowed`;
        }
        const interactive = this.selectedAvailability === ToolAvailability.Personalizado ? 'cursor-pointer' : '';
        const available = this.isCellAvailable(cell);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isPast = cell.date.getTime() < today.getTime();
        const colorClass = available
            ? `bg-green-700 hover:bg-green-600 text-white ${isPast ? 'opacity-60' : ''}`
            : 'bg-gray-300 dark:bg-neutral-600 text-gray-600 dark:text-neutral-300';
        return `${base} ${colorClass} ${interactive}`;
    }

    toggleCustomDay(cell: { date: Date; inMonth: boolean; key: string; weekday: number }): void {
        if (this.selectedAvailability !== ToolAvailability.Personalizado || !cell.inMonth) {
            return;
        }
        if (this.rentedDays().has(cell.key)) {
            return;
        }
        const current = this.customExceptions.get(cell.key) ?? true;
        this.customExceptions.set(cell.key, !current);
    }

    async submitTool(): Promise<void> {
        if (!this.validateStep4()) {
            return;
        }
        const isCustom: boolean = this.selectedAvailability === ToolAvailability.Personalizado;
        const availability = {
            ruleType: isCustom ? null : this.selectedAvailability!.getName(),
            exceptions: isCustom
                ? [...this.customExceptions.entries()]
                    .filter(([_, isAvailable]) => !isAvailable)
                    .map(([date]) => ({ date }))
                : [],
        };
        this.generalDataService.loading.set(true);
        try {
            if (this.mode() === 'add') {
                const photoKeys: string[] = this.images.map(file => file.name);
                const payload: AddToolRequest = {
                    name: this.name.trim(),
                    description: this.description.trim(),
                    pricePerDay: this.pricePerDay,
                    securityDeposit: this.securityDeposit,
                    categoryId: this.selectedCategoryId!,
                    condition: this.selectedState!.getName(),
                    photoKeys,
                    availability,
                };
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
                }

            } else if (this.mode() === 'edit') {
                const toolId = this.toolId();
                if (toolId == null) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'No se pudo identificar la herramienta a editar',
                    });
                    return;
                }

                const payload: UpdateToolRequest = {
                    name: this.name.trim(),
                    description: this.description.trim(),
                    pricePerDay: this.pricePerDay,
                    securityDeposit: this.securityDeposit,
                    categoryId: this.selectedCategoryId!,
                    condition: this.selectedState!.getName(),
                    availability,
                };
                const httpResponse = await this.toolApiService.updateTool(toolId, payload);
                if (httpResponse instanceof HttpErrorResponse) {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: httpResponse.error?.message ?? 'No se pudieron guardar los cambios',
                    });
                    return;
                }

                if (httpResponse.status === 200) {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Herramienta actualizada',
                        detail: 'Los cambios han sido guardados',
                    });
                    Utils.sleep(500).then(() => this.router.navigate(['/app/my-tools']));
                    return;
                }

                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudieron guardar los cambios',
                });
            }
        } finally {
            this.generalDataService.loading.set(false);
        }
    }

    private async loadTool(id: number): Promise<void> {
        this.generalDataService.loading.set(true);
        const response = await this.toolApiService.getToolById(id);
        this.generalDataService.loading.set(false);
        if (response instanceof HttpErrorResponse || !response.body?.data) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'No se pudo cargar la herramienta.',
            });
            return;
        }

        const tool = response.body.data;
        this.step = 1;
        this.name = tool.name ?? '';
        this.description = tool.description ?? '';
        this.pricePerDay = tool.pricePerDay ?? 1;
        this.securityDeposit = tool.securityDeposit ?? 0;
        this.selectedCategoryId = tool.categoryId ?? undefined;

        const condition = typeof tool.condition === 'string' ? tool.condition : null;
        this.selectedState = ToolCondition.values().find(item => item.getName() === condition);

        this.calendarMonth = new Date().getMonth();
        this.calendarYear = new Date().getFullYear();
        for (const preview of this.imagePreviews) {
            if (preview.startsWith('blob:')) {
                URL.revokeObjectURL(preview);
            }
        }
        this.images = [];
        this.imagePreviews = [];
        this.existingImagePreviews = (tool.photos ?? [])
            .map(photo => photo.photoKey)
            .filter(photoKey => !!photoKey);
        this.selectedAvailability = undefined;
        this.customExceptions.clear();
        this.rentedDays.set(new Set());
        this.changeDetectorRef.markForCheck();

        await this.loadCalendarForCurrentMonth(id);
    }

    private async loadCalendarForCurrentMonth(toolId: number): Promise<void> {
        const period = `${this.calendarYear}-${String(this.calendarMonth + 1).padStart(2, '0')}`;
        const response = await this.toolApiService.getAvailability(toolId, period);
        if (response instanceof HttpErrorResponse || !response.body?.data) {
            return;
        }

        const calendar: ToolCalendarResponse = response.body.data;
        if (!this.selectedAvailability && calendar.ruleType) {
            const availability = (ToolAvailability as unknown as Record<string, ToolAvailability | undefined>)[calendar.ruleType];
            this.selectedAvailability = availability;
        }
        if (!this.selectedAvailability && !calendar.ruleType) {
            this.selectedAvailability = ToolAvailability.Personalizado;
        }

        const nextRentedDays = new Set(this.rentedDays());
        for (const day of calendar.days) {
            if (day.status === 'RENTED') {
                nextRentedDays.add(day.date);
                continue;
            }
            nextRentedDays.delete(day.date);
        }
        this.rentedDays.set(nextRentedDays);

        if (this.selectedAvailability === ToolAvailability.Personalizado) {
            const monthPrefix = `${this.calendarYear}-${String(this.calendarMonth + 1).padStart(2, '0')}-`;
            for (const key of [...this.customExceptions.keys()]) {
                if (key.startsWith(monthPrefix)) {
                    this.customExceptions.delete(key);
                }
            }

            for (const day of calendar.days) {
                if (day.status === 'RENTED') {
                    continue;
                }
                this.customExceptions.set(day.date, day.status === 'AVAILABLE');
            }
        }
        this.changeDetectorRef.markForCheck();
    }

    private resetForAddMode(): void {
        this.step = 1;
        this.selectedCategoryId = undefined;
        this.name = '';
        this.description = '';
        this.pricePerDay = 1;
        this.securityDeposit = 0;
        this.selectedState = undefined;
        for (const preview of this.imagePreviews) {
            if (preview.startsWith('blob:')) {
                URL.revokeObjectURL(preview);
            }
        }
        this.images = [];
        this.imagePreviews = [];
        this.existingImagePreviews = [];
        this.selectedAvailability = undefined;
        this.calendarMonth = new Date().getMonth();
        this.calendarYear = new Date().getFullYear();
        this.customExceptions.clear();
        this.rentedDays.set(new Set());
        this.changeDetectorRef.markForCheck();
    }

}
