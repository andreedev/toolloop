import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import { faUser, faBars, faXmark } from '@fortawesome/free-solid-svg-icons';
import { faBell, faComment } from '@fortawesome/free-regular-svg-icons';
import { DialogModule } from 'primeng/dialog';
import { UserDataService } from '../../../core/services/data/user.data.service';
import { ChatApiService } from '../../../core/services/api/chat.api.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
    selector: 'user-header',
    imports: [RouterLink, RouterLinkActive, FontAwesomeModule, DialogModule],
    templateUrl: './user-header.html',
    styleUrl: './user-header.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserHeader implements OnInit {
    faUser = faUser;
    faBell = faBell;
    faComment = faComment;
    faBars = faBars;
    faXmark = faXmark;

    menuOpen = false;
    unreadCount = signal(0);

    private userDataService = inject(UserDataService);
    private chatApiService = inject(ChatApiService);

    constructor() {
        this.userDataService.ensureUserLoaded();
    }

    async ngOnInit(): Promise<void> {
        const httpResponse = await this.chatApiService.getUnreadMessagesCount();
        if (httpResponse instanceof HttpErrorResponse) return;
        this.unreadCount.set(httpResponse.body?.data ?? 0);
    }

    closeMenu(): void {
        this.menuOpen = false;
    }

    get profilePhoto(): string | undefined {
        return this.userDataService.loggedInUser()?.profilePhotoKey;
    }
}
