#!/bin/bash
# OpenSpec: Apply/Implement Change
# Usage: /openspec:apply <change-name>

CHANGE_NAME="$1"

if [ -z "$CHANGE_NAME" ]; then
  echo "Error: Change name required"
  echo "Usage: /openspec:apply <change-name>"
  exit 1
fi

CHANGE_DIR="openspec/changes/$CHANGE_NAME"

if [ ! -d "$CHANGE_DIR" ]; then
  echo "Error: Change '$CHANGE_NAME' not found"
  echo "Available changes:"
  ls -1 openspec/changes/ 2>/dev/null || echo "  (none)"
  exit 1
fi

TASKS_FILE="$CHANGE_DIR/tasks.md"

if [ ! -f "$TASKS_FILE" ]; then
  echo "Error: tasks.md not found in $CHANGE_DIR"
  exit 1
fi

echo "✅ Ready to implement: $CHANGE_NAME"
echo ""
echo "Tasks to complete:"
cat "$TASKS_FILE"
echo ""
echo "Work through these tasks systematically."
echo "When done, archive with: openspec archive $CHANGE_NAME --yes"
