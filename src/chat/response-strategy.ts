import { LeadStage } from './lead-intelligence';

export function inventoryResponseByStage(
    stage: LeadStage,
): string {
    switch (stage) {
        case 'hot':
            return (
                "This vehicle is available right now. " +
                "I can reserve it, schedule a test drive, " +
                "or connect you with a specialist."
            );

        case 'warm':
            return (
                "Would you like to compare trims, " +
                "see estimated monthly payments, " +
                "or schedule a visit?"
            );

        default:
            return (
                "Here are some options. " +
                "Let me know if you'd like to narrow things down."
            );
    }
}
