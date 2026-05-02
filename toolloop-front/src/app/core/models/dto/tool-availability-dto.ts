import { AvailabilityExceptionDTO } from "./availability-exception-dto";

export interface ToolAvailabilityDTO {
    ruleType: string | null;
    exceptions: AvailabilityExceptionDTO[];
}