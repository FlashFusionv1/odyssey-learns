import { Route, Routes } from 'react-router-dom';
import { Suspense, useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { publicRoutes, errorRoutes } from '@/config/routes.config';

/**
 * Loading fallback for public routes
 */
const PublicLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="text-center space-y-4">
      <LoadingSpinner size="lg" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

/**
 * SEO metadata wrapper for public routes
 */
const RouteWithMeta = ({ 
  component: Component, 
  meta 
}: { 
  component: React.ComponentType; 
  meta?: { title?: string; description?: string; keywords?: string[] }; 
}) => {
  useEffect(() => {
    // Update document title
    if (meta?.title) {
      document.title = meta.title;
    }

    // Update meta description
    if (meta?.description) {
      let descMeta = document.querySelector('meta[name="description"]');
      if (!descMeta) {
        descMeta = document.createElement('meta');
        descMeta.setAttribute('name', 'description');
        document.head.appendChild(descMeta);
      }
      descMeta.setAttribute('content', meta.description);
    }

    // Update meta keywords
    if (meta?.keywords && meta.keywords.length > 0) {
      let keywordsMeta = document.querySelector('meta[name="keywords"]');
      if (!keywordsMeta) {
        keywordsMeta = document.createElement('meta');
        keywordsMeta.setAttribute('name', 'keywords');
        document.head.appendChild(keywordsMeta);
      }
      keywordsMeta.setAttribute('content', meta.keywords.join(', '));
    }
  }, [meta]);

  return <Component />;
};

/**
 * Public routes component
 * Handles all public-facing pages (landing, features, pricing, etc.)
 * Includes SEO metadata for each route
 */
export const PublicRoutes = () => {
  return (
    <Suspense fallback={<PublicLoader />}>
      <Routes>
        {publicRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={
              <RouteWithMeta 
                component={route.component as React.ComponentType} 
                meta={route.meta}
              />
            }
          />
        ))}
        {errorRoutes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<route.component />}
          />
        ))}
      </Routes>
    </Suspense>
  );
};
