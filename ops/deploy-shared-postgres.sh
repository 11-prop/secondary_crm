#!/usr/bin/env bash

set -euo pipefail

env_file=".env.deploy"
compose_file="docker-compose.external-db.yml"
skip_compose_up="false"

while (($# > 0)); do
  case "$1" in
    --env-file)
      env_file="${2:?Missing value for --env-file}"
      shift 2
      ;;
    --compose-file)
      compose_file="${2:?Missing value for --compose-file}"
      shift 2
      ;;
    --skip-compose-up)
      skip_compose_up="true"
      shift
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 1
      ;;
  esac
done

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "$script_dir/.." && pwd)"
env_path="$project_root/$env_file"
compose_path="$project_root/$compose_file"

section() {
  printf '\n== %s ==\n' "$1"
}

prompt_value() {
  local prompt="$1"
  local default_value="${2:-}"
  local input=""

  if [[ -n "$default_value" ]]; then
    read -r -p "$prompt [$default_value]: " input || true
    if [[ -z "$input" ]]; then
      printf '%s\n' "$default_value"
      return
    fi
  else
    read -r -p "$prompt: " input || true
  fi

  printf '%s\n' "$input"
}

prompt_required() {
  local prompt="$1"
  local default_value="${2:-}"
  local value=""

  while true; do
    value="$(prompt_value "$prompt" "$default_value")"
    if [[ -n "$value" ]]; then
      printf '%s\n' "$value"
      return
    fi

    echo "A value is required." >&2
  done
}

prompt_secret() {
  local prompt="$1"
  local value=""

  while true; do
    read -r -s -p "$prompt: " value || true
    printf '\n'
    if [[ -n "$value" ]]; then
      printf '%s\n' "$value"
      return
    fi

    echo "A value is required." >&2
  done
}

confirm_action() {
  local prompt="$1"
  local default_value="${2:-yes}"
  local suffix="Y/n"
  local value=""

  if [[ "$default_value" != "yes" ]]; then
    suffix="y/N"
  fi

  read -r -p "$prompt [$suffix]: " value || true
  if [[ -z "$value" ]]; then
    [[ "$default_value" == "yes" ]]
    return
  fi

  case "${value,,}" in
    y|yes) return 0 ;;
    *) return 1 ;;
  esac
}

docker_cmd() {
  docker "$@"
}

container_env_value() {
  local container_name="$1"
  local key="$2"
  docker inspect --format '{{range .Config.Env}}{{println .}}{{end}}' "$container_name" \
    | awk -F= -v target="$key" '$1 == target { $1=""; sub(/^=/, ""); print; exit }'
}

