import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './drizzle',
  dialect: 'postgresql',
  schema: './src/database/schema.ts',
  dbCredentials: {
    url: process.env.DATABASE_URL,
    ssl: true, // ⚠️ SSL ni yoqing
  },
});
