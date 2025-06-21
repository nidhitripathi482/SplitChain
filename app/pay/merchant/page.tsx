"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Store, Scan } from "lucide-react"

export default function PayMerchant() {
  const [merchantId, setMerchantId] = useState("")
  const [isScanning, setIsScanning] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => (window.location.href = "/dashboard")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-bold">Pay Merchant</h1>
          </div>
          <Badge variant="outline">Quick Pay</Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8 text-white" />
            </div>
            <CardTitle>Pay a Merchant</CardTitle>
            <CardDescription>Scan QR code or enter merchant ID to make a crypto payment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Button
                variant="outline"
                className="w-full h-16 border-2 border-dashed"
                onClick={() => setIsScanning(true)}
              >
                <div className="text-center">
                  <Scan className="w-6 h-6 mx-auto mb-2" />
                  <span>Scan Merchant QR Code</span>
                </div>
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-50 px-2 text-gray-500">Or</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="merchantId">Merchant ID</Label>
                <Input
                  id="merchantId"
                  placeholder="Enter merchant unique ID"
                  value={merchantId}
                  onChange={(e) => setMerchantId(e.target.value)}
                />
              </div>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-purple-600 to-yellow-500"
              disabled={!merchantId && !isScanning}
            >
              Continue to Payment
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
