import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import { faUser, faBars, faXmark } from '@fortawesome/free-solid-svg-icons';
import { faBell, faComment } from '@fortawesome/free-regular-svg-icons';
import { DialogModule } from 'primeng/dialog';
import { UserDataService } from '../../../core/services/data/user.data.service';

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
    private userDataService = inject(UserDataService);

    closeMenu(): void {
        this.menuOpen = false;
    }

    get profilePhoto(): string | undefined {
        return this.userDataService.loggedInUser()?.profilePhotoKey;
    }
}
