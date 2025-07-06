"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const drizzle_kit_1 = require("drizzle-kit");
exports.default = (0, drizzle_kit_1.defineConfig)({
    out: './drizzle',
    dialect: 'postgresql',
    schema: './src/database/schema.ts',
    dbCredentials: {
        url: process.env.DATABASE_URL,
        ssl: true,
    },
});
//# sourceMappingURL=drizzle.config.js.map