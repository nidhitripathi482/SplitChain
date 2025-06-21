"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Wallet, CheckCircle, AlertCircle, Copy, ExternalLink, ArrowRight, Loader2 } from "lucide-react"
import { walletService, type WalletInfo } from "@/lib/wallet"

export default function WalletSetup() {
  const router = useRouter()
  const [step, setStep] = useState(1) // 1: intro, 2: connecting, 3: connected, 4: complete
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState("")
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    // Check if user has completed auth setup
    const storedUser = localStorage.getItem("splitchain_user")
    if (!storedUser) {
      router.push("/auth/setup")
      return
    }
    setUserData(JSON.parse(storedUser))
  }, [router])

  const connectWallet = async () => {
    setIsConnecting(true)
    setError("")
    setStep(2)

    try {
      const walletInfo = await walletService.connectWallet()
      if (walletInfo) {
        setWallet(walletInfo)
        setStep(3)

        // Update user data with wallet info
        if (userData) {
          const updatedUser = {
            ...userData,
            walletConnected: true,
            walletAddress: walletInfo.accountId,
            walletBalance: walletInfo.balance,
          }
          localStorage.setItem("splitchain_user", JSON.stringify(updatedUser))
        }
      } else {
        setError("Failed to connect wallet. Please try again.")
        setStep(1)
      }
    } catch (error) {
      setError("Wallet connection failed. Please try again.")
      setStep(1)
    } finally {
      setIsConnecting(false)
    }
  }

  const copyWalletAddress = () => {
    if (wallet) {
      navigator.clipboard.writeText(wallet.accountId)
    }
  }

  const completeSetup = () => {
    setStep(4)
    setTimeout(() => {
      router.push("/dashboard")
    }, 2000)
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl">
            {step === 1 && "Connect Your ICP Wallet"}
            {step === 2 && "Connecting Wallet..."}
            {step === 3 && "Wallet Connected! 🎉"}
            {step === 4 && "Setup Complete! 🚀"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Connect your Internet Computer wallet to start making payments"}
            {step === 2 && "Please approve the connection in your wallet"}
            {step === 3 && "Your ICP wallet is now connected and ready to use"}
            {step === 4 && "Welcome to SplitChain! Redirecting to your dashboard..."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Hello, {userData.username}! 👋</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex justify-between">
                    <span>Email:</span>
                    <span>{userData.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Account:</span>
                    <span className="text-green-600">✓ Created</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wallet:</span>
                    <span className="text-orange-600">⏳ Pending</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">What is an ICP Wallet?</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-bold text-xs">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Your Digital Wallet</p>
                      <p className="text-gray-600">Stores your ICP tokens and other cryptocurrencies</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-bold text-xs">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Send & Receive Payments</p>
                      <p className="text-gray-600">Make instant payments to friends and merchants</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-600 font-bold text-xs">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Secure & Private</p>
                      <p className="text-gray-600">Your keys, your crypto - fully decentralized</p>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-blue-600 to-purple-500 hover:from-blue-700 hover:to-purple-600 text-lg py-6"
                onClick={connectWallet}
                disabled={isConnecting}
              >
                <Wallet className="w-5 h-5 mr-2" />
                Connect ICP Wallet
              </Button>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Connecting to Internet Identity...</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Please approve the connection request in your Internet Identity popup window.
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Connection Steps:</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Internet Identity popup should appear</li>
                  <li>Authenticate with your device (fingerprint, face, etc.)</li>
                  <li>Approve the connection to SplitChain</li>
                  <li>Your wallet will be connected automatically</li>
                </ol>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  If the popup doesn't appear, please disable popup blockers and try again.
                </AlertDescription>
              </Alert>
            </>
          )}

          {step === 3 && wallet && (
            <>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-green-700">Wallet Connected Successfully!</h3>
                  <p className="text-sm text-gray-600 mt-2">Your ICP wallet is now ready for payments</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-3">Your Wallet Details</h4>
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
                  <div className="flex justify-between">
                    <span className="text-gray-600">Network:</span>
                    <Badge variant="outline">Internet Computer</Badge>
                  </div>
                </div>
              </div>

              {wallet.balance === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your wallet is empty. You'll need some ICP to make payments.{" "}
                    <Button variant="link" className="p-0 h-auto">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Get ICP
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              <Button
                className="w-full bg-gradient-to-r from-green-600 to-blue-500 hover:from-green-700 hover:to-blue-600"
                onClick={completeSetup}
              >
                Complete Setup
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </>
          )}

          {step === 4 && (
            <>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-500 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Welcome to SplitChain! 🎉</h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Your account and wallet are ready. Taking you to your dashboard...
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">You're All Set! 🚀</h4>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>Account created with email: {userData.email}</li>
                  <li>ICP wallet connected and ready</li>
                  <li>100 $SPLIT welcome bonus added</li>
                  <li>Ready to create payment sessions</li>
                </ul>
              </div>

              <div className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">Redirecting to dashboard...</span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
