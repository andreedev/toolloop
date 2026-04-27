import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-private-profile-page',
    imports: [RouterLink, FontAwesomeModule, RouterLinkActive],
    templateUrl: './private-profile-page.html',
    styleUrl: './private-profile-page.scss',
})
export class PrivateProfilePage {}
