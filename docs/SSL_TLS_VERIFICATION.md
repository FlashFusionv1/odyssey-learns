# SSL/TLS Certificate Verification Guide

**Purpose:** Ensure HTTPS is properly configured and certificates are valid before production deployment.

---

## Lovable Cloud Auto-SSL

Lovable Cloud **automatically provisions and renews SSL/TLS certificates** for all deployed applications using Let's Encrypt.

### What's Included

✅ **Automatic Certificate Provisioning**
- Certificates issued within 5-10 minutes of deployment
- Wildcard certificates for subdomains
- Automatic renewal 30 days before expiration

✅ **HTTPS Enforcement**
- HTTP requests automatically redirected to HTTPS
- HSTS header enabled (Strict-Transport-Security)
- TLS 1.2+ required (no legacy protocols)

✅ **Zero Configuration**
- No manual certificate management
- No nginx/Apache configuration needed
- Works for both `.lovable.app` and custom domains

---

## Verification Checklist

### 1. Verify Auto-SSL is Active

**For Lovable Staging Domain:**
```bash
# Check SSL certificate
curl -vI https://your-app.lovable.app 2>&1 | grep -E "SSL certificate|issuer"

# Expected output:
# issuer: C=US; O=Let's Encrypt; CN=R3
# SSL certificate verify ok.
```

**For Custom Domain:**
```bash
# Check SSL certificate
curl -vI https://yourdomain.com 2>&1 | grep -E "SSL certificate|issuer"

# Expected output should show Let's Encrypt issuer
```

### 2. Browser Verification

1. Open your app in Chrome/Firefox
2. Click the padlock icon in address bar
3. Click "Certificate is valid"
4. Verify:
   - ✅ Issued by: Let's Encrypt
   - ✅ Valid from: (recent date)
   - ✅ Valid until: (90 days from issuance)
   - ✅ Subject: your-app.lovable.app or yourdomain.com

### 3. Test HTTPS Redirect

```bash
# HTTP request should redirect to HTTPS
curl -I http://your-app.lovable.app

# Expected: HTTP/1.1 301 Moved Permanently
# Location: https://your-app.lovable.app
```

### 4. Check Security Headers

```bash
# Verify HSTS header
curl -I https://your-app.lovable.app | grep -i "strict-transport-security"

# Expected: Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### 5. SSL Labs Test (Production Only)

For production deployments, run a comprehensive SSL test:

1. Go to: https://www.ssllabs.com/ssltest/
2. Enter your domain
3. Wait for analysis (2-5 minutes)
4. **Required Grade:** A or A+

**Common Issues:**
- Grade B: Old TLS versions enabled (not an issue with Lovable Cloud)
- Grade C: Weak ciphers (contact support if this occurs)

---

## Custom Domain Setup

### Step 1: Configure DNS

Add DNS records for your custom domain:

```
Type: A
Name: @
Value: [Lovable Cloud IP]

Type: CNAME
Name: www
Value: your-app.lovable.app
```

**Get the IP address from:**
- Lovable Dashboard → Project Settings → Domains

### Step 2: Add Custom Domain in Lovable

1. Open Lovable Dashboard
2. Go to: Project > Settings > Domains
3. Click "Add Custom Domain"
4. Enter: `yourdomain.com`
5. Click "Add"

### Step 3: Wait for SSL Provisioning

- Certificate provisioning takes **5-10 minutes**
- Status will change from "Pending" to "Active"
- You'll receive an email when ready

### Step 4: Verify Custom Domain SSL

```bash
# Check custom domain SSL
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com < /dev/null 2>/dev/null | openssl x509 -noout -dates

# Expected output:
# notBefore=Jan 15 00:00:00 2025 GMT
# notAfter=Apr 15 23:59:59 2025 GMT
```

---

## Certificate Renewal

### Automatic Renewal

Lovable Cloud automatically renews certificates **30 days before expiration**.

**No action required.** Renewals happen in the background without downtime.

### Monitoring Certificate Expiration

**Set up alerts for certificate expiration:**

1. **SSL Monitoring Service (Recommended):**
   - Use: https://uptimerobot.com/ (free tier)
   - Add HTTPS monitor for your domain
   - Enable email alerts for SSL expiration

2. **Manual Check Script:**

```bash
# Check certificate expiration
./scripts/check-ssl-expiration.sh yourdomain.com

