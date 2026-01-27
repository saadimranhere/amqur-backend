"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.XmlInventoryParser = void 0;
const fast_xml_parser_1 = require("fast-xml-parser");
class XmlInventoryParser {
    static parse(xml) {
        const parser = new fast_xml_parser_1.XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '',
        });
        const json = parser.parse(xml);
        return json?.inventory?.vehicle || [];
    }
}
exports.XmlInventoryParser = XmlInventoryParser;
//# sourceMappingURL=xml.parser.js.map