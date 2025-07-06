"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DatabaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const schema_1 = require("./schema");
let DatabaseService = DatabaseService_1 = class DatabaseService {
    constructor(config) {
        this.config = config;
        if (DatabaseService_1.instance) {
            return DatabaseService_1.instance;
        }
        DatabaseService_1.instance = this;
        return DatabaseService_1.instance;
    }
    async onModuleInit() {
        await this.connect();
    }
    async onModuleDestroy() {
        await this.disconnect();
    }
    async connect() {
        if (this._db) {
            return;
        }
        const connectionString = this.config.get('DATABASE_URL');
        if (!connectionString) {
            throw new Error('DATABASE_URL is not defined in configuration');
        }
        this._pool = new pg_1.Pool({
            connectionString,
            max: 100,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 10000,
        });
        console.log('Connected to database');
        this._db = (0, node_postgres_1.drizzle)(this._pool, { schema: schema_1.schema });
    }
    async disconnect() {
        if (this._pool) {
            await this._pool.end();
        }
    }
    get db() {
        if (!this._db) {
            throw new Error('Database is not initialized');
        }
        return this._db;
    }
    get pool() {
        if (!this._pool) {
            throw new Error('Database pool is not initialized');
        }
        return this._pool;
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = DatabaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Function])
], DatabaseService);
//# sourceMappingURL=database.service.js.map