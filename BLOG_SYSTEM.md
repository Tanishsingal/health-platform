# 📝 Blog Management System

## Overview
A complete blog management system for the healthcare platform, allowing administrators to create, update, and delete blog posts about government policies, health news, platform updates, and more. Public users can browse and read published blogs.

## Features Implemented

### 1. Admin Blog Management (`/admin/blogs`)
- **Create Blogs**: Admin can create new blog posts with rich content
- **Edit Blogs**: Update existing blog posts
- **Delete Blogs**: Remove blog posts
- **Draft/Publish**: Save as draft or publish immediately
- **Auto-slug Generation**: Automatically generates URL-friendly slugs from titles
- **Category Management**: Organize blogs by categories
- **Tag System**: Add tags for better organization and discoverability
- **Featured Images**: Add featured images to blog posts
- **Author Attribution**: Automatically tracks blog author

### 2. Public Blog Page (`/blogs`)
- **Browse Blogs**: View all published blogs in a card grid layout
- **Search Functionality**: Search blogs by title, excerpt, or content
- **Category Filter**: Filter blogs by category
- **Responsive Design**: Mobile-friendly layout
- **Blog Cards**: Featured images, excerpts, author info, publish date
- **Tag Display**: Show tags on blog cards

### 3. Individual Blog View (`/blogs/[slug]`)
- URL-friendly slugs for SEO
- Full blog content display
- Author and publish date information

## Database Schema

### `blogs` Table
```sql
CREATE TABLE blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  tags TEXT[],
  featured_image TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Indexes
- `idx_blogs_status` - Status filtering
- `idx_blogs_published_at` - Published date sorting
- `idx_blogs_author_id` - Author filtering
- `idx_blogs_category` - Category filtering
- `idx_blogs_slug` - SEO-friendly URLs

## API Endpoints

### GET /api/blogs
**Description**: Fetch all blogs (published for public, all for admin)

**Authentication**: Optional (admin sees drafts too)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "New Healthcare Policy 2025",
      "slug": "new-healthcare-policy-2025",
      "excerpt": "Government announces new healthcare reforms...",
      "content": "Full blog content...",
      "author_id": "uuid",
      "first_name": "Admin",
      "last_name": "User",
      "category": "Government Policy",
      "tags": ["policy", "healthcare", "2025"],
      "featured_image": "https://example.com/image.jpg",
      "status": "published",
      "published_at": "2025-10-01T10:00:00Z",
      "created_at": "2025-10-01T09:00:00Z",
      "updated_at": "2025-10-01T09:00:00Z"
    }
  ]
}
```

### POST /api/blogs
**Description**: Create a new blog post (admin only)

**Authentication**: Required (Admin/Super Admin)

**Request Body**:
```json
{
  "title": "Blog Title",
  "slug": "blog-title",
  "excerpt": "Short summary",
  "content": "Full content",
  "category": "Health News",
  "tags": ["tag1", "tag2"],
  "featured_image": "https://example.com/image.jpg",
  "status": "published"
}
```

**Response**:
```json
{
  "success": true,
  "data": { ...blog },
  "message": "Blog created successfully"
}
```

### GET /api/blogs/[id]
**Description**: Fetch a single blog by ID

**Response**:
```json
{
  "success": true,
  "data": { ...blog }
}
```

### PUT /api/blogs/[id]
**Description**: Update a blog post (admin only)

**Authentication**: Required (Admin/Super Admin)

**Request Body**: Same as POST (all fields optional)

### DELETE /api/blogs/[id]
**Description**: Delete a blog post (admin only)

**Authentication**: Required (Admin/Super Admin)

**Response**:
```json
{
  "success": true,
  "message": "Blog deleted successfully"
}
```

## Blog Categories

Predefined categories:
- **Government Policy** - Healthcare policies and regulations
- **Health News** - Latest health news and updates
- **Platform Updates** - Platform features and improvements
- **Medical Research** - Research findings and studies
- **Healthcare Tips** - Health tips and advice
- **Announcements** - Important announcements

## Features

### Auto-Slug Generation
- Automatically converts title to URL-friendly slug
- Removes special characters
- Converts to lowercase
- Replaces spaces with hyphens
- Can be manually edited if needed

Example:
- Title: "New Healthcare Policy 2025!"
- Slug: "new-healthcare-policy-2025"

### Draft vs. Published
- **Draft**: Not visible to public, visible to admin
- **Published**: Visible to everyone, sets `published_at` timestamp

### Search & Filter
- **Search**: Full-text search across title, excerpt, and content
- **Category Filter**: Quick filter by category
- **Real-time Results**: Instant filtering without page reload

## Files Created

### Database
- `scripts/create-blogs-table.sql` - Database schema
- `scripts/run-create-blogs.js` - Migration script

### API Routes
- `app/api/blogs/route.ts` - List & create blogs
- `app/api/blogs/[id]/route.ts` - Get, update, delete individual blog

### Admin Pages
- `app/admin/blogs/page.tsx` - Blog management interface

### Public Pages
- `app/blogs/page.tsx` - Public blog listing page

## UI Components

