"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Copy, QrCode, CheckCircle, Clock, DollarSign, Users, Share2, Wallet, Zap, Gift } from "lucide-react"

interface SessionParticipant {
  email: string
  name: string
  amount: number
  paid: boolean
  paymentMethod?: string
  joinedAt: string
}

interface PaymentSession {
  id: string
  name: string
  description: string
  totalAmount: number
  currency: string
  creatorEmail: string
  creatorName: string
  participants: SessionParticipant[]
  createdAt: string
  expiresAt: string
  status: "active" | "completed" | "expired"
  qrCode: string
}

export default function SessionPage() {
  const [activeTab, setActiveTab] = useState("join")
  const [currentSession, setCurrentSession] = useState<PaymentSession | null>(null)
  const [joinEmail, setJoinEmail] = useState("")
  const [joinName, setJoinName] = useState("")
  const [sessionCode, setSessionCode] = useState("")
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("ICP")
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)

  // Mock session data
  const mockSession: PaymentSession = {
    id: "SPLIT-2024-001",
    name: "Pizza Night 🍕",
    description: "Group dinner at Tony's Pizza Palace",
    totalAmount: 120.5,
    currency: "USD",
    creatorEmail: "alice@example.com",
    creatorName: "Alice Johnson",
    participants: [
      {
        email: "bob@example.com",
        name: "Bob Smith",
        amount: 30.12,
        paid: true,
        paymentMethod: "ICP",
        joinedAt: "2024-01-15T19:30:00Z",
      },
      {
        email: "charlie@example.com",
        name: "Charlie Brown",
        amount: 30.12,
        paid: false,
        joinedAt: "2024-01-15T19:32:00Z",
      },
      {
        email: "diana@example.com",
        name: "Diana Prince",
        amount: 30.13,
        paid: true,
        paymentMethod: "ckBTC",
        joinedAt: "2024-01-15T19:35:00Z",
      },
    ],
    createdAt: "2024-01-15T19:00:00Z",
    expiresAt: "2024-01-16T19:00:00Z",
    status: "active",
    qrCode: "SPLIT-2024-001",
  }

  useEffect(() => {
    // Check if there's a session code in URL params
    const urlParams = new URLSearchParams(window.location.search)
    const code = urlParams.get("code")
    if (code) {
      setSessionCode(code)
      setCurrentSession(mockSession)
      setActiveTab("session")
    }
  }, [])

  const joinSession = () => {
    if (!joinEmail || !joinName || !sessionCode) return

    // Simulate joining session
    setCurrentSession(mockSession)
    setActiveTab("session")

    // Update URL without page reload
    window.history.pushState({}, "", `/session?code=${sessionCode}`)
  }

  const processPayment = async () => {
    setIsProcessingPayment(true)

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Update participant status
    if (currentSession) {
      const updatedParticipants = currentSession.participants.map((p) =>
        p.email === joinEmail ? { ...p, paid: true, paymentMethod: selectedPaymentMethod } : p,
      )
      setCurrentSession({
        ...currentSession,
        participants: updatedParticipants,
      })
    }

    setIsProcessingPayment(false)
  }

  const copySessionLink = () => {
    const link = `${window.location.origin}/session?code=${currentSession?.id}`
    navigator.clipboard.writeText(link)
  }

  const calculateProgress = () => {
    if (!currentSession) return 0
    const paidCount = currentSession.participants.filter((p) => p.paid).length + 1 // +1 for creator
    const totalCount = currentSession.participants.length + 1
    return (paidCount / totalCount) * 100
  }

  const getMyShare = () => {
    if (!currentSession) return 0
    const participant = currentSession.participants.find((p) => p.email === joinEmail)
    return participant?.amount || currentSession.totalAmount / (currentSession.participants.length + 1)
  }

  const isMyPaymentPending = () => {
    if (!currentSession || !joinEmail) return false
    const participant = currentSession.participants.find((p) => p.email === joinEmail)
    return participant && !participant.paid
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => (window.location.href = "/dashboard")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-yellow-500 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">SplitChain Session</span>
            </div>
          </div>
          {currentSession && (
            <Badge className="bg-gradient-to-r from-purple-600 to-yellow-500 text-white">
              {currentSession.status.toUpperCase()}
            </Badge>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="join">Join Session</TabsTrigger>
            <TabsTrigger value="session" disabled={!currentSession}>
              Live Session
            </TabsTrigger>
          </TabsList>

          <TabsContent value="join" className="space-y-6">
            <Card className="border-2 border-dashed border-purple-200 bg-gradient-to-br from-purple-50 to-yellow-50">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl">Join a Payment Session</CardTitle>
                <CardDescription>Enter your details and session code to join a group payment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="joinEmail">Your Email</Label>
                    <Input
                      id="joinEmail"
                      type="email"
                      placeholder="your@email.com"
                      value={joinEmail}
                      onChange={(e) => setJoinEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="joinName">Your Name</Label>
                    <Input
                      id="joinName"
                      placeholder="Your full name"
                      value={joinName}
                      onChange={(e) => setJoinName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionCode">Session Code</Label>
                  <Input
                    id="sessionCode"
                    placeholder="SPLIT-2024-XXX"
                    value={sessionCode}
                    onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                    className="font-mono text-center text-lg"
                  />
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600 text-lg py-6"
                  onClick={joinSession}
                  disabled={!joinEmail || !joinName || !sessionCode}
                >
                  <Users className="w-5 h-5 mr-2" />
                  Join Payment Session
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Don't have a session code?</p>
                  <Button variant="outline" onClick={() => (window.location.href = "/pay/friend")}>
                    <Gift className="w-4 h-4 mr-2" />
                    Create New Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="session" className="space-y-6">
            {currentSession && (
              <>
                {/* Session Header */}
                <Card className="bg-gradient-to-r from-purple-600 to-yellow-500 text-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h1 className="text-2xl font-bold mb-2">{currentSession.name}</h1>
                        <p className="opacity-90">{currentSession.description}</p>
                        <p className="text-sm opacity-75 mt-2">
                          Created by {currentSession.creatorName} • Code: {currentSession.id}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold">${currentSession.totalAmount}</div>
                        <div className="text-sm opacity-75">{currentSession.currency}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Progress & Participants */}
                  <div className="lg:col-span-2 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span className="flex items-center">
                            <DollarSign className="w-5 h-5 mr-2" />
                            Payment Progress
                          </span>
                          <Badge variant="outline">
                            {currentSession.participants.filter((p) => p.paid).length + 1}/
                            {currentSession.participants.length + 1} Paid
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Progress value={calculateProgress()} className="h-3 mb-4" />
                        <div className="text-sm text-gray-600 text-center">
                          {calculateProgress().toFixed(0)}% Complete
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Users className="w-5 h-5 mr-2" />
                          Participants
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {/* Creator */}
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Avatar>
                                <AvatarFallback className="bg-blue-600 text-white">
                                  {currentSession.creatorName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{currentSession.creatorName} (Host)</div>
                                <div className="text-sm text-gray-600">{currentSession.creatorEmail}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge>Host</Badge>
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                          </div>

                          {/* Participants */}
                          {currentSession.participants.map((participant) => (
                            <div
                              key={participant.email}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <Avatar>
                                  <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {participant.name}
                                    {participant.email === joinEmail && " (You)"}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    ${participant.amount.toFixed(2)}
                                    {participant.paymentMethod && (
                                      <span className="ml-2 text-purple-600">via {participant.paymentMethod}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                {participant.paid ? (
                                  <CheckCircle className="w-5 h-5 text-green-600" />
                                ) : (
                                  <Clock className="w-5 h-5 text-orange-600" />
                                )}
                                <Badge variant={participant.paid ? "default" : "secondary"}>
                                  {participant.paid ? "Paid" : "Pending"}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Payment Panel */}
                  <div className="space-y-6">
                    {isMyPaymentPending() && (
                      <Card className="border-orange-200 bg-orange-50">
                        <CardHeader>
                          <CardTitle className="flex items-center text-orange-700">
                            <Wallet className="w-5 h-5 mr-2" />
                            Your Payment
                          </CardTitle>
                          <CardDescription>Complete your payment to join the session</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="bg-white p-3 rounded-lg">
                            <div className="text-sm text-gray-600">Your Share</div>
                            <div className="text-2xl font-bold">${getMyShare().toFixed(2)}</div>
                          </div>

                          <div className="space-y-2">
                            <Label>Pay with</Label>
                            <Select value={selectedPaymentMethod} onValueChange={setSelectedPaymentMethod}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="ICP">ICP</SelectItem>
                                <SelectItem value="ckBTC">ckBTC</SelectItem>
                                <SelectItem value="USDC">USDC</SelectItem>
                                <SelectItem value="ETH">ETH</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <Button
                            className="w-full bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600"
                            onClick={processPayment}
                            disabled={isProcessingPayment}
                          >
                            {isProcessingPayment ? <>Processing Payment...</> : <>Pay ${getMyShare().toFixed(2)}</>}
                          </Button>
                        </CardContent>
                      </Card>
                    )}

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Share2 className="w-5 h-5 mr-2" />
                          Share Session
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="bg-gray-50 p-3 rounded-lg text-center">
                          <div className="text-2xl font-bold font-mono">{currentSession.id}</div>
                          <div className="text-sm text-gray-600">Session Code</div>
                        </div>

                        <Button variant="outline" className="w-full" onClick={copySessionLink}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Session Link
                        </Button>

                        <Button variant="outline" className="w-full">
                          <QrCode className="w-4 h-4 mr-2" />
                          Show QR Code
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Session Info</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Created:</span>
                          <span>{new Date(currentSession.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expires:</span>
                          <span>{new Date(currentSession.expiresAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Participants:</span>
                          <span>{currentSession.participants.length + 1}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
