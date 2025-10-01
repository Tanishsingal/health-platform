"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Loader2, Save, BookOpen } from "lucide-react"

interface Blog {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  author_id: string
  category: string
  tags: string[]
  featured_image: string | null
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  updated_at: string
}

interface CreateEditBlogModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  blog?: Blog | null
}

const blogCategories = [
  "Government Policy",
  "Health News",
  "Platform Updates",
  "Medical Research",
  "Healthcare Tips",
  "Announcements"
]

export function CreateEditBlogModal({ isOpen, onClose, onSuccess, blog }: CreateEditBlogModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: '',
    tags: '',
    featured_image: '',
    status: 'published' as 'draft' | 'published' // Default to published
  })
  const [slugError, setSlugError] = useState<string | null>(null)

  useEffect(() => {
    if (blog) {
      setFormData({
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        content: blog.content,
        category: blog.category,
        tags: blog.tags ? blog.tags.join(', ') : '',
        featured_image: blog.featured_image || '',
        status: blog.status
      })
    } else {
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        category: '',
        tags: '',
        featured_image: '',
        status: 'published'
      })
    }
    setSlugError(null)
  }, [blog, isOpen])

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))

    if (id === 'title' && !blog) {
      setFormData(prev => ({ ...prev, slug: generateSlug(value) }))
    }
    if (id === 'slug') {
      setSlugError(null)
    }
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSlugError(null)

    const payload = {
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      featured_image: formData.featured_image || null
    }

    const url = blog ? `/api/blogs/${blog.id}` : '/api/blogs'
    const method = blog ? 'PUT' : 'POST'

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const result = await response.json()

      if (result.success) {
        alert(`Blog ${blog ? 'updated' : 'created'} successfully!`)
        onSuccess()
      } else {
        if (result.error === 'Slug already exists') {
          setSlugError('This slug is already in use. Please choose a different one.')
        } else {
          alert(result.error || `Failed to ${blog ? 'update' : 'create'} blog.`)
        }
      }
    } catch (error) {
      console.error(`Blog ${blog ? 'update' : 'create'} failed:`, error)
      alert(`Failed to ${blog ? 'update' : 'create'} blog. Please try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto my-8">
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-primary" />
              {blog ? 'Edit Blog Post' : 'New Blog Post'}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {blog ? `Editing: ${blog.title}` : 'Create a new blog post for your audience.'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter blog title"
              required
              className="mt-1"
            />
          </div>

          {/* Slug */}
          <div>
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="auto-generated-slug"
              required
              className="mt-1"
            />
            {slugError && <p className="text-destructive text-sm mt-1">{slugError}</p>}
            <p className="text-xs text-muted-foreground mt-1">
              URL-friendly version of the title. Must be unique.
            </p>
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => handleSelectChange('category', value)}
              required
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {blogCategories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Excerpt */}
          <div>
            <Label htmlFor="excerpt">Excerpt *</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={handleChange}
              placeholder="A short summary of the blog post (2-3 sentences)"
              rows={3}
              required
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              This will be shown on the blog listing page.
            </p>
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={handleChange}
              placeholder="Write your blog content here"
              rows={10}
              required
              className="mt-1"
            />
          </div>

          {/* Featured Image */}
          <div>
            <Label htmlFor="featured_image">Featured Image URL</Label>
            <Input
              id="featured_image"
              value={formData.featured_image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              URL of an image to display prominently with the blog post.
            </p>
          </div>

          {/* Tags */}
          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="e.g., healthcare, policy, news"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Add keywords to help users find your blog.
            </p>
          </div>

          {/* Status */}
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <Label htmlFor="status" className="text-base font-semibold">Publication Status *</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleSelectChange('status', value)}
            >
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="published">
                  <div className="flex items-center gap-2">
                    <span>✅ Published</span>
                  </div>
                </SelectItem>
                <SelectItem value="draft">
                  <div className="flex items-center gap-2">
                    <span>📝 Draft</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <div className="mt-2 text-sm">
              {formData.status === 'published' ? (
                <p className="text-green-700 dark:text-green-400">
                  ✅ This blog will be <strong>visible to everyone</strong> on the public blogs page and landing page.
                </p>
              ) : (
                <p className="text-orange-700 dark:text-orange-400">
                  📝 This blog will be saved as a <strong>draft</strong> and only visible to admins. You can publish it later.
                </p>
              )}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {blog ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {blog ? 'Update Blog Post' : 'Create Blog Post'}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
} 