import { Global, Module } from '@nestjs/common';
import { SourceAuthorityService } from './source-authority.service';
import { TruthResolverService } from './truth-resolver.service';
import { ProvenanceService } from './provenance.service';
import { FreshnessService } from './freshness.service';
import { GroundingGuardService } from './grounding-guard.service';

@Global()
@Module({
  providers: [
    SourceAuthorityService,
    TruthResolverService,
    ProvenanceService,
    FreshnessService,
    GroundingGuardService,
  ],
  exports: [
    SourceAuthorityService,
    TruthResolverService,
    ProvenanceService,
    FreshnessService,
    GroundingGuardService,
  ],
})
export class SourceAuthorityModule {}
