import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocsSidebar } from '@/components/docs/DocsSidebar';
import { DocsViewer } from '@/components/docs/DocsViewer';
import { DocsHome } from '@/components/docs/DocsHome';
import { useDocsSearch } from '@/hooks/useDocsSearch';
import { getDocById, DocCategory } from '@/lib/docsIndex';
import { cn } from '@/lib/utils';

export default function DocsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDocId, setSelectedDocId] = useState<string | null>(
    searchParams.get('doc')
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {
    searchQuery,
    setSearchQuery,
    filteredDocs,
    setSelectedCategory,
  } = useDocsSearch();

  // Update URL when doc changes
  useEffect(() => {
    if (selectedDocId) {
      setSearchParams({ doc: selectedDocId });
    } else {
      setSearchParams({});
    }
  }, [selectedDocId, setSearchParams]);

  // Handle doc selection
  const handleSelectDoc = useCallback((docId: string) => {
    setSelectedDocId(docId);
    setMobileMenuOpen(false);
  }, []);

  // Handle category selection
  const handleSelectCategory = useCallback((category: DocCategory) => {
    setSelectedCategory(category);
    setSelectedDocId(null);
  }, [setSelectedCategory]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    setSelectedDocId(null);
  }, []);

  const selectedDoc = selectedDocId ? getDocById(selectedDocId) : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="h-14 border-b border-border bg-card flex items-center px-4 gap-4 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        
        <div className="flex items-center gap-2">
          <span className="text-xl">📚</span>
          <h1 className="font-semibold">Documentation</h1>
        </div>
        
        <div className="flex-1" />
        
        <Button
          variant="ghost"
          size="sm"
          className="hidden lg:flex"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
        </Button>
        
        <Button variant="outline" size="sm" asChild>
          <a href="/" className="gap-1">
            ← Back to App
          </a>
        </Button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Desktop */}
        <aside
          className={cn(
            'w-72 shrink-0 transition-all duration-200 hidden lg:block',
            !sidebarOpen && 'w-0 overflow-hidden'
          )}
        >
          <DocsSidebar
            selectedDoc={selectedDocId}
            onSelectDoc={handleSelectDoc}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchResults={filteredDocs}
          />
        </aside>

        {/* Sidebar - Mobile */}
        <aside
          className={cn(
            'fixed inset-0 top-14 z-50 bg-background lg:hidden transition-transform duration-200',
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <DocsSidebar
            selectedDoc={selectedDocId}
            onSelectDoc={handleSelectDoc}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchResults={filteredDocs}
          />
        </aside>

        {/* Content Area */}
        <main className="flex-1 flex overflow-hidden">
          {selectedDoc ? (
            <DocsViewer doc={selectedDoc} onBack={handleBack} />
          ) : (
            <DocsHome
              onSelectDoc={handleSelectDoc}
              onSelectCategory={handleSelectCategory}
            />
          )}
        </main>
      </div>
    </div>
  );
}
