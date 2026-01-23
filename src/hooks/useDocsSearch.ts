import { useState, useEffect, useMemo, useCallback } from 'react';
import MiniSearch, { SearchResult } from 'minisearch';
import { DOCS_INDEX, DocFile, DocCategory } from '@/lib/docsIndex';

export interface DocSearchResult extends DocFile {
  score: number;
  matchedTerms: string[];
}

export interface UseDocsSearchReturn {
  search: (query: string) => DocSearchResult[];
  isIndexed: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  results: DocSearchResult[];
  selectedCategory: DocCategory | null;
  setSelectedCategory: (category: DocCategory | null) => void;
  filteredDocs: DocFile[];
}

/**
 * Hook for full-text search across documentation
 */
export function useDocsSearch(): UseDocsSearchReturn {
  const [isIndexed, setIsIndexed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<DocSearchResult[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<DocCategory | null>(null);

  // Initialize MiniSearch with configuration
  const miniSearch = useMemo(() => {
    const ms = new MiniSearch<DocFile>({
      fields: ['title', 'description', 'tags', 'category'],
      storeFields: ['id', 'path', 'title', 'description', 'category', 'tags', 'priority'],
      searchOptions: {
        boost: { title: 3, tags: 2, description: 1.5, category: 1 },
        fuzzy: 0.2,
        prefix: true,
      },
      extractField: (document, fieldName) => {
        if (fieldName === 'tags') {
          return document.tags.join(' ');
        }
        // Type-safe field extraction
        const value = document[fieldName as keyof DocFile];
        return typeof value === 'string' ? value : String(value ?? '');
      },
    });

    // Index all documents
    ms.addAll(DOCS_INDEX);
    return ms;
  }, []);

  useEffect(() => {
    setIsIndexed(true);
  }, []);

  // Search function
  const search = useCallback((query: string): DocSearchResult[] => {
    if (!query.trim()) {
      return [];
    }

    const searchResults = miniSearch.search(query, {
      boost: { title: 3, tags: 2, description: 1.5 },
      fuzzy: 0.2,
      prefix: true,
    }) as (SearchResult & DocFile)[];

    return searchResults.map(result => ({
      id: result.id,
      path: result.path,
      title: result.title,
      description: result.description,
      category: result.category as DocCategory,
      tags: result.tags,
      priority: result.priority,
      score: result.score,
      matchedTerms: result.terms || [],
    }));
  }, [miniSearch]);

  // Update results when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      const searchResults = search(searchQuery);
      // Filter by category if selected
      const filtered = selectedCategory
        ? searchResults.filter(r => r.category === selectedCategory)
        : searchResults;
      setResults(filtered);
    } else {
      setResults([]);
    }
  }, [searchQuery, selectedCategory, search]);

  // Get filtered docs (when not searching)
  const filteredDocs = useMemo(() => {
    if (searchQuery.trim()) {
      return results;
    }
    const docs = selectedCategory
      ? DOCS_INDEX.filter(doc => doc.category === selectedCategory)
      : DOCS_INDEX;
    return docs.sort((a, b) => a.priority - b.priority);
  }, [selectedCategory, searchQuery, results]);

  return {
    search,
    isIndexed,
    searchQuery,
    setSearchQuery,
    results,
    selectedCategory,
    setSelectedCategory,
    filteredDocs,
  };
}
