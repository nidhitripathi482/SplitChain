"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Receipt, Users, Plus } from "lucide-react"

export default function CreateSplit() {
  const [expenseName, setExpenseName] = useState("")
  const [totalAmount, setTotalAmount] = useState("")
  const [participants, setParticipants] = useState<string[]>([])
  const [newParticipant, setNewParticipant] = useState("")

  const addParticipant = () => {
    if (newParticipant && !participants.includes(newParticipant)) {
      setParticipants([...participants, newParticipant])
      setNewParticipant("")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => (window.location.href = "/dashboard")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-xl font-bold">Create Split</h1>
          </div>
          <Badge variant="outline">Reimbursement</Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Receipt className="w-8 h-8 text-white" />
            </div>
            <CardTitle>Create a Split</CardTitle>
            <CardDescription>Get reimbursed for expenses you've already paid</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="expenseName">Expense Description</Label>
              <Input
                id="expenseName"
                placeholder="e.g., Group dinner, Uber ride, etc."
                value={expenseName}
                onChange={(e) => setExpenseName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalAmount">Total Amount You Paid</Label>
              <Input
                id="totalAmount"
                type="number"
                placeholder="0.00"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <Label>Add People Who Owe You</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter username"
                  value={newParticipant}
                  onChange={(e) => setNewParticipant(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addParticipant()}
                />
                <Button onClick={addParticipant} disabled={!newParticipant}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {participants.length > 0 && (
                <div className="space-y-2">
                  {participants.map((participant, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <span className="font-medium">{participant}</span>
                      <Badge variant="outline">
                        {totalAmount ? (Number.parseFloat(totalAmount) / participants.length).toFixed(6) : "0.00"} USDC
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Split Summary</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Total Amount:</span>
                  <span className="font-medium">${totalAmount || "0.00"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Number of People:</span>
                  <span>{participants.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Amount per Person:</span>
                  <span className="font-medium">
                    {totalAmount && participants.length
                      ? (Number.parseFloat(totalAmount) / participants.length).toFixed(6)
                      : "0.00"}{" "}
                    USDC
                  </span>
                </div>
              </div>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-purple-600 to-yellow-500"
              disabled={!expenseName || !totalAmount || participants.length === 0}
            >
              <Users className="w-4 h-4 mr-2" />
              Create Split & Send Requests
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
