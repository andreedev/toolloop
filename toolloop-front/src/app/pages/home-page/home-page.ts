import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {faLeaf, faArrowRight,faLocationDot,faDollarSign,faUsers,faHashtag, faHeart, faShield} from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-home-page',
    imports: [RouterLink, FontAwesomeModule],
    templateUrl: './home-page.html',
    styleUrl: './home-page.scss',
})
export class HomePage {
    faLeaf = faLeaf;
    faArrowRight = faArrowRight;
    faLocationDot = faLocationDot;
    faDollarSign = faDollarSign;
    faUsers = faUsers;
    faHashtag = faHashtag;
    faHeart = faHeart;
    faShield = faShield;
}
