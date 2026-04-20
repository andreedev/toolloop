import {Tool} from './tool';

export interface Rental {
    rentalId: number;
    toolId: number;
    renterId: number;
    startDate: string;
    endDate: string;
    dailyRate: number;
    subtotalAmount: number;
    depositAmount: number;
    totalAmount: number;
    totalDays: number;
    status: RentalStatus;
    createdAt?: string;
    updatedAt?: string;

    // Relaciones
    tool?: Tool;
    daysRemaining?: number;
}

export type RentalStatus = 'Pendiente' | 'Rechazada' | 'Aprobada' | 'En_Uso' | 'Completada';
