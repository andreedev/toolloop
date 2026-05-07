import { Rental } from "../entity/rental";

export interface GetRentalsByOwnerResponse {
    totalPendingRentals: number;
    totalInUseRentals: number;
    rentals: Rental[];
}