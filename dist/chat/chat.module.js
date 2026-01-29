"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatModule = void 0;
const common_1 = require("@nestjs/common");
const chat_orchestrator_1 = require("./chat.orchestrator");
const chat_controller_1 = require("./chat.controller");
const chat_service_1 = require("./chat.service");
const payment_module_1 = require("../payment/payment.module");
const inventory_engine_1 = require("./engines/inventory.engine");
const payment_engine_1 = require("./engines/payment.engine");
const conversation_store_1 = require("./memory/conversation.store");
const filter_extractor_1 = require("./filter-extractor");
const lead_extractor_1 = require("./lead-extractor");
const appointment_extractor_1 = require("./appointment-extractor");
const vin_extractor_1 = require("./vin-extractor");
const compare_extractor_1 = require("./compare-extractor");
const crm_webhook_service_1 = require("./crm-webhook.service");
const photo_enrichment_service_1 = require("./engines/photo-enrichment.service");
const auth_module_1 = require("../auth/auth.module");
const vin_decoder_service_1 = require("./vin/vin-decoder.service");
const google_calendar_service_1 = require("./calendar/google-calendar.service");
const payment_explainer_1 = require("./payment-explainer");
const media_engine_1 = require("./media/media.engine");
const intelligent_router_1 = require("./intelligence/intelligent.router");
const intelligent_service_1 = require("./intelligence/intelligent.service");
const vin_explainer_service_1 = require("./vin/vin-explainer.service");
const followup_engine_1 = require("./followup/followup.engine");
let ChatModule = class ChatModule {
};
exports.ChatModule = ChatModule;
exports.ChatModule = ChatModule = __decorate([
    (0, common_1.Module)({
        imports: [
            auth_module_1.AuthModule,
            payment_module_1.PaymentModule,
        ],
        controllers: [chat_controller_1.ChatController],
        providers: [
            chat_orchestrator_1.ChatOrchestrator,
            chat_service_1.ChatService,
            followup_engine_1.FollowupEngine,
            inventory_engine_1.InventoryEngine,
            payment_engine_1.PaymentEngine,
            payment_explainer_1.PaymentExplainer,
            media_engine_1.MediaEngine,
            intelligent_router_1.IntelligentRouter,
            intelligent_service_1.IntelligentService,
            conversation_store_1.ConversationStore,
            filter_extractor_1.FilterExtractor,
            lead_extractor_1.LeadExtractor,
            appointment_extractor_1.AppointmentExtractor,
            vin_extractor_1.VinExtractor,
            compare_extractor_1.CompareExtractor,
            crm_webhook_service_1.CrmWebhookService,
            photo_enrichment_service_1.PhotoEnrichmentService,
            vin_decoder_service_1.VinDecoderService,
            vin_explainer_service_1.VinExplainerService,
            google_calendar_service_1.GoogleCalendarService,
        ],
        exports: [chat_orchestrator_1.ChatOrchestrator],
    })
], ChatModule);
//# sourceMappingURL=chat.module.js.map