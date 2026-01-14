import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GraduationCap, BookOpen, Users, CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';

interface TeacherOnboardingProps {
  userId: string;
  onComplete: () => void;
}

const SUBJECTS = ['Math', 'Reading', 'Science', 'Social Studies', 'Emotional Intelligence', 'Life Skills'];
const GRADES = [
  { value: 0, label: 'Kindergarten' },
  { value: 1, label: '1st Grade' },
  { value: 2, label: '2nd Grade' },
  { value: 3, label: '3rd Grade' },
  { value: 4, label: '4th Grade' },
  { value: 5, label: '5th Grade' },
  { value: 6, label: '6th Grade' },
  { value: 7, label: '7th Grade' },
  { value: 8, label: '8th Grade' },
];

export function TeacherOnboarding({ userId, onComplete }: TeacherOnboardingProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    schoolName: '',
    subjects: [] as string[],
    gradelevels: [] as number[],
  });

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const handleSubjectToggle = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleGradeToggle = (grade: number) => {
    setFormData(prev => ({
      ...prev,
      gradelevels: prev.gradelevels.includes(grade)
        ? prev.gradelevels.filter(g => g !== grade)
        : [...prev.gradelevels, grade]
    }));
  };

  const handleSubmit = async () => {
    if (!formData.fullName || formData.subjects.length === 0 || formData.gradelevels.length === 0) {
      toast.error('Please complete all required fields');
      return;
    }

    setLoading(true);
    try {
      // Create teacher profile
      const { error: profileError } = await supabase
        .from('teacher_profiles')
        .insert({
          user_id: userId,
          full_name: formData.fullName,
          email: formData.email,
          subjects: formData.subjects,
          grade_levels: formData.gradelevels,
        });

      if (profileError) throw profileError;

      // Add teacher role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: 'teacher',
        });

      if (roleError && !roleError.message.includes('duplicate')) {
        throw roleError;
      }

      toast.success('Teacher profile created successfully!');
      onComplete();
    } catch (err: any) {
      console.error('Error creating teacher profile:', err);
      toast.error(err.message || 'Failed to create teacher profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <CardTitle>Welcome to Inner Odyssey</CardTitle>
          <CardDescription>
            Set up your teacher profile to start managing your classroom
          </CardDescription>
          <Progress value={progress} className="mt-4" />
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                  1
                </div>
                <h3 className="font-semibold">Personal Information</h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="teacher@school.edu"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="schoolName">School Name (Optional)</Label>
                <Input
                  id="schoolName"
                  value={formData.schoolName}
                  onChange={(e) => setFormData(prev => ({ ...prev, schoolName: e.target.value }))}
                  placeholder="Enter your school name"
                />
              </div>
            </div>
          )}

          {/* Step 2: Subjects */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                  2
                </div>
                <h3 className="font-semibold">Subjects You Teach</h3>
              </div>

              <p className="text-sm text-muted-foreground">
                Select all subjects that apply:
              </p>

              <div className="grid grid-cols-2 gap-3">
                {SUBJECTS.map(subject => (
                  <div
                    key={subject}
                    onClick={() => handleSubjectToggle(subject)}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.subjects.includes(subject)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <Checkbox
                      checked={formData.subjects.includes(subject)}
                      onCheckedChange={() => handleSubjectToggle(subject)}
                    />
                    <span className="text-sm">{subject}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Grade Levels */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                  3
                </div>
                <h3 className="font-semibold">Grade Levels</h3>
              </div>

              <p className="text-sm text-muted-foreground">
                Select the grade levels you teach:
              </p>

              <div className="grid grid-cols-3 gap-3">
                {GRADES.map(grade => (
                  <div
                    key={grade.value}
                    onClick={() => handleGradeToggle(grade.value)}
                    className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.gradelevels.includes(grade.value)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <span className="text-sm font-medium">{grade.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => setStep(prev => prev - 1)}
              disabled={step === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {step < totalSteps ? (
              <Button
                onClick={() => setStep(prev => prev + 1)}
                disabled={
                  (step === 1 && !formData.fullName) ||
                  (step === 2 && formData.subjects.length === 0)
                }
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || formData.gradelevels.length === 0}
              >
                {loading ? 'Creating...' : 'Complete Setup'}
                <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
