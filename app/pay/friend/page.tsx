"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Users, Plus, X, DollarSign, Calculator, ArrowRight, Copy, Gift, Wallet } from "lucide-react"
import { walletService, type WalletInfo, type ClaimVoucher } from "@/lib/wallet"

interface Participant {
  email: string
  name: string
  amount?: number
  status: "pending" | "invited" | "joined"
}

export default function PayFriend() {
  const [step, setStep] = useState(1)
  const [sessionName, setSessionName] = useState("")
  const [sessionDescription, setSessionDescription] = useState("")
  const [totalAmount, setTotalAmount] = useState("")
  const [currency, setCurrency] = useState("ICP")
  const [splitType, setSplitType] = useState("equal")
  const [participants, setParticipants] = useState<Participant[]>([])
  const [newParticipantEmail, setNewParticipantEmail] = useState("")
  const [newParticipantName, setNewParticipantName] = useState("")
  const [wallet, setWallet] = useState<WalletInfo | null>(null)
  const [claimVouchers, setClaimVouchers] = useState<ClaimVoucher[]>([])
  const [isConnecting, setIsConnecting] = useState(false)

  const addParticipant = () => {
    if (newParticipantEmail && newParticipantName && !participants.find((p) => p.email === newParticipantEmail)) {
      setParticipants([
        ...participants,
        {
          email: newParticipantEmail,
          name: newParticipantName,
          status: "pending",
        },
      ])
      setNewParticipantEmail("")
      setNewParticipantName("")
    }
  }

  const removeParticipant = (email: string) => {
    setParticipants(participants.filter((p) => p.email !== email))
  }

  const calculateEqualSplit = () => {
    const total = Number.parseFloat(totalAmount) || 0
    return total / participants.length // Only participants, creator pays upfront
  }

  const connectWallet = async () => {
    setIsConnecting(true)
    try {
      const walletInfo = await walletService.connectWallet()
      if (walletInfo) {
        setWallet(walletInfo)
        setStep(4)
      }
    } catch (error) {
      console.error("Wallet connection failed:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const createClaimVouchers = () => {
    const participantsWithAmounts = participants.map((p) => ({
      ...p,
      amount: calculateEqualSplit(),
    }))

    const vouchers = walletService.generateClaimVouchers(sessionName, participantsWithAmounts)
    setClaimVouchers(vouchers)
    setStep(5)
  }

  const copyClaimLink = (voucher: ClaimVoucher) => {
    const link = `${window.location.origin}/claim?email=${encodeURIComponent(voucher.email)}&code=${voucher.claimCode}`
    navigator.clipboard.writeText(link)
  }

  const copyAllClaimInfo = () => {
    const info = claimVouchers
      .map(
        (v) =>
          `${v.name} (${v.email}): Claim ${v.amount} ${v.currency} with code ${v.claimCode}\nLink: ${window.location.origin}/claim?email=${encodeURIComponent(v.email)}&code=${v.claimCode}`,
      )
      .join("\n\n")

    navigator.clipboard.writeText(`${sessionName} - Payment Claims:\n\n${info}`)
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
            <h1 className="text-xl font-bold">Create Payment Claims</h1>
          </div>
          <Badge variant="outline">Step {step} of 5</Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {step === 1 && (
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Payment Details
              </CardTitle>
              <CardDescription>Set up the details for your payment claims</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="sessionName">Payment Name</Label>
                <Input
                  id="sessionName"
                  placeholder="e.g., Pizza Night, Movie Trip, etc."
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionDescription">Description (Optional)</Label>
                <Input
                  id="sessionDescription"
                  placeholder="e.g., Group dinner at Tony's Pizza Palace"
                  value={sessionDescription}
                  onChange={(e) => setSessionDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalAmount">Total Amount</Label>
                  <Input
                    id="totalAmount"
                    type="number"
                    placeholder="0.00"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ICP">ICP</SelectItem>
                      <SelectItem value="ckBTC">ckBTC</SelectItem>
                      <SelectItem value="USDC">USDC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-yellow-500"
                onClick={() => setStep(2)}
                disabled={!sessionName || !totalAmount}
              >
                Continue to Recipients
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Add Recipients
              </CardTitle>
              <CardDescription>Add people who will receive claim codes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="friend@email.com"
                  value={newParticipantEmail}
                  onChange={(e) => setNewParticipantEmail(e.target.value)}
                />
                <Input
                  placeholder="Friend's Name"
                  value={newParticipantName}
                  onChange={(e) => setNewParticipantName(e.target.value)}
                />
              </div>
              <Button
                onClick={addParticipant}
                disabled={!newParticipantEmail || !newParticipantName}
                className="w-full"
                variant="outline"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Recipient
              </Button>

              <div className="space-y-3">
                {participants.map((participant) => (
                  <div key={participant.email} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold text-sm">
                        {participant.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium">{participant.name}</div>
                        <div className="text-sm text-gray-600">{participant.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        Will receive {calculateEqualSplit().toFixed(2)} {currency}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => removeParticipant(participant.email)}>
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-yellow-500"
                onClick={() => setStep(3)}
                disabled={participants.length === 0}
              >
                Continue to Summary
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="w-5 h-5 mr-2" />
                Payment Summary
              </CardTitle>
              <CardDescription>Review the payment breakdown</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Payment Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span className="font-medium">
                      {totalAmount} {currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recipients:</span>
                    <span>{participants.length}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between text-lg font-semibold">
                    <span>Per Person:</span>
                    <span>
                      {calculateEqualSplit().toFixed(4)} {currency}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">How It Works</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Connect your wallet and fund the payment</li>
                  <li>Unique claim codes are generated for each recipient</li>
                  <li>Recipients use their email + claim code to receive payment</li>
                  <li>Payments are sent directly to their wallets</li>
                </ol>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-purple-600 to-yellow-500 hover:from-purple-700 hover:to-yellow-600"
                onClick={connectWallet}
                disabled={isConnecting}
              >
                <Wallet className="w-5 h-5 mr-2" />
                {isConnecting ? "Connecting..." : "Connect Wallet to Continue"}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 4 && wallet && (
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wallet className="w-5 h-5 mr-2 text-green-600" />
                Wallet Connected
              </CardTitle>
              <CardDescription>Ready to create claim vouchers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Your Wallet</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Balance:</span>
                    <span className="font-medium">{wallet.balance.toFixed(4)} ICP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Required:</span>
                    <span className="font-medium">
                      {totalAmount} {currency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Network Fees:</span>
                    <span className="text-sm">~{(participants.length * 0.0001).toFixed(4)} ICP</span>
                  </div>
                </div>
              </div>

              {wallet.balance >= Number.parseFloat(totalAmount) ? (
                <Button
                  className="w-full bg-gradient-to-r from-green-600 to-blue-500 hover:from-green-700 hover:to-blue-600 text-lg py-6"
                  onClick={createClaimVouchers}
                >
                  <Gift className="w-5 h-5 mr-2" />
                  Create Claim Vouchers
                </Button>
              ) : (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h4 className="font-medium text-red-700 mb-2">Insufficient Balance</h4>
                  <p className="text-sm text-red-600">
                    You need at least {totalAmount} {currency} to create these payment claims.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {step === 5 && claimVouchers.length > 0 && (
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl text-green-700">Claim Vouchers Created! 🎉</CardTitle>
              <CardDescription>Share these claim codes with your friends</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {claimVouchers.map((voucher) => (
                  <div key={voucher.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-medium">{voucher.name}</div>
                        <div className="text-sm text-gray-600">{voucher.email}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">
                          {voucher.amount} {voucher.currency}
                        </div>
                        <div className="font-mono text-sm">{voucher.claimCode}</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => copyClaimLink(voucher)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Claim Link
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-3">
                <Button variant="outline" className="w-full" onClick={copyAllClaimInfo}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy All Claim Info
                </Button>

                <Button className="w-full" onClick={() => (window.location.href = "/dashboard")}>
                  Go to Dashboard
                </Button>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Next Steps:</h4>
                <ol className="text-sm space-y-1 list-decimal list-inside">
                  <li>Send claim codes to recipients via email/message</li>
                  <li>They visit the claim page and enter their details</li>
                  <li>Payments are sent directly to their wallets</li>
                  <li>You can track claims in your dashboard</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
