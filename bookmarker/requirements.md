# Bookmarker - Requirements Document

## 1. Project Overview

**Bookmarker** is a full-stack web application designed to help users save, organize, and manage their bookmarks efficiently. The application provides a rich set of features including tagging, categorization, search, multiple view modes, and sharing capabilities.

### 1.1 Target Users
- Individuals looking to organize personal bookmarks
- Professionals managing research links
- Teams sharing curated link collections

### 1.2 Key Objectives
- Provide an intuitive bookmark management system
- Enable powerful search and filtering capabilities
- Support multiple organization methods (tags, categories, favorites)
- Offer flexible viewing options (table, cards, folder tree)
- Enable data portability (import/export)

---

## 2. Tech Stack

### 2.1 Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Icons**: Lucide React
- **State Management**: React Context API / Zustand (for complex state)
- **Form Handling**: React Hook Form with Zod validation
- **Data Fetching**: TanStack Query (React Query) for caching and optimistic updates

### 2.2 Backend
- **Framework**: Next.js API Routes / Server Actions
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js (v5/Auth.js)
- **File Storage**: Local filesystem or AWS S3 for favicons
- **API Architecture**: RESTful API + Server Actions

### 2.3 Development Tools
- **Package Manager**: npm/pnpm/yarn
- **Linting**: ESLint
- **Formatting**: Prettier
- **Type Checking**: TypeScript strict mode
- **Version Control**: Git

---

## 3. Database Schema

