#!/bin/bash

# Staging Environment Smoke Test Suite
# Purpose: Verify staging environment is working correctly
# Run this after deploying to staging or after migrations
# Date: 2025-01-16

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
STAGING_URL="${STAGING_URL:-https://innerodyssey-staging.lovable.app}"
TEST_EMAIL="test.parent@staging.innerodyssey.com"
TEST_PASSWORD="TestPassword123!"

# Counter for tests
PASSED=0
FAILED=0
TOTAL=0

# Helper functions
print_header() {
  echo ""
  echo "========================================="
  echo "$1"
  echo "========================================="
}

print_test() {
  echo ""
  echo "Test $TOTAL: $1"
}

pass_test() {
  PASSED=$((PASSED + 1))
  echo -e "${GREEN}✓ PASS${NC}: $1"
}

fail_test() {
  FAILED=$((FAILED + 1))
  echo -e "${RED}✗ FAIL${NC}: $1"
  if [ -n "$2" ]; then
    echo "  Details: $2"
  fi
}

warn_test() {
  echo -e "${YELLOW}⚠ WARNING${NC}: $1"
}

# =============================================================================
# TEST 1: Staging URL Accessibility
# =============================================================================

print_header "TEST SUITE: Staging Environment Smoke Tests"
echo "Staging URL: $STAGING_URL"
echo "Start Time: $(date)"
echo ""

TOTAL=$((TOTAL + 1))
print_test "Verify staging URL is accessible"

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$STAGING_URL" || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
  pass_test "Staging URL returned 200 OK"
elif [ "$HTTP_CODE" = "000" ]; then
  fail_test "Staging URL not accessible" "Could not connect to $STAGING_URL"
else
  fail_test "Staging URL returned $HTTP_CODE" "Expected 200, got $HTTP_CODE"
fi

# =============================================================================
# TEST 2: Check Critical Pages Load
# =============================================================================

PAGES=("/" "/login" "/signup" "/about" "/pricing")

for PAGE in "${PAGES[@]}"; do
  TOTAL=$((TOTAL + 1))
  print_test "Verify $PAGE page loads"
  
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${STAGING_URL}${PAGE}" || echo "000")
  
  if [ "$HTTP_CODE" = "200" ]; then
    pass_test "$PAGE returned 200 OK"
  else
    fail_test "$PAGE returned $HTTP_CODE"
  fi
done

# =============================================================================
# TEST 3: Check API Health Endpoint (if exists)
# =============================================================================

TOTAL=$((TOTAL + 1))
print_test "Check API health endpoint"

HEALTH_RESPONSE=$(curl -s "${STAGING_URL}/api/health" || echo "ERROR")

if [[ "$HEALTH_RESPONSE" == *"ok"* ]] || [[ "$HEALTH_RESPONSE" == *"healthy"* ]]; then
  pass_test "Health endpoint returned healthy status"
elif [ "$HEALTH_RESPONSE" = "ERROR" ]; then
  warn_test "Health endpoint not found (may not exist yet)"
else
  fail_test "Health endpoint returned unexpected response" "$HEALTH_RESPONSE"
fi

# =============================================================================
# TEST 4: Verify Environment Variables Are Set (via meta tags)
# =============================================================================

TOTAL=$((TOTAL + 1))
print_test "Verify environment is set to staging"

PAGE_CONTENT=$(curl -s "$STAGING_URL" || echo "")

if [[ "$PAGE_CONTENT" == *"staging"* ]] || [[ "$PAGE_CONTENT" == *"STAGING"* ]]; then
  pass_test "Page content indicates staging environment"
else
  warn_test "Could not confirm staging environment from page content"
fi

# =============================================================================
# TEST 5: Check for JavaScript Console Errors
# =============================================================================

TOTAL=$((TOTAL + 1))
print_test "Check for common JavaScript errors"

# Note: This is a basic check, won't catch runtime errors
if command -v node &> /dev/null; then
  # Check if page contains common error patterns
  if [[ "$PAGE_CONTENT" == *"ReferenceError"* ]] || [[ "$PAGE_CONTENT" == *"TypeError"* ]]; then
    fail_test "Found JavaScript errors in page source"
  else
    pass_test "No obvious JavaScript errors in page source"
  fi
else
  warn_test "Node.js not installed, skipping JS error check"
fi

# =============================================================================
# TEST 6: Database Connectivity (via Supabase API)
# =============================================================================

print_header "DATABASE CONNECTIVITY TESTS"

TOTAL=$((TOTAL + 1))
print_test "Verify Supabase connection"

# Try to fetch lessons (public endpoint)
SUPABASE_URL="${SUPABASE_STAGING_URL:-}"
SUPABASE_KEY="${SUPABASE_STAGING_ANON_KEY:-}"

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
  warn_test "Supabase credentials not set, skipping database tests"
  warn_test "Set SUPABASE_STAGING_URL and SUPABASE_STAGING_ANON_KEY to run DB tests"
