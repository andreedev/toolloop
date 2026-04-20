import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import { faBell, faComment } from '@fortawesome/free-regular-svg-icons';

@Component({
    selector: 'user-header',
    imports: [RouterLink, RouterLinkActive ,FontAwesomeModule],
    templateUrl: './user-header.html',
    styleUrl: './user-header.scss',
})
export class UserHeader {
    faUser = faUser;
    faBell = faBell;
    faComment = faComment;

}