select_network() {
  local container_name="$1"
  mapfile -t networks < <(
    docker inspect --format '{{range $name, $_ := .NetworkSettings.Networks}}{{println $name}}{{end}}' "$container_name" \
      | sed '/^$/d' \
      | grep -Ev '^(bridge|host|none)$' || true
  )

  if ((${#networks[@]} == 0)); then
    echo "The Postgres container is not attached to a user-defined Docker network." >&2
    exit 1
  fi

  if ((${#networks[@]} == 1)); then
    echo "${networks[0]}"
    return
  fi

  echo "Select the Docker network this stack should join:" >&2
  local index=1
  for network_name in "${networks[@]}"; do
    printf '[%s] %s\n' "$index" "$network_name" >&2
    index=$((index + 1))
  done

  while true; do
    local selection=""
    read -r -p "Enter the network number: " selection || true
    if [[ "$selection" =~ ^[0-9]+$ ]] && ((selection >= 1 && selection <= ${#networks[@]})); then
      echo "${networks[selection - 1]}"
      return
    fi

    echo "Enter a valid number from the list." >&2
  done
}

assert_database_name() {
  local database_name="$1"
  if [[ ! "$database_name" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
    echo "Database names must start with a letter or underscore and contain only letters, numbers, or underscores." >&2
    exit 1
  fi
}

database_exists() {
  local container_name="$1"
  local postgres_user="$2"
  local postgres_password="$3"
  local admin_database="$4"
  local target_database="$5"

  local result=""
  result="$(
    docker exec \
      -e "PGPASSWORD=$postgres_password" \
      "$container_name" \
      psql \
      -v ON_ERROR_STOP=1 \
      -U "$postgres_user" \
      -d "$admin_database" \
      -tAc "SELECT 1 FROM pg_database WHERE datname = '$target_database';"
  )"

  [[ "${result//[$'\r\n\t ']}" == "1" ]]
}

create_database_if_missing() {
  local container_name="$1"
  local postgres_user="$2"
  local postgres_password="$3"
  local admin_database="$4"
  local target_database="$5"

  assert_database_name "$target_database"

  if database_exists "$container_name" "$postgres_user" "$postgres_password" "$admin_database" "$target_database"; then
    echo "Database '$target_database' already exists."
    return
  fi

  echo "Creating database '$target_database' in container '$container_name'..."
  docker exec \
    -e "PGPASSWORD=$postgres_password" \
    "$container_name" \
    psql \
    -v ON_ERROR_STOP=1 \
    -U "$postgres_user" \
    -d "$admin_database" \
    -c "CREATE DATABASE \"$target_database\";" >/dev/null
}

generate_secret_key() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -base64 48 | tr -d '\n=' | tr '+/' 'AB'
    return
  fi

  tr -dc 'A-Za-z0-9' </dev/urandom | head -c 64
}

escape_env_value() {
  printf '%s' "$1" | tr -d '\r\n'
}

section "Checking prerequisites"

if ! docker_cmd version >/dev/null 2>&1; then
  echo "Docker is required and must be available in PATH." >&2
  exit 1
fi

if [[ ! -f "$compose_path" ]]; then
  echo "Compose file not found: $compose_path" >&2
  exit 1
fi

mapfile -t postgres_containers < <(
  docker ps --format '{{.Names}}|{{.Image}}' \
    | awk -F'|' '$2 ~ /postgres/ { print $0 }'
)

if ((${#postgres_containers[@]} == 0)); then
  echo "No running Postgres containers were detected. Start the shared Postgres container first." >&2
  exit 1
fi

section "Shared Postgres container"
echo "Detected running Postgres containers:"
for entry in "${postgres_containers[@]}"; do
  printf ' - %s\n' "$entry"
done

default_container="${postgres_containers[0]%%|*}"
postgres_container_name="$(prompt_required "Postgres container name" "$default_container")"

if ! docker inspect "$postgres_container_name" >/dev/null 2>&1; then
  echo "Container not found: $postgres_container_name" >&2
  exit 1
fi

external_network="$(select_network "$postgres_container_name")"
database_host="$(docker inspect --format '{{.Name}}' "$postgres_container_name" | sed 's#^/##')"
database_port="5432"

detected_user="$(container_env_value "$postgres_container_name" "POSTGRES_USER")"
detected_admin_database="$(container_env_value "$postgres_container_name" "POSTGRES_DB")"
detected_user="${detected_user:-postgres}"
detected_admin_database="${detected_admin_database:-postgres}"

section "Database connection"
postgres_user="$(prompt_required "Postgres user" "$detected_user")"
postgres_password="$(prompt_secret "Postgres password")"
admin_database="$(prompt_required "Admin database for provisioning" "$detected_admin_database")"
target_database="$(prompt_required "Database name for SecondaryCRM" "secondary_crm")"

create_database_if_missing "$postgres_container_name" "$postgres_user" "$postgres_password" "$admin_database" "$target_database"

section "App configuration"
frontend_port="$(prompt_required "Frontend host port" "4173")"
backend_port="$(prompt_required "Backend host port" "8000")"
frontend_url="$(prompt_required "Frontend public URL" "http://localhost:$frontend_port")"
api_base_url="$(prompt_required "Frontend API base URL" "/api")"
admin_name="$(prompt_required "Bootstrap admin name" "System Administrator")"
admin_email="$(prompt_required "Bootstrap admin email" "admin@example.com")"
admin_password="$(prompt_secret "Bootstrap admin password")"
backup_schedule="$(prompt_required "Backup schedule (cron)" "0 2 * * *")"
backup_retention_days="$(prompt_required "Backup retention in days" "14")"
timezone_value="$(prompt_required "Backup timezone" "Asia/Karachi")"
secret_key="$(prompt_value "Secret key (leave blank to generate one)")"

if [[ -z "$secret_key" ]]; then
  secret_key="$(generate_secret_key)"
  echo "Generated a new SECRET_KEY."
fi

section "Review"
printf 'Postgres container : %s\n' "$postgres_container_name"
printf 'Docker network     : %s\n' "$external_network"
printf 'Database host      : %s\n' "$database_host"
printf 'Database name      : %s\n' "$target_database"
printf 'Frontend URL       : %s\n' "$frontend_url"
printf 'Frontend port      : %s\n' "$frontend_port"
printf 'Backend port       : %s\n' "$backend_port"
printf 'Env file           : %s\n' "$env_path"

if [[ -f "$env_path" ]]; then
  if ! confirm_action "The env file already exists. Overwrite it?" "no"; then
    echo "Deployment cancelled."
    exit 1
  fi
fi

if ! confirm_action "Write the deployment env file and continue?" "yes"; then
  echo "Deployment cancelled."
  exit 1
fi

cat >"$env_path" <<EOF
POSTGRES_USER=$(escape_env_value "$postgres_user")
POSTGRES_PASSWORD=$(escape_env_value "$postgres_password")
POSTGRES_DB=$(escape_env_value "$target_database")
DATABASE_HOST=$(escape_env_value "$database_host")
DATABASE_PORT=$(escape_env_value "$database_port")
EXTERNAL_POSTGRES_NETWORK=$(escape_env_value "$external_network")
FRONTEND_URL=$(escape_env_value "$frontend_url")
VITE_API_BASE_URL=$(escape_env_value "$api_base_url")
BACKEND_PORT=$(escape_env_value "$backend_port")
FRONTEND_PORT=$(escape_env_value "$frontend_port")
SECRET_KEY=$(escape_env_value "$secret_key")
DEFAULT_ADMIN_EMAIL=$(escape_env_value "$admin_email")
DEFAULT_ADMIN_PASSWORD=$(escape_env_value "$admin_password")
DEFAULT_ADMIN_NAME=$(escape_env_value "$admin_name")
BACKUP_SCHEDULE=$(escape_env_value "$backup_schedule")
BACKUP_RETENTION_DAYS=$(escape_env_value "$backup_retention_days")
TZ=$(escape_env_value "$timezone_value")
EOF

chmod 600 "$env_path"
echo "Wrote deployment env file to $env_path"

if [[ "$skip_compose_up" == "true" ]]; then
  section "Done"
  echo "Skipping docker compose up because --skip-compose-up was supplied."
  echo "Run: docker compose --env-file $env_file -f $compose_file up --build -d"
  exit 0
fi

section "Starting the stack"
(
  cd "$project_root"
  docker compose --env-file "$env_file" -f "$compose_file" up --build -d
)

section "Deployment complete"
printf 'Frontend: %s\n' "$frontend_url"
printf 'Backend : http://localhost:%s/api/health\n' "$backend_port"
printf 'Bootstrap admin email: %s\n' "$admin_email"
echo "The admin password is the value you entered during setup."
