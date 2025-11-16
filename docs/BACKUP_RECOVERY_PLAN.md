# Database Backup & Recovery Plan

## Overview
This document outlines the backup strategy, recovery procedures, and verification processes for the Inner Odyssey production database.

---

## 1. Automated Backup Configuration

### Supabase Automated Backups
- **Schedule:** Daily at 2:00 AM UTC
- **Retention:** 7 days for daily backups
- **Type:** Full database snapshot
- **Scope:** All tables, functions, triggers, and data
- **Storage:** Supabase managed backup storage (encrypted at rest)

### Configuration Steps
1. Navigate to Lovable Cloud backend settings
2. Under "Database" → "Backups"
3. Verify "Automated Backups" is enabled
4. Confirm schedule: Daily at 2:00 AM UTC
5. Set retention period: 7 days

---

## 2. Point-in-Time Recovery (PITR)

### Capabilities
- **Recovery Window:** Last 7 days
- **Granularity:** Down to the second
- **RTO (Recovery Time Objective):** 4 hours
- **RPO (Recovery Point Objective):** 24 hours (daily backups)

### When to Use PITR
- Accidental data deletion
- Bad migration rollback
- Data corruption discovered within 7 days
- Testing disaster recovery procedures

---

## 3. Recovery Procedures

### Scenario 1: Restore to Previous Backup (Full Database)

**When:** Complete database corruption, need to restore entire database

**Steps:**
1. **Access Backup Management:**
   - Open Lovable Cloud backend
   - Navigate to Database → Backups
   - View available backups (last 7 days)

2. **Initiate Restore:**
   - Select target backup (by date/time)
   - Click "Restore Backup"
   - **CRITICAL:** This will overwrite current database
   - Confirm restore operation

3. **Verify Restore:**
   - Run verification queries (see Section 5)
   - Check record counts match expected values
   - Test critical application flows
   - Verify RLS policies still active

4. **Post-Restore Actions:**
   - Notify team of restore completion
   - Update incident log
   - Monitor error rates for 1 hour
   - Review what caused the need for restore

**Estimated Time:** 30-60 minutes

---

### Scenario 2: Point-in-Time Recovery (Specific Timestamp)

**When:** Need to restore to a specific time (e.g., 2 hours ago before bad migration)

**Steps:**
1. **Identify Target Time:**
   - Determine exact timestamp to restore to
   - Example: "2025-01-16 14:30:00 UTC"
   - Confirm this was after last known good state

2. **Initiate PITR:**
   - Open Lovable Cloud backend
   - Navigate to Database → Backups → Point-in-Time Recovery
   - Enter target timestamp
   - Review preview of data state at that time
   - Confirm PITR operation

3. **Verify Restore:**
   - Run verification queries
   - Check specific records that were problematic
   - Test affected features

4. **Document:**
   - Log timestamp restored to
   - Document reason for PITR
   - Note any data loss (changes between restore point and incident)

**Estimated Time:** 45-90 minutes

---

### Scenario 3: Selective Table Restore

**When:** Only one table corrupted, don't want to restore entire database

**Steps:**
1. **Create Staging Restore:**
   - Restore backup to staging environment
   - This preserves production

2. **Export Target Table:**
   ```sql
   -- In staging environment after restore
   COPY public.target_table TO '/tmp/table_backup.csv' WITH CSV HEADER;
   ```

3. **Truncate and Import to Production:**
   ```sql
   -- In production (CAUTION!)
   BEGIN;
   TRUNCATE public.target_table CASCADE;
   COPY public.target_table FROM '/tmp/table_backup.csv' WITH CSV HEADER;
   COMMIT;
   ```

4. **Verify:**
   - Check record counts
   - Test foreign key relationships
   - Verify RLS policies

**Estimated Time:** 1-2 hours

---

## 4. Backup Verification Checklist

### Daily Verification (Automated - 5 min)
Run this query to verify backup completed:

```sql
-- Check last backup timestamp
SELECT 
  'Last Backup' as check_type,
  NOW() - INTERVAL '24 hours' as expected_after,
  (SELECT MAX(created_at) FROM parent_weekly_reports) as last_record
WHERE 
  (SELECT MAX(created_at) FROM parent_weekly_reports) > NOW() - INTERVAL '48 hours';
```

### Weekly Manual Verification (30 min)
**Every Monday at 10:00 AM UTC:**

1. **Verify Backup Exists:**
   - Login to Lovable Cloud backend
   - Navigate to Database → Backups
   - Confirm last 7 days of backups present
   - Check backup file sizes (should be consistent)

2. **Test Restore to Staging:**
   - Restore yesterday's backup to staging
   - Run smoke tests:
     - Query 10 random user records
     - Check total record counts
     - Verify RLS policies active
   - Delete staging restore

