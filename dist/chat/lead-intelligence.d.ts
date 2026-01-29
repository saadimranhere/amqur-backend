export type LeadStage = 'cold' | 'warm' | 'hot';
export declare function scoreLeadEvent(currentScore: number, event: string): number;
export declare function stageFromScore(score: number): LeadStage;