### 3.1 User Model
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  password      String    // Hashed
  emailVerified DateTime?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  bookmarks     Bookmark[]
  categories    Category[]
  tags          Tag[]
}
```

### 3.2 Bookmark Model
```prisma
model Bookmark {
  id          String    @id @default(cuid())
  url         String
  title       String
  description String?   @db.Text
  favicon     String?   // URL or file path to favicon
  isFavorite  Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  categoryId  String?
  category    Category? @relation(fields: [categoryId], references: [id])
  
  tags        BookmarkTag[]
  
  @@index([userId])
  @@index([categoryId])
  @@index([isFavorite])
  @@index([createdAt])
}
```

### 3.3 Category Model
```prisma
model Category {
  id        String     @id @default(cuid())
  name      String
  color     String?    // Hex color code
  icon      String?    // Icon name
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  
  userId    String
  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  bookmarks Bookmark[]
  
  @@unique([userId, name])
  @@index([userId])
}
```

### 3.4 Tag Model
```prisma
model Tag {
  id        String        @id @default(cuid())
  name      String
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt
  
  userId    String
  user      User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  bookmarks BookmarkTag[]
  
  @@unique([userId, name])
  @@index([userId])
}
```

### 3.5 BookmarkTag Junction Model
```prisma
model BookmarkTag {
  id         String   @id @default(cuid())
  bookmarkId String
  tagId      String
  
  bookmark   Bookmark @relation(fields: [bookmarkId], references: [id], onDelete: Cascade)
  tag        Tag      @relation(fields: [tagId], references: [id], onDelete: Cascade)
  
  @@unique([bookmarkId, tagId])
  @@index([bookmarkId])
  @@index([tagId])
}
```

---

## 4. Feature Specifications

### 4.1 Authentication & Authorization

#### 4.1.1 User Registration
- Email and password registration
- Email validation (valid format, unique)
- Password requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one number
  - At least one special character
- Optional: Email verification via token

#### 4.1.2 User Login
- Email and password authentication
- "Remember me" functionality
- Password reset via email
- Optional: OAuth providers (Google, GitHub)

#### 4.1.3 Session Management
- JWT-based sessions with NextAuth.js
- Secure HTTP-only cookies
- Automatic session refresh
- Logout functionality

#### 4.1.4 Authorization
- All bookmarks are private by default
- Users can only access their own bookmarks
- Role-based access for future expansion (admin, user)

### 4.2 Bookmark Management

#### 4.2.1 Create Bookmark
**Inputs:**
- URL (required, validated)
- Title (auto-fetched from URL or manual)
- Description (optional, rich text support)
- Category (optional, single selection)
- Tags (optional, multiple selection, create new on-the-fly)
- Favorite status (boolean)

**Process:**
1. Validate URL format
2. Check for duplicate URLs (warn user)
3. Auto-fetch metadata (title, favicon) using URL
4. Save favicon locally or to storage
5. Create bookmark with associations
6. Return success/error response

**Validations:**
- URL must be valid HTTP/HTTPS
- Title max length: 255 characters
- Description max length: 5000 characters
- Max 20 tags per bookmark

#### 4.2.2 Edit Bookmark
- Update any field except `id`, `userId`, `createdAt`
- Support updating tags and category
- Re-fetch favicon option
- Track `updatedAt` timestamp

#### 4.2.3 Delete Bookmark
- Soft delete option (future enhancement)
- Cascade delete associated tag relationships
- Confirmation dialog before deletion
- Bulk delete support

#### 4.2.4 Favorite Bookmarks
- Toggle favorite status
- Quick access to favorites via filter
- Show favorite count in sidebar/header

#### 4.2.5 Favicon Handling
- Auto-fetch favicon from URL
- Fallback to Google's favicon service
- Store locally or in cloud storage
- Default icon if fetch fails
- Manual upload option

### 4.3 Categories

#### 4.3.1 Create Category
- Name (required, unique per user)
- Color picker (hex color)
- Icon selector (from predefined list)
- Validation: No duplicate names

#### 4.3.2 Manage Categories
- Edit category details
- Delete category (unassign bookmarks or reassign)
- View bookmarks count per category
- Color-coded UI elements

#### 4.3.3 Category Organization
- Assign one category per bookmark
- Filter bookmarks by category
- Show category in all view modes
- Quick category change dropdown

### 4.4 Tags

#### 4.4.1 Create Tags
- Create tags on-the-fly while adding bookmarks
- Bulk tag creation from tag management page
- Auto-suggest existing tags while typing
- Case-insensitive tag matching

#### 4.4.2 Manage Tags
- Edit tag names
- Delete tags (remove from all bookmarks)
- View bookmark count per tag
- Merge duplicate tags

#### 4.4.3 Tag Assignment
- Multiple tags per bookmark
- Add/remove tags from bookmark edit
- Batch tag assignment (select multiple bookmarks)
- Tag autocomplete with fuzzy search

### 4.5 Search & Discovery

#### 4.5.1 Search Functionality
**Search Scope:**
- Bookmark title
- URL
- Description
- Tag names
- Category names

**Features:**
- Real-time search (debounced)
- Fuzzy matching
- Search highlighting in results
- Recent searches history
- Search suggestions

**Search Query Examples:**
```
"react tutorial"          → Full-text search
tag:react                 → Search by tag
category:development      → Search by category
is:favorite              → Favorites only
date:2024-01            → By month
```

#### 4.5.2 Filtering
**Filter Options:**
- Category (multi-select)
- Tags (multi-select, AND/OR logic)
- Favorite status
- Date range (created, updated)
- Has description
- URL domain

**Filter UI:**
- Sidebar filter panel
- Active filters chips
- Clear all filters button
- Save filter presets (future)

#### 4.5.3 Sorting
**Sort Options:**
- Created date (newest/oldest)
- Updated date (newest/oldest)
- Title (A-Z, Z-A)
- URL (A-Z, Z-A)
- Favorite first

**Default Sort:** Created date (newest first)

### 4.6 Pagination

#### 4.6.1 Configuration
- Default page size: 20 bookmarks
- Page size options: 10, 20, 50, 100
- Server-side pagination for performance
- Total count display

#### 4.6.2 Navigation
- Previous/Next buttons
- Page number buttons (1, 2, 3, ..., N)
- Jump to page input
- "Load more" option (infinite scroll alternative)

#### 4.6.3 URL Parameters
- Persist pagination state in URL
- Deep linkable paginated views
- Preserve filters across pages

### 4.7 View Modes

#### 4.7.1 Table View
**Columns:**
- Favicon (icon column)
- Title (with link)
- URL (truncated with tooltip)
- Category (badge)
- Tags (badge list)
- Favorite (star icon)
- Created date
- Updated date
- Actions (edit, delete)

**Features:**
- Sortable columns
- Resizable columns
- Row selection (checkbox)
- Bulk actions
- Responsive (horizontal scroll on mobile)

#### 4.7.2 Card View
**Card Layout:**
```
┌─────────────────────────┐
│ [Favicon] Title         │
│ ⭐ (if favorite)        │
│ Description (truncated) │
│ 🔗 URL (truncated)      │
│ 📁 Category             │
│ 🏷️ Tag1, Tag2, Tag3     │
│ 📅 Created date         │
│ [Edit] [Delete]         │
└─────────────────────────┘
```

**Features:**
- Grid layout (responsive columns)
- Hover effects
- Click to open URL
- Quick actions on hover
- Masonry layout option

#### 4.7.3 Folder Tree View
**Structure:**
```
📁 All Bookmarks (Count)
├─ ⭐ Favorites (Count)
├─ 📁 Categories
│  ├─ 💼 Work (Count)
│  ├─ 📚 Learning (Count)
│  └─ 🎮 Entertainment (Count)
└─ 🏷️ Tags
   ├─ react (Count)
   ├─ javascript (Count)
   └─ tutorial (Count)
