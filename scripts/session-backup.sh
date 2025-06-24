#!/bin/bash

# Session & Conversation Backup System
# Captures current session state and conversation context

TIMESTAMP=$(date +%Y-%m-%dT%H-%M-%S)
BACKUP_BASE="/Users/silviomac/Library/CloudStorage/Dropbox/Apps/bewellbe-data-sync/bewellbe-data"
SESSION_DIR="$BACKUP_BASE/sessions/session-$TIMESTAMP"

echo "💬 Starting session backup at $TIMESTAMP"

# Create session directory
mkdir -p "$SESSION_DIR"

# Capture current working state
cd "/Users/silviomac/wellbe"
echo "📝 Capturing current session state..."

# Create session info file
cat > "$SESSION_DIR/session-info.md" << EOF
# Session Backup - $TIMESTAMP

## Current Project State
- **Directory**: $(pwd)
- **Git Branch**: $(git branch --show-current 2>/dev/null || echo 'unknown')
- **Last Commit**: $(git log --oneline -1 2>/dev/null || echo 'no commits')
- **Uncommitted Changes**: $(git status --porcelain | wc -l | tr -d ' ') files

## Recent Activity Summary
$(git log --oneline -5 2>/dev/null || echo 'No recent commits')

## Modified Files
$(git status --porcelain 2>/dev/null || echo 'No changes')

## Current Time
$(date)

## Project Overview
This is the WellBe medical patient management system including:
- Front desk dashboard with patient check-in/out
- Real-time patient status tracking  
- End of day archival and reporting
- Automated backup systems

## Key Recent Changes
- Enhanced front desk dashboard with status filtering
- Fixed End of Day process to archive instead of delete
- Added "Checked In", "Currently in Treatment", "Was Seen", "All Patients" filters
- Implemented Reprint End of Day functionality
- Set up automated backup systems

## Current Issues/Tasks
- Automated backups now running every 30 minutes
- Session backups capture conversation context
- All data preserved in Dropbox with timestamps

EOF

# Copy current CLAUDE.md if it exists
if [ -f "CLAUDE.md" ]; then
    cp "CLAUDE.md" "$SESSION_DIR/"
fi

# Copy any recent backup logs
if [ -f "$BACKUP_BASE/backup.log" ]; then
    tail -50 "$BACKUP_BASE/backup.log" > "$SESSION_DIR/recent-backups.log"
fi

# Update latest session link
rm -f "$BACKUP_BASE/latest-session"
ln -s "$SESSION_DIR" "$BACKUP_BASE/latest-session"

echo "✅ Session backup complete: $SESSION_DIR"
echo "$TIMESTAMP - Session backup completed" >> "$BACKUP_BASE/session.log"