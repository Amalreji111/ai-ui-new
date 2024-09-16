#!/bin/bash

# Variables for repository URL and date
REPO_URL="https://github.com/AIPL-labs/ai-ui"
today=$(date +%F)

# Output the header with today's date
echo "Changes for $today:"
echo ""

# Get the git log for today, exclude commits containing 'Update version'
git log --since="$today 00:00:00" --until="$today 23:59:59" --pretty=format:"- %s ([%h]($REPO_URL/commit/%H)) by %an" | grep -v "Update version"
