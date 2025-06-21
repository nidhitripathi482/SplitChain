"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  Plus,
  Wallet,
  TrendingUp,
  Gift,
  Store,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
  Zap,
  Crown,
  Sparkles,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react"

interface Transaction {
  id: string
  type: "sent" | "received" | "split" | "gift"
  amount: number
  currency: string
  from?: string
  to?: string
  description: string
  status: "completed" | "pending" | "failed"
  timestamp: string
}

interface Session {
  id: string
  title: string
  amount: number
  currency: string
  participants: number
  status: "active" | "completed" | "pending"
  createdAt: string
}

const mockTransactions: Transaction[] = [
  {
    id: "tx-1",
    type: "received",
    amount: 25.5,
    currency: "USDC",
    from: "alice_crypto",
    description: "Dinner split payment",
    status: "completed",
    timestamp: "2024-01-15T10:30:00Z",
  },
  {
    id: "tx-2",
    type: "sent",
    amount: 0.001,
    currency: "ckBTC",
    to: "bob_icp",
    description: "Coffee payment",
    status: "completed",
    timestamp: "2024-01-15T09:15:00Z",
  },
  {
    id: "tx-3",
    type: "gift",
    amount: 10,
    currency: "ICP",
    from: "charlie_dev",
    description: "Birthday gift card",
    status: "completed",
    timestamp: "2024-01-14T16:45:00Z",
  },
  {
    id: "tx-4",
    type: "split",
    amount: 120.0,
    currency: "USDC",
    description: "Group dinner - 4 people",
    status: "pending",
    timestamp: "2024-01-14T20:00:00Z",
  },
]

const mockSessions: Session[] = [
  {
    id: "SPLIT-2024-123456",
    title: "Weekend Trip Expenses",
    amount: 450.0,
    currency: "USDC",
    participants: 4,
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "SPLIT-2024-789012",
    title: "Restaurant Bill",
    amount: 85.5,
    currency: "USDC",
    participants: 3,
    status: "completed",
    createdAt: "2024-01-14",
  },
  {
    id: "SPLIT-2024-345678",
    title: "Concert Tickets",
    amount: 0.05,
    currency: "ckBTC",
    participants: 6,
    status: "pending",
    createdAt: "2024-01-13",
  },
]

