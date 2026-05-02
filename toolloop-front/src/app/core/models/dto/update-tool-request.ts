import { ToolAvailabilityDTO } from './tool-availability-dto';

export interface UpdateToolRequest {
    name: string;
    description: string;
    pricePerDay: number;
    securityDeposit: number;
    categoryId: number;
    condition: string;
    availability: ToolAvailabilityDTO;
}
