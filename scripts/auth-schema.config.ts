// Loaded only by the Better Auth CLI (`pnpm auth:schema`) to generate
// src/server/db/schema.ts. The CLI reads options; it never touches the DB.
import { drizzle } from "drizzle-orm/d1";

import { createAuth } from "../src/server/auth-config";
import * as schema from "../src/server/db/schema";

// Constructing the auth instance runs the OAuth provider's startup seeding of
// the MCP resource — the only database call the CLI makes. The statements
// below answer in memory with empty results, so seeding sees "no rows yet",
// its insert succeeds, and schema generation stays offline.

/** An empty D1 result; a valid "no rows yet" answer for the seeding calls. */
const emptyResult: D1Result = {
  meta: {
    changed_db: false,
    changes: 0,
    duration: 0,
    last_row_id: 0,
    rows_read: 0,
    rows_written: 0,
    size_after: 0,
  },
  results: [],
  success: true,
};

interface CliStatement {
  all: () => Promise<typeof emptyResult>;
  bind: () => CliStatement;
  first: () => Promise<null>;
  raw: () => Promise<[string[], ...unknown[]]>;
  run: () => Promise<typeof emptyResult>;
}

const statement: CliStatement = {
  all: () => Promise.resolve(emptyResult),
  bind: () => statement,
  first: () => Promise.resolve(null),
  raw: () => Promise.resolve([[]]),
  run: () => Promise.resolve(emptyResult),
};

// SAFETY: the CLI only reads the auth options; the seeding queries above are
// answered in memory and no other database call is made.
const cliDatabase = {
  batch: () => Promise.resolve([]),
  dump: () => Promise.resolve(new ArrayBuffer(0)),
  exec: () => Promise.resolve({ count: 0, duration: 0 }),
  prepare: () => statement,
  withSession: () => ({
    batch: () => Promise.resolve([]),
    getBookmark: () => null,
    prepare: () => statement,
  }),
} as D1Database;

export const auth = createAuth(drizzle(cliDatabase, { schema }), {
  baseURL: "http://localhost:3000",
  secret: "cli-only-secret-cli-only-secret-00",
  sendSignInCode: async () => {
    /* empty */
  },
});
