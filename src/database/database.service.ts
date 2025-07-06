import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import type { ConfigService } from '@nestjs/config';

import { Injectable } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { schema } from './schema';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private static instance: DatabaseService;

  private _db: NodePgDatabase<typeof schema>;
  private _pool: Pool;

  constructor(private config: ConfigService) {
    if (DatabaseService.instance) {
      return DatabaseService.instance;
    }

    DatabaseService.instance = this;
    return DatabaseService.instance;
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

    const connectionString = this.config.get<string>('DATABASE_URL');
    if (!connectionString) {
      throw new Error('DATABASE_URL is not defined in configuration');
    }

    this._pool = new Pool({
      connectionString,
      max: 100, // Maximum number of connections
      idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
      connectionTimeoutMillis: 10000, // Connection timeout after 10 seconds
      // Note: pg has different option names than postgres.js
    });

    console.log('Connected to database');

    this._db = drizzle(this._pool, { schema });
  }

  async disconnect() {
    if (this._pool) {
      await this._pool.end();
    }
  }

  get db(): NodePgDatabase<typeof schema> {
    if (!this._db) {
      throw new Error('Database is not initialized');
    }
    return this._db;
  }

  get pool(): Pool {
    if (!this._pool) {
      throw new Error('Database pool is not initialized');
    }
    return this._pool;
  }
}
