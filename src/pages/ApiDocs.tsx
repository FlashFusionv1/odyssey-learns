import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft, ExternalLink, Copy, Check, Code, FileJson, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

interface OpenAPISpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  servers: Array<{ url: string; description: string }>;
  paths: Record<string, Record<string, PathItem>>;
  components: {
    schemas: Record<string, SchemaObject>;
    securitySchemes: Record<string, SecurityScheme>;
  };
  tags: Array<{ name: string; description: string }>;
}

interface PathItem {
  tags: string[];
  summary: string;
  description: string;
  operationId: string;
  security?: Array<Record<string, string[]>>;
  requestBody?: {
    required: boolean;
    content: Record<string, { schema: SchemaRef; example?: unknown }>;
  };
  responses: Record<string, ResponseObject>;
}

interface ResponseObject {
  description: string;
  content?: Record<string, { schema: SchemaRef; example?: unknown }>;
}

interface SchemaRef {
  $ref?: string;
  type?: string;
  properties?: Record<string, SchemaObject>;
  items?: SchemaRef;
  enum?: string[];
}

interface SchemaObject {
  type?: string;
  properties?: Record<string, SchemaObject>;
  required?: string[];
  description?: string;
  format?: string;
  enum?: string[];
  items?: SchemaRef;
  minimum?: number;
  maximum?: number;
  maxLength?: number;
  nullable?: boolean;
  default?: unknown;
  additionalProperties?: SchemaObject | boolean;
}

interface SecurityScheme {
  type: string;
  scheme: string;
  bearerFormat?: string;
  description?: string;
}

const methodColors: Record<string, string> = {
  get: 'bg-green-500',
  post: 'bg-blue-500',
  put: 'bg-amber-500',
  patch: 'bg-orange-500',
  delete: 'bg-red-500',
};

