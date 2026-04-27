import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faArrowRight,faArrowLeft,faEuroSign, faArrowUpFromBracket, faX, faCheck, faCircle, faSquare} from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-add-tool-page',
    imports: [RouterLink, FontAwesomeModule],
    templateUrl: './edit-tool-page.html',
    styleUrl: './edit-tool-page.scss',
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
