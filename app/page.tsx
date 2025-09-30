"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Shield, Users, Calendar, FileText, Activity } from "lucide-react"
import { useTranslations } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default function HomePage() {
  const t = useTranslations();

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

      {/* CTA Section */}
      <section className="py-20 px-4">
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