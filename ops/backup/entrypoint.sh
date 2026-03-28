#!/bin/sh
set -eu

mkdir -p /backups

if [ -n "${TZ:-}" ] && [ -f "/usr/share/zoneinfo/${TZ}" ]; then
  cp "/usr/share/zoneinfo/${TZ}" /etc/localtime
  echo "${TZ}" > /etc/timezone
fi

cat > /etc/crontabs/root <<EOF
${BACKUP_SCHEDULE:-0 2 * * *} PGHOST=${PGHOST:-db} PGPORT=${PGPORT:-5432} POSTGRES_USER=${POSTGRES_USER:-crm_user} POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-crm_password} POSTGRES_DB=${POSTGRES_DB:-real_estate_crm} BACKUP_RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-14} sh /scripts/backup.sh >> /var/log/backup.log 2>&1
EOF

echo "Scheduled backup with cron: ${BACKUP_SCHEDULE:-0 2 * * *}"
echo "Backups will be written to /backups"

crond -f -l 2
