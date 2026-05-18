import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBell, faComment } from '@fortawesome/free-regular-svg-icons';
import { faBars, faUser, faXmark, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { DialogModule } from 'primeng/dialog';
import { ChatApiService } from '../../../core/services/api/chat.api.service';
import { ChatDataService } from '../../../core/services/data/chat.data.service';
import { NotificationDataService } from '../../../core/services/data/notification.data.service';
import { UserDataService } from '../../../core/services/data/user.data.service';
import { GeneralDataService } from '../../../core/services/data/general.data.service';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'user-header',
    imports: [RouterLink, RouterLinkActive, FontAwesomeModule, DialogModule, TooltipModule],
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
    faSun = faSun;
    faMoon = faMoon;

    menuOpen = false;

    private userDataService = inject(UserDataService);
    private chatApiService = inject(ChatApiService);
    protected chatDataService = inject(ChatDataService);
    protected notificationDataService = inject(NotificationDataService);
    protected generalDataService = inject(GeneralDataService);

    constructor() {
        this.userDataService.ensureUserLoaded();
    }

    async ngOnInit(): Promise<void> {
        await Promise.all([
            this.chatDataService.refreshUnreadCount(),
            this.notificationDataService.refreshUnreadCount(),
        ]);
    }

    closeMenu(): void {
        this.menuOpen = false;
    }

    get profilePhoto(): string | undefined {
        return this.userDataService.loggedInUser()?.profilePhotoKey;
    }
}
