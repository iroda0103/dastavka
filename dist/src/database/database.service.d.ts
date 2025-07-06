import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from './schema';
export declare class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private config;
    private static instance;
    private _db;
    private _pool;
    constructor(config: ConfigService);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    get db(): NodePgDatabase<typeof schema>;
    get pool(): Pool;
}
