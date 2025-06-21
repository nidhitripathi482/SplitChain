import { AuthClient } from "@dfinity/auth-client"
import { Actor, HttpAgent } from "@dfinity/agent"
import type { Principal } from "@dfinity/principal"

// ICP Ledger interface (simplified)
const icpLedgerIdl = ({ IDL }: any) => {
  return IDL.Service({
    transfer: IDL.Func(
      [
        IDL.Record({
          to: IDL.Vec(IDL.Nat8),
          fee: IDL.Record({ e8s: IDL.Nat64 }),
          memo: IDL.Nat64,
          from_subaccount: IDL.Opt(IDL.Vec(IDL.Nat8)),
          created_at_time: IDL.Opt(IDL.Record({ timestamp_nanos: IDL.Nat64 })),
          amount: IDL.Record({ e8s: IDL.Nat64 }),
        }),
      ],
      [IDL.Variant({ Ok: IDL.Nat64, Err: IDL.Text })],
      [],
    ),
    account_balance: IDL.Func(
      [IDL.Record({ account: IDL.Vec(IDL.Nat8) })],
      [IDL.Record({ e8s: IDL.Nat64 })],
      ["query"],
    ),
  })
}

export interface WalletInfo {
  principal: Principal
  accountId: string
  balance: number
  connected: boolean
}

export interface ClaimVoucher {
  id: string
  email: string
  name: string
  amount: number
  currency: string
  claimCode: string
  sessionName: string
  createdAt: string
  claimed: boolean
  claimedAt?: string
  recipientWallet?: string
}

class WalletService {
  private authClient: AuthClient | null = null
  private icpActor: any = null

  async connectWallet(): Promise<WalletInfo | null> {
    try {
      this.authClient = await AuthClient.create()

      return new Promise((resolve) => {
        this.authClient!.login({
          identityProvider:
            process.env.NEXT_PUBLIC_DFX_NETWORK === "local"
              ? `http://localhost:4943/?canisterId=${process.env.NEXT_PUBLIC_INTERNET_IDENTITY_CANISTER_ID}`
              : "https://identity.ic0.app",
          onSuccess: async () => {
            const identity = this.authClient!.getIdentity()
            const principal = identity.getPrincipal()
            const accountId = this.principalToAccountId(principal)

            // Create ICP ledger actor
            const agent = new HttpAgent({
              identity,
              host: process.env.NEXT_PUBLIC_DFX_NETWORK === "local" ? "http://localhost:4943" : "https://ic0.app",
            })

            if (process.env.NEXT_PUBLIC_DFX_NETWORK === "local") {
              await agent.fetchRootKey()
            }

            this.icpActor = Actor.createActor(icpLedgerIdl, {
              agent,
              canisterId: "rrkah-fqaaa-aaaaa-aaaaq-cai", // ICP Ledger canister ID
            })

            // Get balance
            const balance = await this.getBalance(accountId)

            const walletInfo: WalletInfo = {
              principal,
              accountId,
              balance,
              connected: true,
            }

            resolve(walletInfo)
          },
          onError: (error) => {
            console.error("Wallet connection failed:", error)
            resolve(null)
          },
        })
      })
    } catch (error) {
      console.error("Wallet connection error:", error)
      return null
    }
  }

  async getBalance(accountId: string): Promise<number> {
    try {
      if (!this.icpActor) return 0

      const accountBytes = this.hexToBytes(accountId)
      const result = await this.icpActor.account_balance({ account: accountBytes })
      return Number(result.e8s) / 100000000 // Convert e8s to ICP
    } catch (error) {
      console.error("Balance fetch error:", error)
      return 0
    }
  }

  async sendPayment(toAccountId: string, amount: number): Promise<boolean> {
    try {
      if (!this.icpActor) return false

      const toBytes = this.hexToBytes(toAccountId)
      const amountE8s = Math.floor(amount * 100000000) // Convert ICP to e8s

      const result = await this.icpActor.transfer({
        to: toBytes,
        fee: { e8s: 10000n }, // 0.0001 ICP fee
        memo: 0n,
        from_subaccount: [],
        created_at_time: [],
        amount: { e8s: BigInt(amountE8s) },
      })

      return "Ok" in result
    } catch (error) {
      console.error("Payment error:", error)
      return false
    }
  }

  // Generate claim vouchers for participants
  generateClaimVouchers(sessionName: string, participants: any[]): ClaimVoucher[] {
    return participants.map((participant) => ({
      id: `CLAIM-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      email: participant.email,
      name: participant.name,
      amount: participant.amount,
      currency: "ICP",
      claimCode: this.generateClaimCode(),
      sessionName,
      createdAt: new Date().toISOString(),
      claimed: false,
    }))
  }

  private generateClaimCode(): string {
    // Generate a unique 8-character claim code
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  private principalToAccountId(principal: Principal): string {
    // Simplified account ID generation (in production, use proper implementation)
    const principalBytes = principal.toUint8Array()
    return Array.from(principalBytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  }

  private hexToBytes(hex: string): number[] {
    const bytes = []
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(Number.parseInt(hex.substr(i, 2), 16))
    }
    return bytes
  }

  async disconnect(): Promise<void> {
    if (this.authClient) {
      await this.authClient.logout()
      this.authClient = null
      this.icpActor = null
    }
  }
}

export const walletService = new WalletService()
