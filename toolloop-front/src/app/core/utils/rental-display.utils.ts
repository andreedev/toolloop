import { Rental } from '../models/entity/rental';
import { RentalStatus as RentalStatusEnum } from '../enums/rental-status';

const DATE_FORMATTER = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });

export function formatDate(dateString?: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return Number.isNaN(date.getTime()) ? '-' : DATE_FORMATTER.format(date);
}

export function formatDateRange(startDate?: string, endDate?: string): string {
    return `${formatDate(startDate)} — ${formatDate(endDate)}`;
}

export function statusBadgeClass(status?: Rental['status']): string {
    switch (RentalStatusEnum.fromString(status ?? '')) {
        case RentalStatusEnum.APROBADA:   return 'text-blue-500 bg-blue-50 dark:text-blue-400 dark:bg-blue-950';
        case RentalStatusEnum.EN_USO:     return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900';
        case RentalStatusEnum.COMPLETADA: return 'text-gray-500 bg-gray-100 dark:text-neutral-300 dark:bg-neutral-700';
        case RentalStatusEnum.RECHAZADA:  return 'text-red-500 bg-red-50 dark:text-red-300 dark:bg-red-900';
        default:                          return 'text-orange-500 bg-orange-50 dark:text-orange-400 dark:bg-orange-950';
    }
}

export function resolveToolPhoto(rental: Rental): string {
    return rental.tool?.photos?.[0]?.photoKey ?? '';
}
