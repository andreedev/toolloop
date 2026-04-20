import {Tool} from '../entity/tool';
import {Rental} from '../entity/rental';

export interface DashboardInfo {
    totalEarnings: number;
    totalRentals: number;
    totalTools: number;
    activeRentals: number;
    userRating: number;
    nextExpiringRental: Rental | null;
    recentTools: Tool[];
}