```

**Features:**
- Collapsible tree nodes
- Click to filter bookmarks
- Drag-and-drop to move bookmarks
- Context menu (right-click)
- Badge with count

#### 4.7.4 View Persistence
- Save user's preferred view in localStorage
- Restore view on page load
- Per-device preference

### 4.8 Sharing

#### 4.8.1 Share Individual Bookmark
- Generate public share link (optional feature)
- Copy bookmark URL to clipboard
- Copy bookmark details as markdown/text
- Share via email (mailto link)

#### 4.8.2 Share by Tag
- Generate public URL for tag view
- Example: `/public/tags/react-tutorials`
- Show all bookmarks with that tag
- Read-only view for non-owners

#### 4.8.3 Share Options
- Public/Private toggle per bookmark
- Expiring share links (future)
- Password-protected shares (future)
- Analytics on shared links (future)

### 4.9 Import & Export

#### 4.9.1 Export Formats

**CSV Export:**
```csv
Title,URL,Description,Category,Tags,Favorite,Created,Updated
"Example","https://example.com","Description","Work","tag1,tag2",true,"2024-01-01","2024-01-02"
```

**JSON Export:**
```json
{
  "version": "1.0",
  "exportDate": "2024-01-01T00:00:00Z",
  "bookmarks": [
    {
      "title": "Example",
      "url": "https://example.com",
      "description": "Description",
      "category": "Work",
      "tags": ["tag1", "tag2"],
      "isFavorite": true,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-02T00:00:00Z"
    }
  ]
}
```

**Browser Bookmarks HTML (Netscape format):**
- Compatible with Chrome, Firefox exports
- Import into any browser

#### 4.9.2 Import Process
**Supported Formats:**
- CSV (custom format)
- JSON (custom format)
- Browser HTML bookmarks

**Process:**
1. File upload with validation
2. Parse and validate data
3. Show preview of bookmarks to import
4. Options:
   - Skip duplicates (by URL)
   - Merge with existing
   - Replace all
5. Background processing for large imports
6. Progress indicator
7. Summary report (imported, skipped, errors)

#### 4.9.3 Data Validation
- Check URL validity
- Sanitize descriptions (XSS prevention)
- Auto-create missing categories/tags
- Handle encoding issues
- Max file size: 10MB

### 4.10 Bulk Operations

#### 4.10.1 Bulk Actions
- Select multiple bookmarks (checkbox)
- Select all on page
- Select all matching filter
- Actions:
  - Delete selected
  - Add tags to selected
  - Remove tags from selected
  - Change category
  - Toggle favorite
  - Export selected

#### 4.10.2 UI Components
- Bulk action toolbar (appears on selection)
- Selection count display
- Clear selection button
- Confirmation dialogs for destructive actions

---

## 5. UI/UX Requirements

### 5.1 Layout

#### 5.1.1 Main Layout Structure
```
┌─────────────────────────────────────┐
│  Header (Logo, Search, User Menu)  │
├────────┬────────────────────────────┤
│        │                            │
│ Side   │  Main Content Area         │
│ bar    │  (Bookmarks List)          │
│        │                            │
│        │                            │
└────────┴────────────────────────────┘
```

#### 5.1.2 Header
- Logo/Brand name (left)
- Global search bar (center)
- View mode toggle (right)
- User avatar with dropdown menu (right)
  - Profile
  - Settings
  - Logout

#### 5.1.3 Sidebar (Collapsible)
- Add Bookmark button (prominent)
- Quick filters:
  - All Bookmarks
  - Favorites
  - Recent
  - Uncategorized
- Categories list (collapsible)
- Tags cloud/list (collapsible)
- Import/Export links
- Settings

#### 5.1.4 Main Content
- Filter bar (active filters, sort dropdown)
- View mode content (table/cards/tree)
- Pagination controls (bottom)

### 5.2 Design System

#### 5.2.1 Colors
- Primary: Blue (#3B82F6)
- Secondary: Slate (#64748B)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error: Red (#EF4444)
- Background: White/Light Gray
- Dark mode support

#### 5.2.2 Typography
- Font: Inter or System UI
- Headings: Bold, various sizes
- Body: Regular, 14-16px
- Monospace for URLs

#### 5.2.3 Spacing
- Base unit: 4px
- Consistent padding/margins
- Card spacing: 16px
- Section spacing: 24px

#### 5.2.4 Components
- Buttons: Primary, Secondary, Ghost, Icon
- Inputs: Text, Textarea, Select, Multi-select
- Badges: Category, Tag, Status
- Cards: Bookmark card, Info card
- Modals: Confirmation, Form dialogs
- Toast notifications: Success, Error, Info
- Loading states: Skeletons, Spinners
- Empty states: Illustrations + CTAs

### 5.3 Responsive Design

#### 5.3.1 Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

#### 5.3.2 Mobile Adaptations
- Collapsible sidebar (hamburger menu)
- Stacked layout
- Touch-friendly tap targets (min 44x44px)
- Swipe gestures (delete, favorite)
- Bottom navigation option
- Card view default on mobile

### 5.4 Accessibility

#### 5.4.1 WCAG 2.1 Level AA Compliance
- Color contrast ratios (4.5:1 for text)
- Keyboard navigation (Tab, Enter, Escape)
- Focus indicators
- Screen reader support (ARIA labels)
- Alt text for images/icons
- Semantic HTML
- Skip to content link

#### 5.4.2 Keyboard Shortcuts
- `Ctrl+K` / `Cmd+K`: Open search
- `Ctrl+N` / `Cmd+N`: New bookmark
- `Escape`: Close modals
- `Arrow keys`: Navigate lists
- `/`: Focus search

---

## 6. API Design

### 6.1 Authentication Endpoints

```
POST   /api/auth/register          # Register new user
POST   /api/auth/login             # Login user
POST   /api/auth/logout            # Logout user
POST   /api/auth/reset-password    # Request password reset
POST   /api/auth/verify-email      # Verify email token
```

### 6.2 Bookmark Endpoints

```
GET    /api/bookmarks              # List bookmarks (with filters, search, pagination)
POST   /api/bookmarks              # Create bookmark
GET    /api/bookmarks/:id          # Get single bookmark
PUT    /api/bookmarks/:id          # Update bookmark
DELETE /api/bookmarks/:id          # Delete bookmark
PATCH  /api/bookmarks/:id/favorite # Toggle favorite
POST   /api/bookmarks/bulk         # Bulk operations
POST   /api/bookmarks/import       # Import bookmarks
GET    /api/bookmarks/export       # Export bookmarks
```

### 6.3 Category Endpoints

```
GET    /api/categories             # List categories
POST   /api/categories             # Create category
PUT    /api/categories/:id         # Update category
DELETE /api/categories/:id         # Delete category
```

### 6.4 Tag Endpoints

```
GET    /api/tags                   # List tags
POST   /api/tags                   # Create tag
PUT    /api/tags/:id               # Update tag
DELETE /api/tags/:id               # Delete tag
POST   /api/tags/merge             # Merge tags
```

### 6.5 Search & Filter

```
GET    /api/search                 # Full-text search
GET    /api/bookmarks/filter       # Advanced filtering
```

### 6.6 Sharing

```
POST   /api/share/bookmark/:id     # Generate share link
GET    /public/bookmark/:shareId   # Public bookmark view
GET    /public/tag/:tagSlug        # Public tag view
```

### 6.7 Utilities

```
POST   /api/utils/fetch-metadata   # Fetch URL metadata
POST   /api/utils/fetch-favicon    # Fetch favicon
```

### 6.8 Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid URL format",
    "fields": {
      "url": "Must be a valid HTTP/HTTPS URL"
    }
  }
}
```

