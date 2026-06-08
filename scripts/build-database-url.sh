#!/bin/sh
# Build DATABASE_URL from POSTGRES_* vars (URL-encodes password for special characters).
build_database_url() {
  DATABASE_URL="$(node -e "
    const user = process.env.POSTGRES_USER || 'postgres';
    const pass = encodeURIComponent(process.env.POSTGRES_PASSWORD || 'postgres');
    const host = process.env.POSTGRES_HOST || 'postgres';
    const port = process.env.POSTGRES_PORT || '5432';
    const db = process.env.POSTGRES_DB || 'vm_inventory';
    process.stdout.write(
      'postgresql://' + user + ':' + pass + '@' + host + ':' + port + '/' + db + '?schema=public'
    );
  ")"
  export DATABASE_URL
}
