import { Component } from '@angular/core';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faArrowRight,faArrowLeft,faEuroSign, faArrowUpFromBracket, faX, faCheck, faCircle, faSquare} from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-add-tool-page',
    imports: [FontAwesomeModule],
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

}
