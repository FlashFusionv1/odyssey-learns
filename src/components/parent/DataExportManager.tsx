import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileJson, FileSpreadsheet, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface DataExportManagerProps {
  childId: string;
  childName: string;
}

export function DataExportManager({ childId, childName }: DataExportManagerProps) {
  const [exporting, setExporting] = useState(false);
  const [exportHistory, setExportHistory] = useState<any[]>([]);
  const { toast } = useToast();

  const handleExport = async (format: 'json' | 'csv') => {
    setExporting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('export-child-data', {
        body: { 
          child_id: childId,
          format
        }
      });

      if (error) throw error;

      // Create download
      const blob = new Blob([format === 'json' ? JSON.stringify(data, null, 2) : data], {
        type: format === 'json' ? 'application/json' : 'text/csv'
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${childName}_data_${format === 'json' ? new Date().toISOString() : Date.now()}.${format === 'json' ? 'json' : 'zip'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Export complete',
        description: `${childName}'s data has been downloaded as ${format.toUpperCase()}.`
      });

      // Refresh history
      loadExportHistory();
    } catch (error: any) {
      toast({
        title: 'Export failed',
        description: error.message || 'Failed to export data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setExporting(false);
    }
  };

  const loadExportHistory = async () => {
    const { data } = await supabase
      .from('data_export_log')
      .select('*')
      .eq('child_id', childId)
      .order('exported_at', { ascending: false })
      .limit(5);

    if (data) {
      setExportHistory(data);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export {childName}'s Data
        </CardTitle>
        <CardDescription>
          Download a complete copy of your child's data in machine-readable format. 
          This is your right under COPPA.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Button 
            onClick={() => handleExport('json')} 
            disabled={exporting}
            className="flex-1"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileJson className="h-4 w-4 mr-2" />
            )}
            Download JSON
          </Button>
          <Button 
            onClick={() => handleExport('csv')} 
            disabled={exporting}
            variant="outline"
            className="flex-1"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4 mr-2" />
            )}
            Download CSV (ZIP)
          </Button>
        </div>

        {exportHistory.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-2">Recent Exports</h4>
            <div className="space-y-2">
              {exportHistory.map((exp) => (
                <div key={exp.id} className="text-xs text-muted-foreground flex justify-between items-center">
                  <span>{exp.export_format.toUpperCase()} export</span>
                  <span>{format(new Date(exp.exported_at), 'MMM d, yyyy h:mm a')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
          <p className="font-semibold mb-1">What's included:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Profile information</li>
            <li>Learning progress and quiz scores</li>
            <li>Emotion check-ins (decrypted)</li>
            <li>Activity history and screen time logs</li>
            <li>Created content and lessons</li>
            <li>Parent-child messages</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
