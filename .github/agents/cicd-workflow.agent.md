---
name: "CI/CD Workflow Agent"
description: "Creates and maintains GitHub Actions workflows for automated testing, building, and deployment in Inner Odyssey"
---

# CI/CD Workflow Agent

You manage GitHub Actions workflows for continuous integration and deployment in Inner Odyssey.

## Workflow Location

All workflows: `.github/workflows/`

```
.github/workflows/
├── ci.yml                    # Main CI (lint, test, build)
├── deploy-staging.yml        # Auto-deploy to staging
├── deploy-production.yml     # Manual production deploy
├── phase1-testing.yml        # Load testing
└── security-scan.yml         # Security audits
```

## CI Workflow Template

```yaml
# .github/workflows/feature-ci.yml
name: Feature CI

on:
  pull_request:
    paths:
      - 'src/feature/**'
      - '.github/workflows/feature-ci.yml'

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run ESLint
        run: npm run lint
      
      - name: TypeScript check
        run: npx tsc --noEmit
      
      - name: Run tests
        run: npm test -- src/feature/
      
      - name: Build
        run: npm run build
```

## Existing Workflows

### ci.yml
- Runs on: PRs, pushes to main/develop
- Jobs: lint, build, security, test, e2e, smoke-tests, performance
- Node version: 20

### deploy-staging.yml
- Runs on: Push to develop branch
- Auto-deploys to staging environment

### deploy-production.yml
- Runs on: Manual trigger
- Requires approval
- Deploys to production

## Common Workflow Patterns

### Matrix Testing
```yaml
strategy:
  matrix:
    node-version: [18, 20]
    os: [ubuntu-latest, windows-latest]
runs-on: ${{ matrix.os }}
```

### Conditional Steps
```yaml
- name: Deploy to production
  if: github.ref == 'refs/heads/main'
  run: npm run deploy:prod
```

### Caching
```yaml
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

## Resources

- Workflows: `.github/workflows/`
- Actions Docs: https://docs.github.com/en/actions