export default function Dashboard() {
  const { authState, logout } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)
  const [transactions] = useState<Transaction[]>(mockTransactions)
  const [sessions] = useState<Session[]>(mockSessions)
  const [walletBalance] = useState({
    USDC: 1250.75,
    ckBTC: 0.0045,
    ETH: 0.85,
    ICP: 125.5,
    SPLIT: 15000,
  })

  useEffect(() => {
    if (!authState.isAuthenticated) {
      router.push("/")
      return
    }

    const storedUserData = localStorage.getItem("splitchain_user")
    if (!storedUserData) {
      router.push("/auth/setup")
      return
    }

    setUserData(JSON.parse(storedUserData))
    setIsLoading(false)
  }, [authState.isAuthenticated, router])

  const handleLogout = async () => {
    await logout()
    localStorage.removeItem("splitchain_user")
    router.push("/")
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "sent":
        return <ArrowUpRight className="w-4 h-4 text-red-500" />
      case "received":
        return <ArrowDownRight className="w-4 h-4 text-green-500" />
      case "split":
        return <Users className="w-4 h-4 text-blue-500" />
      case "gift":
        return <Gift className="w-4 h-4 text-purple-500" />
      default:
        return <Coins className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Loader2 className="w-4 h-4 text-gray-500 animate-spin" />
    }
  }

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-yellow-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
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
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-yellow-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">SC</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-yellow-500 bg-clip-text text-transparent">
                SplitChain Pay
              </h1>
              <p className="text-sm text-gray-600">Welcome back, {userData?.username}!</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Badge
              variant="outline"
              className="bg-gradient-to-r from-purple-100 to-yellow-100 text-purple-700 border-purple-200"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              {walletBalance.SPLIT.toLocaleString()} $SPLIT
            </Badge>
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="relative container mx-auto px-4 py-8 max-w-7xl">
        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Button
            onClick={() => router.push("/create")}
            className="h-20 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white flex-col space-y-2"
          >
            <Plus className="w-6 h-6" />
            <span>Create Split</span>
          </Button>
          <Button
            onClick={() => router.push("/pay/friend")}
            variant="outline"
            className="h-20 bg-white/70 backdrop-blur-sm hover:bg-white/90 flex-col space-y-2"
          >
            <Users className="w-6 h-6 text-blue-600" />
            <span>Pay Friend</span>
          </Button>
          <Button
            onClick={() => router.push("/gift-cards")}
            variant="outline"
            className="h-20 bg-white/70 backdrop-blur-sm hover:bg-white/90 flex-col space-y-2"
          >
            <Gift className="w-6 h-6 text-purple-600" />
            <span>Gift Cards</span>
          </Button>
          <Button
            onClick={() => router.push("/pay/merchant")}
            variant="outline"
            className="h-20 bg-white/70 backdrop-blur-sm hover:bg-white/90 flex-col space-y-2"
          >
            <Store className="w-6 h-6 text-green-600" />
            <span>Pay Merchant</span>
          </Button>
        </div>

        {/* Wallet Balance */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wallet className="w-5 h-5 mr-2 text-purple-600" />
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Wallet Balance
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg">
                <Coins className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{walletBalance.USDC}</div>
                <div className="text-sm text-gray-600">USDC</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg">
                <div className="w-6 h-6 bg-orange-500 rounded-full mx-auto mb-2 flex items-center justify-center text-white text-xs font-bold">
                  ₿
                </div>
                <div className="text-2xl font-bold text-orange-600">{walletBalance.ckBTC}</div>
                <div className="text-sm text-gray-600">ckBTC</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                <Zap className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">{walletBalance.ETH}</div>
                <div className="text-sm text-gray-600">ETH</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg">
                <Crown className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-indigo-600">{walletBalance.ICP}</div>
                <div className="text-sm text-gray-600">ICP</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-100 to-yellow-100 rounded-lg">
                <Sparkles className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">{walletBalance.SPLIT.toLocaleString()}</div>
                <div className="text-sm text-gray-600">$SPLIT</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="activity" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur-sm">
            <TabsTrigger
              value="activity"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger
              value="sessions"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
            >
              <Users className="w-4 h-4 mr-2" />
              Sessions
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest transactions and payments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          {getTransactionIcon(tx.type)}
                        </div>
                        <div>
                          <div className="font-medium">{tx.description}</div>
                          <div className="text-sm text-gray-600">
                            {tx.type === "sent" && tx.to && `To: @${tx.to}`}
                            {tx.type === "received" && tx.from && `From: @${tx.from}`}
                            {tx.type === "gift" && tx.from && `From: @${tx.from}`}
                            {tx.type === "split" && "Split payment"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`font-bold ${
                              tx.type === "received" || tx.type === "gift" ? "text-green-600" : "text-gray-900"
                            }`}
                          >
                            {tx.type === "received" || tx.type === "gift" ? "+" : "-"}
                            {tx.amount} {tx.currency}
                          </span>
                          {getStatusIcon(tx.status)}
                        </div>
                        <div className="text-sm text-gray-500">{formatDate(tx.timestamp)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sessions">
            <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Split Sessions
                </CardTitle>
                <CardDescription>Manage your active and completed split sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="p-4 bg-white/50 rounded-lg hover:bg-white/70 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{session.title}</div>
                        <Badge
                          className={
                            session.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : session.status === "active"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                          }
                        >
                          {session.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center space-x-4">
                          <span>
                            {session.amount} {session.currency}
                          </span>
                          <span>{session.participants} participants</span>
                          <span>{session.createdAt}</span>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => router.push(`/session/${session.id}`)}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Monthly Spending
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>USDC</span>
                      <span className="font-bold">$1,245.50</span>
                    </div>
                    <Progress value={75} className="h-2" />
                    <div className="flex justify-between items-center">
                      <span>ckBTC</span>
                      <span className="font-bold">0.0125 BTC</span>
                    </div>
                    <Progress value={45} className="h-2" />
                    <div className="flex justify-between items-center">
                      <span>ICP</span>
                      <span className="font-bold">85.5 ICP</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    $SPLIT Rewards Earned
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-yellow-500 bg-clip-text text-transparent mb-2">
                      2,450
                    </div>
                    <div className="text-gray-600 mb-4">$SPLIT tokens earned this month</div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Transaction rewards</span>
                        <span className="text-green-600">+1,200</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Daily login bonus</span>
                        <span className="text-green-600">+750</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Referral bonus</span>
                        <span className="text-green-600">+500</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
