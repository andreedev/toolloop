import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faThumbsUp, faStar, faCube, faBusinessTime, faCircleXmark, faBell } from '@fortawesome/free-solid-svg-icons';
import { UserApiService } from '../../core/services/api/user.api.service';
import { AuthDataService } from '../../core/services/data/auth.data.service';
import { GeneralDataService } from '../../core/services/data/general.data.service';
import { UserDataService } from '../../core/services/data/user.data.service';
import { NotificationApiService } from '../../core/services/api/notification.api.service';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';
import { Notification } from '../../core/models/entity/notification';
import { NotificationType } from '../../core/enums/notification-type';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-notifications-page',
    imports: [FontAwesomeModule, CommonModule],
    templateUrl: './notifications-page.html',
    styleUrl: './notifications-page.scss',
})
export class NotificationsPage implements OnInit {
    faThumbsUp = faThumbsUp;
    faStar = faStar;
    faCube = faCube;
    faBusinessTime = faBusinessTime;
    faCircleXmark = faCircleXmark;
    faBell = faBell;

    private messageService = inject(MessageService);
    public authDataService: AuthDataService = inject(AuthDataService);
    private userApiService: UserApiService = inject(UserApiService);
    public userDataService = inject(UserDataService);
    public notificationApiService = inject(NotificationApiService);
    public generalDataService = inject(GeneralDataService);
    private router = inject(Router);

    notifications = signal<Notification[]>([]);

    notificationConfig = {
        [NotificationType.RENTAL_REQUEST]: {
            icon: faCube,
            color: 'text-green-700 dark:text-green-300',
            bg: 'bg-lime-100 dark:bg-green-800',
            border: 'border-neutral-200 dark:border-neutral-600',
            cardBg: 'bg-lime-50 dark:bg-green-900'
        },
        [NotificationType.RENTAL_REQUEST_CONFIRMATION]: {
            icon: faThumbsUp,
            color: 'text-cyan-600 dark:text-cyan-300',
            bg: 'bg-cyan-100 dark:bg-cyan-800',
            border: 'border-neutral-200 dark:border-neutral-600',
            cardBg: 'bg-lime-50 dark:bg-neutral-700'
        },
        [NotificationType.RENTAL_REQUEST_REJECTED]: {
            icon: faCircleXmark,
            color: 'text-red-600 dark:text-red-300',
            bg: 'bg-red-100 dark:bg-red-900',
            border: 'border-neutral-200 dark:border-neutral-600',
            cardBg: 'bg-lime-50 dark:bg-neutral-700'
        },
        [NotificationType.RETURN_REMINDER]: {
            icon: faBusinessTime,
            color: 'text-amber-600 dark:text-amber-300',
            bg: 'bg-amber-100 dark:bg-amber-900',
            border: 'border-neutral-200 dark:border-neutral-600',
            cardBg: 'bg-white dark:bg-neutral-700'
        },
        [NotificationType.REVIEW_RECEIVED]: {
            icon: faStar,
            color: 'text-yellow-600 dark:text-yellow-300',
            bg: 'bg-yellow-100 dark:bg-yellow-900',
            border: 'border-neutral-200 dark:border-neutral-600',
            cardBg: 'bg-white dark:bg-neutral-700'
        },
        [NotificationType.OTHER]: {
            icon: faBell,
            color: 'text-gray-600 dark:text-gray-300',
            bg: 'bg-gray-100 dark:bg-neutral-600',
            border: 'border-neutral-200 dark:border-neutral-600',
            cardBg: 'bg-white dark:bg-neutral-700'
        }
    };

    unreadCount = computed(() => this.notifications().filter(n => !n.read).length);

    async ngOnInit(): Promise<void> {
        const httpResponse = await this.notificationApiService.getNotifications();
        if (httpResponse instanceof HttpErrorResponse) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al cargar las notificaciones' });
            return;
        }
        const notifications = httpResponse.body?.data || [];
        this.notifications.set(notifications);
    }

    async markAsRead(notification: Notification): Promise<void> {
        if (notification.read) return;
        const httpResponse = await this.notificationApiService.markAsRead(notification.notificationId!);
        if (httpResponse instanceof HttpErrorResponse) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al marcar la notificación como leída' });
            return;
        }
        this.notifications.update(notifications => notifications.map(n => n.notificationId === notification.notificationId ? { ...n, read: true } : n));
    }

    async markAllAsRead(): Promise<void> {
        const httpResponse = await this.notificationApiService.markAllAsRead();
        if (httpResponse instanceof HttpErrorResponse) {
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Error al marcar todas las notificaciones como leídas' });
            return;
        }
        this.notifications.update(notifications => notifications.map(n => ({ ...n, read: true })));
    }

    navigateToRelated(notification: Notification): void {
        if (!notification.redirectPath) return;
        this.router.navigateByUrl(notification.redirectPath);
    }
}
