#!/bin/sh
set -e

echo "Starting VM Inventory Manager (production)..."
exec node server.js