**Paginated Response:**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

## 7. Security Requirements

### 7.1 Authentication Security
- Password hashing with bcrypt (salt rounds: 10)
- JWT tokens with expiration (7 days)
- HTTP-only secure cookies
- CSRF protection
- Rate limiting on auth endpoints (5 attempts per 15 min)

### 7.2 Data Security
- SQL injection prevention (Prisma ORM)
- XSS prevention (sanitize inputs, escape outputs)
- Content Security Policy headers
- HTTPS only in production
- Environment variables for secrets

### 7.3 Authorization
- Row-level security (users see only their data)
- Validate userId on every request
- Prevent IDOR attacks
- API route protection with middleware

### 7.4 Input Validation
- Server-side validation (Zod schemas)
- URL validation and sanitization
- File upload restrictions (type, size)
- Rate limiting on API endpoints

---

## 8. Performance Requirements

### 8.1 Page Load
- Initial page load: < 2 seconds
- Time to Interactive: < 3 seconds
- Lighthouse score: > 90

### 8.2 API Response Times
- List bookmarks: < 200ms
- Create bookmark: < 500ms
- Search: < 300ms
- Large import: Background job

### 8.3 Optimization Strategies
- Database indexing (userId, categoryId, createdAt)
- Query optimization (include only needed relations)
- React Query caching
- Image optimization (Next.js Image)
- Code splitting and lazy loading
- Static generation where possible
- CDN for static assets

