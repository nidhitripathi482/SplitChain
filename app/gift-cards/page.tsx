"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  CreditCard,
  Gift,
  Plus,
  Coins,
  Bitcoin,
  Zap,
  User,
  Users,
  Sparkles,
  Star,
  Crown,
  Flame,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

interface GiftCard {
  id: string
  type: "preset" | "custom"
  currency: string
  amount: number
  price: number // in $SPLIT tokens
  icon: any
  popular?: boolean
  premium?: boolean
  discount?: number
}

interface UserGiftCard {
  id: string
  currency: string
  amount: number
  from: string
  redeemed: boolean
  createdAt: string
  code: string
}

const presetGiftCards: GiftCard[] = [
  { id: "usdc-15", type: "preset", currency: "USDC", amount: 15, price: 150, icon: Coins },
  { id: "usdc-50", type: "preset", currency: "USDC", amount: 50, price: 480, icon: Coins, popular: true, discount: 4 },
  { id: "usdc-100", type: "preset", currency: "USDC", amount: 100, price: 950, icon: Coins, discount: 5 },
  { id: "btc-0.001", type: "preset", currency: "ckBTC", amount: 0.001, price: 3800, icon: Bitcoin, discount: 5 },
  {
    id: "btc-0.003",
    type: "preset",
    currency: "ckBTC",
    amount: 0.003,
    price: 11200,
    icon: Bitcoin,
    popular: true,
    discount: 7,
  },
  {
    id: "btc-0.005",
    type: "preset",
    currency: "ckBTC",
    amount: 0.005,
    price: 18500,
    icon: Bitcoin,
    premium: true,
    discount: 8,
  },
  { id: "eth-0.01", type: "preset", currency: "ETH", amount: 0.01, price: 2400, icon: Zap, discount: 4 },
  { id: "eth-0.05", type: "preset", currency: "ETH", amount: 0.05, price: 11800, icon: Zap, discount: 6 },
  { id: "eth-0.1", type: "preset", currency: "ETH", amount: 0.1, price: 23000, icon: Zap, premium: true, discount: 8 },
  { id: "icp-10", type: "preset", currency: "ICP", amount: 10, price: 950, icon: Crown, discount: 5 },
  { id: "icp-50", type: "preset", currency: "ICP", amount: 50, price: 4700, icon: Crown, popular: true, discount: 6 },
  { id: "icp-100", type: "preset", currency: "ICP", amount: 100, price: 9200, icon: Crown, premium: true, discount: 8 },
]

const mockUserGiftCards: UserGiftCard[] = [
  {
    id: "gc-1",
    currency: "USDC",
    amount: 25,
    from: "alice_crypto",
    redeemed: false,
    createdAt: "2024-01-15",
    code: "GIFT-USDC-25-ABC123",
  },
  {
    id: "gc-2",
    currency: "ICP",
    amount: 10,
    from: "bob_icp",
    redeemed: true,
    createdAt: "2024-01-10",
    code: "GIFT-ICP-10-XYZ789",
  },
]

