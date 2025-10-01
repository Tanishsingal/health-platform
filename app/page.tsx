"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Shield, Users, Calendar, FileText, Activity, ArrowRight, Newspaper } from "lucide-react"
import { useTranslations } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useEffect, useState } from "react"

export default function HomePage() {
  const t = useTranslations();
  const [blogs, setBlogs] = useState<any[]>([])
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(true)

  useEffect(() => {
    fetchBlogs()
  }, [])

  const fetchBlogs = async () => {
    try {
      const response = await fetch('/api/blogs')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Get only the 3 most recent published blogs
          setBlogs(result.data.slice(0, 3))
        }
      }
    } catch (error) {
      console.error('Failed to fetch blogs:', error)
    } finally {
      setIsLoadingBlogs(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-lg">
                <Heart className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{t('common.appName', 'HealthCare Portal')}</h1>
                <p className="text-xs text-muted-foreground">{t('common.tagline', 'Comprehensive Healthcare Management')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  {t('nav.login', 'Log in')}
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="sm">{t('nav.getStarted', 'Get Started')}</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <Badge variant="secondary" className="mb-6">
            {t('home.hero.badge', 'Trusted by Healthcare Professionals Nationwide')}
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">
            {t('home.hero.title', 'Modern Healthcare')}
            <span className="text-primary block">{t('home.hero.titleAccent', 'Management Platform')}</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('home.hero.description', 'Streamline patient care, manage appointments, and access medical records securely. Built for patients, doctors, and healthcare administrators.')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="gap-2">
                <Heart className="w-5 h-5" />
                {t('home.hero.startJourney', 'Start Your Journey')}
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline">{t('home.hero.accessPortal', 'Access Portal')}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-accent/20">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">{t('home.features.title', 'Complete Healthcare Ecosystem')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>{t('home.features.patient.title', 'Patient Portal')}</CardTitle>
                <CardDescription>
                  {t('home.features.patient.description', 'Book appointments, view medical history, access prescriptions, and communicate with healthcare providers.')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>{t('home.features.doctor.title', 'Doctor Dashboard')}</CardTitle>
                <CardDescription>
                  {t('home.features.doctor.description', 'Manage appointments, update patient records, prescribe medications, and track treatment progress.')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>{t('home.features.pharmacy.title', 'Pharmacy Management')}</CardTitle>
                <CardDescription>
                  {t('home.features.pharmacy.description', 'Track prescriptions, manage inventory, process refills, and maintain medication records.')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle>{t('home.features.appointments.title', 'Smart Scheduling')}</CardTitle>
                <CardDescription>
                  {t('home.features.appointments.description', 'Automated appointment booking with conflict detection and reminder notifications.')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-red-600" />
                </div>
                <CardTitle>{t('home.features.security.title', 'Secure & Compliant')}</CardTitle>
                <CardDescription>
                  {t('home.features.security.description', 'Enterprise-grade security with role-based access control and encrypted data storage.')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-teal-600" />
                </div>
                <CardTitle>{t('home.features.lab.title', 'Laboratory Integration')}</CardTitle>
                <CardDescription>
                  {t('home.features.lab.description', 'Seamless lab test ordering, result tracking, and integration with patient records.')}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold mb-2">Latest Healthcare News & Updates</h2>
              <p className="text-muted-foreground">
                Stay informed with the latest healthcare policies, tips, and platform updates
              </p>
            </div>
            <Link href="/blogs">
              <Button variant="outline" className="gap-2">
                View All Blogs
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {isLoadingBlogs ? (
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="w-full h-48 bg-gray-200"></div>
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : blogs.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6">
              {blogs.map((blog) => (
                <Link key={blog.id} href={`/blogs/${blog.slug}`}>
                  <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer overflow-hidden group">
                    {blog.featured_image ? (
                      <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-accent overflow-hidden">
                        <img
                          src={blog.featured_image}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-gradient-to-br from-primary/20 to-accent flex items-center justify-center">
                        <Newspaper className="w-16 h-16 text-primary/40" />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="text-xs">
                          {blog.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(blog.published_at).toLocaleDateString()}
                        </span>
                      </div>
                      <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                        {blog.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-3">
                        {blog.excerpt}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        <span>
                          {blog.first_name} {blog.last_name}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Newspaper className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No blogs yet</h3>
              <p className="text-muted-foreground">
                Check back soon for the latest healthcare news and updates!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-accent/20">
        <div className="container mx-auto text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('home.cta.title', 'Ready to Transform Healthcare Delivery?')}
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            {t('home.cta.description', 'Join thousands of healthcare professionals already using our platform to provide better care.')}
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="gap-2">
              {t('home.cta.button', 'Get Started Today')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>© 2024 {t('common.appName', 'HealthCare Portal')}. {t('home.footer.rights', 'All rights reserved.')}</p>
        </div>
      </footer>
    </div>
  )
} 