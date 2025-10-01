import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail, ArrowLeft } from "lucide-react"

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/20 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        <Card className="border-2">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-lg mx-auto mb-4">
              <Mail className="w-6 h-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>We've sent you a verification link to complete your registration</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Please check your email and click the verification link to activate your healthcare portal account. This
              helps us ensure the security of your medical information.
            </p>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Didn't receive the email? Check your spam folder or</p>
              <Link href="/auth/register">
                <Button variant="outline" size="sm">
                  Try Again
                </Button>
              </Link>
            </div>

            <div className="pt-4 border-t">
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
