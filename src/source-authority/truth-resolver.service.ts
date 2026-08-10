import { Injectable } from '@nestjs/common';
import { FreshnessService } from './freshness.service';
import { SourceAuthorityService } from './source-authority.service';

export type FieldCandidate = {
  source: string;
  value: string;
  observedAt?: Date | string | null;
};

export type ResolvedField = {
  value: string | null;
  source: string | null;
  verified: boolean;
  conflict: boolean;
  provenance: {
    field: string;
    entityType: string;
    entityId: string;
    primarySource: string;
    fallbackSource?: string | null;
    freshnessSlaHours: number;
    observedAt?: string | null;
    conflictId?: string | null;
  };
};

@Injectable()
export class TruthResolverService {
  constructor(
    private readonly authority: SourceAuthorityService,
    private readonly freshness: FreshnessService,
  ) {}

  async resolveField(params: {
    tenantId: string;
    field: string;
    candidates: FieldCandidate[];
    entityType: string;
    entityId: string;
  }): Promise<ResolvedField> {
    const rule = await this.authority.resolve(params.tenantId, params.field);
    const primarySource = rule.primarySource;
    const fallbackSource = rule.fallbackSource ?? null;
    const slaHours = rule.freshnessSlaHours ?? 24;

    const fresh = params.candidates.filter((c) =>
      this.freshness.isFresh(c.observedAt, slaHours),
    );

    const pick = (source: string) =>
      fresh.find((c) => c.source === source) ??
      params.candidates.find((c) => c.source === source);

    const primary = pick(primarySource);
    const fallback = fallbackSource ? pick(fallbackSource) : undefined;

    const primaryFresh = primary
      ? this.freshness.isFresh(primary.observedAt, slaHours)
      : false;
    const fallbackFresh = fallback
      ? this.freshness.isFresh(fallback.observedAt, slaHours)
      : false;

    let chosen: FieldCandidate | undefined;
    let verified = false;
    let conflict = false;
    let conflictId: string | null = null;

    if (primary && fallback && primary.value !== fallback.value) {
      if (primaryFresh && fallbackFresh) {
        conflict = true;
        const record = await this.authority.recordConflict({
          tenantId: params.tenantId,
          field: params.field,
          entityType: params.entityType,
          entityId: params.entityId,
          primaryValue: primary.value,
          conflictingValue: fallback.value,
          primarySource,
          conflictingSource: fallbackSource!,
        });
        conflictId = record.id;
      }
    }

    if (primaryFresh && primary) {
      chosen = primary;
      verified = true;
    } else if (fallbackFresh && fallback) {
      chosen = fallback;
      verified = true;
    } else if (primary && !primaryFresh && fallback && !fallbackFresh) {
      // Stale sources — treat as unverified
      chosen = undefined;
    } else if (primary && !primaryFresh) {
      chosen = undefined;
    }

    const baseProvenance = {
      field: params.field,
      entityType: params.entityType,
      entityId: params.entityId,
      primarySource,
      fallbackSource,
      freshnessSlaHours: slaHours,
      observedAt: chosen?.observedAt
        ? new Date(chosen.observedAt).toISOString()
        : null,
      conflictId,
    };

    if (chosen && verified) {
      return {
        value: chosen.value,
        source: chosen.source,
        verified: true,
        conflict,
        provenance: baseProvenance,
      };
    }

    return {
      value: null,
      source: null,
      verified: false,
      conflict,
      provenance: baseProvenance,
    };
  }
}
