import test from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import * as schema from "../db/schema.ts";

test("Database schema defines all required entities", () => {
  assert.ok(schema.users, "users table exists");
  assert.ok(schema.suppliers, "suppliers table exists");
  assert.ok(schema.products, "products table exists");
  assert.ok(schema.locations, "locations table exists");
  assert.ok(schema.requests, "requests table exists");
  assert.ok(schema.auditLogs, "auditLogs table exists");
});

test("Migration directory exists and has migration files", () => {
  const migrationsDir = path.resolve("netlify/database/migrations");
  assert.ok(fs.existsSync(migrationsDir), "netlify/database/migrations exists");
  const entries = fs.readdirSync(migrationsDir);
  assert.ok(entries.length > 0, "migrations directory is not empty");
  
  const migrationFolder = entries.find(e => !e.startsWith("."));
  assert.ok(migrationFolder, "found migration entry");
  const sqlPath = path.join(migrationsDir, migrationFolder, "migration.sql");
  assert.ok(fs.existsSync(sqlPath), "migration.sql exists");
  const sqlContent = fs.readFileSync(sqlPath, "utf-8");
  assert.match(sqlContent, /CREATE TABLE "requests"/, "requests table in migration");
  assert.match(sqlContent, /CREATE TABLE "users"/, "users table in migration");
  assert.match(sqlContent, /CREATE TABLE "suppliers"/, "suppliers table in migration");
});

test("Netlify function api.mts has config and valid path", () => {
  const apiPath = path.resolve("netlify/functions/api.mts");
  assert.ok(fs.existsSync(apiPath), "api.mts exists");
  const content = fs.readFileSync(apiPath, "utf-8");
  assert.match(content, /path:\s*["']\/api\/\*["']/, "path is /api/*");
  assert.match(content, /export\s+default\s+async/, "default handler exported");
});
