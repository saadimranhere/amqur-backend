"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FollowupEngine = void 0;
const common_1 = require("@nestjs/common");
let FollowupEngine = class FollowupEngine {
    shouldFollowUp(state) {
        if (!state.selectedVin)
            return false;
        if (state.leadStage === 'cold')
            return false;
        if (!state.lastActivityAt)
            return false;
        const idleMs = Date.now() - state.lastActivityAt;
        return idleMs > 15_000;
    }
    buildMessage(state) {
        if (state.leadStage === 'hot') {
            return ('Would you like me to schedule a test drive or place this vehicle on hold for you?');
        }
        return ('Would you like me to send you the details we discussed or show similar vehicles?');
    }
};
exports.FollowupEngine = FollowupEngine;
exports.FollowupEngine = FollowupEngine = __decorate([
    (0, common_1.Injectable)()
], FollowupEngine);
//# sourceMappingURL=followup.engine.js.map