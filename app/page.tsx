"use client"

import { useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, Users, Store, ArrowRight, Shield, Zap, Globe, Loader2 } from "lucide-react"

export default function LandingPage() {
  const { authState, login, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && authState.isAuthenticated) {
      const userData = localStorage.getItem("splitchain_user")
      if (userData) {
        router.push("/dashboard")
      } else {
        router.push("/auth/setup")
      }
    }
  }, [authState.isAuthenticated, isLoading, router])

  const handleConnect = async () => {
    const success = await login()
    if (success) {
      // Navigation will be handled by useEffect
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (authState.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-yellow-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">SC</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-yellow-500 bg-clip-text text-transparent">
              SplitChain Pay
            </span>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            <Globe className="w-3 h-3 mr-1" />
            ICP Network
          </Badge>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-yellow-500 bg-clip-text text-transparent">
            Split Payments, Simplified
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The first decentralized payment splitting platform on Internet Computer. Pay friends, merchants, and manage
            group expenses with real crypto conversions.
          </p>

          <Button
            size="lg"
            className="bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600 text-white px-8 py-3 text-lg"
            onClick={handleConnect}
          >
            <Shield className="w-5 h-5 mr-2" />
            Connect with Internet Identity
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>

          <p className="text-sm text-gray-500 mt-4">Secure authentication powered by Internet Computer Protocol</p>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How SplitChain Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-2 hover:border-purple-200 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle>Pay Friends</CardTitle>
              <CardDescription>
                Split bills with friends using QR codes or usernames. Everyone pays in their preferred crypto.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-yellow-200 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Store className="w-6 h-6 text-yellow-600" />
              </div>
              <CardTitle>Pay Merchants</CardTitle>
              <CardDescription>
                Pay merchants directly with automatic crypto conversion to their preferred currency.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-green-200 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Wallet className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Get Reimbursed</CardTitle>
              <CardDescription>
                Create split sessions for expenses you've already paid and get reimbursed in crypto.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">Why Choose SplitChain?</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Zap className="w-5 h-5 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Real-time Conversions</h4>
                    <p className="text-gray-600">Live crypto-to-fiat conversions using DEX oracles</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Secure & Decentralized</h4>
                    <p className="text-gray-600">Built on Internet Computer with Internet Identity</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Wallet className="w-5 h-5 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Earn $SPLIT Rewards</h4>
                    <p className="text-gray-600">Get rewarded for every transaction and daily usage</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h4 className="text-xl font-bold mb-4">Platform Fees</h4>
              <div className="text-3xl font-bold text-purple-600 mb-2">2.5%</div>
              <p className="text-gray-600 mb-4">Low transaction fees with instant settlements</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Transaction Fee</span>
                  <span>2.5%</span>
                </div>
                <div className="flex justify-between">
                  <span>Network Fee</span>
                  <span>~$0.01</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>$SPLIT Rewards</span>
                  <span className="text-green-600">+5%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2024 SplitChain Pay. Built on Internet Computer Protocol.</p>
        </div>
      </footer>
    </div>
  )
}
