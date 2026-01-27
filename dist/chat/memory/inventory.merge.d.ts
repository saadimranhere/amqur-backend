import { InventoryUpdate } from '../engines/inventory.extractor';
import { ConversationInventoryState } from './conversation.store';
export declare function applyInventoryUpdate(current: ConversationInventoryState, update: InventoryUpdate): ConversationInventoryState;
