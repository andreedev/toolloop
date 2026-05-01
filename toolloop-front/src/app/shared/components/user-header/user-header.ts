import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import { faUser, faBars, faXmark } from '@fortawesome/free-solid-svg-icons';
import { faBell, faComment } from '@fortawesome/free-regular-svg-icons';
import { DialogModule } from 'primeng/dialog';

@Component({
    selector: 'user-header',
    imports: [RouterLink, RouterLinkActive, FontAwesomeModule, DialogModule],
    templateUrl: './user-header.html',
    styleUrl: './user-header.scss',
})
export class UserHeader {
    faUser = faUser;
    faBell = faBell;
    faComment = faComment;
    faBars = faBars;
    faXmark = faXmark;

    menuOpen = false;

    closeMenu(): void {
        this.menuOpen = false;
    }
}
