# secondary_crm

Secondary CRM runs as a Docker Compose stack with four services:

- `db` for PostgreSQL
- `backend` for the FastAPI API
- `frontend` for the Vite-built React app
- `backup` for scheduled database and uploads backups

## Deployment Notes

- The database bootstrap creates tables only. It does not insert demo users or sample CRM records.
- The first admin account is created by the backend only when the database is empty and `DEFAULT_ADMIN_EMAIL` plus `DEFAULT_ADMIN_PASSWORD` are set.
- Runtime configuration lives in `.env`. A template is provided in `.env.example`.
- The frontend talks to the API through `VITE_API_BASE_URL`, which defaults to `/api`.
- Daily backups include both a PostgreSQL dump and a compressed archive of the `uploads` directory.

## Reusing an existing Postgres container

If you already have a PostgreSQL container running for another stack, you can deploy Secondary CRM without starting the bundled `db` service.

For a Linux server such as Pop!_OS, run:

```bash
chmod +x ./ops/deploy-shared-postgres.sh
./ops/deploy-shared-postgres.sh
```

For local Windows use, the equivalent helper is:

```powershell
powershell -ExecutionPolicy Bypass -File .\ops\deploy-shared-postgres.ps1
```

The helper will:

- inspect the running Postgres containers
- ask which container and Docker network to use
- create the Secondary CRM database if it does not exist yet
- generate a dedicated `.env.deploy` file without touching your local `.env`
- start the stack with `docker-compose.external-db.yml`

That deployment path keeps the normal `backend`, `frontend`, and `backup` services, and the backup container still performs the daily database dump plus uploads archive over the shared Docker network.
