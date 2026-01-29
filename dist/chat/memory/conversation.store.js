"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConversationStore = void 0;
const common_1 = require("@nestjs/common");
const inventory_merge_1 = require("./inventory.merge");
let ConversationStore = class ConversationStore {
    inventoryState = new Map();
    vinCache = new Map();
    defaultState() {
        return {
            lead: {},
            appointment: {},
            leadScore: 0,
            leadEvents: [],
            leadStage: 'cold',
        };
    }
    getInventoryState(userId) {
        return (this.inventoryState.get(userId) ??
            this.defaultState());
    }
    setInventoryState(userId, input) {
        const current = this.getInventoryState(userId);
        let next;
        if ('patch' in input && 'remove' in input) {
            next = (0, inventory_merge_1.applyInventoryUpdate)(current, input);
        }
        else {
            next = {
                ...current,
                ...input,
                lead: {
                    ...current.lead,
                    ...input.lead,
                },
                appointment: {
                    ...current.appointment,
                    ...input.appointment,
                },
            };
        }
        this.inventoryState.set(userId, next);
    }
    clearInventoryState(userId) {
        this.inventoryState.delete(userId);
    }
    getLead(userId) {
        return this.getInventoryState(userId).lead ?? {};
    }
    setLead(userId, patch) {
        const current = this.getInventoryState(userId);
        this.setInventoryState(userId, {
            lead: { ...current.lead, ...patch },
        });
    }
    leadIsComplete(lead) {
        if (!lead)
            return false;
        const hasName = !!lead.firstName;
        const hasContact = !!lead.phone || !!lead.email;
        return hasName && hasContact;
    }
    missingLeadFields(lead) {
        const out = [];
        if (!lead?.firstName)
            out.push('firstName');
        if (!(lead?.phone || lead?.email))
            out.push('phoneOrEmail');
        return out;
    }
    mergePayment(userId, prefs) {
        const current = this.getInventoryState(userId);
        this.setInventoryState(userId, {
            maxMonthlyPayment: prefs.maxMonthly ?? current.maxMonthlyPayment,
            downPayment: prefs.downPayment ?? current.downPayment,
            termMonths: prefs.termMonths ?? current.termMonths,
            apr: prefs.apr ?? current.apr,
        });
    }
    getVinProfile(vin) {
        return this.vinCache.get(vin);
    }
    setVinProfile(vin, profile) {
        this.vinCache.set(vin, profile);
    }
};
exports.ConversationStore = ConversationStore;
exports.ConversationStore = ConversationStore = __decorate([
    (0, common_1.Injectable)()
], ConversationStore);
//# sourceMappingURL=conversation.store.js.map