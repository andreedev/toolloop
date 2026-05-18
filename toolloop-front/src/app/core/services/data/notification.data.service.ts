import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { NotificationApiService } from '../api/notification.api.service';
import { AppWebsocketService, WS_EVENTS } from '../websocket/app.websocket.service';
import { Notification } from '../../models/entity/notification';

@Injectable({
    providedIn: 'root',
})
export class NotificationDataService {
    private readonly ws = inject(AppWebsocketService);
    private readonly notificationApiService = inject(NotificationApiService);

    public unreadCount = signal(0);

    constructor() {
        this.ws.listenByType<Notification>(WS_EVENTS.NOTIFICATION).subscribe(() => {
            this.unreadCount.update(n => n + 1);
        });
    }

    async refreshUnreadCount(): Promise<void> {
        const response = await this.notificationApiService.getNotifications();
        if (response instanceof HttpErrorResponse) return;
        const notifications: Notification[] = response.body?.data ?? [];
        this.unreadCount.set(notifications.filter(n => !n.read).length);
    }

    resetCount(): void {
        this.unreadCount.set(0);
    }
}
