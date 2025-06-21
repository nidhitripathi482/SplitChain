import { AuthClient } from "@dfinity/auth-client"
import { Actor, HttpAgent } from "@dfinity/agent"
import type { Principal } from "@dfinity/principal"

// Real ICP Ledger IDL
const icpLedgerIdl = ({ IDL }: any) => {
  const Tokens = IDL.Record({ e8s: IDL.Nat64 })
  const TimeStamp = IDL.Record({ timestamp_nanos: IDL.Nat64 })
  const AccountIdentifier = IDL.Vec(IDL.Nat8)
  const SubAccount = IDL.Vec(IDL.Nat8)
  const BlockIndex = IDL.Nat64
  const Memo = IDL.Nat64

  const TransferArgs = IDL.Record({
    memo: Memo,
    amount: Tokens,
    fee: Tokens,
    from_subaccount: IDL.Opt(SubAccount),
    to: AccountIdentifier,
    created_at_time: IDL.Opt(TimeStamp),
  })

  const TransferError = IDL.Variant({
    BadFee: IDL.Record({ expected_fee: Tokens }),
    InsufficientFunds: IDL.Record({ balance: Tokens }),
    TxTooOld: IDL.Record({ allowed_window_nanos: IDL.Nat64 }),
    TxCreatedInFuture: IDL.Null,
    TxDuplicate: IDL.Record({ duplicate_of: BlockIndex }),
  })

  const TransferResult = IDL.Variant({
    Ok: BlockIndex,
    Err: TransferError,
  })

  return IDL.Service({
    transfer: IDL.Func([TransferArgs], [TransferResult], []),
    account_balance: IDL.Func([IDL.Record({ account: AccountIdentifier })], [Tokens], ["query"]),
  })
}

export interface ICPWallet {
  principal: Principal
  accountId: string
  balance: number
  connected: boolean
  authClient: AuthClient
}

export interface PaymentSession {
  id: string
  name: string
  description: string
  totalAmount: number
  currency: string
  creatorEmail: string
  creatorName: string
  participants: Participant[]
  status: "active" | "completed" | "expired"
  createdAt: string
  expiresAt: string
  qrCode: string
}

export interface Participant {
  email: string
  name: string
  amount: number
  status: "pending" | "paid" | "claimed"
  claimCode?: string
  paidAt?: string
  transactionId?: string
}

class ICPWalletService {
  private authClient: AuthClient | null = null
  private icpActor: any = null
  private wallet: ICPWallet | null = null

  // Real ICP Ledger Canister ID
  private readonly ICP_LEDGER_CANISTER_ID = "rrkah-fqaaa-aaaaa-aaaaq-cai"

