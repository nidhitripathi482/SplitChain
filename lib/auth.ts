import { AuthClient } from "@dfinity/auth-client"
import { Actor, HttpAgent } from "@dfinity/agent"
import type { Principal } from "@dfinity/principal"

export interface AuthState {
  isAuthenticated: boolean
  principal: Principal | null
  identity: any | null
  authClient: AuthClient | null
}

class AuthService {
  private authClient: AuthClient | null = null
  private actor: any = null

  async init(): Promise<AuthClient> {
    if (!this.authClient) {
      this.authClient = await AuthClient.create({
        idleOptions: {
          disableIdle: true,
          disableDefaultIdleCallback: true,
        },
      })
    }
    return this.authClient
  }

  async login(): Promise<boolean> {
    const authClient = await this.init()

    return new Promise((resolve) => {
      authClient.login({
        identityProvider:
          process.env.NEXT_PUBLIC_DFX_NETWORK === "local"
            ? `http://localhost:4943/?canisterId=${process.env.NEXT_PUBLIC_INTERNET_IDENTITY_CANISTER_ID}`
            : "https://identity.ic0.app",
        onSuccess: () => {
          resolve(true)
        },
        onError: (error) => {
          console.error("Login failed:", error)
          resolve(false)
        },
      })
    })
  }

  async logout(): Promise<void> {
    const authClient = await this.init()
    await authClient.logout()
    this.actor = null
  }

  async isAuthenticated(): Promise<boolean> {
    const authClient = await this.init()
    return await authClient.isAuthenticated()
  }

  async getIdentity() {
    const authClient = await this.init()
    return authClient.getIdentity()
  }

  async getPrincipal(): Promise<Principal | null> {
    const authClient = await this.init()
    const identity = authClient.getIdentity()
    return identity.getPrincipal()
  }

  async createActor(canisterId: string, idlFactory: any) {
    const authClient = await this.init()
    const identity = authClient.getIdentity()

    const agent = new HttpAgent({
      identity,
      host: process.env.NEXT_PUBLIC_DFX_NETWORK === "local" ? "http://localhost:4943" : "https://ic0.app",
    })

    if (process.env.NEXT_PUBLIC_DFX_NETWORK === "local") {
      await agent.fetchRootKey()
    }

    this.actor = Actor.createActor(idlFactory, {
      agent,
      canisterId,
    })

    return this.actor
  }
}

export const authService = new AuthService()
