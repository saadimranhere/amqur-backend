import { ConversationInventoryState } from '../memory/conversation.store';
export declare class FollowupEngine {
    shouldFollowUp(state: ConversationInventoryState): boolean;
    buildMessage(state: ConversationInventoryState): string;
}
