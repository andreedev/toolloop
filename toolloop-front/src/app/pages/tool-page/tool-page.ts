import { CommonModule, Location } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faBell, faCalendar, faCircleExclamation, faClock, faComment, faEuroSign, faHeart, faLocationDot, faShield, faSquare, faStar } from '@fortawesome/free-solid-svg-icons';
import { GalleriaModule } from 'primeng/galleria';
import { Utils } from '../../core/helpers/utils';
import { Tool } from '../../core/models/entity/tool';
import { ToolApiService } from '../../core/services/api/tool.api.service';
import { ToolDataService } from '../../core/services/data/tool.data.service';
import { UserDataService } from '../../core/services/data/user.data.service';

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

type CalendarStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'RENTED';

@Component({
    selector: 'app-tool-page',
    imports: [CommonModule, FontAwesomeModule, RouterLink, GalleriaModule],
    templateUrl: './tool-page.html',
    styleUrl: './tool-page.scss',
})
export class ToolPage {
    public faHeart = faHeart;
    public faLocationDot = faLocationDot;
    public faStar = faStar;
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
    private locationService = inject(Location);
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

    constructor(){
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
        }
    }

    private async loadCalendarForCurrentMonth(): Promise<void> {
        if (!this.tool?.toolId) return;
    
        const period = `${this.calendarYear}-${String(this.calendarMonth + 1).padStart(2, '0')}`;
        const response = await this.toolApiService.getAvailability(this.tool.toolId, period);
    
        if (response instanceof HttpErrorResponse || !response.body?.data) return;
    
        for (const day of response.body.data.days) {
            this.availabilityMap.set(day.date, day.status);
        }
        this.cdr.detectChanges();
    }

    protected getToolAvailabilityIndicatorClass(): string {
        return this.tool?.isReserved ? 'bg-lime-400 hover:bg-lime-500 text-white' : 'bg-neutral-400 hover:bg-neutral-500 text-gray-600';
    }

    prevMonth(): void {
        if (this.calendarMonth === 0) {
            this.calendarMonth = 11;
            this.calendarYear--;
        } else {
            this.calendarMonth--;
        }
        this.selectedStart = null;
        this.selectedEnd = null;
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
        this.selectedStart = null;
        this.selectedEnd = null;
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
        return status === 'UNAVAILABLE' || status === 'RENTED';
    }

    getDayClass(cell: CalendarCell): string {
        const base = 'aspect-square rounded-lg flex items-center justify-center text-sm font-semibold transition-colors';
        if (!cell.inMonth) {
            return `${base} invisible`;
        }

        const status = this.getDayStatus(cell.key);
        if (status === 'UNAVAILABLE') {
            return `${base} bg-gray-300 text-gray-500 cursor-not-allowed`;
        }
        if (status === 'RENTED') {
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
        return this.availabilityMap.get(key) ?? 'AVAILABLE';
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

    goBack(): void {
        this.locationService.back();
    }

    toolBelongsToCurrentUser(): boolean {
        const currentUserId = this.userDataService.loggedInUser()?.id;
        return !!currentUserId && !!this.tool?.owner?.id && this.tool.owner.id === currentUserId;
    }
}
