import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Save, BookOpen, Search, FileDown } from "lucide-react";
import { Input } from "@/components/ui/input";

interface DigitalNotebookProps {
  childId: string;
  lessonId: string;
  lessonTitle: string;
}

export const DigitalNotebook = ({ childId, lessonId, lessonTitle }: DigitalNotebookProps) => {
  const [noteContent, setNoteContent] = useState("");
  const [savedNotes, setSavedNotes] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadNote();
    loadAllNotes();
  }, [lessonId, childId]);

  const loadNote = async () => {
    const { data } = await supabase
      .from('lesson_notes')
      .select('*')
      .eq('child_id', childId)
      .eq('lesson_id', lessonId)
      .maybeSingle();

    if (data) {
      setNoteContent(data.note_content);
    }
  };

  const loadAllNotes = async () => {
    const { data } = await supabase
      .from('lesson_notes')
      .select('*, lessons(title)')
      .eq('child_id', childId)
      .order('updated_at', { ascending: false })
      .limit(10);

    setSavedNotes(data || []);
  };

  const saveNote = async () => {
    if (!noteContent.trim()) {
      toast({
        title: "Cannot save empty note",
        description: "Please write something first!",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await supabase
      .from('lesson_notes')
      .upsert({
        child_id: childId,
        lesson_id: lessonId,
        note_content: noteContent,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'child_id,lesson_id'
      });

    if (error) {
      toast({
        title: "Error saving note",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Note saved! 📝",
        description: "Your thoughts are safely stored.",
      });
      loadAllNotes();
    }
    setLoading(false);
  };

  const exportToPDF = () => {
    // Simple text export (real PDF would require a library like jsPDF)
    const blob = new Blob([`${lessonTitle}\n\n${noteContent}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lessonTitle.replace(/[^a-z0-9]/gi, '_')}_notes.txt`;
    a.click();
  };

  const filteredNotes = savedNotes.filter(note =>
    note.note_content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.lessons?.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Digital Notebook</h3>
            <p className="text-sm text-muted-foreground">Take notes for: {lessonTitle}</p>
          </div>
        </div>

        <Textarea
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="Write your notes here... You can summarize key points, write questions, or draw connections to other lessons!"
          className="min-h-[200px] mb-4 bg-background"
        />

        <div className="flex gap-2">
          <Button onClick={saveNote} disabled={loading} className="gap-2">
            <Save className="w-4 h-4" />
            {loading ? "Saving..." : "Save Note"}
          </Button>
          <Button onClick={exportToPDF} variant="outline" className="gap-2">
            <FileDown className="w-4 h-4" />
            Export
          </Button>
        </div>
      </Card>

      {/* Recent Notes */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Your Recent Notes</h3>
        
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your notes..."
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-3">
          {filteredNotes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {searchQuery ? "No notes match your search" : "No notes yet. Start taking notes!"}
            </p>
          ) : (
            filteredNotes.map((note) => (
              <Card key={note.id} className="p-4 hover:bg-accent/50 cursor-pointer transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-sm">{note.lessons?.title || "Untitled Lesson"}</h4>
                  <span className="text-xs text-muted-foreground">
                    {new Date(note.updated_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {note.note_content}
                </p>
              </Card>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};
