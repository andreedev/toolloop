import { Component, inject, OnInit, signal } from '@angular/core';
import { ReviewType } from '../../core/enums/review-type';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RatingModule } from 'primeng/rating';
import { Rental } from '../../core/models/entity/rental';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {faArrowLeft, faUserCheck, faPaperPlane, faWrench} from '@fortawesome/free-solid-svg-icons';
import { UtilService } from '../../core/services/util/util.service';

@Component({
    selector: 'app-review-page',
    imports: [ReactiveFormsModule, RatingModule, FontAwesomeModule],
    templateUrl: './review-page.html',
    styleUrl: './review-page.scss',
})
export class ReviewPage implements OnInit {
    public faArrowLeft = faArrowLeft;
    public faUserCheck = faUserCheck;
    public faPaperPlane = faPaperPlane;
    public faWrench = faWrench;

    public ReviewType = ReviewType;

    public activateRoute = inject(ActivatedRoute);
    private formBuilder = inject(FormBuilder);
    public utilservice = inject(UtilService);


    reviewtype = signal<string | null>(null);
    rental = signal<Rental | null>({// this will be loaded from review-api-service getReviewContext() including the review type here inside.
        owner: {
            name: 'Juan Pérez',
        },
        renter: {
            name: 'María García',
        },
        tool: {
            name: 'Taladro Bosch',
        }
    });

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


    ngOnInit() {
    }
    
}
