#!/bin/bash

# Security Audit Script for Inner Odyssey
# Runs automated security checks and generates a report

set -e

echo "🔒 Starting Security Audit..."
echo "================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Create reports directory
mkdir -p security-reports
REPORT_FILE="security-reports/audit-$(date +%Y%m%d-%H%M%S).txt"

echo "Report will be saved to: $REPORT_FILE"
echo "" | tee "$REPORT_FILE"

# 1. NPM Audit
echo "📦 Running npm audit..." | tee -a "$REPORT_FILE"
echo "-----------------------------------" | tee -a "$REPORT_FILE"
if npm audit --json > security-reports/npm-audit.json 2>&1; then
    echo -e "${GREEN}✓ No vulnerabilities found${NC}" | tee -a "$REPORT_FILE"
else
    AUDIT_EXIT=$?
    CRITICAL=$(cat security-reports/npm-audit.json | grep -o '"critical":[0-9]*' | grep -o '[0-9]*' || echo "0")
    HIGH=$(cat security-reports/npm-audit.json | grep -o '"high":[0-9]*' | grep -o '[0-9]*' || echo "0")
    
    if [ "$CRITICAL" -gt "0" ] || [ "$HIGH" -gt "0" ]; then
        echo -e "${RED}✗ Found vulnerabilities:${NC}" | tee -a "$REPORT_FILE"
        echo "  Critical: $CRITICAL" | tee -a "$REPORT_FILE"
        echo "  High: $HIGH" | tee -a "$REPORT_FILE"
        echo "" | tee -a "$REPORT_FILE"
        echo "Run 'npm audit' for details" | tee -a "$REPORT_FILE"
    else
        echo -e "${YELLOW}⚠ Found low/moderate vulnerabilities${NC}" | tee -a "$REPORT_FILE"
        echo "Run 'npm audit' for details" | tee -a "$REPORT_FILE"
    fi
fi
echo "" | tee -a "$REPORT_FILE"

# 2. Check for hardcoded secrets
echo "🔑 Checking for hardcoded secrets..." | tee -a "$REPORT_FILE"
echo "-----------------------------------" | tee -a "$REPORT_FILE"
SECRET_PATTERNS=(
    "password\s*=\s*['\"][^'\"]{8,}"
    "api[_-]?key\s*[=:]\s*['\"][^'\"]{10,}"
    "secret[_-]?key\s*[=:]\s*['\"][^'\"]{10,}"
    "private[_-]?key\s*[=:]\s*['\"][^'\"]{10,}"
    "token\s*[=:]\s*['\"][^'\"]{20,}"
    "Bearer\s+[A-Za-z0-9\-._~+/]+=*"
)

SECRETS_FOUND=0
for pattern in "${SECRET_PATTERNS[@]}"; do
    if grep -rE --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
        --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist \
        "$pattern" src/ 2>/dev/null; then
        SECRETS_FOUND=$((SECRETS_FOUND + 1))
    fi
done

if [ $SECRETS_FOUND -eq 0 ]; then
    echo -e "${GREEN}✓ No hardcoded secrets detected${NC}" | tee -a "$REPORT_FILE"
else
    echo -e "${RED}✗ Found $SECRETS_FOUND potential hardcoded secrets${NC}" | tee -a "$REPORT_FILE"
    echo "Review the output above and move secrets to environment variables" | tee -a "$REPORT_FILE"
fi
echo "" | tee -a "$REPORT_FILE"

# 3. Check for console.log in production code
echo "🐛 Checking for console.log statements..." | tee -a "$REPORT_FILE"
echo "-----------------------------------" | tee -a "$REPORT_FILE"
CONSOLE_COUNT=$(grep -r "console\.log\|console\.warn\|console\.error" src/ \
    --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
    --exclude-dir=node_modules 2>/dev/null | wc -l)

if [ "$CONSOLE_COUNT" -gt "50" ]; then
    echo -e "${YELLOW}⚠ Found $CONSOLE_COUNT console statements${NC}" | tee -a "$REPORT_FILE"
    echo "Consider removing or protecting console.log in production" | tee -a "$REPORT_FILE"
else
    echo -e "${GREEN}✓ Console usage is acceptable ($CONSOLE_COUNT statements)${NC}" | tee -a "$REPORT_FILE"
fi
echo "" | tee -a "$REPORT_FILE"

# 4. Check for dangerouslySetInnerHTML
echo "⚠️  Checking for dangerouslySetInnerHTML..." | tee -a "$REPORT_FILE"
echo "-----------------------------------" | tee -a "$REPORT_FILE"
DANGEROUS_HTML=$(grep -r "dangerouslySetInnerHTML" src/ \
    --include="*.tsx" --include="*.jsx" 2>/dev/null | wc -l)

if [ "$DANGEROUS_HTML" -gt "0" ]; then
    echo -e "${RED}✗ Found $DANGEROUS_HTML uses of dangerouslySetInnerHTML${NC}" | tee -a "$REPORT_FILE"
    echo "Ensure all uses are sanitized with DOMPurify" | tee -a "$REPORT_FILE"
    grep -rn "dangerouslySetInnerHTML" src/ --include="*.tsx" --include="*.jsx" 2>/dev/null | tee -a "$REPORT_FILE"
