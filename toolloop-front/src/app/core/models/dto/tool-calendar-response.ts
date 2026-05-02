export interface ToolCalendarDay {
    date: string;
    status: 'AVAILABLE' | 'UNAVAILABLE' | 'RENTED';
}

export interface ToolCalendarResponse {
    ruleType: string | null;
    exceptions: string[];
    days: ToolCalendarDay[];
}
