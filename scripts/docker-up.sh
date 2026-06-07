#!/usr/bin/env bash
# Wrapper — use deploy.sh for production Linux deployment
exec "$(dirname "$0")/../deploy.sh" "$@"
