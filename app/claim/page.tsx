"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Wallet, Gift, CheckCircle, Copy, ExternalLink } from "lucide-react"
import { walletService, type WalletInfo, type ClaimVoucher } from "@/lib/wallet"

export default function ClaimPage() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [claimCode, setClaimCode] = useState("")
  const [voucher, setVoucher] = useState<ClaimVoucher | null>(null)
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimed, setClaimed] = useState(false)
  const [error, setError] = useState("")

  // Mock voucher data (in production, this would come from your backend)
  const mockVouchers: ClaimVoucher[] = [
    {
      id: "CLAIM-001",
      email: "bob@example.com",
      name: "Bob Smith",
      amount: 2.5,
      currency: "ICP",
      claimCode: "ABC123XY",
      sessionName: "Pizza Night 🍕",
      createdAt: "2024-01-15T19:30:00Z",
      claimed: false,
    },
    {
      id: "CLAIM-002",
      email: "charlie@example.com",
      name: "Charlie Brown",
      amount: 1.8,
      currency: "ICP",
      claimCode: "DEF456ZW",
      sessionName: "Movie Night",
      createdAt: "2024-01-15T20:00:00Z",
      claimed: false,
    },
  ]

  useEffect(() => {
    // Check URL parameters for pre-filled data
    const urlParams = new URLSearchParams(window.location.search)
    const emailParam = urlParams.get("email")
    const codeParam = urlParams.get("code")

    if (emailParam) setEmail(emailParam)
    if (codeParam) setClaimCode(codeParam.toUpperCase())
  }, [])

  const findVoucher = () => {
    setError("")
    const foundVoucher = mockVouchers.find((v) => v.email === email && v.claimCode === claimCode.toUpperCase())

    if (!foundVoucher) {
      setError("Invalid email or claim code. Please check your details.")
      return
    }

    if (foundVoucher.claimed) {
      setError("This voucher has already been claimed.")
      return
    }

    setVoucher(foundVoucher)
    setStep(2)
  }

  const connectWallet = async () => {
    setIsConnecting(true)
    setError("")

    try {
      const walletInfo = await walletService.connectWallet()
      if (walletInfo) {
        setWallet(walletInfo)
        setStep(3)
      } else {
        setError("Failed to connect wallet. Please try again.")
      }
    } catch (error) {
      setError("Wallet connection failed. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  const claimVoucher = async () => {
    if (!voucher || !wallet) return

    setIsClaiming(true)
    setError("")

    try {
      // In production, you would:
      // 1. Verify the voucher on your backend
      // 2. Send the payment from your treasury wallet to user's wallet
      // 3. Mark voucher as claimed

      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Mock successful claim
      setVoucher({ ...voucher, claimed: true, claimedAt: new Date().toISOString(), recipientWallet: wallet.accountId })
      setClaimed(true)
      setStep(4)
    } catch (error) {
      setError("Failed to claim voucher. Please try again.")
    } finally {
      setIsClaiming(false)
    }
  }

  const copyWalletAddress = () => {
    if (wallet) {
      navigator.clipboard.writeText(wallet.accountId)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => (window.location.href = "/")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-500 rounded-lg flex items-center justify-center">
                <Gift className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold">Claim Your Payment</span>
            </div>
          </div>
          <Badge variant="outline">Step {step} of 4</Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {step === 1 && (
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Claim Your Payment</CardTitle>
              <CardDescription>Enter your email and claim code to receive your share</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Your Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="claimCode">Claim Code</Label>
                <Input
                  id="claimCode"
                  placeholder="ABC123XY"
                  value={claimCode}
                  onChange={(e) => setClaimCode(e.target.value.toUpperCase())}
                  className="font-mono text-center text-lg"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                className="w-full bg-gradient-to-r from-green-600 to-blue-500 hover:from-green-700 hover:to-blue-600 text-lg py-6"
                onClick={findVoucher}
                disabled={!email || !claimCode}
              >
                <Gift className="w-5 h-5 mr-2" />
                Find My Payment
              </Button>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Don't have a claim code?</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Ask the person who created the payment session to send you the claim code via email or message.
                </p>
                <Button variant="outline" size="sm" onClick={() => (window.location.href = "/session")}>
                  Join a Session Instead
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && voucher && (
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                Payment Found!
              </CardTitle>
              <CardDescription>Confirm your payment details below</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-green-600 to-blue-500 text-white p-6 rounded-lg">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    {voucher.amount} {voucher.currency}
                  </div>
                  <div className="text-lg opacity-90">{voucher.sessionName}</div>
                  <div className="text-sm opacity-75 mt-2">From: SplitChain Payment</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Recipient:</span>
                  <span className="font-medium">{voucher.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{voucher.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">{new Date(voucher.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Claim Code:</span>
                  <span className="font-mono font-bold">{voucher.claimCode}</span>
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-green-600 to-blue-500 hover:from-green-700 hover:to-blue-600"
                onClick={connectWallet}
                disabled={isConnecting}
              >
                <Wallet className="w-5 h-5 mr-2" />
                {isConnecting ? "Connecting..." : "Connect ICP Wallet"}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {step === 3 && voucher && wallet && (
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wallet className="w-5 h-5 mr-2 text-purple-600" />
                Wallet Connected
              </CardTitle>
              <CardDescription>Ready to claim your payment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Your Wallet</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Balance:</span>
                    <span className="font-medium">{wallet.balance.toFixed(4)} ICP</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Address:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm">
                        {wallet.accountId.slice(0, 8)}...{wallet.accountId.slice(-8)}
                      </span>
                      <Button variant="ghost" size="sm" onClick={copyWalletAddress}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Payment Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Amount:</span>
                    <span className="font-bold text-green-600">
                      {voucher.amount} {voucher.currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Network Fee:</span>
                    <span className="text-sm">~0.0001 ICP</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-lg font-bold">
                    <span>You'll Receive:</span>
                    <span className="text-green-600">{(voucher.amount - 0.0001).toFixed(4)} ICP</span>
                  </div>
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-green-600 to-blue-500 hover:from-green-700 hover:to-blue-600 text-lg py-6"
                onClick={claimVoucher}
                disabled={isClaiming}
              >
                {isClaiming ? "Processing Claim..." : `Claim ${voucher.amount} ICP`}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {step === 4 && voucher && claimed && (
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-green-700">Payment Claimed! 🎉</CardTitle>
              <CardDescription>Your ICP has been sent to your wallet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 p-6 rounded-lg text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">{voucher.amount} ICP</div>
                <div className="text-lg">Successfully Claimed!</div>
                <div className="text-sm text-gray-600 mt-2">
                  Claimed on {new Date(voucher.claimedAt!).toLocaleString()}
                </div>
              </div>

              <div className="space-y-3">
                <Button variant="outline" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on IC Explorer
                </Button>

                <Button className="w-full" onClick={() => (window.location.href = "/dashboard")}>
                  Go to Dashboard
                </Button>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">What's Next?</h4>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Your ICP is now in your wallet</li>
                  <li>You can use it for other payments or exchanges</li>
                  <li>Create your own payment sessions anytime</li>
                  <li>Earn $SPLIT rewards for using the platform</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