else
    echo -e "${GREEN}✓ No dangerouslySetInnerHTML found${NC}" | tee -a "$REPORT_FILE"
fi
echo "" | tee -a "$REPORT_FILE"

# 5. Check for eval usage
echo "🚨 Checking for eval() usage..." | tee -a "$REPORT_FILE"
echo "-----------------------------------" | tee -a "$REPORT_FILE"
EVAL_COUNT=$(grep -r "\beval\s*(" src/ \
    --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
    --exclude-dir=node_modules 2>/dev/null | wc -l)

if [ "$EVAL_COUNT" -gt "0" ]; then
    echo -e "${RED}✗ Found $EVAL_COUNT uses of eval()${NC}" | tee -a "$REPORT_FILE"
    echo "CRITICAL: Remove all eval() usage immediately" | tee -a "$REPORT_FILE"
else
    echo -e "${GREEN}✓ No eval() usage found${NC}" | tee -a "$REPORT_FILE"
fi
echo "" | tee -a "$REPORT_FILE"

# 6. Check TypeScript strict mode
echo "📘 Checking TypeScript configuration..." | tee -a "$REPORT_FILE"
echo "-----------------------------------" | tee -a "$REPORT_FILE"
if grep -q '"strict":\s*true' tsconfig*.json 2>/dev/null; then
    echo -e "${GREEN}✓ TypeScript strict mode enabled${NC}" | tee -a "$REPORT_FILE"
else
    echo -e "${YELLOW}⚠ TypeScript strict mode not enabled${NC}" | tee -a "$REPORT_FILE"
    echo "Enable strict mode for better type safety" | tee -a "$REPORT_FILE"
fi
echo "" | tee -a "$REPORT_FILE"

# 7. Check for HTTP URLs (should be HTTPS)
echo "🔐 Checking for insecure HTTP URLs..." | tee -a "$REPORT_FILE"
echo "-----------------------------------" | tee -a "$REPORT_FILE"
HTTP_URLS=$(grep -rE "http://[^l]" src/ \
    --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" \
    --exclude-dir=node_modules 2>/dev/null | grep -v "http://localhost" | wc -l)

if [ "$HTTP_URLS" -gt "0" ]; then
    echo -e "${YELLOW}⚠ Found $HTTP_URLS HTTP URLs (should be HTTPS)${NC}" | tee -a "$REPORT_FILE"
else
    echo -e "${GREEN}✓ No insecure HTTP URLs found${NC}" | tee -a "$REPORT_FILE"
fi
echo "" | tee -a "$REPORT_FILE"

# 8. Check security headers configuration
echo "🛡️  Checking security headers..." | tee -a "$REPORT_FILE"
echo "-----------------------------------" | tee -a "$REPORT_FILE"
if [ -f "public/_headers" ]; then
    REQUIRED_HEADERS=(
        "X-Frame-Options"
        "X-Content-Type-Options"
        "Referrer-Policy"
        "Permissions-Policy"
    )
    
    MISSING_HEADERS=0
    for header in "${REQUIRED_HEADERS[@]}"; do
        if ! grep -q "$header" public/_headers; then
            echo -e "${YELLOW}⚠ Missing header: $header${NC}" | tee -a "$REPORT_FILE"
            MISSING_HEADERS=$((MISSING_HEADERS + 1))
        fi
    done
    
    if [ $MISSING_HEADERS -eq 0 ]; then
        echo -e "${GREEN}✓ All security headers configured${NC}" | tee -a "$REPORT_FILE"
    else
        echo -e "${YELLOW}⚠ $MISSING_HEADERS security headers missing${NC}" | tee -a "$REPORT_FILE"
    fi
else
    echo -e "${RED}✗ No _headers file found${NC}" | tee -a "$REPORT_FILE"
fi
echo "" | tee -a "$REPORT_FILE"

# 9. Summary
echo "================================" | tee -a "$REPORT_FILE"
echo "📊 Security Audit Summary" | tee -a "$REPORT_FILE"
echo "================================" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"
echo "Audit completed at: $(date)" | tee -a "$REPORT_FILE"
echo "Full report saved to: $REPORT_FILE" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"
echo "Next Steps:" | tee -a "$REPORT_FILE"
echo "1. Review npm audit findings and update dependencies" | tee -a "$REPORT_FILE"
echo "2. Fix any critical or high severity issues immediately" | tee -a "$REPORT_FILE"
echo "3. Review and remove any hardcoded secrets" | tee -a "$REPORT_FILE"
echo "4. Run Playwright security tests: npm run test:e2e:security" | tee -a "$REPORT_FILE"
echo "5. Update this audit regularly (weekly recommended)" | tee -a "$REPORT_FILE"
echo "" | tee -a "$REPORT_FILE"

# Make script executable
chmod +x "$0" 2>/dev/null || true

echo -e "${GREEN}Security audit complete!${NC}"
