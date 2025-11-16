# Security Deployment Checklist

**Version:** 1.0  
**Last Updated:** 2025-01-15  
**Owner:** Security Team

> **CRITICAL:** This checklist must be completed and signed off before **EVERY** production deployment.

---

## Pre-Deployment Security Checks

### 1. Code Security ✅

- [ ] **Run security audit script**
  ```bash
  ./scripts/security-audit.sh
  ```
- [ ] All critical and high severity npm vulnerabilities resolved
- [ ] No hardcoded secrets in code (API keys, passwords, tokens)
- [ ] No `dangerouslySetInnerHTML` without DOMPurify sanitization
- [ ] No `eval()` usage in production code
- [ ] TypeScript strict mode enabled (`tsconfig.strict.json`)

### 2. Authentication & Authorization ✅

- [ ] Auto-confirm email signups disabled in production (Lovable Cloud → Auth settings)
- [ ] Password strength requirements enforced (min 8 chars, uppercase, lowercase, number, special)
- [ ] Rate limiting active on authentication endpoints (5 login attempts per 15 min)
- [ ] Session expiration configured (default: 7 days)
- [ ] RLS (Row Level Security) policies verified for all new tables
- [ ] Admin routes protected with role-based access checks
- [ ] Child validation middleware active on child routes

### 3. Input Validation & Sanitization ✅

- [ ] All form inputs validated client-side with Zod schemas
- [ ] Server-side validation on all edge functions
- [ ] HTML content sanitized with DOMPurify before rendering
- [ ] UUID validation for all ID parameters
- [ ] SQL injection protection verified (no raw SQL in edge functions)
- [ ] XSS protection tested with malicious payloads

### 4. API Security ✅

- [ ] Rate limiting configured for all public edge functions:
  - Auth endpoints: 5 req/15 min per user
  - AI generation: 10 req/day per user
  - Feedback: 5 req/day per user
- [ ] CORS headers properly configured (origin whitelisting)
- [ ] API keys stored in Lovable Cloud Secrets (never in code)
- [ ] Edge function JWT verification enabled (or explicitly disabled with reason)
- [ ] Request size limits enforced (max 10MB)

### 5. Database Security ✅

- [ ] All tables have RLS policies enabled
- [ ] Foreign key constraints validated
- [ ] Sensitive data encrypted at rest (emotion logs use `pgcrypto`)
- [ ] Database backups verified (automated daily 2 AM UTC)
- [ ] Connection pooling configured (pg_bouncer settings checked)
- [ ] No direct SQL execution in edge functions

### 6. Security Headers ✅

Verify `public/_headers` includes:

- [ ] `Content-Security-Policy` (CSP) - prevents XSS
- [ ] `X-Frame-Options: DENY` - prevents clickjacking
- [ ] `X-Content-Type-Options: nosniff` - prevents MIME sniffing
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Permissions-Policy` - restricts browser features
- [ ] `Strict-Transport-Security` (HSTS) - enforces HTTPS

### 7. SSL/TLS Configuration ✅

- [ ] Lovable Cloud auto-SSL certificate active
- [ ] Custom domain SSL verified (if using custom domain)
- [ ] Certificate expiration > 30 days
- [ ] HTTPS redirect enforced (no HTTP access)
- [ ] TLS 1.2+ required (no TLS 1.0/1.1)

### 8. Monitoring & Logging ✅

- [ ] Error logging active (`error_logs` table)
- [ ] Rate limit violations logged (`rate_limit_violations` table)
- [ ] Security access log configured for sensitive operations
- [ ] Admin audit trail enabled (`role_audit_log`)
- [ ] Supabase Auth logs reviewed (last 7 days)
- [ ] No sensitive data in console logs (passwords, tokens, PII)

### 9. Third-Party Dependencies ✅

- [ ] All npm packages up to date
- [ ] No known vulnerabilities in dependencies (`npm audit`)
- [ ] Unused dependencies removed
- [ ] Package lock file committed (`package-lock.json`)
- [ ] Supabase SDK version verified (v2.75.0+)

### 10. Compliance (COPPA/FERPA) ✅

- [ ] Parental consent flow verified
- [ ] Privacy policy accessible (`/privacy`)
- [ ] Terms of service accessible (`/terms`)
- [ ] Data deletion functionality tested
- [ ] Parent data access verified (download child data)
- [ ] Email opt-out mechanisms working

---

## Deployment Process

### Step 1: Run Automated Tests

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Security tests
npm run test:e2e:security

# Accessibility tests
npm run test:e2e:a11y
```

