import { ChatOrchestrator } from './chat.orchestrator';
export declare class ChatService {
    private readonly orchestrator;
    constructor(orchestrator: ChatOrchestrator);
    chat(input: {
        message: string;
        action?: string;
        vin?: string;
        conversationId?: string;
        tenantId: string;
        locationId?: string | null;
        userId: string;
        role: string;
    }): Promise<{
        reply: string;
    } | {
        type: "vehicle_detail";
        vehicle: import("./vin/vin.types").VinProfile;
        reply: string;
    } | {
        type: "vehicle_carousel";
        vehicles: import("./types/vehicle.types").InventoryVehicle[];
        reply: string;
    } | {
        type: "vehicle_compare";
        vehicles: import("./types/vehicle.types").InventoryVehicle[];
        reply: string;
    }>;
}
