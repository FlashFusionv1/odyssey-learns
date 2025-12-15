import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useValidatedChild } from "@/hooks/useValidatedChild";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ChildSelector as ChildSelectorComponent } from "@/components/auth/ChildSelector";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface Child {
  id: string;
  name: string;
  grade_level: number;
  avatar_config: any;
  total_points: number | null;
}

const ChildSelector = () => {
  const { user, loading: authLoading } = useAuth();
  const { selectChild } = useValidatedChild();
  const [children, setChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      loadChildren();
    }
  }, [user, authLoading]);

  const loadChildren = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('children')
        .select('id, name, grade_level, avatar_config, total_points')
        .eq('parent_id', user.id)
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const childList = data || [];
      setChildren(childList);

      // Auto-redirect if only one child
      if (childList.length === 1) {
        const success = await selectChild(childList[0].id);
        if (success) {
          navigate('/dashboard');
        }
      } else if (childList.length === 0) {
        // No children, redirect to parent setup
        navigate('/parent-setup');
      } else {
        // Check for previously selected child
        const selectedChildId = localStorage.getItem('selectedChildId');
        if (selectedChildId && childList.some(c => c.id === selectedChildId)) {
          const success = await selectChild(selectedChildId);
          if (success) {
            navigate('/dashboard');
          }
        }
      }
    } catch (error) {
      console.error('Error loading children:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChildSelect = async (childId: string) => {
    const success = await selectChild(childId);
    if (success) {
      navigate('/dashboard');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="w-full max-w-4xl space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="inline-block w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mb-4 shadow-elevated">
            <span className="text-3xl font-bold text-primary-foreground">IO</span>
          </div>
          <h1 className="text-4xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-muted-foreground">
            Select a learner to continue their adventure
          </p>
        </div>

        {children.length > 0 ? (
          <ChildSelectorComponent children={children} onSelect={handleChildSelect} />
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No learners found. Add a child to get started!</p>
            <Button onClick={() => navigate('/parent-setup')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Learner
            </Button>
          </Card>
        )}

        <div className="text-center">
          <Button variant="ghost" onClick={() => navigate('/parent')}>
            Go to Parent Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChildSelector;
