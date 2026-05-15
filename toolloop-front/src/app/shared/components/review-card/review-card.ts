import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faKey, faStar, faUser, faWrench } from '@fortawesome/free-solid-svg-icons';
import { faStar as faStarRegular } from '@fortawesome/free-regular-svg-icons';
import { ReviewType } from '../../../core/enums/review-type';
import { Review } from '../../../core/models/entity/review';

@Component({
    selector: 'app-review-card',
    imports: [DatePipe, FontAwesomeModule],
    templateUrl: './review-card.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewCard {
    public review = input.required<Review>();

    protected readonly faStar = faStar;
    protected readonly faStarRegular = faStarRegular;
    protected readonly faUser = faUser;
    protected readonly faWrench = faWrench;
    protected readonly faKey = faKey;
    protected readonly stars = [1, 2, 3, 4, 5];

    protected isOwnerToRenter = computed(() => this.review().reviewType === ReviewType.OWNER_TO_RENTER);
}
