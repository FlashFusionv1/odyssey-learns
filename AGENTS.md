# AGENTS.md - Multi-Agent Development Guide

> Comprehensive guide for AI agents collaborating on the Inner Odyssey platform.

## Overview

Inner Odyssey uses a multi-agent architecture for development, with different AI systems handling specialized tasks. This document defines protocols for agent collaboration, task delegation, and quality assurance.

---

## Agent Roles & Responsibilities

### 1. Claude (Anthropic) - Primary Development Agent
**Capabilities:**
- Full codebase access and modification
- Complex refactoring and architecture decisions
- Security audits and vulnerability assessment
- Documentation generation
- Code review and quality assurance

**Best For:**
- Multi-file refactoring
- Complex bug investigation
- Security-sensitive changes
- Comprehensive documentation
- Architectural planning

**Context Window:** Extended (ideal for large codebases)

---

### 2. Gemini (Lovable AI) - Content Generation Agent
**Capabilities:**
- AI-powered lesson content generation
- Quiz question creation
- Educational content adaptation
- Multi-grade level content differentiation

**Best For:**
- Batch lesson generation
- Content localization
- Age-appropriate content creation
- Interactive quiz design

**Integration Point:** `supabase/functions/generate-lesson-content/`

---

### 3. Cursor/Copilot - Inline Code Agent
**Capabilities:**
- Autocomplete suggestions
- Single-file edits
- Quick fixes
- Boilerplate generation

**Best For:**
- Rapid prototyping
- Repetitive code patterns
- Import suggestions
- Type completions

---

## Agent Communication Protocol

### Handoff Template
When transferring work between agents:

```markdown
## Task Handoff

**From:** [Agent Name]
**To:** [Agent Name]
**Task:** [Brief description]
**Status:** [In Progress | Blocked | Ready for Review]

### Context
- Files modified: [list]
- Dependencies: [list]
- Open questions: [list]

### Completed Work
- [x] Task 1
- [x] Task 2

### Remaining Work
- [ ] Task 3
- [ ] Task 4

### Notes
[Additional context for receiving agent]
```

---

## Task Delegation Matrix

| Task Type | Primary Agent | Secondary Agent | Notes |
|-----------|---------------|-----------------|-------|
| Architecture Design | Claude | - | Requires full context |
| Security Audit | Claude | - | Critical, comprehensive |
| Lesson Content | Gemini | Claude (review) | Bulk generation |
| Bug Fixes | Claude | Cursor | Depends on scope |
| New Features | Claude | Cursor (assist) | Multi-file changes |
| Refactoring | Claude | - | Requires consistency |
| Unit Tests | Claude | Cursor | Pattern-based |
| Documentation | Claude | - | Comprehensive |
| Quick Fixes | Cursor | Claude (review) | Single-file |
| Localization | Gemini | Claude (review) | Content translation |

---

## Code Quality Standards

### Before Committing (All Agents)

1. **Type Safety**
   ```bash
   npm run lint  # No TypeScript errors
   ```

2. **Formatting**
   ```bash
   npm run format  # Prettier applied
   ```

3. **Testing**
   ```bash
   npm run test  # All tests pass
   ```

4. **Security Checklist**
   - [ ] No hardcoded secrets
   - [ ] Input sanitization applied
   - [ ] RLS policies considered
   - [ ] Rate limiting for sensitive ops

---

## File Ownership

### Claude-Managed Files
- `src/hooks/*.tsx` - Custom hooks
- `src/lib/*.ts` - Utility functions
- `src/components/auth/*` - Auth components
- `src/pages/*` - Page components
- `supabase/migrations/*` - Database migrations
- `docs/*` - Documentation
- `*.md` - All markdown files

### Gemini-Managed Files
- `supabase/functions/generate-*` - Content generation
- `supabase/functions/seed-*` - Seed data
- `docs/*-lesson-outlines.md` - Lesson content

### Shared Files (Careful Coordination)
- `src/App.tsx` - Root component
- `package.json` - Dependencies
- `tsconfig.json` - TypeScript config
- `tailwind.config.ts` - Styling config

