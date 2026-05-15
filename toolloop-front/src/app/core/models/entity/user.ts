import { UserNotificationConfig } from './user-notification-config';
export interface User {
    id?: number;
    name?: string;
    password?: string;
    email?: string;
    postalCode?: string;
    profilePhotoKey?: string;
    averageRating?: number;
    totalRentals?: number;
    createdAt?: string;
    // transient
    userNotificationConfig?: UserNotificationConfig;
}
