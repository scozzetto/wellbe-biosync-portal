#!/bin/bash

# Backup Verification & Recovery System
echo "🔍 WellBe Backup Verification System"

BACKUP_BASE="/Users/silviomac/Library/CloudStorage/Dropbox/Apps/bewellbe-data-sync/bewellbe-data"
PROJECT_DIR="/Users/silviomac/wellbe"

echo "📊 Backup Status Report - $(date)"
echo "=================================="

# Check if backup directory exists
if [ ! -d "$BACKUP_BASE" ]; then
    echo "❌ ERROR: Backup directory not found at $BACKUP_BASE"
    exit 1
fi

# Count backups
backup_count=$(ls -1 "$BACKUP_BASE"/auto-backup-* 2>/dev/null | wc -l | tr -d ' ')
session_count=$(ls -1 "$BACKUP_BASE"/sessions/session-* 2>/dev/null | wc -l | tr -d ' ')

echo "📁 Project backups found: $backup_count"
echo "💬 Session backups found: $session_count"

# Check latest backup
if [ -L "$BACKUP_BASE/latest-backup" ]; then
    latest_backup=$(readlink "$BACKUP_BASE/latest-backup")
    latest_time=$(basename "$latest_backup" | sed 's/auto-backup-//')
    echo "⏰ Latest backup: $latest_time"
    
    # Verify backup contents
    if [ -f "$latest_backup/wellbe/CLAUDE.md" ]; then
        echo "✅ Latest backup contains CLAUDE.md"
    else
        echo "❌ Latest backup missing CLAUDE.md"
    fi
    
    if [ -f "$latest_backup/backup-info.txt" ]; then
        echo "✅ Backup info file present"
        echo "📋 Backup details:"
        head -5 "$latest_backup/backup-info.txt" | sed 's/^/   /'
    fi
else
    echo "❌ No latest-backup symlink found"
fi

# Check latest session
if [ -L "$BACKUP_BASE/latest-session" ]; then
    latest_session=$(readlink "$BACKUP_BASE/latest-session")
    session_time=$(basename "$latest_session" | sed 's/session-//')
    echo "💬 Latest session: $session_time"
    
    if [ -f "$latest_session/session-info.md" ]; then
        echo "✅ Session info available"
    fi
else
    echo "❌ No latest-session symlink found"
fi

# Check backup logs
if [ -f "$BACKUP_BASE/backup.log" ]; then
    echo "📝 Recent backup activity:"
    tail -3 "$BACKUP_BASE/backup.log" | sed 's/^/   /'
fi

# Git status in main project
cd "$PROJECT_DIR"
echo ""
echo "🔄 Current Git Status:"
echo "Branch: $(git branch --show-current 2>/dev/null || echo 'unknown')"
echo "Last commit: $(git log --oneline -1 2>/dev/null || echo 'no commits')"
uncommitted=$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')
echo "Uncommitted changes: $uncommitted files"

echo ""
echo "🎯 Recommendations:"
if [ "$backup_count" -lt 3 ]; then
    echo "⚠️  Consider running more frequent backups"
fi

if [ "$uncommitted" -gt 0 ]; then
    echo "⚠️  You have uncommitted changes - consider committing and backing up"
fi

echo "✅ Backup verification complete"