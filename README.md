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
