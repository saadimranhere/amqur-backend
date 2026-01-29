"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonInventoryParser = void 0;
class JsonInventoryParser {
    static parse(data) {
        return data.vehicles || [];
    }
}
exports.JsonInventoryParser = JsonInventoryParser;
//# sourceMappingURL=json.parser.js.map