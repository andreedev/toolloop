import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faArrowRight,faArrowLeft,faEuroSign, faArrowUpFromBracket, faCross, faCheck} from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-add-tool-page',
    imports: [RouterLink, FontAwesomeModule],
    templateUrl: './add-tool-page.html',
    styleUrl: './add-tool-page.scss',
})
export class AddToolPage {

    faArrowRight = faArrowRight;
    faArrowLeft = faArrowLeft;
    faEuroSign = faEuroSign;
    faArrowUpFromBracket = faArrowUpFromBracket;
    faCross = faCross;
    faCheck = faCheck;

}
