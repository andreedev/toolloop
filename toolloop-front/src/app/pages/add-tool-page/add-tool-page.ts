import { Component } from '@angular/core';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faArrowRight,faArrowLeft,faEuroSign, faArrowUpFromBracket, faX, faCheck, faCircle, faSquare} from '@fortawesome/free-solid-svg-icons';
import { RouterLink } from "@angular/router";

@Component({
    selector: 'app-add-tool-page',
    imports: [FontAwesomeModule, RouterLink],
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

    step: number = 1;

    previousStep() {
        if (this.step > 1) {
            this.step--;
        }
    }

    nextStep() {
        if (this.step < 4) {
            this.step++;
        }
    }

}
