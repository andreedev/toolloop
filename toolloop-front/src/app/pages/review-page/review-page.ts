import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { ReviewType } from '../../core/enums/review-type';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RatingModule } from 'primeng/rating';
import { Review } from '../../core/models/entity/review';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faUserCheck, faPaperPlane, faWrench } from '@fortawesome/free-solid-svg-icons';
import { UtilService } from '../../core/services/util/util.service';
import { ReviewApiService } from '../../core/services/api/review.api.service';
import { GeneralDataService } from '../../core/services/data/general.data.service';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { Utils } from '../../core/helpers/utils';

@Component({
    selector: 'app-review-page',
    imports: [ReactiveFormsModule, RatingModule, FontAwesomeModule],
    templateUrl: './review-page.html',
    styleUrl: './review-page.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewPage implements OnInit {
    public faArrowLeft = faArrowLeft;
    public faUserCheck = faUserCheck;
    public faPaperPlane = faPaperPlane;
    public faWrench = faWrench;

    public ReviewType = ReviewType;

    private activatedRoute = inject(ActivatedRoute);
    private router = inject(Router);
    private formBuilder = inject(FormBuilder);
    public utilservice = inject(UtilService);
    private reviewApiService = inject(ReviewApiService);
    private generalDataService = inject(GeneralDataService);
    private messageService = inject(MessageService);

    private reviewContext = signal<Review | null>(null);
    public reviewtype = signal<string | null>(null);
    public submitting = signal(false);

    public rental = computed(() => this.reviewContext()?.rental ?? null);
    public revieweePhoto = computed(() => this.reviewContext()?.reviewee?.profilePhotoKey ?? null);
    public revieweeInitial = computed(() => this.reviewContext()?.reviewee?.name?.charAt(0)?.toUpperCase() ?? '');

    review = this.formBuilder.group({
        rentalId: this.formBuilder.nonNullable.control(0),
        reviewerId: this.formBuilder.nonNullable.control(0),
        revieweeId: this.formBuilder.nonNullable.control(0),
        reviewType: this.formBuilder.control<string | null>(null),
        userRating: this.formBuilder.nonNullable.control(0),
        toolRating: this.formBuilder.nonNullable.control(0),
        userTags: this.formBuilder.nonNullable.control<string[]>([]),
        toolTags: this.formBuilder.nonNullable.control<string[]>([]),
        comment: this.formBuilder.nonNullable.control(''),
    });

    private commentValue = toSignal(this.review.controls.comment.valueChanges, { initialValue: '' });
    public commentLength = computed(() => this.commentValue()?.length ?? 0);

    ngOnInit(): void {
        const id = Number(this.activatedRoute.snapshot.paramMap.get('id'));
        this.loadContext(id);
    }

    async loadContext(rentalId: number): Promise<void> {
        this.generalDataService.loading.set(true);
        try {
            const res = await this.reviewApiService.getReviewContext(rentalId);
            if (res instanceof HttpErrorResponse) {
                const message = res.error?.message ?? 'No se pudo cargar la valoración.';
                this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
                await Utils.sleep(2000);
                this.router.navigate(['/app/my-tools/loans']);
                return;
            }
            const data = res.body?.data;
            if (!data) return;
            this.reviewContext.set(data);
            this.reviewtype.set(data.reviewType ?? null);
            this.review.patchValue({
                rentalId: data.rentalId,
                reviewerId: data.reviewerId,
                revieweeId: data.revieweeId,
                reviewType: data.reviewType ?? null,
            });
        } finally {
            this.generalDataService.loading.set(false);
        }
    }

    toggleUserTag(tag: string): void {
        const tags = this.review.controls.userTags.value;
        this.review.controls.userTags.setValue(
            tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag]
        );
    }

    isUserTagSelected(tag: string): boolean {
        return this.review.controls.userTags.value.includes(tag);
    }

    toggleToolTag(tag: string): void {
        const tags = this.review.controls.toolTags.value;
        this.review.controls.toolTags.setValue(
            tags.includes(tag) ? tags.filter(t => t !== tag) : [...tags, tag]
        );
    }

    isToolTagSelected(tag: string): boolean {
        return this.review.controls.toolTags.value.includes(tag);
    }

    tagClass(selected: boolean): string {
        return `px-3 py-2 border rounded-full duration-400 transition-all cursor-pointer ${selected
            ? 'border-green-700 bg-green-100 text-green-700'
            : 'border-neutral-300 hover:bg-green-100 hover:border-green-700 hover:text-green-700'}`;
    }

    async submitReview(): Promise<void> {
        if (this.submitting()) return;
        if (!this.review.controls.userRating.value || !this.review.controls.toolRating.value) {
            this.messageService.add({ severity: 'warn', summary: 'Faltan valoraciones', detail: 'Por favor, completa todas las puntuaciones.' });
            return;
        }
        this.submitting.set(true);
        try {
            const res = await this.reviewApiService.submitReview(this.review.getRawValue() as Review);
            if (res instanceof HttpErrorResponse) {
                const errorMsg = res.error?.message ?? 'No se pudo enviar la valoración.';
                this.messageService.add({ severity: 'error', summary: 'Error', detail: errorMsg });
                return;
            }
            this.messageService.add({ severity: 'success', summary: '¡Valoración enviada!', detail: 'Gracias por tu opinión.' });
            this.router.navigate(['/app/dashboard']);
        } finally {
            this.submitting.set(false);
        }
    }
}
