#!/bin/bash

# Variables for repository URL and date
REPO_URL="https://github.com/AIPL-labs/ai-ui"
# today=$(date +%F)

# # Output the header with today's date
# echo "Changes for $today:"
# echo ""

# # Get the git log for today, exclude commits containing 'Update version'
# git log --since="$today 00:00:00" --until="$today 23:59:59" --pretty=format:"- %s ([%h]($REPO_URL/commit/%H)) by %an" | grep -v "Update version"



#!/bin/bash

# Variables for repository URL and commit path
# REPO_URL="https://github.com/USERNAME/REPOSITORY"
COMMIT_PATH="/commit"

# Output the header for the changelog
echo "# Changelog"
echo ""

# Get the git log grouped by date
git log --pretty=format:"%ad %s ([%h]($REPO_URL$COMMIT_PATH/%H)) by %an" --date=short | grep -v "Update version" | while IFS= read -r line; do
    # Extract the date from the line
    current_date=$(echo "$line" | awk '{print $1}')
    
    # If the date has changed, print it as a new section
    if [ "$current_date" != "$last_date" ]; then
        echo ""
        echo "## $current_date"
        last_date=$current_date
    fi

    # Print the commit message without the date
    echo "- $(echo "$line" | sed 's/^[0-9-]* //')"
done
