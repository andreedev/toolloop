import { HttpResponse } from '@angular/common/http';
import {
    AfterViewInit,
    Component,
    computed,
    ElementRef,
    HostListener,
    inject,
    OnDestroy,
    OnInit,
    signal,
    ViewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
    faArrowRight,
    faDollarSign,
    faHashtag,
    faHeart,
    faLeaf,
    faLocationDot,
    faShield,
    faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FeaturedTool } from '../../core/models/dto/featured-tool';
import { HomeApiService } from '../../core/services/api/home.api.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-home-page',
    imports: [RouterLink, FontAwesomeModule, CommonModule],
    templateUrl: './home-page.html',
    styleUrl: './home-page.scss',
})
export class HomePage implements OnInit, AfterViewInit, OnDestroy {
    faLeaf = faLeaf;
    faArrowRight = faArrowRight;
    faLocationDot = faLocationDot;
    faDollarSign = faDollarSign;
    faUsers = faUsers;
    faHashtag = faHashtag;
    faHeart = faHeart;
    faShield = faShield;

    private homeApiService = inject(HomeApiService);
    featuredTools = signal<FeaturedTool[]>([]);

    @ViewChild('carouselContainer') carouselContainer!: ElementRef<HTMLElement>;

    private readonly GAP_PX = 24;
    private readonly PEEK_PX = 56;

    private _currentIndex = signal(0);
    isAnimating = signal(true);
    cardWidth = signal(300);
    private _visibleCount = signal(this.computeVisibleCount());

    private autoScrollTimer: ReturnType<typeof setInterval> | null = null;

    private displayIndex = computed(
        () => this.featuredTools().length + this._currentIndex()
    );

    tripleTools = computed<FeaturedTool[]>(() => {
        const t = this.featuredTools();
        return t.length ? [...t, ...t, ...t] : [];
    });

    carouselTransform = computed(() => {
        const tools = this.featuredTools();
        if (!tools.length) return 'translateX(0px)';

        const offset = this.PEEK_PX + this.GAP_PX;
        const tx =
            -(this.displayIndex() * (this.cardWidth() + this.GAP_PX)) + offset;
        return `translateX(${tx}px)`;
    });

    centerCardIndex = computed(() => {
        const n = this._visibleCount();
        if (n % 2 === 0 || n < 3 || !this.featuredTools().length) return -1;
        return this.displayIndex() + Math.floor(n / 2);
    });

    private computeVisibleCount(): number {
        if (typeof window === 'undefined') return 3;
        if (window.innerWidth >= 1440) return 5;
        if (window.innerWidth >= 1280) return 4;
        if (window.innerWidth >= 1024) return 3;
        if (window.innerWidth >= 768) return 2;
        return 1;
    }

    private updateCardWidth(): void {
        if (!this.carouselContainer?.nativeElement) return;
        const containerW = this.carouselContainer.nativeElement.offsetWidth;
        const n = this._visibleCount();
        const width =
            (containerW - 2 * this.PEEK_PX - (n + 1) * this.GAP_PX) / n;
        this.cardWidth.set(Math.max(width, 180));
    }

    private startAutoScroll(): void {
        this.autoScrollTimer = setInterval(() => this.advance(), 3500);
    }

    private stopAutoScroll(): void {
        if (this.autoScrollTimer !== null) {
            clearInterval(this.autoScrollTimer);
            this.autoScrollTimer = null;
        }
    }

    private advance(): void {
        const tools = this.featuredTools();
        if (!tools.length) return;

        const next = this._currentIndex() + 1;
        this.isAnimating.set(true);
        this._currentIndex.set(next);

        if (next >= tools.length) {
            setTimeout(() => {
                this.isAnimating.set(false);
                this._currentIndex.set(0);
                requestAnimationFrame(() =>
                    requestAnimationFrame(() => this.isAnimating.set(true))
                );
            }, 700);
        }
    }

    @HostListener('window:resize')
    onResize(): void {
        this._visibleCount.set(this.computeVisibleCount());
        this.updateCardWidth();
    }

    async ngOnInit(): Promise<void> {
        const httpResponse = await this.homeApiService.getFeaturedTools();
        if (httpResponse instanceof HttpResponse && httpResponse.body) {
            this.featuredTools.set(httpResponse.body.data);
            setTimeout(() => this.updateCardWidth(), 0);
        } else {
            console.error('Error fetching featured tools:', httpResponse);
        }
    }

    ngAfterViewInit(): void {
        this.updateCardWidth();
        setTimeout(() => this.startAutoScroll(), 2000);
    }

    ngOnDestroy(): void {
        this.stopAutoScroll();
    }
}