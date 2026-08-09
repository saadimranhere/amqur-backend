import { Module } from '@nestjs/common';
import { VoiceSessionService } from './voice-session.service';

@Module({
  providers: [VoiceSessionService],
  exports: [VoiceSessionService],
})
export class VoiceModule {}
