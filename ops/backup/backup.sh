#!/bin/sh
set -eu

timestamp="$(date '+%Y%m%d-%H%M%S')"
backup_dir="/backups/${timestamp}"

mkdir -p "${backup_dir}"

export PGPASSWORD="${POSTGRES_PASSWORD:?POSTGRES_PASSWORD is required}"

pg_dump \
  -h "${PGHOST:-db}" \
  -p "${PGPORT:-5432}" \
  -U "${POSTGRES_USER:?POSTGRES_USER is required}" \
  -d "${POSTGRES_DB:?POSTGRES_DB is required}" \
  -F c \
  -f "${backup_dir}/database.dump"

if [ -d /data/uploads ]; then
  tar -czf "${backup_dir}/uploads.tar.gz" -C /data uploads
fi

cat > "${backup_dir}/manifest.txt" <<EOF
created_at=${timestamp}
database_file=database.dump
uploads_archive=uploads.tar.gz
EOF

find /backups -mindepth 1 -maxdepth 1 -type d -mtime +"${BACKUP_RETENTION_DAYS:-14}" -exec rm -rf {} +
