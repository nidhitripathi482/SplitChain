"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Wallet, CheckCircle, AlertCircle, Copy, Zap, Shield, Globe, Loader2 } from "lucide-react"
import { icpWalletService, type ICPWallet } from "@/lib/icp-wallet"

export default function ConnectWallet() {
  const router = useRouter()
  const [wallet, setWallet] = useState<ICPWallet | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState("")
  const [step, setStep] = useState(1) // 1: connect, 2: connected, 3: complete

  useEffect(() => {
    // Check if already connected
    const existingWallet = icpWalletService.getWallet()
    if (existingWallet) {
      setWallet(existingWallet)
      setStep(2)
    }
  }, [])

  const connectWallet = async () => {
    setIsConnecting(true)
    setError("")

    try {
      const connectedWallet = await icpWalletService.connectWallet()
      if (connectedWallet) {
        setWallet(connectedWallet)
        setStep(2)

        // Update user data
        const userData = localStorage.getItem("splitchain_user")
        if (userData) {
          const user = JSON.parse(userData)
          user.walletConnected = true
          user.walletAddress = connectedWallet.accountId
          user.walletBalance = connectedWallet.balance
          localStorage.setItem("splitchain_user", JSON.stringify(user))
        }
      } else {
        setError("Failed to connect wallet. Please try again.")
      }
    } catch (error) {
      setError("Wallet connection failed. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  const copyAddress = () => {
    if (wallet) {
      navigator.clipboard.writeText(wallet.accountId)
    }
  }

  const goToDashboard = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-yellow-50">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-lg border-2 border-white/20 backdrop-blur-sm bg-white/80">
          <CardHeader className="text-center">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 via-purple-600 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Wallet className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {step === 1 && "Connect Your ICP Wallet"}
              {step === 2 && "Wallet Connected! 🎉"}
            </CardTitle>
            <CardDescription className="text-lg">
              {step === 1 && "Connect to Internet Computer and start making crypto payments"}
              {step === 2 && "Your ICP wallet is ready for instant payments"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            {step === 1 && (
              <>
                {/* Features */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Zap className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-sm font-medium">Instant</div>
                    <div className="text-xs text-gray-600">Payments</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Shield className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-sm font-medium">Secure</div>
                    <div className="text-xs text-gray-600">Decentralized</div>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Globe className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="text-sm font-medium">Global</div>
                    <div className="text-xs text-gray-600">Network</div>
                  </div>
                </div>

                {/* Connection Button */}
                <Button
                  className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-yellow-500 hover:from-blue-700 hover:via-purple-700 hover:to-yellow-600 text-white text-lg py-8 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-105"
                  onClick={connectWallet}
                  disabled={isConnecting}
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                      Connecting to Internet Identity...
                    </>
                  ) : (
                    <>
                      <Wallet className="w-6 h-6 mr-3" />
                      Connect ICP Wallet
                    </>
                  )}
                </Button>

                {error && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* Info */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
                  <h4 className="font-semibold mb-3 text-center">What happens when you connect?</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">1</span>
                      </div>
                      <span>Internet Identity popup opens for secure authentication</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">2</span>
                      </div>
                      <span>Your ICP wallet is connected to SplitChain</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-xs">3</span>
                      </div>
                      <span>Start making instant crypto payments!</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {step === 2 && wallet && (
              <>
                {/* Success Animation */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-700 mb-2">Successfully Connected!</h3>
                  <p className="text-gray-600">Your ICP wallet is ready for payments</p>
                </div>

                {/* Wallet Info */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl">
                  <h4 className="font-semibold mb-4 text-center">Your Wallet Details</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Balance:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-lg">{wallet.balance.toFixed(4)} ICP</span>
                        <Badge variant="outline">≈ ${(wallet.balance * 12).toFixed(2)}</Badge>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Address:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm">
                          {wallet.accountId.slice(0, 6)}...{wallet.accountId.slice(-6)}
                        </span>
                        <Button variant="ghost" size="sm" onClick={copyAddress}>
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Network:</span>
                      <Badge className="bg-gradient-to-r from-blue-600 to-purple-600">Internet Computer</Badge>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <Button
                    className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-lg py-6 rounded-xl"
                    onClick={goToDashboard}
                  >
                    Go to Dashboard 🚀
                  </Button>

                  {wallet.balance === 0 && (
                    <Alert className="border-yellow-200 bg-yellow-50">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-700">
                        Your wallet is empty. You'll need some ICP to make payments.{" "}
                        <Button variant="link" className="p-0 h-auto text-yellow-700 underline">
                          Get ICP →
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
