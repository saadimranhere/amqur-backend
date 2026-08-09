import { Module } from '@nestjs/common';
import {
  ChannelAdapterService,
  TwilioSignatureValidator,
} from './channel-adapter.service';

@Module({
  providers: [ChannelAdapterService, TwilioSignatureValidator],
  exports: [ChannelAdapterService, TwilioSignatureValidator],
})
export class ChannelsModule {}
