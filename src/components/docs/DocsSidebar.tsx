import { useState } from 'react';
import { Search, ChevronDown, ChevronRight, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  DOCS_INDEX, 
  CATEGORY_LABELS, 
  DocFile, 
  DocCategory,
  getDocsByCategory,
  getAllCategories 
} from '@/lib/docsIndex';

interface DocsSidebarProps {
  selectedDoc: string | null;
  onSelectDoc: (docId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchResults: DocFile[];
}

export function DocsSidebar({
  selectedDoc,
  onSelectDoc,
  searchQuery,
  onSearchChange,
  searchResults,
}: DocsSidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<DocCategory>>(
    new Set(['getting-started', 'architecture', 'development'])
  );

  const toggleCategory = (category: DocCategory) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="flex flex-col h-full border-r border-border bg-card">
      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search documentation..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        {isSearching && (
          <p className="text-xs text-muted-foreground mt-2">
            {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <nav className="p-2">
          {isSearching ? (
            // Search results
            <div className="space-y-1">
              {searchResults.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4 text-center">
                  No documents found for "{searchQuery}"
                </p>
              ) : (
                searchResults.map((doc) => (
                  <DocItem
                    key={doc.id}
                    doc={doc}
                    isSelected={selectedDoc === doc.id}
                    onClick={() => onSelectDoc(doc.id)}
                    showCategory
                  />
                ))
              )}
            </div>
          ) : (
            // Category tree
            <div className="space-y-1">
              {getAllCategories().map((category) => {
                const docs = getDocsByCategory(category);
                const isExpanded = expandedCategories.has(category);
                const { label, icon } = CATEGORY_LABELS[category];

                return (
                  <div key={category}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start gap-2 h-9"
                      onClick={() => toggleCategory(category)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <span>{icon}</span>
                      <span className="flex-1 text-left">{label}</span>
                      <Badge variant="secondary" className="h-5 text-xs">
                        {docs.length}
                      </Badge>
                    </Button>
                    
                    {isExpanded && (
                      <div className="ml-4 pl-4 border-l border-border space-y-0.5 mt-0.5">
                        {docs.map((doc) => (
                          <DocItem
                            key={doc.id}
                            doc={doc}
                            isSelected={selectedDoc === doc.id}
                            onClick={() => onSelectDoc(doc.id)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          {DOCS_INDEX.length} documents indexed
        </p>
      </div>
    </div>
  );
}

interface DocItemProps {
  doc: DocFile;
  isSelected: boolean;
  onClick: () => void;
  showCategory?: boolean;
}

function DocItem({ doc, isSelected, onClick, showCategory }: DocItemProps) {
  const categoryInfo = CATEGORY_LABELS[doc.category];
  
  return (
    <Button
      variant={isSelected ? 'secondary' : 'ghost'}
      className={cn(
        'w-full justify-start gap-2 h-auto py-2 px-3',
        isSelected && 'bg-primary/10 text-primary'
      )}
      onClick={onClick}
    >
      <FileText className="h-4 w-4 shrink-0" />
      <div className="flex-1 text-left min-w-0">
        <p className="text-sm font-medium truncate">{doc.title}</p>
        {showCategory && (
          <p className={cn('text-xs', categoryInfo.color)}>
            {categoryInfo.icon} {categoryInfo.label}
          </p>
        )}
      </div>
    </Button>
  );
}
