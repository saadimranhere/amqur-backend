"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var CrmWebhookService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrmWebhookService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = __importDefault(require("axios"));
let CrmWebhookService = CrmWebhookService_1 = class CrmWebhookService {
    logger = new common_1.Logger(CrmWebhookService_1.name);
    async send(payload) {
        const url = process.env.CRM_WEBHOOK_URL;
        if (!url) {
            this.logger.warn('CRM_WEBHOOK_URL not configured — skipping webhook.');
            return;
        }
        try {
            await axios_1.default.post(url, payload, {
                timeout: 5000,
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            this.logger.log('CRM webhook sent successfully.');
        }
        catch (error) {
            this.logger.error('CRM webhook failed', error?.response?.data || error.message);
        }
    }
};
exports.CrmWebhookService = CrmWebhookService;
exports.CrmWebhookService = CrmWebhookService = CrmWebhookService_1 = __decorate([
    (0, common_1.Injectable)()
], CrmWebhookService);
//# sourceMappingURL=crm-webhook.service.js.map