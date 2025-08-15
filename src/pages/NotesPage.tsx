"use client"

import { useState, useEffect } from "react"
import { FileText, Youtube } from "lucide-react"
import { generateContent } from "../lib/gemini" // This actually uses Groq API
import { db } from "../lib/firebase"
import { collection, addDoc, getDocs, query, orderBy, where } from "firebase/firestore"
import { useAuthStore } from "../lib/store"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"

export function NotesPage() {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [transcribing, setTranscribing] = useState(false)
  const [videoUrl, setVideoUrl] = useState("")
  const [videoId, setVideoId] = useState("")
  const [transcript, setTranscript] = useState("")
  const [videoData, setVideoData] = useState<{ title: string; description: string } | null>(null)
  const [notes, setNotes] = useState("")
  const [error, setError] = useState("")
  const [viewRaw, setViewRaw] = useState(false)
  const [lastApiCall, setLastApiCall] = useState<number>(0)
  const [apiCallCount, setApiCallCount] = useState<number>(0)

  interface Note {
    id: string
    videoUrl: string
    videoTitle?: string
    notes: string
    timestamp: { toDate: () => Date }
  }

  const [savedNotes, setSavedNotes] = useState<Note[]>([])

  useEffect(() => {
    if (user) {
      fetchNotes()
    }
  }, [user])

  useEffect(() => {
    if (videoUrl) {
      const id = extractVideoId(videoUrl)
      setVideoId(id || "")

      if (id) {
        fetchVideoData(id)
      }
    } else {
      setVideoId("")
      setVideoData(null)
    }
  }, [videoUrl])

  const extractVideoId = (url: string): string | null => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[7].length === 11 ? match[7] : null
  }

  const fetchVideoData = async (id: string) => {
    try {
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY
      if (!apiKey) {
        console.warn("YouTube API key is missing")
        return
      }

      const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${id}&key=${apiKey}`)

      if (!response.ok) {
        throw new Error("Failed to fetch video data")
      }

      const data = await response.json()

      if (data.items && data.items.length > 0) {
        const videoDetails = data.items[0].snippet
        setVideoData({
          title: videoDetails.title,
          description: videoDetails.description,
        })
      }
    } catch (err) {
      console.error("Error fetching video data:", err)
    }
  }

  const fetchNotes = async () => {
    if (!user) {
      console.log("[v0] No user logged in, skipping note fetch")
      return
    }

    if (!db) {
      console.error("[v0] Firestore not initialized")
      setError("Database connection not available")
      return
    }

    try {
      console.log("[v0] Fetching notes for user:", user.uid)
      const notesQuery = query(collection(db, "notes"), where("userId", "==", user.uid), orderBy("timestamp", "desc"))

      const querySnapshot = await getDocs(notesQuery)
      const notesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Note[]

      setSavedNotes(notesData)
      console.log("[v0] Successfully fetched", notesData.length, "notes")
    } catch (err: any) {
      console.error("[v0] Error fetching notes:", err)

      if (err.code === "permission-denied") {
        setError("Permission denied. Please make sure you're logged in.")
      } else if (err.code === "unavailable") {
        setError("Database temporarily unavailable. Please try again later.")
      } else {
        setError("Failed to fetch saved notes. Please refresh the page.")
      }
    }
  }

  const fetchTranscript = async () => {
    if (!videoId) {
      setError("Please enter a valid YouTube URL")
      return
    }

    setTranscribing(true)
    setError("")

    try {
      if (!videoData) {
        await fetchVideoData(videoId)
      }

      if (videoData) {
        const simulatedTranscript =
          `Since we don't have a backend server set up for transcript fetching, ` +
          `we're generating notes based on the video metadata.\n\n` +
          `Video Title: ${videoData.title}\n\n` +
          `Video Description:\n${videoData.description}\n\n`

        setTranscript(simulatedTranscript)
        return simulatedTranscript
      } else {
        throw new Error("No video data available")
      }
    } catch (err) {
      console.error("Error fetching transcript:", err)
      setError("Failed to fetch video transcript. Using available video metadata for note generation.")

      const fallbackTranscript =
        "Transcript could not be fetched.\n\n" +
        "For this demonstration, we'll generate notes based on the limited information available about this video."

      setTranscript(fallbackTranscript)
      return fallbackTranscript
    } finally {
      setTranscribing(false)
    }
  }

  const checkRateLimit = (): boolean => {
    const now = Date.now()
    const timeSinceLastCall = now - lastApiCall

    // Enforce minimum 10 seconds between API calls
    if (timeSinceLastCall < 10000) {
      const waitTime = Math.ceil((10000 - timeSinceLastCall) / 1000)
      setError(`Please wait ${waitTime} seconds before making another request to avoid quota limits.`)
      return false
    }

    // Reset daily counter at midnight
    const today = new Date().toDateString()
    const lastCallDate = new Date(lastApiCall).toDateString()
    if (today !== lastCallDate) {
      setApiCallCount(0)
    }

    // Check daily limit (conservative limit for free tier)
    if (apiCallCount >= 10) {
      setError("Daily API quota reached. Please try again tomorrow.")
      return false
    }

    return true
  }

  const generateNotes = async () => {
    if (!videoUrl.includes("youtube.com") && !videoUrl.includes("youtu.be")) {
      setError("Please enter a valid YouTube URL")
      return
    }

    if (!user) {
      setError("Please log in to generate and save notes")
      return
    }

    if (!db) {
      setError("Database connection not available. Notes cannot be saved.")
      return
    }

    if (!checkRateLimit()) {
      return
    }

    setLoading(true)
    setError("")

    try {
      let transcriptText = transcript

      if (!transcriptText) {
        setTranscribing(true)
        transcriptText = (await fetchTranscript()) || ""
        setTranscribing(false)
      }

      if (!videoData && videoId) {
        await fetchVideoData(videoId)
      }

      let prompt = `Generate detailed, structured notes from this YouTube video: ${videoUrl}\n\n`

      if (videoData) {
        prompt += `Video Title: ${videoData.title}\n\n`
        prompt += `Video Description: ${videoData.description.substring(0, 1000)}\n\n`
      }

      if (transcriptText) {
        prompt += `Transcript:\n${transcriptText.substring(0, 15000)}\n\n`
      }

      prompt += `
        Create comprehensive, well-organized notes with:
        1. Main topics and subtopics with clear headings (use # for main headings, ## for subheadings)
        2. Key points and important details under each topic (use bullet points with *)
        3. Important definitions, concepts, and examples (use bold for key terms with **)
        4. A summary of the main takeaways at the end
        
        Format the notes in proper Markdown with:
        - Use # for main headings
        - Use ## and ### for subheadings
        - Use * or - for bullet points
        - Use ** for bold text to emphasize important concepts
        - Use > for quotes or important callouts
        - Use \`code blocks\` for any code snippets or technical terms

        Keep the response concise but comprehensive. Limit to 2000 words maximum.`

      console.log("[v0] Making Groq API request for notes generation...")
      const generatedNotes = await generateContent(prompt)

      setLastApiCall(Date.now())
      setApiCallCount((prev) => prev + 1)

      setNotes(generatedNotes)
      console.log("[v0] Notes generated successfully using Groq API")

      try {
        console.log("[v0] Saving notes to Firestore for user:", user.uid)
        await addDoc(collection(db, "notes"), {
          videoUrl: videoUrl,
          videoTitle: videoData?.title || "Unknown Title",
          notes: generatedNotes,
          timestamp: new Date(),
          userId: user.uid,
          userEmail: user.email,
        })
        console.log("[v0] Notes saved successfully to Firestore")
        await fetchNotes()
      } catch (firestoreError: any) {
        console.error("[v0] Error saving notes to Firestore:", firestoreError)

        if (firestoreError.code === "permission-denied") {
          setError("Permission denied when saving notes. Please check your login status.")
        } else if (firestoreError.code === "unavailable") {
          setError("Database temporarily unavailable. Notes generated but not saved.")
        } else {
          setError("Notes generated successfully but couldn't be saved. Please try again.")
        }
      }
    } catch (err: any) {
      console.error("[v0] Error generating notes:", err)

      if (err.message?.includes("429")) {
        setError("API quota exceeded. Please wait before trying again. You can try again in a few minutes.")
      } else if (err.message?.includes("403")) {
        setError("API access denied. Please check your API key and permissions.")
      } else if (err.message?.includes("400")) {
        setError("Invalid request. The content might be too long or contain unsupported characters.")
      } else {
        setError("Failed to generate notes. Please try again with a shorter video or check your internet connection.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {!user ? (
        <div className="bg-[#B3D8A8]/10 backdrop-blur-lg rounded-xl p-6 border border-[#B3D8A8]/30 mb-8 shadow-lg text-center">
          <h2 className="text-xl font-semibold mb-4 text-[#B3D8A8]">Please log in to generate notes</h2>
          <p className="text-[#B3D8A8]/70">You need to be logged in to generate and save notes.</p>
        </div>
      ) : (
        <>
          <div className="bg-[#B3D8A8]/10 backdrop-blur-lg rounded-xl p-6 border border-[#B3D8A8]/30 mb-8 shadow-lg">
            <div className="flex items-center space-x-2 mb-4">
              <Youtube className="w-6 h-6 text-[#B3D8A8]" />
              <h1 className="text-2xl font-bold text-[#B3D8A8]">Generate Smart Notes</h1>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[#B3D8A8]">YouTube URL</label>
                <input
                  type="text"
                  placeholder="Enter YouTube video URL"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[#B3D8A8]/5 border border-[#B3D8A8]/30 focus:border-[#82A878] focus:outline-none transition-all focus:ring-2 focus:ring-[#B3D8A8]/20"
                />
              </div>

              {videoId && (
                <div className="bg-[#B3D8A8]/5 p-4 rounded-lg border border-[#B3D8A8]/20">
                  <div className="aspect-video w-full mb-3">
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}`}
                      className="w-full h-full rounded-lg"
                      allowFullScreen
                      title="YouTube video preview"
                    ></iframe>
                  </div>

                  {videoData && (
                    <div className="mb-4 p-4 rounded-lg bg-[#B3D8A8]/5 border border-[#B3D8A8]/20">
                      <h3 className="font-medium text-[#B3D8A8] mb-1">{videoData.title}</h3>
                      <p className="text-sm text-[#B3D8A8]/70 line-clamp-3">{videoData.description}</p>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <button
                      onClick={fetchTranscript}
                      disabled={transcribing}
                      className="flex-1 px-4 py-2 rounded-lg bg-[#B3D8A8]/20 text-[#B3D8A8] hover:bg-[#B3D8A8]/30 transition-colors flex items-center justify-center space-x-2"
                    >
                      {transcribing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-t-transparent border-solid rounded-full animate-spin-smooth border-[#B3D8A8]"></div>
                          <span>Fetching...</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4" />
                          <span>Fetch Transcript</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={generateNotes}
                      disabled={loading}
                      className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-[#B3D8A8] to-[#82A878] text-black font-medium hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-t-transparent border-solid rounded-full animate-spin-smooth border-black"></div>
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4" />
                          <span>Generate Notes</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {!videoId && (
                <button
                  onClick={generateNotes}
                  disabled={loading || !videoUrl}
                  className={`w-full px-6 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 transition-all ${
                    videoUrl
                      ? "bg-gradient-to-r from-[#B3D8A8] to-[#82A878] text-black hover:opacity-90"
                      : "bg-gray-300 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-t-transparent border-solid rounded-full animate-spin-smooth border-black"></div>
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      <span>Generate Notes</span>
                    </>
                  )}
                </button>
              )}

              {error && <div className="p-3 rounded bg-red-500/10 border border-red-500 text-red-500">{error}</div>}
            </div>
          </div>

          {transcript && (
            <div className="bg-[#B3D8A8]/10 backdrop-blur-lg rounded-xl p-6 mb-8 border border-[#B3D8A8]/30 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-[#B3D8A8]">Video Transcript</h2>
              <div className="max-h-60 overflow-y-auto bg-[#B3D8A8]/5 rounded-lg p-4 border border-[#B3D8A8]/20">
                <pre className="whitespace-pre-wrap font-sans text-sm">{transcript}</pre>
              </div>
            </div>
          )}

          {notes && (
            <div className="bg-[#B3D8A8]/10 backdrop-blur-lg rounded-xl p-6 mb-8 border border-[#B3D8A8]/30 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[#B3D8A8]">Generated Notes</h2>
                <button
                  onClick={() => setViewRaw(!viewRaw)}
                  className="text-xs px-2 py-1 rounded bg-[#B3D8A8]/20 text-[#B3D8A8] hover:bg-[#B3D8A8]/30"
                >
                  {viewRaw ? "View Formatted" : "View Raw"}
                </button>
              </div>

              <div className="bg-[#B3D8A8]/5 rounded-lg border border-[#B3D8A8]/20">
                {viewRaw ? (
                  <div className="max-h-[400px] overflow-y-auto p-4 custom-scrollbar">
                    <pre className="whitespace-pre-wrap font-mono text-sm overflow-x-auto">{notes}</pre>
                  </div>
                ) : (
                  <div className="max-h-[400px] overflow-y-auto p-4 custom-scrollbar markdown-body prose prose-invert prose-headings:text-[#B3D8A8] prose-a:text-[#B3D8A8] max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                      {notes}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          )}

          {savedNotes.length > 0 && (
            <div className="bg-[#B3D8A8]/10 backdrop-blur-lg rounded-xl p-6 border border-[#B3D8A8]/30 shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-[#B3D8A8]">Previously Generated Notes</h2>
              <div className="space-y-4">
                {savedNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-lg bg-[#B3D8A8]/5 border border-[#B3D8A8]/20 hover:bg-[#B3D8A8]/10 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-[#B3D8A8]">{note.videoTitle || "Notes"}</h3>
                      <p className="text-xs text-[#B3D8A8]/70">{note.timestamp.toDate().toLocaleString()}</p>
                    </div>
                    <p className="text-xs text-[#B3D8A8]/70 mb-2 truncate">{note.videoUrl}</p>

                    <div className="bg-[#B3D8A8]/5 rounded-lg border border-[#B3D8A8]/20">
                      <div className="h-[200px] overflow-y-auto p-3 custom-scrollbar">
                        <div className="markdown-body prose prose-invert prose-headings:text-[#B3D8A8] prose-a:text-[#B3D8A8] max-w-none prose-sm">
                          <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                            {note.notes}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
