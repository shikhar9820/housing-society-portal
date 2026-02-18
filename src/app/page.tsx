import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Building2,
  FileText,
  Megaphone,
  Users,
  LogIn,
  UserPlus,
  Shield,
  BarChart3,
  Vote,
} from 'lucide-react'

export default async function Home() {
  const session = await getServerSession(authOptions)

  // If logged in, redirect to dashboard
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold">Angel Jupiter Society</h1>
              <p className="text-xs text-muted-foreground">Transparency Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="outline">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </Link>
            <Link href="/register">
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Register
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Welcome to Angel Jupiter
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          A transparency-focused portal for our housing society. Access announcements,
          view open tenders, and stay connected with your community.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/public/announcements">
            <Button size="lg" variant="outline">
              <Megaphone className="mr-2 h-5 w-5" />
              View Announcements
            </Button>
          </Link>
          <Link href="/public/tenders">
            <Button size="lg">
              <FileText className="mr-2 h-5 w-5" />
              Open Tenders
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-center mb-8">What We Offer</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-2">
                <Megaphone className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Announcements</CardTitle>
              <CardDescription>
                Stay updated with society notices, events, and important updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/public/announcements">
                <Button variant="link" className="px-0">View Announcements &rarr;</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-2">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Open Tenders</CardTitle>
              <CardDescription>
                View active tenders and submit bids for society contracts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/public/tenders">
                <Button variant="link" className="px-0">View Tenders &rarr;</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-2">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Financial Transparency</CardTitle>
              <CardDescription>
                View society expenses, budgets, and financial reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Resident login required</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center mb-2">
                <Vote className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Voting & Polls</CardTitle>
              <CardDescription>
                Participate in society elections and polls
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Resident login required</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center mb-2">
                <Shield className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Document Repository</CardTitle>
              <CardDescription>
                Access meeting minutes, audit reports, and society documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Resident login required</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-teal-100 flex items-center justify-center mb-2">
                <Users className="h-6 w-6 text-teal-600" />
              </div>
              <CardTitle>Resident Directory</CardTitle>
              <CardDescription>
                Connect with fellow residents and find contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Resident login required</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-blue-600 text-white py-12 mt-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4 text-center">
            <div>
              <div className="text-4xl font-bold">600+</div>
              <div className="text-blue-200">Flats</div>
            </div>
            <div>
              <div className="text-4xl font-bold">6</div>
              <div className="text-blue-200">Blocks</div>
            </div>
            <div>
              <div className="text-4xl font-bold">2000+</div>
              <div className="text-blue-200">Residents</div>
            </div>
            <div>
              <div className="text-4xl font-bold">24/7</div>
              <div className="text-blue-200">Security</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Are you a resident?</h2>
        <p className="text-muted-foreground mb-6">
          Register to access all features including voting, documents, and financial reports.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/login">
            <Button variant="outline" size="lg">
              <LogIn className="mr-2 h-4 w-4" />
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg">
              <UserPlus className="mr-2 h-4 w-4" />
              Register Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Building2 className="h-6 w-6" />
            <span className="font-bold">Angel Jupiter Housing Society</span>
          </div>
          <p className="text-gray-400 text-sm">
            Committed to transparency and community living
          </p>
          <div className="mt-4 flex justify-center gap-6 text-sm text-gray-400">
            <Link href="/public/announcements" className="hover:text-white">Announcements</Link>
            <Link href="/public/tenders" className="hover:text-white">Tenders</Link>
            <Link href="/login" className="hover:text-white">Resident Login</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