3. **Document:**
   - Log verification completion
   - Note any anomalies
   - Update backup health status

---

## 5. Verification Queries

### Record Count Verification
```sql
SELECT 
  'profiles' as table_name, COUNT(*) as record_count FROM profiles
UNION ALL
SELECT 'children', COUNT(*) FROM children
UNION ALL
SELECT 'lessons', COUNT(*) FROM lessons
UNION ALL
SELECT 'user_progress', COUNT(*) FROM user_progress
UNION ALL
SELECT 'child_generated_lessons', COUNT(*) FROM child_generated_lessons
ORDER BY table_name;
```

### Data Integrity Check
```sql
-- Verify no orphaned children
SELECT COUNT(*) as orphaned_children
FROM children c
LEFT JOIN profiles p ON c.parent_id = p.id
WHERE p.id IS NULL;

-- Should return 0

-- Verify no orphaned progress
SELECT COUNT(*) as orphaned_progress
FROM user_progress up
LEFT JOIN children c ON up.child_id = c.id
WHERE c.id IS NULL;

-- Should return 0
```

### RLS Policy Verification
```sql
-- Verify RLS enabled on critical tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('children', 'profiles', 'user_progress', 'emotion_logs', 'parent_child_messages')
ORDER BY tablename;

-- All should show rowsecurity = true
```

---

## 6. Backup Success/Failure Alerts

### Alert Configuration (Via Lovable Cloud)
1. **Backup Success Notification:**
   - Frequency: Daily at 2:30 AM UTC (30 min after backup)
   - Method: Email to ops@innerodyssey.com
   - Content: "Daily backup completed successfully - [backup_id] - [size]"

2. **Backup Failure Alert:**
   - Trigger: Backup fails or takes >30 minutes
   - Method: Slack webhook + Email (HIGH PRIORITY)
   - Content: "URGENT: Daily backup failed - Immediate action required"
   - Response: Team member must investigate within 1 hour

### Manual Monitoring (Until Automated Alerts Set Up)
**Daily Check (2:30 AM UTC):**
- Login to Lovable Cloud backend
- Navigate to Database → Backups
- Verify new backup created today
- If no backup: Escalate immediately

---

## 7. Disaster Recovery Scenarios

### Scenario A: Database Completely Deleted
**Recovery Steps:**
1. Create new Supabase project with same configuration
2. Restore latest backup to new project
3. Update environment variables in application
4. Run all migrations (should be idempotent)
5. Test authentication flow
6. Switch DNS to new project
7. **Estimated Downtime:** 2-4 hours

### Scenario B: Ransomware/Malicious Deletion
**Recovery Steps:**
1. Immediately revoke all API keys
2. Restore to backup from before attack (use PITR)
3. Force password reset for all users
4. Rotate all secrets and environment variables
5. Conduct security audit
6. **Estimated Downtime:** 4-8 hours

### Scenario C: Supabase Service Outage
**Recovery Steps:**
1. Monitor Supabase status page
2. If outage >1 hour, restore to backup on new provider
3. Use documented self-hosting migration guide
4. **Estimated Downtime:** 4-12 hours (worst case)

---

## 8. Backup Testing Schedule

### Monthly Full Restore Test (Last Friday of Month)
1. Restore full backup to staging environment
2. Run full E2E test suite against restored database
3. Verify all features work
4. Document results
5. Delete test environment

### Quarterly Disaster Recovery Drill
1. Simulate complete database loss
2. Execute full recovery procedure
3. Time the recovery process
4. Identify bottlenecks
5. Update runbook based on findings

---

## 9. Contact Information

### Backup Failures
- **Primary:** DevOps Team Lead
- **Secondary:** Database Administrator
- **Escalation:** CTO (if not resolved in 2 hours)

### Recovery Assistance
- **Supabase Support:** support@supabase.com
- **Lovable Support:** Via Lovable Cloud backend

---

## 10. Audit Trail

### Backup Operations Log
All backup and restore operations are automatically logged in:
```sql
-- View backup operation history
SELECT 
  operation_type,
  performed_by,
  performed_at,
  status,
  details
FROM backup_audit_log
ORDER BY performed_at DESC
LIMIT 50;
```

### Required Documentation
Every restore operation must document:
- Date/time of incident
- Reason for restore
- Backup selected (timestamp)
- Verification results
- Data loss (if any)
- Lessons learned

---

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-01-16 | 1.0 | Initial backup and recovery plan | System |

---

## Next Steps (Post-Day 1)

1. **Week 1 Day 2:** Test point-in-time recovery to staging
2. **Week 1 Day 5:** Set up automated backup verification alerts
3. **Week 2:** Implement automated daily backup success email
4. **Week 3:** First monthly full restore test
5. **Month 3:** First quarterly disaster recovery drill
