import { CommonModule, Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faBell, faCalendar, faCircleExclamation, faClock, faComment, faEuroSign, faHeart, faLocationDot, faShield, faSquare, faStar } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import { GalleriaModule } from 'primeng/galleria';
import { ReviewCard } from '../../shared/components/review-card/review-card';
import { Utils } from '../../core/helpers/utils';
import { Tool } from '../../core/models/entity/tool';
import { ToolApiService } from '../../core/services/api/tool.api.service';
import { ToolDataService } from '../../core/services/data/tool.data.service';
import { UserDataService } from '../../core/services/data/user.data.service';
import { UnderscoreToSpacePipe } from '../../core/pipes/underscore-to-space.pipe';
import { MessageService } from 'primeng/api';
import { UtilService } from '../../core/services/util/util.service';
import { ToolFavoriteDataService } from '../../core/services/data/tool-favorite.data.service';
import { TooltipModule } from 'primeng/tooltip';
import { CalendarStatus } from '../../core/enums/calendar-status';

interface GalleryImage {
    itemImageSrc: string;
    thumbnailImageSrc: string;
    alt: string;
}

interface CalendarCell {
    date: Date;
    inMonth: boolean;
    key: string;
    weekday: number;
}

@Component({
    selector: 'app-tool-page',
    imports: [CommonModule, FontAwesomeModule, RouterLink, GalleriaModule, UnderscoreToSpacePipe, TooltipModule, ReviewCard],
    templateUrl: './tool-page.html',
    styleUrl: './tool-page.scss',
})
export class ToolPage {
    public faHeart = faHeart;
    public faLocationDot = faLocationDot;
    public faStar = faStar;
    public faStarRegular = faStarRegular;
    public faCalendar = faCalendar;
    public faComment = faComment;
    public faArrowLeft = faArrowLeft;
    public faShield = faShield;
    public faSquare = faSquare;
    public faBell = faBell;
    public faClock = faClock;
    public faCircleExclamation = faCircleExclamation;
    public faEuroSign = faEuroSign;

    private cdr = inject(ChangeDetectorRef);
    private toolDataService = inject(ToolDataService);
    private toolApiService = inject(ToolApiService);
    private router = inject(Router);
    private activatedRoute = inject(ActivatedRoute);
    private userDataService = inject(UserDataService);
    private messageService = inject(MessageService);
    private toolFavoriteDataService = inject(ToolFavoriteDataService);
    protected utilService = inject(UtilService);
    protected readonly utils = Utils;
    protected readonly Math = Math;

    public isToolLoading = signal<boolean>(true);
    public tool: Tool | null = null;
    public images: GalleryImage[] = [];
    public activeIndex = 0;
    public calendarMonth: number = new Date().getMonth();
    public calendarYear: number = new Date().getFullYear();
    public availabilityMap = new Map<string, CalendarStatus>();
    public selectedStart: string | null = null;
    public selectedEnd: string | null = null;
    public hoverDate: string | null = null;
    public readonly responsiveOptions = [
        { breakpoint: '1400px', numVisible: 3 },
        { breakpoint: '1024px', numVisible: 3 },
        { breakpoint: '768px', numVisible: 3 },
        { breakpoint: '560px', numVisible: 2 },
    ];

    constructor() {
        this.loadTool();
    }

    async loadTool(): Promise<void> {
        const toolId = this.activatedRoute.snapshot.paramMap.get('id');
        if (!toolId) {
            this.isToolLoading.set(false);
            void this.router.navigate(['/tools']);
            return;
        }

        try {
            const tool: Tool | null = await this.toolDataService.loadToolById(Number(toolId));
            this.tool = tool;
            this.images = (tool?.photos ?? []).map((photo, index) => ({
                itemImageSrc: photo.photoKey,
                thumbnailImageSrc: photo.photoKey,
                alt: `${tool?.name ?? 'Herramienta'} foto ${index + 1}`,
            }));
            this.activeIndex = 0;
            await this.loadCalendarForCurrentMonth();
        } finally {
            this.isToolLoading.set(false);
            Utils.sleep(500).then(() => this.loadToolReviews());
        }
    }

    async loadToolReviews(): Promise<void> {
        if (!this.tool?.toolId) return;
        const response = await this.toolApiService.getToolReviews(this.tool.toolId);
        if (response instanceof HttpErrorResponse || !response.body?.data) return;
        this.tool.reviews = response.body.data;
        this.cdr.markForCheck();
    }

