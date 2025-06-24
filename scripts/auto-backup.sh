#!/bin/bash

# WellBe Auto-Backup System
# Runs every 30 minutes to backup everything to Dropbox

TIMESTAMP=$(date +%Y-%m-%dT%H-%M-%S)
PROJECT_DIR="/Users/silviomac/wellbe"
BACKUP_BASE="/Users/silviomac/Library/CloudStorage/Dropbox/Apps/bewellbe-data-sync/bewellbe-data"
BACKUP_DIR="$BACKUP_BASE/auto-backup-$TIMESTAMP"
LATEST_LINK="$BACKUP_BASE/latest-backup"

echo "🔄 Starting auto-backup at $TIMESTAMP"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Copy entire project
echo "📁 Copying project files..."
cp -r "$PROJECT_DIR" "$BACKUP_DIR/"

# Create git status backup
cd "$PROJECT_DIR"
echo "🔍 Capturing git status..."
git status > "$BACKUP_DIR/git-status.txt" 2>&1
git log --oneline -10 > "$BACKUP_DIR/git-recent-commits.txt" 2>&1
git diff > "$BACKUP_DIR/git-uncommitted-changes.txt" 2>&1

# Create system info
echo "💻 Capturing system info..."
echo "Backup created: $TIMESTAMP" > "$BACKUP_DIR/backup-info.txt"
echo "PWD: $(pwd)" >> "$BACKUP_DIR/backup-info.txt"
echo "Git branch: $(git branch --show-current 2>/dev/null || echo 'unknown')" >> "$BACKUP_DIR/backup-info.txt"
echo "Last modified files:" >> "$BACKUP_DIR/backup-info.txt"
find . -type f -name "*.html" -o -name "*.js" -o -name "*.css" -exec ls -la {} \; | head -20 >> "$BACKUP_DIR/backup-info.txt"

# Update latest link
rm -f "$LATEST_LINK"
ln -s "$BACKUP_DIR" "$LATEST_LINK"

# Keep only last 20 backups (cleanup old ones)
cd "$BACKUP_BASE"
ls -dt auto-backup-* | tail -n +21 | xargs rm -rf

echo "✅ Backup complete: $BACKUP_DIR"
echo "🔗 Latest backup link updated"

# Log to central backup log
echo "$TIMESTAMP - Backup completed successfully" >> "$BACKUP_BASE/backup.log"