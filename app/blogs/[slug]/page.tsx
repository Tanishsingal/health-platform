"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Calendar,
  User,
  ArrowLeft,
  Loader2
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"

interface Blog {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  author_id: string
  first_name: string
  last_name: string
  category: string
  tags: string[]
  featured_image: string | null
  status: 'draft' | 'published'
  published_at: string | null
  created_at: string
  updated_at: string
}

export default function SingleBlogPage() {
  const params = useParams()
  const slug = params.slug as string
  const [blog, setBlog] = useState<Blog | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (slug) {
      fetchBlog()
    }
  }, [slug])

  const fetchBlog = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/blogs/${slug}`)
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setBlog(result.data)
        } else {
          setError(result.error || 'Failed to fetch blog.')
        }
      } else {
        setError(`Failed to fetch blog: HTTP ${response.status}`)
      }
    } catch (err: any) {
      console.error('Failed to fetch blog:', err)
      setError('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-950">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
        <FileText className="w-16 h-16 text-destructive mx-auto mb-4" />
        <h3 className="text-xl font-semibold mb-2">Blog Not Found</h3>
        <p className="text-muted-foreground text-center mb-6">
          {error || "The blog post you are looking for does not exist or is not published."}
        </p>
        <Link href="/blogs">
          <Button>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blogs
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link href="/blogs">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Blogs
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          {blog.featured_image && (
            <div className="w-full h-80 bg-gray-200 dark:bg-gray-800 overflow-hidden rounded-t-lg">
              <img
                src={blog.featured_image}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary">{blog.category}</Badge>
            </div>
            <CardTitle className="text-4xl font-bold mb-2">{blog.title}</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              {blog.excerpt}
            </CardDescription>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4 pt-4 border-t">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span>{blog.first_name} {blog.last_name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {blog.published_at 
                    ? new Date(blog.published_at).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    : 'Not published'}
                </span>
              </div>
            </div>
            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {blog.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            {/* Render content with line breaks preserved */}
            <div className="text-base leading-relaxed whitespace-pre-wrap">
              {blog.content}
            </div>
          </CardContent>
        </Card>

        {/* Back to blogs link at bottom */}
        <div className="mt-8 text-center">
          <Link href="/blogs">
            <Button variant="outline" size="lg">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Blogs
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
} 