### 8.4 Scalability
- Support 10,000+ bookmarks per user
- Efficient pagination (cursor-based option)
- Database connection pooling
- Caching layer (Redis for future)

---

## 9. Error Handling

### 9.1 User-Facing Errors
- Clear, actionable error messages
- Toast notifications for operations
- Inline form validation errors
- Fallback UI for failed loads
- Retry mechanisms

### 9.2 System Errors
- Error logging (console, file, service)
- Error boundaries in React
- Graceful degradation
- 404 and 500 error pages

### 9.3 Network Errors
- Offline detection
- Retry logic for failed requests
- Optimistic updates with rollback
- Connection status indicator

---

## 10. Testing Requirements

### 10.1 Unit Tests
- Utility functions
- React components
- API route handlers
- Database queries

### 10.2 Integration Tests
- API endpoint flows
- Authentication flows
- CRUD operations
- Import/export

### 10.3 E2E Tests
- User registration and login
- Create, edit, delete bookmark
- Search and filter
- View mode switching
- Import/export flows

### 10.4 Test Coverage
- Target: > 80% code coverage
- Critical paths: 100% coverage

---

## 11. Deployment

### 11.1 Hosting Options
- **Recommended**: Vercel (Next.js optimized)
- **Alternative**: AWS, DigitalOcean, Railway

