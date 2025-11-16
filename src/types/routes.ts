import { ComponentType, LazyExoticComponent } from 'react';

/**
 * Configuration for a single route in the application
 */
export interface RouteConfig {
  /** URL path for the route */
  path: string;
  
  /** React component to render for this route */
  component: ComponentType<any> | LazyExoticComponent<ComponentType<any>>;
  
  /** Whether authentication is required to access this route */
  requireAuth?: boolean;
  
  /** Specific roles required to access this route (e.g., 'admin', 'parent', 'child') */
  roles?: string[];
  
  /** Whether to preload this route on hover or idle time */
  preload?: boolean;
  
  /** Priority level for preloading (1 = highest, 3 = lowest) */
  preloadPriority?: 1 | 2 | 3;
  
  /** Custom error boundary component for this route */
  errorBoundary?: ComponentType<{ error: Error; resetError: () => void }>;
  
  /** Custom layout wrapper component for this route */
  layout?: ComponentType<{ children: React.ReactNode }>;
  
  /** Optional metadata for SEO and analytics */
  meta?: {
    title?: string;
    description?: string;
    keywords?: string[];
  };
}

/**
 * Group of related routes (e.g., all auth routes, all parent routes)
 */
export interface RouteGroup {
  /** Unique identifier for this route group */
  name: string;
  
  /** Base path prefix for all routes in this group */
  basePath: string;
  
  /** Array of route configurations in this group */
  routes: RouteConfig[];
  
  /** Whether all routes in this group require authentication */
  requireAuth?: boolean;
  
  /** Shared layout component for all routes in this group */
  layout?: ComponentType<{ children: React.ReactNode }>;
}

/**
 * Complete application route tree
 */
export interface AppRoutes {
  auth: RouteGroup;
  public: RouteGroup;
  parent: RouteGroup;
  child: RouteGroup;
  admin: RouteGroup;
}

/**
 * Type-safe route path builder result
 */
export type RoutePath = string;

/**
 * Route guard check result
 */
export interface RouteGuardResult {
  allowed: boolean;
  redirectTo?: string;
  reason?: string;
}
