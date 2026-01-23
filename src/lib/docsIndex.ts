/**
 * Documentation Index Generator
 * 
 * This module provides the structure and metadata for all documentation files.
 * It creates a searchable index of markdown documentation.
 */

export interface DocFile {
  id: string;
  path: string;
  title: string;
  description: string;
  category: DocCategory;
  tags: string[];
  priority: number; // Lower = higher priority in search results
}

export type DocCategory = 
  | 'getting-started'
  | 'architecture'
  | 'development'
  | 'security'
  | 'testing'
  | 'operations'
  | 'features'
  | 'planning'
  | 'ai-agents'
  | 'compliance'
  | 'troubleshooting';

export const CATEGORY_LABELS: Record<DocCategory, { label: string; icon: string; color: string }> = {
  'getting-started': { label: 'Getting Started', icon: '🚀', color: 'bg-green-500/10 text-green-600 dark:text-green-400' },
  'architecture': { label: 'Architecture', icon: '🏗️', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  'development': { label: 'Development', icon: '💻', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
  'security': { label: 'Security', icon: '🔒', color: 'bg-red-500/10 text-red-600 dark:text-red-400' },
  'testing': { label: 'Testing', icon: '🧪', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  'operations': { label: 'Operations', icon: '⚙️', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400' },
  'features': { label: 'Features', icon: '✨', color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400' },
  'planning': { label: 'Planning', icon: '📋', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' },
  'ai-agents': { label: 'AI & Agents', icon: '🤖', color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400' },
  'compliance': { label: 'Compliance', icon: '📜', color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400' },
  'troubleshooting': { label: 'Troubleshooting', icon: '🔧', color: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400' },
};

/**
 * Complete documentation index with metadata for all markdown files
 */
export const DOCS_INDEX: DocFile[] = [
  // Getting Started
  {
    id: 'quick-start',
    path: 'docs/QUICK_START.md',
    title: 'Quick Start Guide',
    description: '5-minute developer onboarding path to get up and running',
    category: 'getting-started',
    tags: ['setup', 'installation', 'onboarding', 'prerequisites'],
    priority: 1,
  },
  {
    id: 'readme',
    path: 'docs/README.md',
    title: 'Documentation Overview',
    description: 'Main documentation index and navigation guide',
    category: 'getting-started',
    tags: ['index', 'navigation', 'overview'],
    priority: 2,
  },
  {
    id: 'developer-onboarding',
    path: 'docs/DEVELOPER_ONBOARDING.md',
    title: 'Developer Onboarding',
    description: 'Full setup guide for new developers joining the project',
    category: 'getting-started',
    tags: ['setup', 'environment', 'tools', 'configuration'],
    priority: 3,
  },
  {
    id: 'developer-cheat-sheet',
    path: 'docs/DEVELOPER_CHEAT_SHEET.md',
    title: 'Developer Cheat Sheet',
    description: '2-page quick reference for common development tasks',
    category: 'getting-started',
    tags: ['reference', 'commands', 'shortcuts'],
    priority: 4,
  },
  {
    id: 'faq',
    path: 'docs/FAQ.md',
    title: 'FAQ',
    description: 'Frequently asked questions and answers',
    category: 'getting-started',
    tags: ['questions', 'help', 'support'],
    priority: 5,
  },

  // Architecture
  {
    id: 'architecture',
    path: 'docs/ARCHITECTURE.md',
    title: 'System Architecture',
    description: 'Complete system design, technology stack, and data flow diagrams',
    category: 'architecture',
    tags: ['design', 'stack', 'database', 'backend', 'frontend'],
    priority: 1,
  },
  {
    id: 'complete-documentation',
    path: 'docs/COMPLETE_DOCUMENTATION.md',
    title: 'Complete Documentation',
    description: 'Comprehensive documentation covering all aspects of the platform',
    category: 'architecture',
    tags: ['complete', 'comprehensive', 'reference'],
    priority: 2,
  },
  {
    id: 'database-schema',
    path: 'docs/DATABASE_SCHEMA.md',
    title: 'Database Schema',
    description: 'Database tables, relationships, and RLS policies',
    category: 'architecture',
    tags: ['database', 'tables', 'schema', 'rls', 'supabase'],
    priority: 3,
  },
  {
    id: 'technical-specs',
    path: 'docs/TECHNICAL_SPECS.md',
    title: 'Technical Specifications',
    description: 'Detailed technical specifications and requirements',
    category: 'architecture',
    tags: ['specifications', 'requirements', 'technical'],
    priority: 4,
  },
  {
    id: 'routing',
    path: 'docs/ROUTING.md',
    title: 'Routing Structure',
    description: 'Application routing configuration and navigation patterns',
    category: 'architecture',
    tags: ['routes', 'navigation', 'pages'],
    priority: 5,
  },

  // Development
  {
    id: 'developer-guide',
    path: 'docs/DEVELOPER_GUIDE.md',
    title: 'Developer Guide',
    description: 'Extended guide for development best practices',
    category: 'development',
    tags: ['development', 'coding', 'practices'],
    priority: 1,
  },
  {
    id: 'api-integration',
    path: 'docs/API_INTEGRATION.md',
    title: 'API Integration',
    description: 'Supabase query patterns and API integration guide',
    category: 'development',
    tags: ['api', 'supabase', 'queries', 'integration'],
    priority: 2,
  },
  {
    id: 'api',
    path: 'docs/API.md',
    title: 'API Reference',
    description: 'Complete API reference documentation',
    category: 'development',
    tags: ['api', 'reference', 'endpoints'],
    priority: 3,
  },
  {
    id: 'components',
    path: 'docs/COMPONENTS.md',
    title: 'UI Components',
    description: 'UI component library documentation',
    category: 'development',
    tags: ['ui', 'components', 'react', 'shadcn'],
    priority: 4,
  },
  {
    id: 'component-library',
    path: 'docs/COMPONENT_LIBRARY.md',
    title: 'Component Library',
    description: 'Detailed component library reference',
    category: 'development',
    tags: ['components', 'library', 'ui'],
    priority: 5,
  },
  {
    id: 'design-system',
    path: 'docs/DESIGN_SYSTEM.md',
    title: 'Design System',
    description: 'Design tokens, colors, typography, and styling guide',
    category: 'development',
    tags: ['design', 'tokens', 'colors', 'typography', 'tailwind'],
    priority: 6,
  },
  {
    id: 'state-management',
    path: 'docs/STATE_MANAGEMENT.md',
    title: 'State Management',
    description: 'React Query patterns and state management guide',
    category: 'development',
    tags: ['state', 'react-query', 'hooks'],
    priority: 7,
  },
  {
    id: 'workflows',
    path: 'docs/WORKFLOWS.md',
    title: 'User Workflows',
    description: 'User journey flows and interaction patterns',
    category: 'development',
    tags: ['workflows', 'user-flows', 'interactions'],
    priority: 8,
  },
  {
    id: 'edge-functions',
    path: 'docs/EDGE_FUNCTIONS.md',
    title: 'Edge Functions',
    description: 'Backend serverless functions documentation',
    category: 'development',
    tags: ['edge', 'functions', 'serverless', 'backend'],
    priority: 9,
  },
  {
    id: 'implementation-guide',
    path: 'docs/IMPLEMENTATION_GUIDE.md',
    title: 'Implementation Guide',
    description: '12-week implementation plan and guidance',
    category: 'development',
    tags: ['implementation', 'plan', 'guidance'],
    priority: 10,
  },

  // Security
  {
    id: 'security',
    path: 'docs/SECURITY.md',
    title: 'Security Architecture',
    description: 'Security architecture and best practices',
    category: 'security',
    tags: ['security', 'authentication', 'authorization', 'rls'],
    priority: 1,
  },
  {
    id: 'authentication',
    path: 'docs/AUTHENTICATION.md',
    title: 'Authentication',
    description: 'Authentication flows and implementation',
    category: 'security',
    tags: ['auth', 'login', 'signup', 'oauth'],
    priority: 2,
  },
  {
    id: 'security-testing-guide',
    path: 'docs/security-testing-guide.md',
    title: 'Security Testing Guide',
    description: 'Security testing procedures and checklists',
    category: 'security',
    tags: ['security', 'testing', 'owasp', 'zap'],
    priority: 3,
  },
  {
    id: 'security-deployment-checklist',
    path: 'docs/SECURITY_DEPLOYMENT_CHECKLIST.md',
    title: 'Security Deployment Checklist',
    description: 'Pre-deployment security verification checklist',
    category: 'security',
    tags: ['security', 'deployment', 'checklist'],
    priority: 4,
  },
  {
    id: 'security-enhancement',
    path: 'docs/SECURITY_ENHANCEMENT_IMPLEMENTATION.md',
    title: 'Security Enhancements',
    description: 'Security enhancement implementation details',
    category: 'security',
    tags: ['security', 'enhancements', 'implementation'],
    priority: 5,
  },
  {
    id: 'ssl-tls',
    path: 'docs/SSL_TLS_VERIFICATION.md',
    title: 'SSL/TLS Verification',
    description: 'SSL/TLS certificate verification guide',
    category: 'security',
    tags: ['ssl', 'tls', 'certificates', 'https'],
    priority: 6,
  },

  // Testing
  {
    id: 'testing',
    path: 'docs/TESTING.md',
    title: 'Testing Strategy',
    description: 'Overall testing strategy and approach',
    category: 'testing',
    tags: ['testing', 'strategy', 'coverage'],
    priority: 1,
  },
  {
    id: 'testing-guide',
    path: 'docs/TESTING_GUIDE.md',
    title: 'Testing Guide',
    description: 'Detailed testing guide with examples',
    category: 'testing',
    tags: ['testing', 'guide', 'examples', 'vitest'],
    priority: 2,
  },
  {
    id: 'quick-test-reference',
    path: 'docs/QUICK_TEST_REFERENCE.md',
    title: 'Quick Test Reference',
    description: 'Quick reference for test commands',
    category: 'testing',
    tags: ['testing', 'commands', 'reference'],
    priority: 3,
  },
  {
    id: 'accessibility',
    path: 'docs/ACCESSIBILITY.md',
    title: 'Accessibility',
    description: 'WCAG 2.1 AA compliance and accessibility standards',
    category: 'testing',
    tags: ['accessibility', 'wcag', 'a11y', 'aria'],
    priority: 4,
  },

  // Operations
  {
    id: 'deployment',
    path: 'docs/DEPLOYMENT.md',
    title: 'Deployment Guide',
    description: 'Deployment process and procedures',
    category: 'operations',
    tags: ['deployment', 'release', 'production'],
    priority: 1,
  },
  {
    id: 'deployment-runbook',
    path: 'docs/DEPLOYMENT_RUNBOOK.md',
    title: 'Deployment Runbook',
    description: 'Operational runbook for deployments and incidents',
    category: 'operations',
    tags: ['runbook', 'operations', 'incidents'],
    priority: 2,
  },
  {
    id: 'ci-cd-setup',
    path: 'docs/CI_CD_SETUP.md',
    title: 'CI/CD Setup',
    description: 'Continuous integration and deployment pipeline',
    category: 'operations',
    tags: ['ci', 'cd', 'pipeline', 'github-actions'],
    priority: 3,
  },
  {
    id: 'monitoring',
    path: 'docs/MONITORING.md',
    title: 'Monitoring',
    description: 'Monitoring, metrics, and alerting setup',
    category: 'operations',
    tags: ['monitoring', 'metrics', 'alerts', 'observability'],
    priority: 4,
  },
  {
    id: 'performance',
    path: 'docs/PERFORMANCE.md',
    title: 'Performance',
    description: 'Performance tuning and optimization',
    category: 'operations',
    tags: ['performance', 'optimization', 'lighthouse'],
    priority: 5,
  },
  {
    id: 'backup-recovery',
    path: 'docs/BACKUP_RECOVERY_PLAN.md',
    title: 'Backup & Recovery',
    description: 'Database backup and recovery procedures',
    category: 'operations',
    tags: ['backup', 'recovery', 'disaster', 'database'],
    priority: 6,
  },
  {
    id: 'staging-setup',
    path: 'docs/STAGING_ENVIRONMENT_SETUP.md',
    title: 'Staging Environment',
    description: 'Staging environment setup and configuration',
    category: 'operations',
    tags: ['staging', 'environment', 'setup'],
    priority: 7,
  },

  // Features
  {
    id: 'onboarding-system',
    path: 'docs/ONBOARDING_SYSTEM.md',
    title: 'Onboarding System',
    description: 'User onboarding architecture and flows',
    category: 'features',
    tags: ['onboarding', 'users', 'flows'],
    priority: 1,
  },
  {
    id: 'pwa-setup',
    path: 'docs/PWA_SETUP.md',
    title: 'PWA Setup',
    description: 'Progressive Web App configuration',
    category: 'features',
    tags: ['pwa', 'mobile', 'offline'],
    priority: 2,
  },
  {
    id: 'narration-feature',
    path: 'docs/features/NARRATION_FEATURE.md',
    title: 'Voice Narration',
    description: 'Voice-based lesson narration feature',
    category: 'features',
    tags: ['narration', 'voice', 'audio', 'tts'],
    priority: 3,
  },
  {
    id: 'gamification-module',
    path: 'docs/modules/gamification.md',
    title: 'Gamification Module',
    description: 'Points, badges, quests, and rewards system',
    category: 'features',
    tags: ['gamification', 'points', 'badges', 'rewards'],
    priority: 4,
  },
  {
    id: 'adaptive-learning',
    path: 'docs/ADAPTIVE_LEARNING_IMPLEMENTATION.md',
    title: 'Adaptive Learning',
    description: 'AI-powered adaptive learning path implementation',
    category: 'features',
    tags: ['adaptive', 'learning', 'ai', 'recommendations'],
    priority: 5,
  },

  // Planning
  {
    id: 'roadmap-executive',
    path: 'docs/ROADMAP_EXECUTIVE.md',
    title: 'Executive Roadmap',
    description: 'High-level project roadmap for stakeholders',
    category: 'planning',
    tags: ['roadmap', 'planning', 'executive'],
    priority: 1,
  },
  {
    id: 'full-roadmap',
    path: 'docs/FULL_ROADMAP_2025-2026.md',
    title: 'Full Roadmap 2025-2026',
    description: 'Detailed project roadmap for 2025-2026',
    category: 'planning',
    tags: ['roadmap', 'planning', '2025', '2026'],
    priority: 2,
  },
  {
    id: 'mvp-roadmap',
    path: 'docs/MVP_TO_V1_ROADMAP.md',
    title: 'MVP to V1 Roadmap',
    description: 'Roadmap from MVP to version 1.0',
    category: 'planning',
    tags: ['mvp', 'v1', 'roadmap'],
    priority: 3,
  },
  {
    id: 'beta-launch-checklist',
    path: 'docs/BETA_LAUNCH_CHECKLIST.md',
    title: 'Beta Launch Checklist',
    description: 'Checklist for beta launch preparation',
    category: 'planning',
    tags: ['beta', 'launch', 'checklist'],
    priority: 4,
  },
  {
    id: 'pre-launch-checklist',
    path: 'docs/PRE_LAUNCH_CHECKLIST.md',
    title: 'Pre-Launch Checklist',
    description: 'Pre-launch verification checklist',
    category: 'planning',
    tags: ['pre-launch', 'checklist', 'verification'],
    priority: 5,
  },
  {
    id: 'production-readiness',
    path: 'docs/PRODUCTION_READINESS_CHECKLIST.md',
    title: 'Production Readiness',
    description: 'Production readiness checklist',
    category: 'planning',
    tags: ['production', 'readiness', 'checklist'],
    priority: 6,
  },
  {
    id: 'features-plan',
    path: 'docs/FEATURES_PLAN.md',
    title: 'Features Plan',
    description: 'Planned features and enhancements',
    category: 'planning',
    tags: ['features', 'plan', 'enhancements'],
    priority: 7,
  },
  {
    id: 'scalability-plan',
    path: 'docs/SCALABILITY_PLAN.md',
    title: 'Scalability Plan',
    description: 'Platform scalability planning',
    category: 'planning',
    tags: ['scalability', 'performance', 'growth'],
    priority: 8,
  },
  {
    id: 'refactor-plan',
    path: 'docs/REFACTOR_PLAN.md',
    title: 'Refactor Plan',
    description: 'Code refactoring plan and priorities',
    category: 'planning',
    tags: ['refactor', 'code', 'cleanup'],
    priority: 9,
  },
  {
    id: 'app-refactor-plan',
    path: 'docs/APP_REFACTOR_PLAN.md',
    title: 'App Refactor Plan',
    description: 'App.tsx refactoring plan',
    category: 'planning',
    tags: ['refactor', 'app', 'routes'],
    priority: 10,
  },

  // AI & Agents
  {
    id: 'claude',
    path: 'docs/claude.md',
    title: 'Claude Integration',
    description: 'Claude AI development patterns and guidelines',
    category: 'ai-agents',
    tags: ['claude', 'ai', 'development'],
    priority: 1,
  },
  {
    id: 'agents',
    path: 'docs/agents.md',
    title: 'Multi-Agent Workflows',
    description: 'Multi-agent AI workflows and coordination',
    category: 'ai-agents',
    tags: ['agents', 'ai', 'workflows'],
    priority: 2,
  },
  {
    id: 'gemini',
    path: 'docs/gemini.md',
    title: 'Gemini Integration',
    description: 'Gemini AI content generation guide',
    category: 'ai-agents',
    tags: ['gemini', 'ai', 'content', 'generation'],
    priority: 3,
  },
  {
    id: 'audit-recommendations',
    path: 'docs/AUDIT_RECOMMENDATIONS.md',
    title: 'Audit Recommendations',
    description: 'Codebase audit recommendations and resources',
    category: 'ai-agents',
    tags: ['audit', 'recommendations', 'improvements'],
    priority: 4,
  },
  {
    id: 'audit-summary',
    path: 'docs/AUDIT_SUMMARY.md',
    title: 'Audit Summary',
    description: 'Summary of codebase audit findings',
    category: 'ai-agents',
    tags: ['audit', 'summary', 'findings'],
    priority: 5,
  },

  // Compliance
  {
    id: 'compliance',
    path: 'docs/COMPLIANCE.md',
    title: 'COPPA/FERPA Compliance',
    description: 'COPPA and FERPA compliance documentation',
    category: 'compliance',
    tags: ['coppa', 'ferpa', 'compliance', 'privacy'],
    priority: 1,
  },
  {
    id: 'prd',
    path: 'docs/PRD_COMPLETE.md',
    title: 'Product Requirements',
    description: 'Complete product requirements document',
    category: 'compliance',
    tags: ['prd', 'requirements', 'product'],
    priority: 2,
  },

  // Troubleshooting
  {
    id: 'troubleshooting',
    path: 'docs/TROUBLESHOOTING.md',
    title: 'Troubleshooting Guide',
    description: 'Common issues and their solutions',
    category: 'troubleshooting',
    tags: ['troubleshooting', 'issues', 'solutions', 'help'],
    priority: 1,
  },
  {
    id: 'debug-plan',
    path: 'docs/DEBUG_PLAN.md',
    title: 'Debug Plan',
    description: 'Debugging strategies and approaches',
    category: 'troubleshooting',
    tags: ['debug', 'debugging', 'strategies'],
    priority: 2,
  },
  {
    id: 'codebase-audit',
    path: 'docs/CODEBASE_AUDIT.md',
    title: 'Codebase Audit',
    description: 'Complete codebase audit findings',
    category: 'troubleshooting',
    tags: ['audit', 'codebase', 'findings'],
    priority: 3,
  },
  {
    id: 'current-state',
    path: 'docs/CURRENT_STATE_QUICK_REF.md',
    title: 'Current State Reference',
    description: 'Quick reference for current project state',
    category: 'troubleshooting',
    tags: ['state', 'reference', 'current'],
    priority: 4,
  },
];

/**
 * Get documents by category
 */
export function getDocsByCategory(category: DocCategory): DocFile[] {
  return DOCS_INDEX
    .filter(doc => doc.category === category)
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Get all unique categories
 */
export function getAllCategories(): DocCategory[] {
  return Object.keys(CATEGORY_LABELS) as DocCategory[];
}

/**
 * Get document by ID
 */
export function getDocById(id: string): DocFile | undefined {
  return DOCS_INDEX.find(doc => doc.id === id);
}
