import { Injectable } from '@nestjs/common';

@Injectable()
export class VinExtractor {

    extract(text: string, visibleVins: string[]) {
        const lower = text.toLowerCase();

        // 1️⃣ Direct VIN pasted
        const vinMatch = text.match(/\b[A-HJ-NPR-Z0-9]{17}\b/i);
        if (vinMatch) return vinMatch[0];

        // 2️⃣ Ordinal selection
        if (lower.includes('first')) return visibleVins[0];
        if (lower.includes('second')) return visibleVins[1];
        if (lower.includes('third')) return visibleVins[2];

        // 3️⃣ Generic reference
        if (
            lower.includes('this one') ||
            lower.includes('that one')
        ) {
            return visibleVins[0];
        }

        return null;
    }
}