### Admin Blog Management
```typescript
// Features:
- Create/Edit modal with form
- Blog list with edit/delete actions
- Status badges (draft/published)
- Category and tag display
- Author attribution
- Publish date display
```

### Public Blog Page
```typescript
// Features:
- Card grid layout
- Featured images
- Search bar
- Category filter buttons
- Blog excerpts
- Author and date info
- Tag badges
```

## Security

### Access Control
- ✅ Only admins can create, update, delete blogs
- ✅ Public can only view published blogs
- ✅ Drafts hidden from public
- ✅ Token-based authentication
- ✅ Role verification for all admin operations

### Data Validation
- ✅ Required fields validation
- ✅ Unique slug enforcement
- ✅ Input sanitization
- ✅ Error handling

## Usage Guide

### For Administrators

#### Creating a Blog
1. Navigate to `/admin/blogs`
2. Click "New Blog Post"
3. Fill in the form:
   - **Title**: Main blog title (auto-generates slug)
   - **Slug**: URL-friendly identifier (editable)
   - **Category**: Select from predefined categories
   - **Excerpt**: Short summary (200-300 characters)
   - **Content**: Full blog content (supports markdown)
   - **Featured Image**: URL to image
   - **Tags**: Comma-separated tags
   - **Status**: Draft or Published
4. Click "Create Blog Post"

#### Editing a Blog
1. Click the edit icon next to any blog
2. Modify fields as needed
3. Click "Update Blog Post"

#### Deleting a Blog
1. Click the delete icon next to any blog
2. Confirm deletion
3. Blog is permanently removed

### For Public Users

#### Browsing Blogs
1. Visit `/blogs`
2. Browse blog cards in grid layout
3. Use search to find specific blogs
4. Filter by category
5. Click on any blog card to read full article

## Example Blog Content

### Government Policy Example
```markdown
**Title**: New Healthcare Subsidy Program 2025

**Category**: Government Policy

**Excerpt**: The government has announced a new healthcare subsidy program providing up to 80% coverage for low-income families.

**Content**:
The Ministry of Health announced today a comprehensive healthcare subsidy program aimed at making healthcare more accessible to low-income families across the nation.

## Key Features:
- 80% coverage for families earning below poverty line
- Includes primary care, medications, and emergency services
- Digital enrollment through our platform
- Instant eligibility verification

## Eligibility:
- Annual income below $30,000
- Valid national ID
- Not covered by other insurance

**Tags**: policy, subsidy, healthcare, 2025
```

### Health Tips Example
```markdown
**Title**: 10 Tips for a Healthy Heart

**Category**: Healthcare Tips

**Excerpt**: Simple lifestyle changes that can significantly improve your cardiovascular health.

**Content**:
Maintaining a healthy heart doesn't require drastic measures. Here are 10 simple tips you can start implementing today...

[Full content with tips]

**Tags**: health tips, cardiology, prevention
```

## Benefits

### For Healthcare Platform:
- ✅ Keeps patients informed about policies
- ✅ Builds trust through transparency
- ✅ Improves SEO with fresh content
- ✅ Establishes platform as health authority
- ✅ Reduces support queries through information

### For Administrators:
- ✅ Easy content management
- ✅ No technical knowledge required
- ✅ Draft system for review
- ✅ Quick publishing workflow
- ✅ Full editorial control

### For Patients:
- ✅ Stay updated on healthcare news
- ✅ Understand government policies
- ✅ Access health tips and advice
- ✅ Easy search and filtering
- ✅ Mobile-friendly reading experience

## Future Enhancements

### 1. Rich Text Editor
- WYSIWYG editor instead of plain textarea
- Image upload directly in editor
- Markdown preview
- Code syntax highlighting

### 2. Comments System
- Allow users to comment on blogs
- Admin moderation
- Reply functionality
- Email notifications

### 3. Social Sharing
- Share buttons for social media
- Twitter, Facebook, LinkedIn integration
- WhatsApp sharing for mobile

### 4. Related Posts
- Show related blogs at bottom
- Based on category and tags
- Automatic recommendations

### 5. Analytics
- View count tracking
- Reading time estimation
- Popular posts tracking
- Engagement metrics

### 6. SEO Enhancements
- Meta descriptions
- Open Graph tags
- Twitter cards
- Sitemap generation

### 7. Newsletter Integration
- Subscribe to blog updates
- Email notifications for new posts
- Weekly digest emails

### 8. Multi-language Support
- Translate blogs to regional languages
- Language switcher
- i18n integration

## Testing Checklist

- [x] Admin can create blogs
- [x] Admin can edit blogs
- [x] Admin can delete blogs
- [x] Auto-slug generation works
- [x] Unique slug enforcement
- [x] Draft vs Published status
- [x] Public sees only published blogs
- [x] Admin sees all blogs
- [x] Search functionality works
- [x] Category filter works
- [x] Tags display correctly
- [x] Featured images display
- [x] Author attribution correct
- [x] Publish date displays
- [x] Responsive design
- [x] Empty states show
- [x] Error handling works

---

**Status**: ✅ Fully Implemented and Ready

**Last Updated**: October 1, 2025 