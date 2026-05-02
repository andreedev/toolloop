import { Component, inject, signal } from '@angular/core';
import { ReviewType } from '../../core/enums/review-type';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RatingModule } from 'primeng/rating';
import { Rental } from '../../core/models/entity/rental';

@Component({
    selector: 'app-review-page',
    imports: [ReactiveFormsModule, RatingModule],
    templateUrl: './review-page.html',
    styleUrl: './review-page.scss',
})
export class ReviewPage {
    // esto copia el enum en una propiedad pública de la clase, para que puedas usarlo en el html
    public ReviewType = ReviewType;
    public activateRoute = inject(ActivatedRoute);
    private formBuilder = inject(FormBuilder);

    // aqui creas el signal que sera el tipo de reseña, el cual puede ser RENTER_TO_OWNER o OWNER_TO_RENTER
    // un enum vendria bien para esto
    // por defecto le pondras cualquiera de los dos valores, para que puedas ver lo que haces para uno y para el otro

    // al inicio no existe un tipo de reseña
    reviewtype = signal<string | null>(null);

    // signal solo para visualizar datos relevantes del alquiler ya finalizado
    rental = signal<Rental | null>(null);

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

    constructor() {
        this.activateRoute.queryParams.subscribe((params) => {
            if (params['type']) {
                this.reviewtype.set(params['type']);
                this.review.patchValue({ reviewType: params['type'] });
            }
        });
    }
}
