import { ChatService } from './chat.service';
import { ChatDto } from './dto/chat.dto';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    chat(req: any, body: ChatDto): Promise<{
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
