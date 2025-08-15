// YouTube API with OAuth authentication
export class YouTubeAuthService {
  private static instance: YouTubeAuthService
  private accessToken: string | null = null
  private isInitialized = false

  private constructor() {}

  static getInstance(): YouTubeAuthService {
    if (!YouTubeAuthService.instance) {
      YouTubeAuthService.instance = new YouTubeAuthService()
    }
    return YouTubeAuthService.instance
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // Load Google API script
      await this.loadGoogleAPI()

      // Initialize Google API client
      await window.gapi.load("auth2", () => {
        window.gapi.auth2.init({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          scope: "https://www.googleapis.com/auth/youtube.readonly",
        })
      })

      this.isInitialized = true
    } catch (error) {
      console.error("[v0] Failed to initialize YouTube Auth:", error)
      throw error
    }
  }

  private loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.gapi) {
        resolve()
        return
      }

      const script = document.createElement("script")
      script.src = "https://apis.google.com/js/api.js"
      script.onload = () => resolve()
      script.onerror = () => reject(new Error("Failed to load Google API"))
      document.head.appendChild(script)
    })
  }

  async signIn(): Promise<boolean> {
    try {
      await this.initialize()

      const authInstance = window.gapi.auth2.getAuthInstance()
      const user = await authInstance.signIn()

      this.accessToken = user.getAuthResponse().access_token
      return true
    } catch (error) {
      console.error("[v0] YouTube sign-in failed:", error)
      return false
    }
  }

  async searchVideos(query: string, maxResults = 10): Promise<any[]> {
    if (!this.accessToken) {
      const signedIn = await this.signIn()
      if (!signedIn) {
        throw new Error("Authentication required")
      }
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?` +
          `part=snippet&q=${encodeURIComponent(query)}&` +
          `maxResults=${maxResults}&type=video&` +
          `key=${import.meta.env.VITE_YOUTUBE_API_KEY}`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`)
      }

      const data = await response.json()
      return data.items || []
    } catch (error) {
      console.error("[v0] YouTube search failed:", error)
      throw error
    }
  }

  isAuthenticated(): boolean {
    return !!this.accessToken
  }

  signOut(): void {
    this.accessToken = null
    if (window.gapi?.auth2) {
      window.gapi.auth2.getAuthInstance().signOut()
    }
  }
}

// Global type declarations
declare global {
  interface Window {
    gapi: any
  }
}
