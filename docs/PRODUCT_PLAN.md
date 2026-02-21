# Super-Task Vibe - Implementation Roadmap

## Current Status: MVP with Advanced Features
✅ Kanban board with drag-drop
✅ Task tags, archiving, dependencies
✅ AI subtask generation (Gemini)
✅ Voice assistant (ElevenLabs)
✅ Real-time sync (polling)

## Phase 1: Authentication & Landing Page (Priority: CRITICAL)

### 1.1 Linux OS-Style Landing Page
**Goal**: Create a terminal/console aesthetic landing page with "boot sequence" animation

**Components**:
- [ ] Terminal-style login screen
- [ ] Boot sequence animation (kernel loading, services starting)
- [ ] Username/password input with terminal cursor
- [ ] ASCII art logo
- [ ] "Login" command or Enter key submission
- [ ] Error messages in terminal style (red text)
- [ ] Success animation (green checkmark)

**Design Inspiration**:
- Black/dark terminal background
- Monospace font (JetBrains Mono, Fira Code)
- Green/amber text (classic terminal colors)
- Blinking cursor
- Command-line interface feel

### 1.2 Authentication System
**Goal**: Secure user authentication with JWT sessions

**Database Schema**:
```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Sessions table (for server-side sessions)
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Update tasks to link to users properly
-- (Already has user_id, but now it references users table)
```

**Server Actions**:
- [ ] `registerUser` - Create new account with bcrypt password hashing
- [ ] `loginUser` - Validate credentials, create session
- [ ] `logoutUser` - Destroy session
- [ ] `getCurrentUser` - Get logged-in user from session
- [ ] `updateUserProfile` - Update display name, avatar
- [ ] `changePassword` - Secure password change flow

**Middleware**:
- [ ] `middleware.ts` - Protect routes, check auth status
- [ ] Redirect unauthenticated users to landing page
- [ ] Redirect authenticated users away from landing page

**Security Measures**:
- [ ] bcrypt for password hashing (10+ rounds)
- [ ] JWT tokens with expiration
- [ ] HttpOnly cookies for session tokens
- [ ] CSRF protection
- [ ] Rate limiting on auth endpoints
- [ ] Input validation with Zod
- [ ] SQL injection protection (parameterized queries already in place)

### 1.3 Landing Page Implementation
**File Structure**:
```
src/
  app/
    (auth)/
      login/
        page.tsx          # Linux-style terminal login
      register/
        page.tsx          # Registration page
      layout.tsx          # Auth layout (no sidebar, etc.)
    (app)/
      layout.tsx          # Main app layout (with sidebar, etc.)
      page.tsx            # Main task manager
  components/
    auth/
      TerminalLogin.tsx   # Linux terminal-style login component
      BootSequence.tsx    # Boot animation component
  lib/
    auth/
      session.ts         # Session management
      password.ts        # Password hashing utilities
```

## Phase 2: Core Product Features (Priority: HIGH)

### 2.1 Multiple Projects
- [ ] Create projects table
- [ ] Project creation/management UI
- [ ] Project switcher in sidebar
- [ ] Project-specific settings

### 2.2 List View + Calendar View
- [ ] Toggle between Kanban and List views
- [ ] Calendar view with month/week/day modes
- [ ] Drag-and-drop in calendar
- [ ] Date-based navigation

### 2.3 Subtasks (Hierarchical)
- [ ] Subtasks table with parent_task_id
- [ ] Nested task display in UI
- [ ] Progress calculation based on subtasks
- [ ] Collapsible subtask lists

### 2.4 Comments & Activity Feed
- [ ] Comments table
- [ ] Activity log table
- [ ] Comment UI in task detail
- [ ] Activity feed sidebar
- [ ] @mentions with notifications

## Phase 3: Power User Features (Priority: MEDIUM)

### 3.1 Recurring Tasks
- [ ] Recurrence pattern storage
- [ ] Cron job or scheduled function
- [ ] Recurrence UI in task creation

### 3.2 Time Tracking
- [ ] Time entries table
- [ ] Start/stop timer UI
- [ ] Time reports and analytics

### 3.3 Advanced Filters & Saved Views
- [ ] Complex filter builder
- [ ] Saved views per user
- [ ] Shareable views

### 3.4 Bulk Operations
- [ ] Multi-select tasks
- [ ] Bulk status change
- [ ] Bulk archive/delete
- [ ] Bulk tag assignment

## Phase 4: Integrations & Scale (Priority: LOW)

### 4.1 Notifications
- [ ] Email notifications (Resend/Postmark)
- [ ] Push notifications (OneSignal/Pusher)
- [ ] Notification preferences

### 4.2 Integrations
- [ ] Slack bot
- [ ] GitHub issues sync
- [ ] Google Calendar sync
- [ ] Webhook support

### 4.3 API & Webhooks
- [ ] REST API
- [ ] GraphQL (optional)
- [ ] Webhook management UI
- [ ] API documentation

### 4.4 Performance & Scale
- [ ] Redis caching
- [ ] Database optimization
- [ ] CDN setup
- [ ] Load testing

## Security Checklist

### Authentication & Authorization
- [ ] bcrypt password hashing (12+ rounds)
- [ ] JWT with short expiration + refresh tokens
- [ ] HttpOnly, Secure, SameSite cookies
- [ ] CSRF protection
- [ ] Rate limiting (5 attempts per 15 min)
- [ ] Account lockout after failed attempts
- [ ] Password strength requirements
- [ ] 2FA support (TOTP)

### Data Protection
- [ ] Input sanitization (XSS prevention)
- [ ] SQL injection protection (parameterized queries ✓)
- [ ] Output encoding
- [ ] Content Security Policy headers
- [ ] Secure headers (HSTS, X-Frame-Options, etc.)
- [ ] Data encryption at rest (if needed)
- [ ] GDPR compliance (data export, deletion)

### Infrastructure
- [ ] HTTPS only
- [ ] Environment variables for secrets
- [ ] No sensitive data in logs
- [ ] Dependency scanning (npm audit)
- [ ] Container security (if using Docker)
- [ ] Database backup strategy

## Recommended Tech Stack Additions

### For Authentication
- **next-auth** (Auth.js v5) - Flexible authentication
- **bcryptjs** - Password hashing
- **jose** - JWT handling

### For Real-time Features
- **Socket.io** or **PartyKit** - Real-time collaboration
- **Redis** - Session store, caching, pub/sub

### For File Uploads
- **UploadThing** or **AWS S3** - File storage
- **Sharp** - Image optimization

### For Email
- **Resend** or **Postmark** - Transactional emails

### For Monitoring
- **Sentry** - Error tracking
- **LogRocket** or **PostHog** - Session replay and analytics

## Next Immediate Actions

1. **Create Linux OS-style landing page** with terminal aesthetic
2. **Implement authentication system** with proper security
3. **Add middleware** for route protection
4. **Create user registration/login flows**

Would you like me to start implementing the Linux OS-style landing page with the terminal aesthetic? This will be the foundation for the authentication system and give the product a unique, memorable identity.