# Output shows days until expiration
```

Create the script:

```bash
#!/bin/bash
DOMAIN=$1
EXPIRY=$(openssl s_client -connect $DOMAIN:443 -servername $DOMAIN < /dev/null 2>/dev/null | openssl x509 -noout -dates | grep "notAfter" | cut -d= -f2)
EXPIRY_EPOCH=$(date -d "$EXPIRY" +%s)
NOW_EPOCH=$(date +%s)
DAYS_LEFT=$(( ($EXPIRY_EPOCH - $NOW_EPOCH) / 86400 ))

echo "Certificate for $DOMAIN expires in $DAYS_LEFT days"
if [ $DAYS_LEFT -lt 30 ]; then
    echo "⚠️  WARNING: Certificate expiring soon!"
fi
```

---

## Troubleshooting

### Issue 1: Certificate Not Provisioning

**Symptoms:**
- Browser shows "Not Secure"
- SSL handshake fails
- Domain shows "Pending" status for >15 minutes

**Solution:**
1. Verify DNS records are correct (use `dig yourdomain.com`)
2. Check domain ownership verification
3. Contact Lovable support if issue persists

### Issue 2: Mixed Content Warnings

**Symptoms:**
- Padlock icon shows warning
- Console error: "Mixed Content: The page at 'https://...' was loaded over HTTPS, but requested an insecure resource"

**Solution:**
```typescript
// Fix hardcoded HTTP URLs
// ❌ Wrong
const imageUrl = 'http://example.com/image.jpg';

// ✅ Correct
const imageUrl = 'https://example.com/image.jpg';

// ✅ Better - protocol-relative
const imageUrl = '//example.com/image.jpg';
```

### Issue 3: Certificate Mismatch

**Symptoms:**
- Browser shows "NET::ERR_CERT_COMMON_NAME_INVALID"
- Certificate is for different domain

**Solution:**
- Verify custom domain is correctly added in Lovable Dashboard
- Check DNS propagation: `dig yourdomain.com`
- Wait 24 hours for full DNS propagation

### Issue 4: Expired Certificate

**Symptoms:**
- Browser shows "Your connection is not private"
- Error: "NET::ERR_CERT_DATE_INVALID"

**Solution:**
- Check system clock (should be accurate)
- Verify Lovable auto-renewal is active (check email notifications)
- Contact support if certificate hasn't auto-renewed

---

## Production Deployment Checklist

Before deploying to production:

- [ ] SSL certificate provisioned and valid
- [ ] HTTPS redirect working (test `curl -I http://domain.com`)
- [ ] HSTS header present (`Strict-Transport-Security`)
- [ ] No mixed content warnings in browser console
- [ ] SSL Labs test returns Grade A or A+ (production domains)
- [ ] Certificate expiration monitoring configured
- [ ] Custom domain (if applicable) has valid certificate
- [ ] Mobile browsers tested (iOS Safari, Android Chrome)

---

## Maintenance Schedule

| Task | Frequency | Responsible |
|------|-----------|-------------|
| Check certificate expiration | Weekly | DevOps |
| Verify HTTPS redirect | Monthly | QA |
| Run SSL Labs test | Quarterly | Security |
| Review certificate logs | Monthly | DevOps |

---

## Additional Resources

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Mozilla SSL Configuration Generator](https://ssl-config.mozilla.org/)
- [SSL Labs Best Practices](https://github.com/ssllabs/research/wiki/SSL-and-TLS-Deployment-Best-Practices)
- [Lovable Custom Domain Docs](https://docs.lovable.dev/deployment/custom-domains)

---

**Last Verified:** 2025-01-15  
**Next Review:** 2025-02-15
