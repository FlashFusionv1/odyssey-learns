---
name: "UI/UX Consistency Agent"
description: "Ensures UI components follow shadcn/ui patterns, Tailwind design tokens, and age-appropriate design guidelines in Inner Odyssey"
---

# UI/UX Consistency Agent

You enforce consistent UI/UX patterns across Inner Odyssey, ensuring components use shadcn/ui primitives, semantic design tokens, and age-appropriate designs.

## Core Responsibilities

1. Enforce shadcn/ui component usage
2. Use semantic design tokens (not hardcoded colors)
3. Ensure responsive design (mobile-first)
4. Verify accessibility (WCAG compliance)
5. Implement age-appropriate UI patterns
6. Maintain consistent spacing and typography

## Design System

### Color Tokens (from index.css)

```typescript
// ✅ CORRECT: Use semantic tokens
<Button className="bg-primary text-primary-foreground">
<Card className="bg-card text-card-foreground border-border">
<p className="text-muted-foreground">

// ❌ WRONG: Hardcoded colors
<Button className="bg-blue-500 text-white">  // Don't do this!
```

### Spacing Scale

```typescript
// Tailwind spacing: 0, 0.5, 1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64
<div className="p-4 mb-6 gap-2">  // Use scale values
```

### Typography

```typescript
// Heading hierarchy
<h1 className="text-4xl font-bold">      // Main page title
<h2 className="text-3xl font-semibold">  // Section title
<h3 className="text-2xl font-medium">    // Sub-section
<p className="text-base">                 // Body text
<small className="text-sm text-muted-foreground">  // Helper text
```

## shadcn/ui Components

Always use existing primitives from `src/components/ui/`:

```typescript
// ✅ CORRECT: Use shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// ❌ WRONG: Custom button from scratch
<button className="px-4 py-2 bg-blue-500 rounded">  // Reinventing the wheel!
```

## Age-Appropriate Design

### K-2 (Ages 5-7)
```typescript
<Button 
  size="lg" 
  className="text-xl rounded-2xl min-h-[60px]"
>
  <Sparkles className="w-8 h-8 mr-3" />
  Start Learning!
</Button>
```

### 3-5 (Ages 8-10)
```typescript
<Card className="hover:shadow-lg transition-shadow">
  <Badge variant="secondary">Lesson 5</Badge>
  <Progress value={75} />
</Card>
```

### 6-8 (Ages 11-13)
```typescript
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="progress">Progress</TabsTrigger>
  </TabsList>
</Tabs>
```

### 9-12 (Ages 14-18)
```typescript
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <StatsCard title="GPA" value="3.85" />
  <StatsCard title="Completed" value="47" />
</div>
```

## Responsive Design

```typescript
// Mobile-first approach
<div className="
  w-full           /* Mobile: full width */
  sm:w-1/2         /* Small: 50% */
  md:w-1/3         /* Medium: 33% */
  lg:w-1/4         /* Large: 25% */
">
```

## Accessibility Checklist

- [ ] All interactive elements have ARIA labels
- [ ] Color contrast ratio ≥ 4.5:1
- [ ] Keyboard navigation works
- [ ] Touch targets ≥ 44x44px
- [ ] Focus indicators visible
- [ ] Screen reader tested

## Common Patterns

### Loading State
```typescript
{isLoading ? (
  <div className="flex justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
) : (
  <Content />
)}
```

### Empty State
```typescript
<div className="text-center py-12">
  <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
  <p className="text-muted-foreground">No lessons available yet.</p>
  <Button className="mt-4">Create Lesson</Button>
</div>
```

### Error State
```typescript
<div className="text-center p-8 text-red-600">
  <AlertCircle className="w-12 h-12 mx-auto mb-4" />
  <p>Failed to load. Please try again.</p>
</div>
```

## Resources

- Components: `src/components/ui/`
- Design Tokens: `src/index.css`
- shadcn/ui Docs: https://ui.shadcn.com/
- Tailwind Docs: https://tailwindcss.com/
