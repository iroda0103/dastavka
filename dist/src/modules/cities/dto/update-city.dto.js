"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateCityDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_city_dto_1 = require("./create-city.dto");
class UpdateCityDto extends (0, mapped_types_1.PartialType)(create_city_dto_1.CreateCityDto) {
}
exports.UpdateCityDto = UpdateCityDto;
//# sourceMappingURL=update-city.dto.js.map