import { NotificationType } from "../../enums/notification-type";

export interface Notification {
    notificationId?: number;
    userId?: number;
    type?: NotificationType;
    title?: string;
    message?: string;
    read?: boolean;
    redirectPath?: string;
    createdAt?: string;
}