import { UserNotificationConfig } from './user-notification-config';
export interface User {
    id?: number;
    name?: string;
    password?: string;
    email?: string;
    isEmailVerified?: boolean;
    postalCode?: string;
    profilePhotoKey?: string;
    averageRating?: number;
    totalRentals?: number;
    createdAt?: string;
    availabilityDescription?: string;
    // transient
    userNotificationConfig?: UserNotificationConfig;
}