export default function GiftCards() {
  const router = useRouter()
  const { authState } = useAuth()
  const [userTokens, setUserTokens] = useState(15000) // Mock user's $SPLIT tokens
  const [customAmount, setCustomAmount] = useState("")
  const [customCurrency, setCustomCurrency] = useState("USDC")
  const [selectedCard, setSelectedCard] = useState<string | null>(null)
  const [recipient, setRecipient] = useState("self") // "self" or "other"
  const [receiverId, setReceiverId] = useState("")
  const [isValidatingId, setIsValidatingId] = useState(false)
  const [idValidation, setIdValidation] = useState<"valid" | "invalid" | null>(null)
  const [userGiftCards, setUserGiftCards] = useState<UserGiftCard[]>(mockUserGiftCards)
  const [purchaseProgress, setPurchaseProgress] = useState(0)
  const [isPurchasing, setIsPurchasing] = useState(false)

  useEffect(() => {
    if (!authState.isAuthenticated) {
      router.push("/")
    }
  }, [authState.isAuthenticated, router])

  const calculateCustomPrice = () => {
    const amount = Number.parseFloat(customAmount) || 0
    const rates: Record<string, number> = {
      USDC: 10, // 10 $SPLIT per 1 USDC
      ckBTC: 4000000, // 4M $SPLIT per 1 ckBTC (updated rate)
      ETH: 250000, // 250k $SPLIT per 1 ETH
      ICP: 95, // 95 $SPLIT per 1 ICP (5% discount built in)
    }
    return Math.floor(amount * (rates[customCurrency] || 10))
  }

  const validateReceiverId = async (id: string) => {
    if (!id) {
      setIdValidation(null)
      return
    }

    setIsValidatingId(true)

    // Simulate API call to validate SplitChain ID
    setTimeout(() => {
      // Mock validation - in real app, this would check against the canister
      const isValid = id.length >= 3 && !["admin", "test", "invalid", "system"].includes(id.toLowerCase())
      setIdValidation(isValid ? "valid" : "invalid")
      setIsValidatingId(false)
    }, 1500)
  }

  const purchaseGiftCard = async (card: GiftCard | null, isCustom = false) => {
    if (recipient === "other" && (!receiverId || idValidation !== "valid")) {
      toast.error("Please enter a valid receiver SplitChain ID")
      return
    }

    setIsPurchasing(true)
    setPurchaseProgress(0)

    // Simulate purchase progress
    const progressInterval = setInterval(() => {
      setPurchaseProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          return 100
        }
        return prev + 10
      })
    }, 200)

    setTimeout(() => {
      if (isCustom) {
        const price = calculateCustomPrice()
        if (price > userTokens) {
          toast.error("Insufficient $SPLIT tokens")
          setIsPurchasing(false)
          return
        }
        setUserTokens((prev) => prev - price)
        const recipientText = recipient === "self" ? "yourself" : `@${receiverId}`
        toast.success(`🎁 Custom gift card created: ${customAmount} ${customCurrency} for ${recipientText}!`, {
          description: `Cost: ${price} $SPLIT tokens`,
          duration: 5000,
        })
      } else if (card) {
        if (card.price > userTokens) {
          toast.error("Insufficient $SPLIT tokens")
          setIsPurchasing(false)
          return
        }
        setUserTokens((prev) => prev - card.price)
        const recipientText = recipient === "self" ? "yourself" : `@${receiverId}`
        toast.success(`🎁 Gift card purchased: ${card.amount} ${card.currency} for ${recipientText}!`, {
          description: `Cost: ${card.price} $SPLIT tokens ${card.discount ? `(${card.discount}% discount applied!)` : ""}`,
          duration: 5000,
        })
      }
      setIsPurchasing(false)
      setPurchaseProgress(0)
    }, 2000)
  }

  const redeemGiftCard = (giftCard: UserGiftCard) => {
    setUserGiftCards((prev) => prev.map((gc) => (gc.id === giftCard.id ? { ...gc, redeemed: true } : gc)))
    toast.success(`🎉 Gift card redeemed: ${giftCard.amount} ${giftCard.currency}!`, {
      description: `Added to your wallet balance`,
      duration: 5000,
    })
  }

  const canPurchase = (price: number) => {
    if (price > userTokens) return false
    if (recipient === "other" && (!receiverId || idValidation !== "valid")) return false
    return true
  }

  const getCardGradient = (card: GiftCard) => {
    if (card.premium) return "from-purple-600 via-pink-600 to-yellow-500"
    if (card.popular) return "from-blue-600 to-purple-600"
    return "from-gray-600 to-gray-800"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-yellow-50">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <Gift className="w-6 h-6 text-purple-600" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Gift Cards
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge
              variant="outline"
              className="bg-gradient-to-r from-purple-100 to-yellow-100 text-purple-700 border-purple-200"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              {userTokens.toLocaleString()} $SPLIT
            </Badge>
            {isPurchasing && (
              <div className="flex items-center space-x-2">
                <div className="w-20">
                  <Progress value={purchaseProgress} className="h-2" />
                </div>
                <span className="text-sm text-purple-600">Processing...</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="relative container mx-auto px-4 py-8 max-w-6xl">
        <Tabs defaultValue="buy" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/50 backdrop-blur-sm">
            <TabsTrigger
              value="buy"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
            >
              <Gift className="w-4 h-4 mr-2" />
              Buy Gift Cards
            </TabsTrigger>
            <TabsTrigger
              value="redeem"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              My Gift Cards
            </TabsTrigger>
          </TabsList>

          <TabsContent value="buy" className="space-y-6">
            {/* Recipient Selection */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-600" />
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Who is this gift card for?
                  </span>
                </CardTitle>
                <CardDescription>Choose whether to buy for yourself or send to someone else</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={recipient} onValueChange={setRecipient}>
                  <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-purple-50 transition-colors">
                    <RadioGroupItem value="self" id="self" />
                    <Label htmlFor="self" className="flex items-center cursor-pointer">
                      <User className="w-4 h-4 mr-2 text-purple-600" />
                      For myself
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg hover:bg-purple-50 transition-colors">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="flex items-center cursor-pointer">
                      <Gift className="w-4 h-4 mr-2 text-pink-600" />
                      Send to someone else
                    </Label>
                  </div>
                </RadioGroup>

                {recipient === "other" && (
                  <div className="space-y-2 mt-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <Label htmlFor="receiverId">Receiver's SplitChain ID</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="receiverId"
                        placeholder="Enter username (e.g., alice, bob123)"
                        value={receiverId}
                        onChange={(e) => {
                          setReceiverId(e.target.value)
                          setIdValidation(null)
                        }}
                        onBlur={() => validateReceiverId(receiverId)}
                        className={
                          idValidation === "valid"
                            ? "border-green-500 bg-green-50"
                            : idValidation === "invalid"
                              ? "border-red-500 bg-red-50"
                              : "bg-white"
                        }
                      />
                      <Button
                        variant="outline"
                        onClick={() => validateReceiverId(receiverId)}
                        disabled={!receiverId || isValidatingId}
                        className="bg-white"
                      >
                        {isValidatingId ? "Checking..." : "Verify"}
                      </Button>
                    </div>
                    {idValidation === "valid" && (
                      <p className="text-sm text-green-600 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Valid SplitChain ID
                      </p>
                    )}
                    {idValidation === "invalid" && (
                      <p className="text-sm text-red-600 flex items-center">
                        <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                        Invalid or not found
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preset Gift Cards */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Popular Gift Cards
                  </span>
                </CardTitle>
                <CardDescription>
                  Choose from our most popular gift card denominations with exclusive discounts!
                  {recipient === "other" && receiverId && (
                    <span className="block mt-1 text-purple-600 font-medium">Sending to: @{receiverId}</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {presetGiftCards.map((card) => {
                    const Icon = card.icon
                    const canBuy = canPurchase(card.price)
                    const originalPrice = Math.floor(card.price / (1 - (card.discount || 0) / 100))

                    return (
                      <Card
                        key={card.id}
                        className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                          selectedCard === card.id ? "ring-2 ring-purple-500 shadow-lg" : ""
                        } ${!canBuy ? "opacity-60" : ""} ${
                          card.premium
                            ? "bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 border-2 border-purple-300"
                            : card.popular
                              ? "bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300"
                              : "bg-white/80 backdrop-blur-sm"
                        }`}
                        onClick={() => canBuy && setSelectedCard(card.id)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Icon
                                className={`w-6 h-6 ${
                                  card.premium ? "text-purple-600" : card.popular ? "text-blue-600" : "text-gray-600"
                                }`}
                              />
                              {card.premium && <Crown className="w-4 h-4 text-yellow-500" />}
                            </div>
                            <div className="flex flex-col items-end">
                              {card.popular && <Badge className="bg-blue-600 text-xs mb-1">Popular</Badge>}
                              {card.premium && (
                                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-xs mb-1">
                                  Premium
                                </Badge>
                              )}
                              {card.discount && (
                                <Badge
                                  variant="outline"
                                  className="bg-green-100 text-green-700 border-green-300 text-xs"
                                >
                                  -{card.discount}%
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-2xl font-bold mb-1">
                            {card.amount} {card.currency}
                          </div>
                          <div className="flex items-center space-x-2 mb-3">
                            <span className="text-lg font-bold text-purple-600">{card.price} $SPLIT</span>
                            {card.discount && (
                              <span className="text-sm text-gray-500 line-through">{originalPrice}</span>
                            )}
                          </div>
                          <Button
                            className={`w-full transition-all duration-300 ${
                              card.premium
                                ? "bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-500 hover:from-purple-700 hover:via-pink-700 hover:to-yellow-600"
                                : card.popular
                                  ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                                  : canBuy
                                    ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                    : "bg-gray-400"
                            } text-white`}
                            disabled={!canBuy || isPurchasing}
                            onClick={(e) => {
                              e.stopPropagation()
                              purchaseGiftCard(card)
                            }}
                          >
                            {card.price > userTokens
                              ? "Insufficient Tokens"
                              : recipient === "other" && (!receiverId || idValidation !== "valid")
                                ? "Enter Valid Receiver ID"
                                : isPurchasing
                                  ? "Processing..."
                                  : "Purchase"}
                          </Button>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Custom Gift Card */}
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-green-600" />
                  <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    Create Custom Gift Card
                  </span>
                </CardTitle>
                <CardDescription>
                  Create a gift card with your preferred amount and currency
                  {recipient === "other" && receiverId && (
                    <span className="block mt-1 text-purple-600 font-medium">Sending to: @{receiverId}</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customAmount">Amount</Label>
                    <Input
                      id="customAmount"
                      type="number"
                      placeholder="0.00"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="bg-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select value={customCurrency} onValueChange={setCustomCurrency}>
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USDC">
                          <div className="flex items-center">
                            <Coins className="w-4 h-4 mr-2" />
                            USDC
                          </div>
                        </SelectItem>
                        <SelectItem value="ckBTC">
                          <div className="flex items-center">
                            <Bitcoin className="w-4 h-4 mr-2" />
                            ckBTC
                          </div>
                        </SelectItem>
                        <SelectItem value="ETH">
                          <div className="flex items-center">
                            <Zap className="w-4 h-4 mr-2" />
                            ETH
                          </div>
                        </SelectItem>
                        <SelectItem value="ICP">
                          <div className="flex items-center">
                            <Crown className="w-4 h-4 mr-2" />
                            ICP
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {customAmount && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium text-lg">
                          {customAmount} {customCurrency} Gift Card
                        </span>
                        {recipient === "other" && receiverId && (
                          <span className="block text-sm text-purple-600">for @{receiverId}</span>
                        )}
                      </div>
                      <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {calculateCustomPrice().toLocaleString()} $SPLIT
                      </span>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white text-lg py-3"
                  disabled={!customAmount || !canPurchase(calculateCustomPrice()) || isPurchasing}
                  onClick={() => purchaseGiftCard(null, true)}
                >
                  {!customAmount
                    ? "Enter Amount"
                    : calculateCustomPrice() > userTokens
                      ? "Insufficient $SPLIT Tokens"
                      : recipient === "other" && (!receiverId || idValidation !== "valid")
                        ? "Enter Valid Receiver ID"
                        : isPurchasing
                          ? "Processing..."
                          : `Create for ${calculateCustomPrice().toLocaleString()} $SPLIT`}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="redeem" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-purple-600" />
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Your Gift Cards
                  </span>
                </CardTitle>
                <CardDescription>Redeem your purchased gift cards and gifts received from others</CardDescription>
              </CardHeader>
              <CardContent>
                {userGiftCards.length > 0 ? (
                  <div className="space-y-4">
                    {userGiftCards.map((giftCard) => (
                      <Card
                        key={giftCard.id}
                        className={`transition-all duration-300 ${
                          giftCard.redeemed
                            ? "bg-gray-50 opacity-60"
                            : "bg-gradient-to-r from-purple-50 to-pink-50 hover:shadow-lg"
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                                  giftCard.redeemed ? "bg-gray-200" : "bg-gradient-to-r from-purple-600 to-pink-600"
                                }`}
                              >
                                <Gift className={`w-6 h-6 ${giftCard.redeemed ? "text-gray-500" : "text-white"}`} />
                              </div>
                              <div>
                                <div className="font-bold text-lg">
                                  {giftCard.amount} {giftCard.currency}
                                </div>
                                <div className="text-sm text-gray-600">
                                  From: @{giftCard.from} • {giftCard.createdAt}
                                </div>
                                <div className="text-xs text-gray-500 font-mono">{giftCard.code}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {giftCard.redeemed ? (
                                <Badge className="bg-green-100 text-green-700">✓ Redeemed</Badge>
                              ) : (
                                <Button
                                  onClick={() => redeemGiftCard(giftCard)}
                                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                                >
                                  <Flame className="w-4 h-4 mr-2" />
                                  Redeem
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="w-10 h-10 text-purple-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Gift Cards Yet</h3>
                    <p className="text-gray-600 mb-4">
                      Purchase gift cards or receive them from friends to see them here
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const buyTab = document.querySelector('[value="buy"]') as HTMLElement
                        buyTab?.click()
                      }}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      Browse Gift Cards
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Exchange Rates */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Current Exchange Rates
            </CardTitle>
            <CardDescription>$SPLIT token exchange rates for gift cards (discounts included)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                <Coins className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="font-medium">USDC</div>
                <div className="text-sm text-gray-600">10 $SPLIT = 1 USDC</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                <Bitcoin className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <div className="font-medium">ckBTC</div>
                <div className="text-sm text-gray-600">4M $SPLIT = 1 ckBTC</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <Zap className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="font-medium">ETH</div>
                <div className="text-sm text-gray-600">250k $SPLIT = 1 ETH</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg border border-indigo-200">
                <Crown className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                <div className="font-medium">ICP</div>
                <div className="text-sm text-gray-600">95 $SPLIT = 1 ICP</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
