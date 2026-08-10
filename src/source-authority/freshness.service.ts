import { Injectable } from '@nestjs/common';

@Injectable()
export class FreshnessService {
  /** Returns true when observedAt is within slaHours of now (inclusive). */
  isFresh(
    observedAt: Date | string | null | undefined,
    slaHours: number,
  ): boolean {
    if (!observedAt) return false;
    const observed =
      observedAt instanceof Date ? observedAt : new Date(observedAt);
    if (Number.isNaN(observed.getTime())) return false;
    const ageMs = Date.now() - observed.getTime();
    const slaMs = slaHours * 60 * 60 * 1000;
    return ageMs <= slaMs;
  }
}
