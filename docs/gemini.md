# Gemini AI Integration Guide

> **How to integrate Google's Gemini AI with Odyssey Learns for multimodal educational content generation**

## 📋 Table of Contents

1. [Overview](#overview)
2. [Use Cases](#use-cases)
3. [Architecture](#architecture)
4. [Setup & Configuration](#setup--configuration)
5. [Implementation Examples](#implementation-examples)
6. [Multimodal Features](#multimodal-features)
7. [Best Practices](#best-practices)
8. [Cost Optimization](#cost-optimization)

---

## 🎯 Overview

Gemini AI (Google) brings unique multimodal capabilities to Odyssey Learns:
- **Vision**: Analyze images in lessons (diagrams, charts, photos)
- **Text Generation**: Create lesson content and explanations
- **Long Context**: Handle extensive lesson materials
- **Fast Processing**: Quick response times for real-time features
- **Multilingual**: Support for multiple languages (future)

### Why Gemini?

- **Multimodal**: Process text, images, and video
- **Google Integration**: Easy integration with Google Workspace
- **Cost-effective**: Competitive pricing
- **Fast**: Low latency responses
- **Safety**: Built-in content filtering

---

## 💡 Use Cases

### 1. Image-Based Lesson Creation

**Feature**: Upload an image (diagram, chart, photo) and generate a lesson around it.

**User Flow**:
```
Parent uploads: Photo of butterfly lifecycle
    ↓
Gemini Vision: Analyzes image content
    ↓
Gemini Pro: Generates lesson about butterfly metamorphosis
    - Identifies stages in image
    - Creates explanatory text
    - Suggests activities
    - Generates quiz questions
```

### 2. Math Problem Solving with Images

**Feature**: Child takes photo of math problem, gets step-by-step help.

**User Flow**:
```
Child: Uploads photo of homework problem
    ↓
Gemini Vision: Recognizes equation/problem
    ↓
Gemini Pro: Provides solution steps
    - Breaks down problem
    - Explains each step
    - Shows similar examples
```

### 3. Science Experiment Documentation

**Feature**: Create lessons from experiment photos/videos.

**Example**: Parent photos of volcano experiment
```
Gemini: Generates lesson including:
    - Materials list (from image analysis)
    - Step-by-step instructions
    - Scientific explanations
    - Safety notes
    - Follow-up questions
```

### 4. Real-World Learning

**Feature**: Convert field trip photos into lessons.

**Example**: Zoo visit photos
```
Gemini: Creates lesson about:
    - Animals observed (identified from photos)
    - Habitats and ecosystems
    - Conservation topics
    - Fun facts about each animal
```

---

## 🏗️ Architecture

### Integration Pattern

```
┌────────────────────────────────────────┐
│        Odyssey Learns Frontend         │
│  • Image upload                        │
│  • Text input                          │
│  • Video upload (future)               │
└───────────────┬────────────────────────┘
                │
                │ Multimodal request
                ↓
┌────────────────────────────────────────┐
│     Supabase Edge Function             │
│  (Gemini API Integration Layer)        │
│                                        │
│  • Image preprocessing                 │
│  • Request validation                  │
│  • Response formatting                 │
│  • Usage tracking                      │
└───────────────┬────────────────────────┘
                │
                │ API call with image + prompt
                ↓
┌────────────────────────────────────────┐
│         Gemini API (Google AI)         │
│  Model: gemini-1.5-pro or gemini-flash │
└───────────────┬────────────────────────┘
                │
                │ Generated content + analysis
                ↓
┌────────────────────────────────────────┐
│      Content Processing Pipeline       │
│  • Format extraction                   │
│  • Sanitization                        │
│  • Image storage (Supabase Storage)    │
│  • Database persistence                │
└────────────────────────────────────────┘
```

---

## ⚙️ Setup & Configuration

### Step 1: Get API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create API key
3. Add to Supabase secrets:
   ```bash
   supabase secrets set GOOGLE_AI_API_KEY=your_key_here
   ```

### Step 2: Create Edge Function

```bash
# Create new edge function
supabase functions new generate-lesson-gemini

# Deploy
supabase functions deploy generate-lesson-gemini
```

### Step 3: Environment Variables

```env
# .env.local
VITE_GEMINI_FUNCTION_URL=https://your-project.supabase.co/functions/v1/generate-lesson-gemini

# Supabase secrets (server-side)
GOOGLE_AI_API_KEY=AIza...
GEMINI_MODEL=gemini-1.5-pro-latest
```

---

## 💻 Implementation Examples

### Edge Function: Image-Based Lesson Generation

```typescript
// supabase/functions/generate-lesson-gemini/index.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(Deno.env.get('GOOGLE_AI_API_KEY')!);

interface ImageLessonRequest {
  imageData: string; // base64 encoded
  imageMimeType: string;
  gradeLevel: number;
  subject: string;
  additionalContext?: string;
}

Deno.serve(async (req) => {
  // Verify authentication
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body: ImageLessonRequest = await req.json();

  try {
    // Initialize model with vision capabilities
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro-latest" 
    });

    // Prepare image data
    const imageParts = [{
      inlineData: {
        data: body.imageData,
        mimeType: body.imageMimeType
      }
    }];

    // System instruction for educational content
    const prompt = `You are an expert educator creating lessons for Grade ${body.gradeLevel} students.

Analyze the provided image and create a comprehensive ${body.subject} lesson based on what you see.

${body.additionalContext ? `Additional context: ${body.additionalContext}` : ''}

Create a structured lesson with:

1. **Title**: Catchy, descriptive title based on image content
2. **Image Description**: Detailed description of what's shown
3. **Introduction**: Hook students' interest (2-3 sentences)
4. **Main Content**: 
   - Explain key concepts shown in the image
   - Use age-appropriate language for Grade ${body.gradeLevel}
   - Break complex ideas into simple parts
   - Include 3-5 key learning points
5. **Activities**: 2-3 hands-on activities related to the image
6. **Discussion Questions**: 3-4 thought-provoking questions
7. **Quiz Questions**: 5 multiple choice questions about the content
8. **Summary**: Brief recap of key points

Format as markdown. Make it engaging and educational!`;

    // Generate content with vision
    const result = await model.generateContent([prompt, ...imageParts]);
    const response = result.response;
    const content = response.text();

    // Parse and structure the response
    const lesson = parseGeminiLesson(content);

    return new Response(
      JSON.stringify({
        success: true,
        lesson: {
          ...lesson,
          grade_level: body.gradeLevel,
          subject: body.subject,
          generated_by: 'gemini-ai',
          has_image: true,
          metadata: {
            model: 'gemini-1.5-pro',
            promptTokens: result.response.usageMetadata?.promptTokenCount,
            completionTokens: result.response.usageMetadata?.candidatesTokenCount,
          }
        }
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Gemini API error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Failed to generate lesson from image' 
      }),
      { status: 500 }
    );
  }
});

function parseGeminiLesson(content: string) {
  // Extract title
  const titleMatch = content.match(/#+\s*(.+?)(?:\n|$)/);
  const title = titleMatch ? titleMatch[1].trim() : 'Untitled Lesson';

  // Extract quiz questions if present
  const quizSection = content.match(/##\s*Quiz Questions?[\s\S]*$/i);
  const quiz = quizSection ? parseQuizFromMarkdown(quizSection[0]) : [];

  return {
    title,
    content_markdown: content,
    quiz_questions: quiz,
  };
}

function parseQuizFromMarkdown(quizText: string) {
  // Parse markdown-formatted quiz questions
  const questions = [];
  const questionBlocks = quizText.split(/\d+\.\s+/).slice(1);

  for (const block of questionBlocks) {
    const lines = block.trim().split('\n');
    const question = lines[0];
    const options = {};
    let correctAnswer = '';

    lines.slice(1).forEach(line => {
      const optMatch = line.match(/([a-d])\)\s*(.+)/i);
      if (optMatch) {
        const letter = optMatch[1].toLowerCase();
        options[letter] = optMatch[2].trim();
      }
      
      const correctMatch = line.match(/(?:correct|answer):\s*([a-d])/i);
      if (correctMatch) {
        correctAnswer = correctMatch[1].toLowerCase();
      }
    });

    if (question && Object.keys(options).length > 0) {
      questions.push({
        question: question.trim(),
        options,
        correct_answer: correctAnswer || 'a'
      });
    }
  }

  return questions;
}
```

### Frontend: Image Upload & Lesson Generation

```typescript
// src/components/admin/GeminiImageLessonGenerator.tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function GeminiImageLessonGenerator() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [gradeLevel, setGradeLevel] = useState(3);
  const [subject, setSubject] = useState('science');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!selectedImage) {
      toast.error('Please select an image first');
      return;
    }

    setLoading(true);

    try {
      // Convert image to base64
      const base64 = await fileToBase64(selectedImage);
      
      // Get auth token
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Call Gemini edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-lesson-gemini`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageData: base64.split(',')[1], // Remove data:image/... prefix
            imageMimeType: selectedImage.type,
            gradeLevel,
            subject,
            additionalContext: context
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate lesson');
      }

      const result = await response.json();

      // Upload image to storage
      const imageUrl = await uploadImage(selectedImage, session.user.id);

      // Save lesson to database
      const { data: lesson, error } = await supabase
        .from('lessons')
        .insert({
          ...result.lesson,
          thumbnail_url: imageUrl,
          created_by: session.user.id,
          is_active: false, // Requires review
          source: 'ai_generated_image'
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Lesson generated successfully from image!');
      navigate(`/admin/lessons/${lesson.id}/edit`);

    } catch (error) {
      console.error('Failed to generate lesson:', error);
      toast.error('Failed to generate lesson. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-6 bg-white rounded-lg shadow">
      <div className="flex items-center gap-2">
        <ImageIcon className="w-6 h-6 text-purple-600" />
        <h2 className="text-2xl font-bold">AI Image Lesson Generator</h2>
      </div>
      
      <p className="text-gray-600">
        Powered by Gemini Vision - Upload an image and let AI create an educational lesson
      </p>

      <div className="space-y-4">
        {/* Image Upload */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center gap-2"
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-64 rounded-lg"
              />
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Click to upload image or drag and drop
                </span>
                <span className="text-xs text-gray-400">
                  PNG, JPG, WEBP up to 5MB
                </span>
              </>
            )}
          </label>
        </div>

        {/* Options */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Grade Level</Label>
            <select
              value={gradeLevel}
              onChange={(e) => setGradeLevel(Number(e.target.value))}
              className="w-full p-2 border rounded"
              disabled={loading}
            >
              {Array.from({ length: 13 }, (_, i) => (
                <option key={i} value={i}>
                  {i === 0 ? 'Kindergarten' : `Grade ${i}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label>Subject</Label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2 border rounded"
              disabled={loading}
            >
              <option value="science">Science</option>
              <option value="math">Math</option>
              <option value="reading">Reading</option>
              <option value="social">Social Studies</option>
              <option value="lifeskills">Life Skills</option>
            </select>
          </div>
        </div>

        {/* Optional Context */}
        <div>
          <Label>Additional Context (Optional)</Label>
          <Input
            placeholder="E.g., 'This is from our butterfly garden project'"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            disabled={loading}
          />
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={loading || !selectedImage}
          className="w-full"
        >
          {loading ? 'Analyzing Image & Generating Lesson...' : 'Generate Lesson from Image'}
        </Button>
      </div>

      {loading && (
        <div className="text-center text-sm text-gray-600">
          <p>Gemini Vision is analyzing your image...</p>
          <p className="text-xs mt-1">This may take 15-30 seconds</p>
        </div>
      )}
    </div>
  );
}

// Helper functions
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function uploadImage(file: File, userId: string): Promise<string> {
  const fileName = `${userId}/${Date.now()}-${file.name}`;
  
  const { data, error } = await supabase.storage
    .from('lesson-images')
    .upload(fileName, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('lesson-images')
    .getPublicUrl(fileName);

  return publicUrl;
}
```

---

## 🎨 Multimodal Features

### 1. Homework Help (Camera → Solution)

```typescript
// Take photo of problem → Get step-by-step help
export async function analyzeMathProblem(imageFile: File) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  
  const prompt = `You are a patient math tutor for elementary/middle school students.

Analyze this math problem image and provide:
1. What the problem is asking
2. Step-by-step solution
3. Explanation of each step in simple terms
4. A similar practice problem

Be encouraging and clear!`;

  const imagePart = await fileToImagePart(imageFile);
  const result = await model.generateContent([prompt, imagePart]);
  
  return result.response.text();
}
```

### 2. Science Diagram Explanation

```typescript
// Upload science diagram → Get detailed explanation
export async function explainDiagram(imageFile: File, subject: string) {
  const prompt = `Explain this ${subject} diagram in detail.
  
  Identify:
  - What process/concept is shown
  - Each labeled component
  - How components interact
  - Real-world applications
  
  Use grade-appropriate language.`;
  
  // Similar implementation as above
}
```

### 3. Art & History Analysis

```typescript
// Analyze artwork or historical image
export async function analyzeArtwork(imageFile: File) {
  const prompt = `You are an art educator for children.
  
  Analyze this artwork/historical image:
  - What do you see?
  - What might be the story?
  - Historical context (if applicable)
  - Art techniques used
  - Discussion questions for students
  
  Make it engaging and age-appropriate!`;
  
  // Implementation
}
```

---

## ✅ Best Practices

### 1. Image Preprocessing

```typescript
// Optimize images before sending
async function preprocessImage(file: File): Promise<File> {
  // Resize if too large
  if (file.size > 1024 * 1024) { // 1MB
    return await resizeImage(file, { maxWidth: 1024, maxHeight: 1024 });
  }
  return file;
}
```

### 2. Error Handling

```typescript
try {
  const result = await generateLessonFromImage(image);
} catch (error) {
  if (error.message.includes('quota')) {
    toast.error('Daily AI generation limit reached. Try again tomorrow.');
  } else if (error.message.includes('safety')) {
    toast.error('Image content could not be processed. Please try a different image.');
  } else {
    toast.error('Failed to generate lesson. Please try again.');
  }
}
```

### 3. Safety Filters

Gemini has built-in safety filters, but add extra validation:

```typescript
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

const model = genAI.getGenerativeModel({ 
  model: "gemini-1.5-pro",
  safetySettings 
});
```

---

## 💰 Cost Optimization

### Gemini Pricing (as of 2024)

**Gemini 1.5 Pro**:
- Input: $3.50 per million tokens
- Output: $10.50 per million tokens

**Gemini 1.5 Flash** (faster, cheaper):
- Input: $0.075 per million tokens
- Output: $0.30 per million tokens

### Cost per Lesson (Estimated)

**With image (Gemini Pro)**:
- Input: ~1,500 tokens (prompt + image) = $0.005
- Output: ~3,000 tokens = $0.03
- **Total: ~$0.035 per lesson**

**Text-only (Gemini Flash)**:
- Input: ~500 tokens = $0.00004
- Output: ~2,000 tokens = $0.0006
- **Total: ~$0.001 per lesson**

### Optimization Strategies

1. **Use Flash model** for simple text generation
2. **Use Pro model** only for image analysis
3. **Batch requests** when possible
4. **Cache common results**
5. **Set monthly quotas** per user

---

## 📊 Comparison: Claude vs Gemini

| Feature | Claude | Gemini |
|---------|--------|--------|
| **Vision** | ❌ No | ✅ Yes |
| **Context Window** | 200K | 1M-2M |
| **Speed** | Medium | Fast |
| **Cost** | Medium | Low-Medium |
| **Best For** | Complex text, reasoning | Multimodal, fast responses |

**Recommendation**: Use both!
- **Claude**: Text-heavy lessons, complex explanations
- **Gemini**: Image-based lessons, quick generations

---

## 🔮 Future Possibilities

1. **Video Analysis**: Generate lessons from educational videos
2. **Audio Transcription**: Convert lectures to text lessons
3. **Multi-image Lessons**: Compare/contrast multiple images
4. **Real-time Chat**: Interactive AI tutor for students
5. **Handwriting Recognition**: Convert handwritten notes to digital

---

## 📚 Resources

- [Gemini API Documentation](https://ai.google.dev/docs)
- [Vision Capabilities](https://ai.google.dev/tutorials/vision_quickstart)
- [Safety Settings](https://ai.google.dev/docs/safety_setting_gemini)
- [Best Practices](https://ai.google.dev/docs/best_practices)

---

**Last Updated**: 2025-12-30
