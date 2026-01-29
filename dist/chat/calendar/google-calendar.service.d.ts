export declare class GoogleCalendarService {
    private calendar;
    constructor();
    createEvent(params: {
        title: string;
        description?: string;
        startISO: string;
        endISO: string;
        attendeeEmail?: string;
    }): Promise<void>;
}