---

## Conflict Resolution

### Priority Order
1. **Security fixes** - Always highest priority
2. **Bug fixes** - Production issues
3. **Features** - New functionality
4. **Refactoring** - Code quality
5. **Documentation** - Clarity

### Merge Conflicts
1. Claude has final authority on architectural decisions
2. Gemini has authority on content/lesson changes
3. When in doubt, preserve the more comprehensive solution
4. Always run tests after resolution

---

## Agent-Specific Guidelines

### For Claude

**DO:**
- Read existing code before modifying
- Follow established patterns
- Update documentation with changes
- Consider edge cases thoroughly
- Use TodoWrite for complex tasks

**DON'T:**
- Introduce new patterns without justification
- Skip security considerations
- Make breaking changes without migration plan
- Over-engineer simple solutions

### For Gemini

**DO:**
- Follow lesson template structure
- Include quiz questions with explanations
- Adapt content for grade level
- Use age-appropriate language

**DON'T:**
- Generate content without grade level context
- Skip content review for accuracy
- Exceed token limits for single lessons
- Ignore cultural sensitivity

### For Cursor/Copilot

**DO:**
- Follow existing code style
- Use proper imports
- Add TypeScript types
- Suggest tests for new functions

**DON'T:**
- Add new dependencies without approval
- Change architectural patterns
- Modify security-sensitive code
- Skip type annotations

---

## Testing Protocol

### Unit Tests (All Agents)
```typescript
// Naming convention
describe('ComponentName', () => {
  it('should [action] when [condition]', () => {
    // Test implementation
  });
});
```

### Integration Tests (Claude Primary)
```typescript
// E2E with Playwright
test('user can complete lesson', async ({ page }) => {
  await page.goto('/lessons');
  // Test implementation
});
```

### Content Tests (Gemini Primary)
- Verify grade-level appropriateness
- Check quiz answer accuracy
- Validate content length limits

---

## Deployment Coordination

### Pre-Deployment Checklist
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] Database migrations reviewed
- [ ] Edge functions tested locally
- [ ] Documentation updated

### Deployment Order
1. Database migrations (Supabase)
2. Edge functions (Supabase)
3. Frontend (Lovable Cloud)
4. Verify health check endpoint

---

## Communication Channels

### Inline Comments
```typescript
// AGENT:Claude - Refactored for security (2025-12-30)
// AGENT:Gemini - Generated content v2 (2025-12-30)
```

### TODO Markers
```typescript
// TODO(Claude): Review RLS policy for this query
// TODO(Gemini): Add more quiz variations
// TODO(Security): Audit this before production
```

### Documentation Updates
All agents should update relevant docs when making changes:
- `CHANGELOG.md` - Version history
- Component-specific docs in `docs/`
- Inline JSDoc comments

---

## Escalation Paths

### Security Issues
1. Stop current work
2. Document vulnerability
3. Claude handles fix
4. Comprehensive testing
5. Immediate deployment

### Breaking Changes
1. Create migration plan
2. Update all affected code
3. Update documentation
4. Coordinate deployment
5. Monitor for issues

### Performance Issues
1. Identify bottleneck
2. Profile affected code
3. Implement optimization
4. Benchmark improvement
5. Document changes

---

## Quick Reference

### Common Commands
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run test         # Run tests
npm run lint         # Check linting
npm run preview      # Preview build
```

### Key Files
| Purpose | Location |
|---------|----------|
| Entry point | `src/main.tsx` |
| Root component | `src/App.tsx` |
| Routes | `src/routes/index.ts` |
| Supabase client | `src/integrations/supabase/client.ts` |
| Auth hook | `src/hooks/useAuth.tsx` |
| Error handler | `src/lib/errorHandler.ts` |

### Environment Variables
```bash
VITE_SUPABASE_URL=<supabase-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<anon-key>
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-30 | Initial agent documentation |

---

*This document is maintained by the Inner Odyssey development team and should be updated whenever agent workflows change.*
