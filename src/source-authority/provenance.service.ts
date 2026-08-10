import { Injectable } from '@nestjs/common';
import type { ResolvedField } from './truth-resolver.service';

export type ChatProvenanceEntry = {
  field: string;
  source: string | null;
  verified: boolean;
  conflict: boolean;
  observedAt?: string | null;
};

export type ChatProvenance = {
  entries: ChatProvenanceEntry[];
  generatedAt: string;
  disclaimer: string;
};

@Injectable()
export class ProvenanceService {
  buildChatProvenance(
    resolved: ResolvedField[],
    opts?: { disclaimer?: string },
  ): ChatProvenance {
    return {
      entries: resolved.map((r) => ({
        field: r.provenance.field,
        source: r.source,
        verified: r.verified,
        conflict: r.conflict,
        observedAt: r.provenance.observedAt,
      })),
      generatedAt: new Date().toISOString(),
      disclaimer:
        opts?.disclaimer ??
        'Information shown is based on verified dealership sources when available.',
    };
  }

  buildSingleFieldProvenance(resolved: ResolvedField): ChatProvenanceEntry {
    return {
      field: resolved.provenance.field,
      source: resolved.source,
      verified: resolved.verified,
      conflict: resolved.conflict,
      observedAt: resolved.provenance.observedAt,
    };
  }

  mergeProvenance(
    existing: ChatProvenance | null | undefined,
    additions: ChatProvenanceEntry[],
  ): ChatProvenance {
    const entries = [...(existing?.entries ?? []), ...additions];
    return {
      entries,
      generatedAt: new Date().toISOString(),
      disclaimer:
        existing?.disclaimer ??
        'Information shown is based on verified dealership sources when available.',
    };
  }
}
