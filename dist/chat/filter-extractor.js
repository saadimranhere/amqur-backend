"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterExtractor = void 0;
const common_1 = require("@nestjs/common");
let FilterExtractor = class FilterExtractor {
    extract(text) {
        const message = text.toLowerCase();
        const filters = {};
        if (message.includes('black'))
            filters.color = 'black';
        if (message.includes('white'))
            filters.color = 'white';
        if (message.includes('silver'))
            filters.color = 'silver';
        if (message.includes('gray') || message.includes('grey'))
            filters.color = 'gray';
        if (message.includes('red'))
            filters.color = 'red';
        if (message.includes('blue'))
            filters.color = 'blue';
        if (message.includes('awd') || message.includes('all wheel')) {
            filters.drivetrain = 'AWD';
        }
        if (message.includes('4x4')) {
            filters.drivetrain = '4x4';
        }
        if (message.includes('suv'))
            filters.bodyType = 'SUV';
        if (message.includes('truck'))
            filters.bodyType = 'Truck';
        if (message.includes('sedan'))
            filters.bodyType = 'Sedan';
        if (message.includes('4 door') || message.includes('four door')) {
            filters.doors = 4;
        }
        if (message.includes('2 door') || message.includes('two door')) {
            filters.doors = 2;
        }
        const priceMatch = message.match(/under\s?\$?(\d{2,6})/);
        if (priceMatch) {
            filters.maxPrice = Number(priceMatch[1]);
        }
        const monthlyMatch = message.match(/\$?(\d{2,4})\s?(?:per|\/)?\s?month/);
        if (monthlyMatch) {
            filters.maxMonthlyPayment = Number(monthlyMatch[1]);
        }
        if (message.includes('cheap') || message.includes('low to high')) {
            filters.sortBy = 'price_asc';
        }
        if (message.includes('high to low')) {
            filters.sortBy = 'price_desc';
        }
        return filters;
    }
};
exports.FilterExtractor = FilterExtractor;
exports.FilterExtractor = FilterExtractor = __decorate([
    (0, common_1.Injectable)()
], FilterExtractor);
//# sourceMappingURL=filter-extractor.js.map