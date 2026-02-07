---
name: db-query
description: "Query the backend PostgreSQL database directly. Use when needing to inspect reward sources, source items, orders, or any backend data. Triggers on: query database, check database, db query, what's in the database, check rewards_sources table."
---

# Database Query

Run SQL queries against the backend PostgreSQL database (Prisma-hosted).

---

## The Job

1. Understand what data the user needs
2. Run the query using the helper script
3. Return formatted results

---

## How to Query

Use the Bash tool to run queries via Node.js with the `pg` module from the backend project:

```bash
node -e "
const { Client } = require('/Users/ruben/code/_clients/carepoynt/new-api/carecloud-api/node_modules/pg');
const c = new Client({ connectionString: process.env.POSTGRES_DATABASE_URL });
c.connect().then(() => c.query('YOUR_SQL_HERE')).then(r => { console.log(JSON.stringify(r.rows, null, 2)); c.end(); }).catch(e => { console.error(e.message); c.end(); });
"
```

Replace `YOUR_SQL_HERE` with the actual SQL query.

---

## Key Tables

| Table | Description |
|-------|-------------|
| `rewards_sources` | Reward providers (Tango, Amazon, Tremendous, Blackhawk) |
| `rewards_source_items` | Catalog items linked to sources |
| `rewards` | Reward definitions |
| `orders` | Order records |
| `order_items` | Individual order line items |

---

## Common Queries

**List all reward sources:**
```sql
SELECT id, name, description, status FROM rewards_sources ORDER BY name
```

**List source items for a provider:**
```sql
SELECT id, source_fk, source_identifier, reward_fk, status FROM rewards_source_items WHERE source_fk = 'source-tango' LIMIT 20
```

**List all tables:**
```sql
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename
```

---

## Safety

- **READ-ONLY queries only** unless the user explicitly asks for writes
- Never drop tables or truncate data without explicit confirmation
- Always use LIMIT on exploratory queries
