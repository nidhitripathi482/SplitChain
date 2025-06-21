"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { QRCodeGenerator } from "@/components/qr-code-generator"
import { ArrowLeft, Users, Plus, X, DollarSign, ArrowRight, Copy, Share2, QrCode, Sparkles, Zap } from "lucide-react"
import { icpWalletService, type ICPWallet, type PaymentSession } from "@/lib/icp-wallet"

interface Participant {
  email: string
  name: string
}

export default function CreateSession() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [wallet, setWallet] = useState<ICPWallet | null>(null)
  const [userData, setUserData] = useState<any>(null)

  // Form data
  const [sessionName, setSessionName] = useState("")
  const [sessionDescription, setSessionDescription] = useState("")
  const [totalAmount, setTotalAmount] = useState("")
  const [participants, setParticipants] = useState<Participant[]>([])
  const [newParticipantEmail, setNewParticipantEmail] = useState("")
  const [newParticipantName, setNewParticipantName] = useState("")

  // Created session
  const [createdSession, setCreatedSession] = useState<PaymentSession | null>(null)

  useEffect(() => {
    // Check wallet connection
    const connectedWallet = icpWalletService.getWallet()
    if (!connectedWallet) {
      router.push("/wallet/connect")
      return
    }
    setWallet(connectedWallet)

    // Get user data
    const storedUser = localStorage.getItem("splitchain_user")
    if (!storedUser) {
      router.push("/auth/setup")
      return
    }
    setUserData(JSON.parse(storedUser))
  }, [router])

  const addParticipant = () => {
    if (newParticipantEmail && newParticipantName && !participants.find((p) => p.email === newParticipantEmail)) {
      setParticipants([...participants, { email: newParticipantEmail, name: newParticipantName }])
      setNewParticipantEmail("")
      setNewParticipantName("")
    }
  }

  const removeParticipant = (email: string) => {
    setParticipants(participants.filter((p) => p.email !== email))
  }

  const calculateAmountPerPerson = () => {
    const total = Number.parseFloat(totalAmount) || 0
    return participants.length > 0 ? total / participants.length : 0
  }

  const createSession = () => {
    if (!userData || participants.length === 0) return

    const session = icpWalletService.createPaymentSession(
      sessionName,
      sessionDescription,
      Number.parseFloat(totalAmount),
      participants,
      userData.email,
      userData.username,
    )

    setCreatedSession(session)
    setStep(4)
  }

  const copySessionLink = () => {
    if (createdSession) {
      const link = `${window.location.origin}/join?code=${createdSession.id}`
      navigator.clipboard.writeText(link)
    }
  }

  const copyQRData = () => {
    if (createdSession) {
      navigator.clipboard.writeText(createdSession.qrCode)
    }
  }

  const shareSession = async () => {
    if (createdSession && navigator.share) {
      try {
        await navigator.share({
          title: `Join ${createdSession.name} on SplitChain`,
          text: `You're invited to join "${createdSession.name}" - split payment session on SplitChain!`,
          url: `${window.location.origin}/join?code=${createdSession.id}`,
        })
      } catch (error) {
        copySessionLink()
      }
    } else {
      copySessionLink()
    }
  }

  if (!wallet || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse animation-delay-2000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Create Payment Session
            </h1>
          </div>
          <Badge variant="outline" className="bg-white/50">
            Step {step} of 4
          </Badge>
        </div>
      </header>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-2xl">
        {step === 1 && (
          <Card className="border-2 border-white/20 backdrop-blur-sm bg-white/80 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <DollarSign className="w-6 h-6 mr-3 text-purple-600" />
                Session Details
              </CardTitle>
              <CardDescription className="text-lg">Create an awesome payment session</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="sessionName" className="text-base font-medium">
                  Session Name *
                </Label>
                <Input
                  id="sessionName"
                  placeholder="e.g., Pizza Night 🍕, Movie Trip 🎬, Concert Tickets 🎵"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  className="text-lg py-6"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionDescription" className="text-base font-medium">
                  Description (Optional)
                </Label>
                <Textarea
                  id="sessionDescription"
                  placeholder="Add some details about this payment session..."
                  value={sessionDescription}
                  onChange={(e) => setSessionDescription(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalAmount" className="text-base font-medium">
                  Total Amount (ICP) *
                </Label>
                <Input
                  id="totalAmount"
                  type="number"
                  step="0.0001"
                  placeholder="0.0000"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                  className="text-lg py-6 font-mono"
                />
                {totalAmount && (
                  <p className="text-sm text-gray-600">≈ ${(Number.parseFloat(totalAmount) * 12).toFixed(2)} USD</p>
                )}
              </div>

              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6 rounded-xl"
                onClick={() => setStep(2)}
                disabled={!sessionName || !totalAmount}
              >
                Continue to Participants
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="border-2 border-white/20 backdrop-blur-sm bg-white/80 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Users className="w-6 h-6 mr-3 text-purple-600" />
                Add Participants
              </CardTitle>
              <CardDescription className="text-lg">Who's joining this payment session?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input
                    placeholder="friend@email.com"
                    value={newParticipantEmail}
                    onChange={(e) => setNewParticipantEmail(e.target.value)}
                    className="py-3"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    placeholder="Friend's Name"
                    value={newParticipantName}
                    onChange={(e) => setNewParticipantName(e.target.value)}
                    className="py-3"
                  />
                </div>
              </div>

              <Button
                onClick={addParticipant}
                disabled={!newParticipantEmail || !newParticipantName}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Participant
              </Button>

              {/* Participants List */}
              <div className="space-y-3">
                {/* Creator */}
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl border-2 border-purple-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                      {userData.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold">{userData.username} (You)</div>
                      <div className="text-sm text-gray-600">{userData.email}</div>
                    </div>
                  </div>
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">Creator</Badge>
                </div>

                {/* Participants */}
                {participants.map((participant) => (
                  <div
                    key={participant.email}
                    className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-xl hover:border-purple-300 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">
                        {participant.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-semibold">{participant.name}</div>
                        <div className="text-sm text-gray-600">{participant.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{calculateAmountPerPerson().toFixed(4)} ICP</Badge>
                      <Button variant="ghost" size="sm" onClick={() => removeParticipant(participant.email)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {participants.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No participants added yet</p>
                  <p className="text-sm">Add some friends to split the payment with!</p>
                </div>
              )}

              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-6 rounded-xl"
                onClick={() => setStep(3)}
                disabled={participants.length === 0}
              >
                Continue to Review
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="border-2 border-white/20 backdrop-blur-sm bg-white/80 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-2xl">
                <Sparkles className="w-6 h-6 mr-3 text-purple-600" />
                Review & Create
              </CardTitle>
              <CardDescription className="text-lg">Everything looks good? Let's create this session!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Session Summary */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
                <h4 className="font-bold text-lg mb-4 text-center">{sessionName}</h4>
                {sessionDescription && <p className="text-gray-700 mb-4 text-center">{sessionDescription}</p>}

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{totalAmount} ICP</div>
                    <div className="text-sm text-gray-600">Total Amount</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-pink-600">{participants.length}</div>
                    <div className="text-sm text-gray-600">Participants</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-purple-200">
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">{calculateAmountPerPerson().toFixed(4)} ICP</div>
                    <div className="text-sm text-gray-600">Per Person</div>
                  </div>
                </div>
              </div>

              {/* Wallet Check */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <h4 className="font-semibold mb-2 flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-blue-600" />
                  Your Wallet
                </h4>
                <div className="flex justify-between items-center">
                  <span>Current Balance:</span>
                  <span className="font-bold">{wallet.balance.toFixed(4)} ICP</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Required:</span>
                  <span className="font-bold">{totalAmount} ICP</span>
                </div>
                {wallet.balance < Number.parseFloat(totalAmount) && (
                  <Alert className="mt-3 border-yellow-200 bg-yellow-50">
                    <AlertDescription className="text-yellow-700">
                      You need more ICP to fund this session. Consider reducing the amount or adding funds to your
                      wallet.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Button
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-lg py-8 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                onClick={createSession}
                disabled={wallet.balance < Number.parseFloat(totalAmount)}
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Create Payment Session
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 4 && createdSession && (
          <Card className="border-2 border-green-200 backdrop-blur-sm bg-white/90 shadow-xl">
            <CardHeader className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-3xl bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                Session Created! 🎉
              </CardTitle>
              <CardDescription className="text-lg">
                Share this with your friends to start collecting payments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Session Code */}
              <div className="text-center">
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border-2 border-green-200">
                  <div className="text-3xl font-bold font-mono mb-2">{createdSession.id}</div>
                  <div className="text-sm text-gray-600">Session Code</div>
                </div>
              </div>

              {/* QR Code */}
              <div className="text-center">
                <div className="bg-white p-6 rounded-xl border-2 border-gray-200 inline-block">
                  <QRCodeGenerator data={createdSession.qrCode} size={200} />
                </div>
                <p className="text-sm text-gray-600 mt-2">Scan to join session</p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="py-6" onClick={copySessionLink}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Link
                </Button>
                <Button variant="outline" className="py-6" onClick={shareSession}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Session
                </Button>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-lg py-6 rounded-xl"
                onClick={() => router.push(`/join?code=${createdSession.id}`)}
              >
                <QrCode className="w-5 h-5 mr-2" />
                Go to Live Session
              </Button>

              {/* Next Steps */}
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h4 className="font-semibold mb-3">Next Steps:</h4>
                <ol className="space-y-2 text-sm list-decimal list-inside">
                  <li>Share the session code or QR code with participants</li>
                  <li>They'll join using the link or by scanning the QR code</li>
                  <li>Everyone pays their share in ICP</li>
                  <li>You receive payments automatically in your wallet!</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
