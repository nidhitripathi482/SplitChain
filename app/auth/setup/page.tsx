"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, User, ArrowRight, Loader2, Mail } from "lucide-react"

export default function AuthSetup() {
  const { authState, isLoading } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [isChecking, setIsChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [step, setStep] = useState(1) // 1: email, 2: username, 3: complete

  useEffect(() => {
    if (!isLoading && !authState.isAuthenticated) {
      router.push("/")
    }
  }, [authState.isAuthenticated, isLoading, router])

  const validateEmail = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return false
    }
    setStep(2)
    return true
  }

  const checkUsername = async () => {
    if (!username) return
    setIsChecking(true)

    // Simulate username availability check
    setTimeout(() => {
      setIsAvailable(!["admin", "test", "user", "splitchain"].includes(username.toLowerCase()))
      setIsChecking(false)
    }, 1000)
  }

  const createAccount = async () => {
    if (!authState.principal || !email || !username) return

    setIsCreating(true)

    try {
      const userData = {
        email,
        username,
        principal: authState.principal.toString(),
        balance: 0,
        splitTokens: 100, // Welcome bonus
        createdAt: new Date().toISOString(),
        walletConnected: false,
      }

      localStorage.setItem("splitchain_user", JSON.stringify(userData))

      // Simulate account creation
      setTimeout(() => {
        setStep(3)
        // Redirect to wallet setup after showing success
        setTimeout(() => {
          router.push("/wallet/setup")
        }, 2000)
      }, 2000)
    } catch (error) {
      console.error("Account creation failed:", error)
      setIsCreating(false)
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

  if (!authState.isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Redirecting to authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            {step === 1 ? <Mail className="w-8 h-8 text-white" /> : <User className="w-8 h-8 text-white" />}
          </div>
          <CardTitle className="text-2xl">
            {step === 1 && "Welcome to SplitChain"}
            {step === 2 && "Choose Your Username"}
            {step === 3 && "Account Created! 🎉"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Let's set up your account with your email address"}
            {step === 2 && "Create your unique username for SplitChain"}
            {step === 3 && "Your account is ready! Setting up your wallet next..."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Your Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-center"
                />
                <p className="text-xs text-gray-500">
                  We'll use this email for payment notifications and account recovery
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Your Internet Identity</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Network:</span>
                    <span>Internet Computer</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Principal ID:</span>
                    <span className="font-mono text-xs break-all">
                      {authState.principal?.toString().slice(0, 20)}...
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <span className="text-green-600 font-semibold">✓ Connected</span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600"
                onClick={validateEmail}
                disabled={!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
              >
                Continue with Email
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="username">Choose Username</Label>
                <div className="flex space-x-2">
                  <Input
                    id="username"
                    placeholder="Enter unique username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value)
                      setIsAvailable(null)
                    }}
                    className="flex-1"
                  />
                  <Button variant="outline" onClick={checkUsername} disabled={!username || isChecking}>
                    {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : "Check"}
                  </Button>
                </div>

                {isAvailable === true && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-700">Username is available!</AlertDescription>
                  </Alert>
                )}

                {isAvailable === false && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-700">
                      Username is already taken. Try another one.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Account Summary</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span>{email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Username:</span>
                    <span>{username || "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Welcome Bonus:</span>
                    <span className="text-purple-600 font-semibold">100 $SPLIT</span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600"
                onClick={createAccount}
                disabled={!isAvailable || isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </>
          )}

          {step === 3 && (
            <>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-700">Account Created Successfully!</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Welcome to SplitChain, {username}! We're setting up your wallet next...
                  </p>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">What's Next?</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Set up your ICP wallet for payments</li>
                  <li>Start creating payment sessions</li>
                  <li>Invite friends and split bills easily</li>
                  <li>Earn $SPLIT rewards for using the platform</li>
                </ol>
              </div>

              <div className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">Redirecting to wallet setup...</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
