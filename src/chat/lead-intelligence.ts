export type LeadStage = 'cold' | 'warm' | 'hot';

export function scoreLeadEvent(
    currentScore: number,
    event: string,
): number {
    const weights: Record<string, number> = {
        inventory_search: 1,
        vehicle_view: 2,
        compare: 2,
        pricing: 2,
        payment: 3,
        appointment: 5,
        hold: 6,
        human: 10,
    };

    return currentScore + (weights[event] ?? 0);
}

export function stageFromScore(score: number): LeadStage {
    if (score >= 12) return 'hot';
    if (score >= 6) return 'warm';
    return 'cold';
}
