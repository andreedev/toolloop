import {Tool} from './tool';
import { User } from './user';

export interface Rental {
    rentalId?: number;
    toolId?: number;
    renterId?: number;
    startDate?: string;
    endDate?: string;
    dailyRate?: number;
    subtotalAmount?: number;
    depositAmount?: number;
    totalAmount?: number;
    totalDays?: number;
    status?: RentalStatus;
    createdAt?: string;
    updatedAt?: string;

    // transient: no persisten en la BD
    tool?: Tool;
    owner?: User;
    renter?: User;
    daysRemaining?: number;
    hasReviewFromRenter?: boolean;
    hasReviewFromOwner?: boolean;
}

export type RentalStatus = 'Pendiente' | 'Rechazada' | 'Aprobada' | 'En_Uso' | 'Completada';