### 11.2 Database Hosting
- **Recommended**: Vercel Postgres, Supabase
- **Alternative**: AWS RDS, DigitalOcean Managed DB

### 11.3 Environment Variables
```env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=...
JWT_SECRET=...
```

### 11.4 CI/CD
- Automated testing on PR
- Automated deployment on merge
- Database migrations on deploy
- Environment-specific configs

---

## 12. Future Enhancements

### 12.1 Phase 2 Features
- Browser extension for quick bookmarking
- Mobile app (React Native)
- Collaborative collections (team sharing)
- AI-powered tag suggestions
- Duplicate detection
- Archive/unarchive bookmarks
- Bookmark notes/comments
- Full-text search in bookmark content
- Dark mode toggle

### 12.2 Phase 3 Features
- API for third-party integrations
- Zapier integration
- Backup and restore
- Activity logs
- Analytics dashboard
- Premium features (storage limits, advanced features)
- Social features (follow users, like bookmarks)

---

## 13. Success Metrics

### 13.1 User Metrics
- User registration rate
- Daily active users (DAU)
- Bookmarks created per user
- Search usage frequency
- Export/import usage

### 13.2 Technical Metrics
- API response times
- Error rates
- Page load times
- Database query performance
- Uptime percentage (target: 99.9%)

### 13.3 Business Metrics
- User retention (30-day, 90-day)
- Feature adoption rates
- User satisfaction (NPS score)

---

## 14. Development Timeline (Estimated)

### Phase 1: Foundation (Weeks 1-2)
- Project setup and configuration
- Database schema and Prisma setup
- Authentication system
- Basic UI layout and design system

### Phase 2: Core Features (Weeks 3-4)
- Bookmark CRUD operations
- Categories and tags
- Search and filtering
- View modes (table, cards)

### Phase 3: Advanced Features (Weeks 5-6)
- Import/export functionality
- Sharing features
- Folder tree view
- Bulk operations

### Phase 4: Polish & Testing (Week 7)
- UI/UX refinement
- Testing and bug fixes
- Performance optimization
- Documentation

### Phase 5: Deployment (Week 8)
- Production deployment
- Monitoring setup
- User feedback collection

---

## 15. Documentation

### 15.1 Developer Documentation
- README with setup instructions
- API documentation
- Database schema documentation
- Code comments and JSDoc
- Architecture diagrams

### 15.2 User Documentation
- User guide
- FAQ
- Video tutorials (optional)
- In-app tooltips and help

---

## 16. Maintenance & Support

### 16.1 Regular Maintenance
- Weekly dependency updates
- Monthly security audits
- Database backups (daily)
- Log rotation and cleanup

### 16.2 Support Channels
- Email support
- In-app feedback form
- GitHub issues (if open source)
- Community forum (future)

---

## Appendix A: Glossary

- **Bookmark**: A saved web link with metadata
- **Tag**: A label for categorizing bookmarks (many-to-many)
- **Category**: A folder/collection for bookmarks (one-to-many)
- **Favicon**: Website icon displayed next to URL
- **CRUD**: Create, Read, Update, Delete operations
- **JWT**: JSON Web Token for authentication
- **ORM**: Object-Relational Mapping (Prisma)

---

## Appendix B: References

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com)

---

**Document Version**: 1.0  
**Last Updated**: 2024-11-20  
**Author**: Development Team  
**Status**: Ready for Development
