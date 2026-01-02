#!/bin/bash
# OpenSpec: Create Change Proposal
# Usage: /openspec:proposal <change-name>

CHANGE_NAME="$1"

if [ -z "$CHANGE_NAME" ]; then
  echo "Error: Change name required"
  echo "Usage: /openspec:proposal <change-name>"
  exit 1
fi

CHANGE_DIR="openspec/changes/$CHANGE_NAME"

if [ -d "$CHANGE_DIR" ]; then
  echo "Error: Change '$CHANGE_NAME' already exists"
  exit 1
fi

# Create change directory structure
mkdir -p "$CHANGE_DIR/specs"

echo "✅ Created OpenSpec change proposal: $CHANGE_NAME"
echo ""
echo "Next steps:"
echo "1. Fill out proposal.md (why and what)"
echo "2. Create tasks.md (implementation checklist)"
echo "3. Add specs with deltas (ADDED/MODIFIED/REMOVED)"
echo "4. Validate with: openspec validate $CHANGE_NAME"
