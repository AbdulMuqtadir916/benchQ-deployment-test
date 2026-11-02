# Viewing the database (Adminer)

Adminer is a small web UI for the backend's Postgres database: browse tables, run SQL, and see
the schema as a diagram. It's an optional service in `docker-compose.yml` (profile `tools`), so a
normal `docker compose up` doesn't start it.

## Start

The database must be running first (`docker compose up -d db backend`).

```bash
docker compose --profile tools up -d adminer
```

Open **http://localhost:8081** and log in:

| Field | Value |
|---|---|
| System | PostgreSQL |
| Server | `db` |
| Username | `jobnavigator` |
| Password | `password` (or your `POSTGRES_PASSWORD`, if you set one) |
| Database | `jobnavigator` |

## Stop

```bash
docker compose stop adminer        # stop it; start again with the command above
docker compose rm -sf adminer      # stop and remove the container
```

Stopping Adminer doesn't touch the database or its data.

## Useful views

- **Database schema** (top of the schema page): every table, its columns and the foreign-key
  links between tables, drawn as a diagram.
- **select \<table\>** (left sidebar): browse a table's rows, filter and sort.
- **SQL command**: run your own queries, e.g. `select status, count(*) from applications group by status;`

## Notes

- It's bound to `127.0.0.1`, so only your own machine can reach it.
- It's the local development database. Be careful with **Edit**, **Delete** and **Truncate** —
  the backend's data has no undo.