const ApiDocs = () => {
  const [spec, setSpec] = useState<OpenAPISpec | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedEndpoints, setExpandedEndpoints] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/openapi.json')
      .then((res) => res.json())
      .then(setSpec)
      .catch(console.error);
  }, []);

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleEndpoint = (id: string) => {
    setExpandedEndpoints((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const resolveRef = (ref: string): SchemaObject | null => {
    if (!spec || !ref.startsWith('#/components/schemas/')) return null;
    const name = ref.replace('#/components/schemas/', '');
    return spec.components.schemas[name] || null;
  };

  const renderSchema = (schema: SchemaRef | SchemaObject, depth = 0): React.ReactNode => {
    if ('$ref' in schema && schema.$ref) {
      const resolved = resolveRef(schema.$ref);
      if (resolved) return renderSchema(resolved, depth);
      return <span className="text-muted-foreground">{schema.$ref}</span>;
    }

    const s = schema as SchemaObject;

    if (s.type === 'object' && s.properties) {
      return (
        <div className={depth > 0 ? 'ml-4 border-l-2 border-muted pl-4' : ''}>
          {Object.entries(s.properties).map(([key, prop]) => (
            <div key={key} className="py-1">
              <span className="font-mono text-sm text-primary">{key}</span>
              {s.required?.includes(key) && (
                <Badge variant="outline" className="ml-2 text-xs">
                  required
                </Badge>
              )}
              <span className="ml-2 text-xs text-muted-foreground">
                {prop.type || (prop as SchemaRef).$ref?.split('/').pop()}
              </span>
              {prop.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{prop.description}</p>
              )}
              {prop.enum && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {prop.enum.map((e) => (
                    <Badge key={e} variant="secondary" className="text-xs">
                      {e}
                    </Badge>
                  ))}
                </div>
              )}
              {prop.type === 'object' && prop.properties && renderSchema(prop, depth + 1)}
              {prop.type === 'array' && prop.items && (
                <div className="ml-4">
                  <span className="text-xs text-muted-foreground">Array of:</span>
                  {renderSchema(prop.items as SchemaObject, depth + 1)}
                </div>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (s.type === 'array' && s.items) {
      return (
        <div>
          <span className="text-xs text-muted-foreground">Array of </span>
          {renderSchema(s.items as SchemaObject, depth)}
        </div>
      );
    }

    return <span className="text-muted-foreground">{s.type}</span>;
  };

  if (!spec) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const filteredPaths = Object.entries(spec.paths).filter(([_, methods]) => {
    if (selectedTag === 'all') return true;
    return Object.values(methods).some((m) => m.tags?.includes(selectedTag));
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center gap-4">
          <Link to="/" className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <FileJson className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">{spec.info.title}</h1>
            <Badge variant="secondary">v{spec.info.version}</Badge>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(window.location.origin + '/api/openapi.json', 'spec-url')}
            >
              {copiedId === 'spec-url' ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              Copy Spec URL
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/api/openapi.json" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                Raw JSON
              </a>
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                <Button
                  variant={selectedTag === 'all' ? 'secondary' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => setSelectedTag('all')}
                >
                  All Endpoints
                </Button>
                {spec.tags.map((tag) => (
                  <Button
                    key={tag.name}
                    variant={selectedTag === tag.name ? 'secondary' : 'ghost'}
                    className="w-full justify-start"
                    onClick={() => setSelectedTag(tag.name)}
                  >
                    {tag.name}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Authentication Info */}
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Authentication
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>Most endpoints require a Bearer token (JWT) from Supabase Auth.</p>
                <div className="mt-2 p-2 bg-muted rounded font-mono text-xs">
                  Authorization: Bearer &lt;token&gt;
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 space-y-6">
            <Card>
              <CardHeader>
                <CardDescription>{spec.info.description}</CardDescription>
              </CardHeader>
            </Card>

            {filteredPaths.map(([path, methods]) =>
              Object.entries(methods).map(([method, details]) => {
                const endpointId = `${method}-${path}`;
                const isExpanded = expandedEndpoints.has(endpointId);
                const hasAuth = details.security && details.security.length > 0;

                return (
                  <Card key={endpointId} className="overflow-hidden">
                    <button
                      className="w-full text-left"
                      onClick={() => toggleEndpoint(endpointId)}
                      aria-expanded={isExpanded}
                      aria-controls={`${endpointId}-content`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <Badge className={`${methodColors[method]} text-white uppercase text-xs px-2 py-1`}>
                            {method}
                          </Badge>
                          <code className="text-sm font-mono">{path}</code>
                          {hasAuth && (
                            <Badge variant="outline" className="ml-auto text-xs">
                              🔒 Auth Required
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-base mt-2">{details.summary}</CardTitle>
                        <CardDescription>{details.description}</CardDescription>
                        <div className="flex gap-2 mt-2">
                          {details.tags?.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardHeader>
                    </button>

                    {isExpanded && (
                      <CardContent id={`${endpointId}-content`} className="border-t pt-4">
                        <Tabs defaultValue="request" className="w-full">
                          <TabsList>
                            {details.requestBody && <TabsTrigger value="request">Request</TabsTrigger>}
                            <TabsTrigger value="responses">Responses</TabsTrigger>
                            <TabsTrigger value="example">Try It</TabsTrigger>
                          </TabsList>

                          {details.requestBody && (
                            <TabsContent value="request" className="mt-4">
                              <h4 className="text-sm font-medium mb-2">Request Body</h4>
                              {Object.entries(details.requestBody.content).map(([contentType, content]) => (
                                <div key={contentType}>
                                  <Badge variant="outline" className="mb-2">
                                    {contentType}
                                  </Badge>
                                  <ScrollArea className="h-64 rounded border p-4">
                                    {renderSchema(content.schema)}
                                  </ScrollArea>
                                  {content.example && (
                                    <div className="mt-4">
                                      <div className="flex items-center justify-between mb-2">
                                        <h5 className="text-sm font-medium">Example</h5>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() =>
                                            copyToClipboard(JSON.stringify(content.example, null, 2), `${endpointId}-example`)
                                          }
                                        >
                                          {copiedId === `${endpointId}-example` ? (
                                            <Check className="h-3 w-3" />
                                          ) : (
                                            <Copy className="h-3 w-3" />
                                          )}
                                        </Button>
                                      </div>
                                      <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
                                        {JSON.stringify(content.example, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </TabsContent>
                          )}

                          <TabsContent value="responses" className="mt-4">
                            <div className="space-y-4">
                              {Object.entries(details.responses).map(([status, response]) => (
                                <div key={status}>
                                  <div className="flex items-center gap-2 mb-2">
                                    <Badge
                                      variant={status.startsWith('2') ? 'default' : 'destructive'}
                                      className="font-mono"
                                    >
                                      {status}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">{response.description}</span>
                                  </div>
                                  {response.content &&
                                    Object.entries(response.content).map(([contentType, content]) => (
                                      <div key={contentType} className="ml-4">
                                        {content.example && (
                                          <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
                                            {JSON.stringify(content.example, null, 2)}
                                          </pre>
                                        )}
                                      </div>
                                    ))}
                                </div>
                              ))}
                            </div>
                          </TabsContent>

                          <TabsContent value="example" className="mt-4">
                            <div className="space-y-4">
                              <h4 className="text-sm font-medium">cURL Example</h4>
                              <div className="relative">
                                <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
                                  {`curl -X ${method.toUpperCase()} \\
  '${spec.servers[0].url}${path}' \\${
                                    hasAuth
                                      ? `
  -H 'Authorization: Bearer YOUR_TOKEN' \\`
                                      : ''
                                  }
  -H 'Content-Type: application/json'${
    details.requestBody?.content['application/json']?.example
      ? ` \\
  -d '${JSON.stringify(details.requestBody.content['application/json'].example)}'`
      : ''
  }`}
                                </pre>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute top-2 right-2"
                                  onClick={() =>
                                    copyToClipboard(
                                      `curl -X ${method.toUpperCase()} '${spec.servers[0].url}${path}' ${
                                        hasAuth ? "-H 'Authorization: Bearer YOUR_TOKEN' " : ''
                                      }-H 'Content-Type: application/json'${
                                        details.requestBody?.content['application/json']?.example
                                          ? ` -d '${JSON.stringify(details.requestBody.content['application/json'].example)}'`
                                          : ''
                                      }`,
                                      `${endpointId}-curl`
                                    )
                                  }
                                >
                                  {copiedId === `${endpointId}-curl` ? (
                                    <Check className="h-3 w-3" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                              </div>

                              <h4 className="text-sm font-medium">TypeScript Example</h4>
                              <pre className="bg-muted p-4 rounded text-xs overflow-x-auto">
                                {`import { supabase } from '@/integrations/supabase/client';

const { data, error } = await supabase.functions.invoke('${path.replace('/', '')}', {
  body: ${details.requestBody?.content['application/json']?.example ? JSON.stringify(details.requestBody.content['application/json'].example, null, 2) : '{}'}
});`}
                              </pre>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    )}
                  </Card>
                );
              })
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ApiDocs;