  async connectWallet(): Promise<ICPWallet | null> {
    try {
      this.authClient = await AuthClient.create()

      return new Promise((resolve) => {
        this.authClient!.login({
          identityProvider:
            process.env.NEXT_PUBLIC_DFX_NETWORK === "local"
              ? `http://localhost:4943/?canisterId=${process.env.NEXT_PUBLIC_INTERNET_IDENTITY_CANISTER_ID}`
              : "https://identity.ic0.app",
          maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days
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
              canisterId: this.ICP_LEDGER_CANISTER_ID,
            })

            // Get balance
            const balance = await this.getBalance(accountId)

            this.wallet = {
              principal,
              accountId,
              balance,
              connected: true,
              authClient: this.authClient!,
            }

            resolve(this.wallet)
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

  async getBalance(accountId?: string): Promise<number> {
    try {
      if (!this.icpActor) return 0

      const account = accountId || this.wallet?.accountId
      if (!account) return 0

      const accountBytes = this.hexToBytes(account)
      const result = await this.icpActor.account_balance({ account: accountBytes })
      return Number(result.e8s) / 100000000 // Convert e8s to ICP
    } catch (error) {
      console.error("Balance fetch error:", error)
      return 0
    }
  }

  async sendPayment(toAccountId: string, amount: number, memo = ""): Promise<string | null> {
    try {
      if (!this.icpActor || !this.wallet) return null

      const toBytes = this.hexToBytes(toAccountId)
      const amountE8s = Math.floor(amount * 100000000) // Convert ICP to e8s
      const feeE8s = 10000 // 0.0001 ICP fee

      const transferArgs = {
        memo: BigInt(memo ? this.stringToMemo(memo) : 0),
        amount: { e8s: BigInt(amountE8s) },
        fee: { e8s: BigInt(feeE8s) },
        from_subaccount: [],
        to: toBytes,
        created_at_time: [{ timestamp_nanos: BigInt(Date.now() * 1000000) }],
      }

      const result = await this.icpActor.transfer(transferArgs)

      if ("Ok" in result) {
        return result.Ok.toString()
      } else {
        console.error("Transfer failed:", result.Err)
        return null
      }
    } catch (error) {
      console.error("Payment error:", error)
      return null
    }
  }

  // Create payment session with QR code
  createPaymentSession(
    name: string,
    description: string,
    totalAmount: number,
    participants: { email: string; name: string }[],
    creatorEmail: string,
    creatorName: string,
  ): PaymentSession {
    const sessionId = `SPLIT-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`
    const amountPerPerson = totalAmount / participants.length

    const session: PaymentSession = {
      id: sessionId,
      name,
      description,
      totalAmount,
      currency: "ICP",
      creatorEmail,
      creatorName,
      participants: participants.map((p) => ({
        ...p,
        amount: amountPerPerson,
        status: "pending",
        claimCode: this.generateClaimCode(),
      })),
      status: "active",
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      qrCode: this.generateQRCode(sessionId),
    }

    // Store session
    this.saveSession(session)
    return session
  }

  // Generate QR code data
  private generateQRCode(sessionId: string): string {
    const qrData = {
      type: "splitchain_session",
      sessionId,
      url: `${typeof window !== "undefined" ? window.location.origin : ""}/join/${sessionId}`,
    }
    return JSON.stringify(qrData)
  }

  // Generate unique claim code
  private generateClaimCode(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  // Save session to localStorage (in production, use backend)
  private saveSession(session: PaymentSession): void {
    const sessions = this.getSessions()
    sessions[session.id] = session
    localStorage.setItem("splitchain_sessions", JSON.stringify(sessions))
  }

  // Get all sessions
  getSessions(): Record<string, PaymentSession> {
    if (typeof window === "undefined") return {}
    const stored = localStorage.getItem("splitchain_sessions")
    return stored ? JSON.parse(stored) : {}
  }

  // Get specific session
  getSession(sessionId: string): PaymentSession | null {
    const sessions = this.getSessions()
    return sessions[sessionId] || null
  }

  // Join session
  joinSession(sessionId: string, email: string, name: string): boolean {
    const session = this.getSession(sessionId)
    if (!session) return false

    // Check if already joined
    const existingParticipant = session.participants.find((p) => p.email === email)
    if (existingParticipant) return true

    // Add participant
    session.participants.push({
      email,
      name,
      amount: session.totalAmount / (session.participants.length + 1),
      status: "pending",
      claimCode: this.generateClaimCode(),
    })

    // Recalculate amounts
    const amountPerPerson = session.totalAmount / session.participants.length
    session.participants.forEach((p) => {
      p.amount = amountPerPerson
    })

    this.saveSession(session)
    return true
  }

  // Process payment for participant
  async processPayment(sessionId: string, participantEmail: string): Promise<boolean> {
    const session = this.getSession(sessionId)
    if (!session || !this.wallet) return false

    const participant = session.participants.find((p) => p.email === participantEmail)
    if (!participant) return false

    // In production, you would send payment to creator's wallet
    // For demo, we'll just mark as paid
    participant.status = "paid"
    participant.paidAt = new Date().toISOString()
    participant.transactionId = `TXN-${Date.now()}`

    this.saveSession(session)
    return true
  }

  // Utility functions
  private principalToAccountId(principal: Principal): string {
    const bytes = principal.toUint8Array()
    // Simplified account ID generation (use proper implementation in production)
    return Array.from(bytes)
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

  private stringToMemo(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }

  async disconnect(): Promise<void> {
    if (this.authClient) {
      await this.authClient.logout()
      this.authClient = null
      this.icpActor = null
      this.wallet = null
    }
  }

  getWallet(): ICPWallet | null {
    return this.wallet
  }
}

export const icpWalletService = new ICPWalletService()
