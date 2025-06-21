"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useState, useEffect, Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Users, DollarSign, Clock, CheckCircle, Share2, QrCode, ArrowLeft } from "lucide-react"

interface SessionData {
  id: string
  title: string
  description: string
  totalAmount: number
  currency: string
  participants: Array<{
    id: string
    name: string
    amount: number
    paid: boolean
  }>
  createdBy: string
  createdAt: string
  status: "active" | "completed" | "cancelled"
}

function JoinSessionContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()

  const [sessionCode, setSessionCode] = useState("")
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(false)
  const [joining, setJoining] = useState(false)
  const [userAmount, setUserAmount] = useState(0)
  const [step, setStep] = useState(1) // 1: enter code, 2: view session, 3: join

  useEffect(() => {
    const code = searchParams?.get("code")
    if (code) {
      setSessionCode(code)
      loadSession(code)
    }
  }, [searchParams])

  const loadSession = async (code?: string) => {
    const codeToLoad = code || sessionCode
    if (!codeToLoad) return

    setLoading(true)
    try {
      // Simulate loading session data
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const mockSession: SessionData = {
        id: codeToLoad,
        title: `Pizza Night 🍕`,
        description: "Group dinner at Tony's Pizza Palace",
        totalAmount: 120.5,
        currency: "ICP",
        participants: [
          { id: "1", name: "Alice Johnson", amount: 30.12, paid: true },
          { id: "2", name: "Bob Smith", amount: 30.13, paid: false },
          { id: "3", name: "Charlie Brown", amount: 30.12, paid: false },
          { id: "4", name: "Diana Prince", amount: 30.13, paid: true },
        ],
        createdBy: "Alice Johnson",
        createdAt: new Date().toISOString(),
        status: "active",
      }

      setSession(mockSession)
      setUserAmount(mockSession.totalAmount / (mockSession.participants.length + 1))
      setStep(2)
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to load session",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const joinSession = async () => {
    setJoining(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      toast({
        title: "🎉 Joined Successfully!",
        description: "You've been added to the split session",
      })

      setStep(3)
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "Failed to join session",
        variant: "destructive",
      })
    } finally {
      setJoining(false)
    }
  }

  const shareSession = async () => {
    try {
      const shareUrl = `${window.location.origin}/join?code=${session?.id}`
      await navigator.share({
        title: session?.title,
        text: `Join my split session: ${session?.description}`,
        url: shareUrl,
      })
    } catch (error) {
      const shareUrl = `${window.location.origin}/join?code=${session?.id}`
      navigator.clipboard.writeText(shareUrl)
      toast({
        title: "🔗 Link Copied!",
        description: "Session link copied to clipboard",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Floating Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Join Session
            </h1>
          </div>
          {session && (
            <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              {session.status.toUpperCase()}
            </Badge>
          )}
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Step 1: Enter Session Code */}
          {step === 1 && (
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">Join Payment Session</CardTitle>
                <CardDescription className="text-lg">Enter the session code to join</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="sessionCode" className="text-base font-medium">
                    Session Code
                  </Label>
                  <Input
                    id="sessionCode"
                    placeholder="SPLIT-2024-XXX"
                    value={sessionCode}
                    onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                    className="text-center font-mono text-lg py-6"
                  />
                </div>

                <Button
                  onClick={() => loadSession()}
                  disabled={!sessionCode || loading}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-lg py-6 rounded-xl"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Loading Session...
                    </div>
                  ) : (
                    <>
                      <Users className="w-5 h-5 mr-2" />
                      Find Session
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Don't have a session code?</p>
                  <Button variant="outline" onClick={() => router.push("/create")}>
                    Create New Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: View Session Details */}
          {step === 2 && session && (
            <div className="space-y-6">
              <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Clock className="w-3 h-3 mr-1" />
                      {session.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={shareSession}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-800">{session.title}</CardTitle>
                  <CardDescription className="text-lg">{session.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Total Amount */}
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-gray-800 mb-1">
                      {session.totalAmount.toFixed(4)} {session.currency}
                    </div>
                    <div className="text-gray-600">Total Amount</div>
                  </div>

                  <Separator className="my-6" />

                  {/* Your Share */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 mb-6">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-1">Your Share</div>
                      <div className="text-2xl font-bold text-purple-600">
                        {userAmount.toFixed(4)} {session.currency}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">≈ ${(userAmount * 12).toFixed(2)} USD</div>
                    </div>
                  </div>

                  {/* Participants */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      Current Participants ({session.participants.length})
                    </h3>
                    <div className="space-y-2">
                      {session.participants.map((participant) => (
                        <div
                          key={participant.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center">
                            <Avatar className="w-8 h-8 mr-3">
                              <AvatarFallback className="text-xs bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                                {participant.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{participant.name}</span>
                            {participant.paid && <CheckCircle className="w-4 h-4 text-green-500 ml-2" />}
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">
                              {participant.amount.toFixed(4)} {session.currency}
                            </div>
                            <div className={`text-xs ${participant.paid ? "text-green-600" : "text-orange-600"}`}>
                              {participant.paid ? "Paid" : "Pending"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Join Button */}
                  <Button
                    onClick={joinSession}
                    disabled={joining}
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-6 rounded-xl transition-all duration-200 transform hover:scale-105"
                  >
                    {joining ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Joining Session...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Join & Pay {userAmount.toFixed(4)} {session.currency}
                      </div>
                    )}
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-3">
                    By joining, you agree to pay your share of {userAmount.toFixed(4)} {session.currency}
                  </p>
                </CardContent>
              </Card>

              {/* Session Info */}
              <Card className="border-0 shadow-lg bg-white/60 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="text-center text-sm text-gray-600">
                    <p>
                      Created by <span className="font-semibold">{session.createdBy}</span>
                    </p>
                    <p>
                      Session ID: <span className="font-mono">{session.id}</span>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && session && (
            <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
              <CardHeader className="text-center">
                <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-3xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Successfully Joined! 🎉
                </CardTitle>
                <CardDescription className="text-lg">You're now part of this payment session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                  <h4 className="font-bold text-lg mb-4 text-center text-green-700">What's Next?</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      You've been added to "{session.title}"
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      Your share: {userAmount.toFixed(4)} {session.currency}
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      Payment will be processed automatically
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                      You'll receive confirmation via email
                    </li>
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" onClick={() => router.push("/dashboard")}>
                    Go to Dashboard
                  </Button>
                  <Button onClick={shareSession} className="bg-gradient-to-r from-purple-600 to-blue-600">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default function JoinSession() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      }
    >
      <JoinSessionContent />
    </Suspense>
  )
}
