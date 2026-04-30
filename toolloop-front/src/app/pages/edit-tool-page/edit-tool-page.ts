import { Component, inject } from '@angular/core';
import {RouterLink} from '@angular/router';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import { Location } from '@angular/common';
import {faArrowRight,faArrowLeft,faEuroSign, faArrowUpFromBracket, faX, faCheck, faCircle, faSquare} from '@fortawesome/free-solid-svg-icons';
import { CategoryDataService } from '../../core/services/data/category.data.service';

@Component({
    selector: 'app-edit-tool-page',
    imports: [RouterLink, FontAwesomeModule],
    templateUrl: './edit-tool-page.html',
    styleUrl: './edit-tool-page.scss',
})
export class EditToolPage {
    faArrowRight = faArrowRight;
    faArrowLeft = faArrowLeft;
    faEuroSign = faEuroSign;
    faArrowUpFromBracket = faArrowUpFromBracket;
    faX = faX;
    faCheck = faCheck;
    faCircle = faCircle;
    faSquare = faSquare;

    private categoryDataService = inject(CategoryDataService);

    private location = inject(Location);

    navigateBack() {
        this.location.back();
    }
}
