import { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, Copy, Check, BookOpen, Clock, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { SafeMarkdown } from '@/components/learning/SafeMarkdown';
import { DocFile, CATEGORY_LABELS } from '@/lib/docsIndex';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DocsViewerProps {
  doc: DocFile | null;
  onBack: () => void;
}

export function DocsViewer({ doc, onBack }: DocsViewerProps) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!doc) {
      setContent(null);
      return;
    }

    const fetchContent = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch the markdown file
        const response = await fetch(`/${doc.path}`);
        if (!response.ok) {
          throw new Error(`Failed to load document: ${response.status}`);
        }
        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load document');
        setContent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [doc]);

  const handleCopyLink = () => {
    if (!doc) return;
    const url = `${window.location.origin}/docs/${doc.id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleViewRaw = () => {
    if (!doc) return;
    window.open(`/${doc.path}`, '_blank');
  };

  if (!doc) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/30">
        <div className="text-center space-y-4">
          <BookOpen className="h-16 w-16 text-muted-foreground mx-auto" />
          <div>
            <h3 className="text-lg font-semibold">Select a Document</h3>
            <p className="text-muted-foreground">
              Choose a document from the sidebar to view its contents
            </p>
          </div>
        </div>
      </div>
    );
  }

  const categoryInfo = CATEGORY_LABELS[doc.category];

  return (
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Button variant="ghost" size="sm" onClick={onBack} className="mb-2 -ml-2">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to list
            </Button>
            <h1 className="text-2xl font-bold truncate">{doc.title}</h1>
            <p className="text-muted-foreground mt-1">{doc.description}</p>
            
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge className={cn('gap-1', categoryInfo.color)}>
                <span>{categoryInfo.icon}</span>
                {categoryInfo.label}
              </Badge>
              
              {doc.tags.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="outline" className="gap-1">
                  <Tag className="h-3 w-3" />
                  {tag}
                </Badge>
              ))}
              
              {doc.tags.length > 4 && (
                <Badge variant="outline">+{doc.tags.length - 4} more</Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              {copied ? (
                <Check className="h-4 w-4 mr-1" />
              ) : (
                <Copy className="h-4 w-4 mr-1" />
              )}
              Copy Link
            </Button>
            <Button variant="outline" size="sm" onClick={handleViewRaw}>
              <ExternalLink className="h-4 w-4 mr-1" />
              View Raw
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-6 max-w-4xl mx-auto">
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-32 w-full mt-6" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
            </div>
          ) : content ? (
            <article className="prose prose-slate dark:prose-invert max-w-none">
              <SafeMarkdown 
                content={content} 
                className="
                  [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-6 [&_h1]:pb-2 [&_h1]:border-b
                  [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-4
                  [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3
                  [&_h4]:text-lg [&_h4]:font-medium [&_h4]:mt-4 [&_h4]:mb-2
                  [&_p]:leading-7 [&_p]:mb-4
                  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4
                  [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4
                  [&_li]:mb-1
                  [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
                  [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:mb-4
                  [&_pre_code]:bg-transparent [&_pre_code]:p-0
                  [&_blockquote]:border-l-4 [&_blockquote]:border-primary/50 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground
                  [&_table]:w-full [&_table]:border-collapse [&_table]:mb-4
                  [&_th]:border [&_th]:border-border [&_th]:px-4 [&_th]:py-2 [&_th]:bg-muted [&_th]:font-medium [&_th]:text-left
                  [&_td]:border [&_td]:border-border [&_td]:px-4 [&_td]:py-2
                  [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary/80
                  [&_hr]:border-border [&_hr]:my-8
                  [&_img]:rounded-lg [&_img]:max-w-full
                "
              />
            </article>
          ) : null}
        </div>
      </ScrollArea>
    </div>
  );
}