    private async loadCalendarForCurrentMonth(): Promise<void> {
        if (!this.tool?.toolId) return;

        const period = `${this.calendarYear}-${String(this.calendarMonth + 1).padStart(2, '0')}`;
        const response = await this.toolApiService.getAvailability(this.tool.toolId, period);

        if (response instanceof HttpErrorResponse || !response.body?.data) return;

        for (const day of response.body.data.days) {
            this.availabilityMap.set(day.date, day.status.toString() as CalendarStatus);
        }
        this.cdr.detectChanges();
    }

    protected getToolAvailabilityIndicatorClass(): string {
        return this.tool?.isAvailable ? 'bg-lime-400 hover:bg-lime-500 text-white' : 'bg-neutral-400 hover:bg-neutral-500 text-gray-600';
    }

    prevMonth(): void {
        if (this.calendarMonth === 0) {
            this.calendarMonth = 11;
            this.calendarYear--;
        } else {
            this.calendarMonth--;
        }
        this.hoverDate = null;
        void this.loadCalendarForCurrentMonth();
    }

    nextMonth(): void {
        if (this.calendarMonth === 11) {
            this.calendarMonth = 0;
            this.calendarYear++;
        } else {
            this.calendarMonth++;
        }
        this.hoverDate = null;
        void this.loadCalendarForCurrentMonth();
    }

    getMonthName(): string {
        const date = new Date(this.calendarYear, this.calendarMonth, 1);
        const name = new Intl.DateTimeFormat('es-ES', { month: 'long' }).format(date);
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    getMonthGrid(): CalendarCell[] {
        const firstOfMonth = new Date(this.calendarYear, this.calendarMonth, 1);
        const jsWeekday = firstOfMonth.getDay();
        const mondayIndex = (jsWeekday + 6) % 7;
        const cells: CalendarCell[] = [];
        const daysInMonth = new Date(this.calendarYear, this.calendarMonth + 1, 0).getDate();

        for (let i = 0; i < mondayIndex; i++) {
            cells.push({ date: new Date(0), inMonth: false, key: `pad-start-${i}`, weekday: i });
        }
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(this.calendarYear, this.calendarMonth, day);
            const weekday = (date.getDay() + 6) % 7;
            cells.push({ date, inMonth: true, key: this.formatDateKey(date), weekday });
        }
        while (cells.length % 7 !== 0) {
            cells.push({ date: new Date(0), inMonth: false, key: `pad-end-${cells.length}`, weekday: cells.length % 7 });
        }

        return cells;
    }

    onDayClick(cell: CalendarCell): void {
        if (!cell.inMonth || this.isDayBlocked(cell.key)) {
            return;
        }

        const key = cell.key;
        if (!this.selectedStart || this.selectedEnd) {
            this.selectedStart = key;
            this.selectedEnd = null;
            this.hoverDate = null;
            return;
        }

        if (key === this.selectedStart) {
            this.selectedEnd = key;
            this.hoverDate = null;
            return;
        }

        if (key < this.selectedStart) {
            this.selectedStart = key;
            this.selectedEnd = null;
            this.hoverDate = null;
            return;
        }

        const maxValidEnd = this.getMaxValidEnd(this.selectedStart);
        if (key <= maxValidEnd) {
            this.selectedEnd = key;
            this.hoverDate = null;
            return;
        }

        this.selectedStart = key;
        this.selectedEnd = null;
        this.hoverDate = null;
    }

    onDayHover(cell: CalendarCell): void {
        if (!this.selectedStart || this.selectedEnd || !cell.inMonth) {
            this.hoverDate = null;
            return;
        }

        if (cell.key > this.selectedStart && !this.isDayBlocked(cell.key)) {
            this.hoverDate = cell.key;
            return;
        }

        this.hoverDate = null;
    }

    onDayLeave(): void {
        this.hoverDate = null;
    }

    protected isDayBlocked(key: string): boolean {
        if (this.isPastDate(this.parseDateKey(key))) {
            return true;
        }
        const status = this.getDayStatus(key);
        return status === CalendarStatus.UNAVAILABLE || status === CalendarStatus.RENTED;
    }

    getDayTooltip(cell: CalendarCell): string {
        if (!cell.inMonth) return '';
        const status = this.getDayStatus(cell.key);
        if (status === CalendarStatus.RENTED) return 'Alquilada';
        if (status === CalendarStatus.UNAVAILABLE) return 'No disponible';
        return 'Disponible';
    }

