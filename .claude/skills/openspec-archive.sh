#!/bin/bash
# OpenSpec: Archive Completed Change
# Usage: /openspec:archive <change-name>

CHANGE_NAME="$1"

if [ -z "$CHANGE_NAME" ]; then
  echo "Error: Change name required"
  echo "Usage: /openspec:archive <change-name>"
  exit 1
fi

cd "$(dirname "$0")/../.." || exit 1

# Run openspec archive command
openspec archive "$CHANGE_NAME" --yes

if [ $? -eq 0 ]; then
  echo "✅ Successfully archived: $CHANGE_NAME"
  echo ""
  echo "Changes merged to openspec/specs/"
  echo "Original moved to openspec/archive/"
else
  echo "❌ Failed to archive $CHANGE_NAME"
  exit 1
fi
