import { BookOpen, Search, Sparkles, Shield, Code, Rocket, Settings, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CATEGORY_LABELS, DocCategory, getDocsByCategory } from '@/lib/docsIndex';
import { cn } from '@/lib/utils';

interface DocsHomeProps {
  onSelectDoc: (docId: string) => void;
  onSelectCategory: (category: DocCategory) => void;
}

const FEATURED_DOCS = [
  { id: 'quick-start', icon: Rocket, label: 'Quick Start' },
  { id: 'architecture', icon: Code, label: 'Architecture' },
  { id: 'security', icon: Shield, label: 'Security' },
  { id: 'troubleshooting', icon: HelpCircle, label: 'Troubleshooting' },
];

const CATEGORY_ICONS: Record<DocCategory, React.ComponentType<{ className?: string }>> = {
  'getting-started': Rocket,
  'architecture': Code,
  'development': Code,
  'security': Shield,
  'testing': Settings,
  'operations': Settings,
  'features': Sparkles,
  'planning': BookOpen,
  'ai-agents': Sparkles,
  'compliance': Shield,
  'troubleshooting': HelpCircle,
};

export function DocsHome({ onSelectDoc, onSelectCategory }: DocsHomeProps) {
  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-5xl mx-auto p-6 space-y-8">
        {/* Hero */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary">
            <BookOpen className="h-8 w-8" />
          </div>
          <h1 className="text-4xl font-bold">Inner Odyssey Documentation</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to build, deploy, and maintain the Inner Odyssey K-12 educational platform
          </p>
          <div className="flex items-center justify-center gap-2 pt-4">
            <Badge variant="secondary" className="gap-1">
              <Search className="h-3 w-3" />
              Full-text search enabled
            </Badge>
            <Badge variant="secondary">50+ documents</Badge>
          </div>
        </div>

        {/* Featured Docs */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Popular Documents</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FEATURED_DOCS.map(({ id, icon: Icon, label }) => (
              <Card
                key={id}
                className="cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => onSelectDoc(id)}
              >
                <CardContent className="p-4 text-center">
                  <Icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Browse by Category */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.keys(CATEGORY_LABELS) as DocCategory[]).map((category) => {
              const { label, icon, color } = CATEGORY_LABELS[category];
              const docs = getDocsByCategory(category);
              const CategoryIcon = CATEGORY_ICONS[category];

              return (
                <Card
                  key={category}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={() => onSelectCategory(category)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      <div className={cn('p-2 rounded-lg', color)}>
                        <CategoryIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {icon} {label}
                        </CardTitle>
                        <CardDescription>{docs.length} documents</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {docs.slice(0, 3).map((doc) => (
                        <li key={doc.id} className="truncate">
                          • {doc.title}
                        </li>
                      ))}
                      {docs.length > 3 && (
                        <li className="text-primary">+ {docs.length - 3} more</li>
                      )}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Quick Links */}
        <section className="bg-muted/50 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-3" onClick={() => onSelectDoc('api')}>
              <Code className="h-4 w-4 mr-2" />
              API Reference
            </Button>
            <Button variant="outline" className="h-auto py-3" onClick={() => onSelectDoc('components')}>
              <Sparkles className="h-4 w-4 mr-2" />
              Components
            </Button>
            <Button variant="outline" className="h-auto py-3" onClick={() => onSelectDoc('deployment')}>
              <Rocket className="h-4 w-4 mr-2" />
              Deployment
            </Button>
            <Button variant="outline" className="h-auto py-3" onClick={() => onSelectDoc('security')}>
              <Shield className="h-4 w-4 mr-2" />
              Security
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground py-4 border-t border-border">
          <p>
            Inner Odyssey K-12 Documentation • Last updated: January 2026
          </p>
        </footer>
      </div>
    </div>
  );
}
