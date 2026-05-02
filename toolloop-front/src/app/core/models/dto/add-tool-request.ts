import { ToolAvailabilityDTO } from "./tool-availability-dto";

export interface AddToolRequest {
    name: string;
    description: string;
    pricePerDay: number;
    securityDeposit: number;
    categoryId: number;
    condition: string;
    photoKeys: string[];
    availability: ToolAvailabilityDTO;
}