import { Injectable } from '@nestjs/common';

@Injectable()
export class IntelligentService {
    async answer(params: {
        question: string;
        context: string[];
    }): Promise<string> {
        // 🔒 TEMP PLACEHOLDER
        // AI will be plugged in next step

        return (
            `I understand your question:\n\n` +
            `"${params.question}"\n\n` +
            `This feature is currently being prepared.`
        );
    }
}
