# API Documentation

> **Version:** 1.6.0  
> **Last Updated:** 2026-01-17

## Overview

Inner Odyssey uses Supabase as its backend, providing:
- **PostgreSQL Database** - Primary data store with RLS
- **Edge Functions** - Serverless API endpoints
- **Realtime** - Live data subscriptions
- **Storage** - File uploads and management
- **Authentication** - User identity management

---

## Table of Contents

1. [Authentication](#authentication)
2. [Database Schema](#database-schema)
3. [Edge Functions](#edge-functions)
4. [Realtime Subscriptions](#realtime-subscriptions)
5. [Error Handling](#error-handling)

---

## Authentication

### Sign Up

```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword',
  options: {
    data: {
      display_name: 'John Doe',
    },
  },
});
```

### Sign In

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword',
});
```

### Get Current User

```typescript
const { data: { user } } = await supabase.auth.getUser();
```

### Sign Out

```typescript
await supabase.auth.signOut();
```

---

## Database Schema

### Core Tables

#### `profiles`
User profile information.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key (matches auth.users.id) |
| display_name | text | User's display name |
| email | text | Email address |
| avatar_url | text | Profile picture URL |
| is_admin | boolean | Admin privileges |
| created_at | timestamptz | Creation timestamp |

#### `children`
Child accounts linked to parents.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| parent_id | uuid | FK to profiles |
| name | text | Child's display name |
| grade_level | integer | School grade (0-12) |
| total_points | integer | Accumulated points |
| avatar_config | jsonb | Avatar customization |
| pin_hash | text | Encrypted PIN |

#### `lessons`
Educational content.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| title | text | Lesson title |
| subject | text | Subject area |
| grade_level | integer | Target grade |
| content_markdown | text | Lesson content |
| difficulty | text | easy/medium/hard |
| points_value | integer | Points awarded |
| quiz_questions | jsonb | Assessment questions |

#### `user_progress`
Tracks lesson completion.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| child_id | uuid | FK to children |
| lesson_id | uuid | FK to lessons |
| status | text | not_started/in_progress/completed |
| score | integer | Quiz score |
| completed_at | timestamptz | Completion time |

### Social Tables

#### `peer_connections`
Friend connections between children.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| child_id | uuid | Requester's ID |
| peer_id | uuid | Recipient's ID |
| status | text | pending/accepted/rejected |
| parent_approved | boolean | Parent approval status |

#### `shared_activities`
Collaborative learning activities.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| created_by | uuid | Creator child ID |
| title | text | Activity name |
| activity_type | text | study_group/project/challenge |
| max_participants | integer | Maximum members |
| status | text | open/in_progress/completed |

---

## Edge Functions

### AI Content Generation

**Endpoint:** `POST /functions/v1/generate-lesson-content`

```typescript
const { data } = await supabase.functions.invoke('generate-lesson-content', {
  body: {
    topic: 'Multiplication Tables',
    gradeLevel: 3,
    subject: 'math',
    difficulty: 'medium',
  },
});
```

**Response:**
```json
{
  "title": "Mastering Multiplication",
  "content": "# Introduction...",
  "quiz_questions": [...],
  "estimated_minutes": 15
}
```

### AI Insights

**Endpoint:** `POST /functions/v1/ai-insights`

```typescript
const { data } = await supabase.functions.invoke('ai-insights', {
  body: {
    childId: 'uuid',
    insightType: 'weekly_summary',
  },
});
```

### Health Check

**Endpoint:** `GET /functions/v1/health-check`

```typescript
const { data } = await supabase.functions.invoke('health-check');
// Returns: { status: 'healthy', timestamp: '...' }
```

### Export Child Data (GDPR/COPPA)

**Endpoint:** `POST /functions/v1/export-child-data`

```typescript
const { data } = await supabase.functions.invoke('export-child-data', {
  body: {
    childId: 'uuid',
    format: 'json', // or 'csv'
  },
});
```

---

## Realtime Subscriptions

### Progress Updates

```typescript
const channel = supabase
  .channel('progress-updates')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'user_progress',
      filter: `child_id=eq.${childId}`,
    },
    (payload) => {
      console.log('Progress updated:', payload);
    }
  )
  .subscribe();

// Cleanup
channel.unsubscribe();
```

### Presence (Who's Online)

```typescript
const presenceChannel = supabase.channel('online-users');

presenceChannel
  .on('presence', { event: 'sync' }, () => {
    const state = presenceChannel.presenceState();
    console.log('Online users:', state);
  })
  .on('presence', { event: 'join' }, ({ key, newPresences }) => {
    console.log('User joined:', key);
  })
  .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
    console.log('User left:', key);
  })
  .subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await presenceChannel.track({
        userId: user.id,
        online_at: new Date().toISOString(),
      });
    }
  });
```

---

## Error Handling

### Standard Error Response

```typescript
interface APIError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
```

### Common Error Codes

| Code | Description | Resolution |
|------|-------------|------------|
| `PGRST116` | No rows returned | Check if record exists |
| `42501` | RLS policy violation | Check permissions |
| `23505` | Unique violation | Handle duplicates |
| `23503` | Foreign key violation | Verify references |
| `RATE_LIMITED` | Too many requests | Implement backoff |

### Error Handling Pattern

```typescript
try {
  const { data, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('id', lessonId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Lesson not found');
    }
    throw error;
  }

  return data;
} catch (error) {
  console.error('API Error:', error);
  toast({
    title: 'Error',
    description: error.message,
    variant: 'destructive',
  });
}
```

---

## Rate Limiting

API calls are rate-limited to prevent abuse:

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Read operations | 100/min | Per user |
| Write operations | 30/min | Per user |
| AI generation | 10/hour | Per user |
| File uploads | 20/hour | Per user |

---

## Security

### Row Level Security (RLS)

All tables have RLS policies ensuring:
- Parents can only access their children's data
- Children can only access age-appropriate content
- Admins have elevated privileges with audit logging
- Sensitive fields (emotions, health) are encrypted

### API Key Security

- Never expose service role keys in frontend code
- Use anon key for client-side operations
- Edge functions use service role internally

---

## Related Documentation

- [Database Schema](./DATABASE_SCHEMA.md)
- [Edge Functions](./EDGE_FUNCTIONS.md)
- [Security](./SECURITY.md)
- [Authentication](./AUTHENTICATION.md)
