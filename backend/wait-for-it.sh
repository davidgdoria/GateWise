#!/usr/bin/env bash
#   Use this script to test if a given TCP host/port are available
#   Copied from https://github.com/vishnubob/wait-for-it

set -e

HOST="$1"
PORT="$2"
shift 2

while ! nc -z "$HOST" "$PORT"; do
  echo "Waiting for $HOST:$PORT..."
  sleep 1
done

exec "$@"