**Gate:** All tests must pass. No exceptions.

### Step 2: Manual Security Review

- [ ] Review all code changes in PR
- [ ] Check for new database migrations (review SQL)
- [ ] Verify new edge functions have rate limiting
- [ ] Test authentication flows manually
- [ ] Verify critical user journeys work

### Step 3: Staging Deployment

```bash
# Deploy to staging
npm run deploy:staging

# Run smoke tests
./scripts/staging-smoke-tests.sh
```

- [ ] Smoke tests pass (100%)
- [ ] Performance metrics within budget (Lighthouse > 85)
- [ ] No console errors in browser DevTools
- [ ] Mobile responsiveness verified

### Step 4: Security Verification

```bash
# Run security audit
./scripts/security-audit.sh

# Review audit report
cat security-reports/audit-latest.txt
```

- [ ] No critical vulnerabilities
- [ ] No hardcoded secrets detected
- [ ] Security headers verified

### Step 5: Production Deployment

```bash
# Merge to main branch (triggers deployment)
git checkout main
git merge develop
git push origin main
```

- [ ] Deployment completes successfully
- [ ] Health check endpoint returns 200 (`/api/health`)
- [ ] Critical flows tested in production
- [ ] Rollback plan confirmed

---

## Post-Deployment Verification

### Immediate Checks (Within 5 minutes)

- [ ] Application loads without errors
- [ ] Login/signup flows work
- [ ] Database connections active
- [ ] Edge functions responding
- [ ] No 500 errors in logs

### 15-Minute Checks

- [ ] User sessions persisting correctly
- [ ] Email notifications sending
- [ ] Analytics tracking events
- [ ] Performance within acceptable range (< 3s load time)

### 24-Hour Monitoring

- [ ] Error rate < 0.1% (check `error_logs` table)
- [ ] No spike in rate limit violations
- [ ] No security alerts triggered
- [ ] User feedback reviewed (Beta Feedback Widget)

---

## Incident Response

If security issue detected:

1. **STOP DEPLOYMENT** - Do not proceed to production
2. **Document Issue** - Log in `security-reports/incidents/`
3. **Assess Severity:**
   - **P0 (Critical):** Data breach, authentication bypass → Rollback immediately
   - **P1 (High):** Exploitable vulnerability → Fix within 4 hours
   - **P2 (Medium):** Security weakness → Fix within 24 hours
   - **P3 (Low):** Minor issue → Fix in next sprint
4. **Notify Stakeholders** - Email security@innerodyssey.com
5. **Implement Fix** - Create hotfix branch
6. **Verify Fix** - Re-run security tests
7. **Post-Mortem** - Document learnings in `docs/incidents/`

---

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **Developer** | ___________ | ___________ | ______ |
| **Security Lead** | ___________ | ___________ | ______ |
| **Engineering Manager** | ___________ | ___________ | ______ |

**Deployment Approved:** ☐ Yes  ☐ No

---

## Additional Resources

- [Security Architecture](./SECURITY.md)
- [Security Testing Guide](./security-testing-guide.md)
- [Incident Response Plan](./SECURITY.md#incident-response-plan)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase Security Best Practices](https://supabase.com/docs/guides/platform/going-into-prod)

---

**Next Review:** 2025-02-15 (Monthly checklist review)