    getDayClass(cell: CalendarCell): string {
        const base = 'aspect-square rounded-lg flex items-center justify-center text-sm font-semibold transition-colors';
        if (!cell.inMonth) {
            return `${base} invisible`;
        }

        const status = this.getDayStatus(cell.key);
        if (status === CalendarStatus.UNAVAILABLE) {
            return `${base} bg-gray-300 text-gray-500 cursor-not-allowed`;
        }
        if (status === CalendarStatus.RENTED) {
            return `${base} bg-yellow-300 text-yellow-800 cursor-not-allowed`;
        }
        if (this.isPastDate(cell.date)) {
            return `${base} bg-gray-200 text-gray-400 cursor-not-allowed`;
        }
        if (cell.key === this.selectedStart || cell.key === this.selectedEnd) {
            return `${base} bg-[#2fb2d8] text-white ring-2 ring-[#2fb2d8] ring-offset-1 cursor-pointer`;
        }
        if (this.isInSelectedRange(cell.key)) {
            return `${base} bg-green-100 text-green-800 cursor-pointer`;
        }
        if (this.isInHoverRange(cell.key)) {
            return `${base} bg-green-50 text-green-600 cursor-pointer`;
        }
        return `${base} bg-green-700 text-white cursor-pointer hover:bg-green-600`;
    }

    get totalDays(): number {
        if (!this.selectedStart || !this.selectedEnd) {
            return 0;
        }

        const start = this.parseDateKey(this.selectedStart);
        const end = this.parseDateKey(this.selectedEnd);
        const diffMs = end.getTime() - start.getTime();
        return Math.floor(diffMs / 86_400_000) + 1;
    }

    get totalPrice(): number {
        return this.totalDays * (this.tool?.pricePerDay ?? 0);
    }

    goToRentalRequest(): void {
        if (!this.tool?.toolId || !this.selectedStart || !this.selectedEnd) {
            return;
        }

        if (this.toolBelongsToCurrentUser()) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No puedes solicitar el alquiler de tu propia herramienta.' });
            return;
        }

        void this.router.navigate(['/app/tool', this.tool.toolId, 'book'], {
            queryParams: {
                toolId: this.tool.toolId,
                startDate: this.selectedStart,
                endDate: this.selectedEnd,
            },
        });
    }

    private isInSelectedRange(key: string): boolean {
        if (!this.selectedStart || !this.selectedEnd) {
            return false;
        }
        return key > this.selectedStart && key < this.selectedEnd;
    }

    private isInHoverRange(key: string): boolean {
        if (!this.selectedStart || this.selectedEnd || !this.hoverDate || this.hoverDate <= this.selectedStart) {
            return false;
        }

        const maxValidEnd = this.getMaxValidEnd(this.selectedStart);
        const hoverEnd = this.hoverDate <= maxValidEnd ? this.hoverDate : maxValidEnd;

        return key > this.selectedStart && key <= hoverEnd;
    }

    private getMaxValidEnd(startKey: string): string {
        let maxEnd = startKey;
        const current = this.parseDateKey(startKey);

        for (let i = 1; i <= 60; i++) {
            current.setDate(current.getDate() + 1);
            const key = this.formatDateKey(current);

            if (this.isDayBlocked(key)) {
                break;
            }
            maxEnd = key;
        }
        return maxEnd;
    }

    private getDayStatus(key: string): CalendarStatus {
        return this.availabilityMap.get(key) ?? CalendarStatus.AVAILABLE;
    }

    private isPastDate(date: Date): boolean {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date.getTime() < today.getTime();
    }

    private parseDateKey(key: string): Date {
        const [year, month, day] = key.split('-').map(Number);
        return new Date(year, month - 1, day);
    }

    private formatDateKey(d: Date): string {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    }

    toolBelongsToCurrentUser(): boolean {
        return this.tool!.owner!.id === this.userDataService.loggedInUser()?.id;
    }

    async toggleFavorite(): Promise<void> {
        if (!this.tool) return;
        const result = await this.toolFavoriteDataService.toggleFavorite(this.tool.toolId!);
        if (!result) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo actualizar el estado de favorito. Inténtalo de nuevo.' });
            return;
        }
        this.tool.isFavorited = !this.tool.isFavorited;
        this.cdr.markForCheck();
    }

    contactOwner(): void {
        this.messageService.add({ severity: 'info', summary: 'Contactar propietario', detail: 'Has una solicitud de alquiler para contactar al propietario' });
    }
}
