"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  FileText,
  Calendar,
  User,
  Search,
  ArrowLeft
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([])
  const [filteredBlogs, setFilteredBlogs] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetchBlogs()
  }, [])

  useEffect(() => {
    filterBlogs()
  }, [blogs, searchQuery, selectedCategory])

  const fetchBlogs = async () => {
    try {
      const response = await fetch('/api/blogs')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setBlogs(result.data)
          setFilteredBlogs(result.data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch blogs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterBlogs = () => {
    let filtered = [...blogs]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(blog =>
        blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(blog => blog.category === selectedCategory)
    }

    setFilteredBlogs(filtered)
  }

  const categories = Array.from(new Set(blogs.map(blog => blog.category)))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">Healthcare Blogs</h1>
            <p className="text-lg text-muted-foreground mb-6">
              Stay updated with the latest healthcare news, government policies, and platform updates
            </p>
            
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search blogs..."
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Blog Grid */}
        {filteredBlogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => (
              <Link key={blog.id} href={`/blogs/${blog.slug}`}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  {blog.featured_image && (
                    <div className="w-full h-48 bg-gray-200 overflow-hidden rounded-t-lg">
                      <img
                        src={blog.featured_image}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{blog.category}</Badge>
                    </div>
                    <CardTitle className="line-clamp-2">{blog.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {blog.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{blog.first_name} {blog.last_name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(blog.published_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {blog.tags.slice(0, 3).map((tag: string) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No blogs found</h3>
            <p className="text-muted-foreground">
              {searchQuery || selectedCategory !== 'all'
                ? 'Try adjusting your search or filter'
                : 'No blogs have been published yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 