else
  DB_RESPONSE=$(curl -s \
    -H "apikey: $SUPABASE_KEY" \
    -H "Authorization: Bearer $SUPABASE_KEY" \
    "${SUPABASE_URL}/rest/v1/lessons?select=count&limit=1" || echo "ERROR")
  
  if [[ "$DB_RESPONSE" == *"count"* ]]; then
    pass_test "Database query successful"
  else
    fail_test "Database query failed" "$DB_RESPONSE"
  fi
fi

# =============================================================================
# TEST 7: Authentication Endpoints
# =============================================================================

print_header "AUTHENTICATION TESTS"

TOTAL=$((TOTAL + 1))
print_test "Verify auth signup endpoint exists"

if [ -n "$SUPABASE_URL" ] && [ -n "$SUPABASE_KEY" ]; then
  AUTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST \
    -H "apikey: $SUPABASE_KEY" \
    -H "Content-Type: application/json" \
    "${SUPABASE_URL}/auth/v1/signup" \
    -d '{}' || echo "000")
  
  # Expect 400 (bad request) because we sent empty body, but endpoint exists
  if [ "$AUTH_RESPONSE" = "400" ] || [ "$AUTH_RESPONSE" = "422" ]; then
    pass_test "Auth endpoint is accessible (returned $AUTH_RESPONSE as expected)"
  elif [ "$AUTH_RESPONSE" = "000" ]; then
    fail_test "Auth endpoint not accessible"
  else
    fail_test "Auth endpoint returned unexpected code: $AUTH_RESPONSE"
  fi
else
  warn_test "Skipping auth tests (Supabase credentials not set)"
fi

# =============================================================================
# TEST 8: Static Assets Loading
# =============================================================================

print_header "STATIC ASSETS TESTS"

TOTAL=$((TOTAL + 1))
print_test "Verify favicon loads"

FAVICON_CODE=$(curl -s -o /dev/null -w "%{http_code}" "${STAGING_URL}/favicon.ico" || echo "000")

if [ "$FAVICON_CODE" = "200" ]; then
  pass_test "Favicon loads successfully"
else
  warn_test "Favicon returned $FAVICON_CODE (non-critical)"
fi

# =============================================================================
# TEST 9: HTTPS/Security Headers
# =============================================================================

print_header "SECURITY TESTS"

TOTAL=$((TOTAL + 1))
print_test "Verify HTTPS is enabled"

if [[ "$STAGING_URL" == https://* ]]; then
  pass_test "Using HTTPS"
else
  fail_test "Not using HTTPS" "Staging should always use HTTPS"
fi

TOTAL=$((TOTAL + 1))
print_test "Check for security headers"

HEADERS=$(curl -s -I "$STAGING_URL" || echo "")

if [[ "$HEADERS" == *"X-Frame-Options"* ]]; then
  pass_test "X-Frame-Options header present"
else
  warn_test "X-Frame-Options header missing"
fi

if [[ "$HEADERS" == *"Content-Security-Policy"* ]] || [[ "$HEADERS" == *"content-security-policy"* ]]; then
  pass_test "Content-Security-Policy header present"
else
  warn_test "Content-Security-Policy header missing"
fi

# =============================================================================
# TEST 10: Response Time Check
# =============================================================================

print_header "PERFORMANCE TESTS"

TOTAL=$((TOTAL + 1))
print_test "Verify response time is acceptable"

RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$STAGING_URL" || echo "999")

# Convert to milliseconds
RESPONSE_MS=$(echo "$RESPONSE_TIME * 1000" | bc 2>/dev/null || echo "9999")

if (( $(echo "$RESPONSE_TIME < 2.0" | bc -l) )); then
  pass_test "Response time: ${RESPONSE_MS}ms (< 2000ms)"
elif (( $(echo "$RESPONSE_TIME < 5.0" | bc -l) )); then
  warn_test "Response time: ${RESPONSE_MS}ms (acceptable but slow)"
else
  fail_test "Response time: ${RESPONSE_MS}ms (> 5000ms is too slow)"
fi

# =============================================================================
# SUMMARY REPORT
# =============================================================================

print_header "TEST SUMMARY"

echo "Total Tests: $TOTAL"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ ALL TESTS PASSED${NC}"
  echo "Staging environment is healthy and ready for use."
  exit 0
else
  echo -e "${RED}✗ SOME TESTS FAILED${NC}"
  echo "Please review failed tests above and fix issues."
  echo ""
  echo "Common fixes:"
  echo "1. Verify staging URL is correct: $STAGING_URL"
  echo "2. Check Supabase credentials are set"
  echo "3. Verify deployment completed successfully"
  echo "4. Check network connectivity"
  exit 1
fi
