export declare class AppointmentExtractor {
    wantsScheduling(text: string): boolean;
    extractDate(text: string): string | undefined;
    extractTime(text: string): string | undefined;
}
