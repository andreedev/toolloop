import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { UserHeader } from '../../components/user-header/user-header';
import { RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AppWebsocketService, WS_EVENTS } from '../../../core/services/websocket/app.websocket.service';

@Component({
    selector: 'main-layout',
    imports: [UserHeader, RouterOutlet],
    templateUrl: './main-layout.html',
    styleUrl: './main-layout.scss',
})
export class MainLayout implements OnInit, OnDestroy {
    private wsService      = inject(AppWebsocketService);
    private messageService = inject(MessageService);
    private notifSub: Subscription | null = null;

    ngOnInit(): void {
        this.wsService.connect();
        this.notifSub = this.wsService.listenByType<any>(WS_EVENTS.NOTIFICATION).subscribe(data => {
            this.messageService.add({
                severity: 'info',
                summary: data?.title ?? 'Notificación',
                detail: data?.message ?? '',
                sticky: true
            });
        });
    }

    ngOnDestroy(): void {
        this.notifSub?.unsubscribe();
        this.wsService.disconnect();
    }
}
