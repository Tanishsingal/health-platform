"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Loader2,
  ArrowLeft,
  Eye,
  EyeOff
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CreateEditBlogModal } from "@/components/admin/CreateEditBlogModal"

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBlog, setEditingBlog] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/blogs')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setBlogs(result.data)
        }
      } else {
        router.push('/auth/login')
      }
    } catch (error) {
      console.error('Failed to fetch blogs:', error)
      router.push('/auth/login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateEditSuccess = () => {
    setShowModal(false)
    setEditingBlog(null)
    fetchBlogs()
  }

  const handleEdit = (blog: any) => {
    setEditingBlog(blog)
    setShowModal(true)
  }

  const handleDelete = async (blogId: string) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return

    try {
      const response = await fetch(`/api/blogs/${blogId}`, {
        method: 'DELETE',
      })
      const result = await response.json()
      if (result.success) {
        alert('Blog deleted successfully!')
        fetchBlogs()
      } else {
        alert(result.error || 'Failed to delete blog.')
      }
    } catch (error) {
      console.error('Delete blog failed:', error)
      alert('Failed to delete blog. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                <h1 className="text-xl font-bold text-foreground">Blog Management</h1>
              </div>
            </div>
            <Button 
              onClick={() => { 
                setEditingBlog(null) 
                setShowModal(true)
              }} 
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Blog Post
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>All Blog Posts</CardTitle>
            <CardDescription>Manage all blog content, including drafts and published posts.</CardDescription>
          </CardHeader>
          <CardContent>
            {blogs.length > 0 ? (
              <div className="space-y-4">
                {blogs.map((blog) => (
                  <div
                    key={blog.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {blog.featured_image && (
                        <img
                          src={blog.featured_image}
                          alt={blog.title}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-lg">{blog.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <span>By {blog.first_name} {blog.last_name}</span>
                          <span>•</span>
                          <Badge variant="secondary" className="text-xs">{blog.category}</Badge>
                          <span>•</span>
                          <span>{new Date(blog.created_at).toLocaleDateString()}</span>
                        </div>
                        {blog.tags && blog.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {blog.tags.map((tag: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={blog.status === 'published' ? 'default' : 'secondary'}
                        className="whitespace-nowrap"
                      >
                        {blog.status === 'published' ? (
                          <>
                            <Eye className="w-3 h-3 mr-1" /> Published
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-3 h-3 mr-1" /> Draft
                          </>
                        )}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleEdit(blog)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleDelete(blog.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No blog posts yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first blog post to share news and updates.
                </p>
                <Button onClick={() => setShowModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Blog Post
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Blog Creation/Edit Modal */}
      <CreateEditBlogModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setEditingBlog(null)
        }}
        onSuccess={handleCreateEditSuccess}
        blog={editingBlog}
      />
    </div>
  )
} 