const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export interface ThinkingStep {
  title: string
  content: string
  status: 'pending' | 'in_progress' | 'complete'
}

export interface Source {
  url: string
  title: string
  domain: string
  snippet?: string
}

export interface Message {
  id: string
  chat_id: string
  role: 'user' | 'assistant'
  content: string
  thinking_steps: ThinkingStep[]
  sources: Source[]
  created_at: string
}

export interface Chat {
  id: string
  title: string | null
  created_at: string
  updated_at: string
  messages: Message[]
}

export interface ChatListItem {
  id: string
  title: string | null
  created_at: string
  updated_at: string
}

export const api = {
  async createChat(title?: string): Promise<Chat> {
    const response = await fetch(`${API_URL}/api/chats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    if (!response.ok) throw new Error('Failed to create chat')
    return response.json()
  },

  async listChats(): Promise<ChatListItem[]> {
    const response = await fetch(`${API_URL}/api/chats`)
    if (!response.ok) throw new Error('Failed to list chats')
    return response.json()
  },

  async getChat(chatId: string): Promise<Chat> {
    const response = await fetch(`${API_URL}/api/chats/${chatId}`)
    if (!response.ok) throw new Error('Failed to get chat')
    return response.json()
  },

  async deleteChat(chatId: string): Promise<void> {
    const response = await fetch(`${API_URL}/api/chats/${chatId}`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to delete chat')
  },

  async clearAllChats(): Promise<{ count: number }> {
    const response = await fetch(`${API_URL}/api/chats`, {
      method: 'DELETE',
    })
    if (!response.ok) throw new Error('Failed to clear chats')
    return response.json()
  },

  sendMessage(chatId: string, content: string): SSEClient {
    const url = `${API_URL}/api/chats/${chatId}/messages`

    // We need to use fetch with POST for SSE since EventSource only supports GET
    // Using a custom implementation with fetch
    return new SSEClient(url, content)
  },
}

// Custom SSE client that supports POST requests
export class SSEClient extends EventTarget {
  private reader: ReadableStreamDefaultReader<Uint8Array> | null = null
  private decoder = new TextDecoder()
  private buffer = ''

  constructor(url: string, content: string) {
    super()
    this.connect(url, content)
  }

  private async connect(url: string, content: string) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (!response.ok || !response.body) {
        this.dispatchEvent(new CustomEvent('error', { detail: 'Connection failed' }))
        return
      }

      this.reader = response.body.getReader()
      this.readStream()
    } catch (error) {
      this.dispatchEvent(new CustomEvent('error', { detail: error }))
    }
  }

  private async readStream() {
    if (!this.reader) return

    try {
      while (true) {
        const { done, value } = await this.reader.read()
        if (done) {
          this.dispatchEvent(new Event('close'))
          break
        }

        this.buffer += this.decoder.decode(value, { stream: true })
        this.processBuffer()
      }
    } catch (error) {
      this.dispatchEvent(new CustomEvent('error', { detail: error }))
    }
  }

  private processBuffer() {
    const lines = this.buffer.split('\n')
    this.buffer = lines.pop() || ''

    let eventType = ''
    let eventData = ''

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        eventType = line.slice(7)
      } else if (line.startsWith('data: ')) {
        eventData = line.slice(6)
      } else if (line === '' && eventType && eventData) {
        try {
          const data = JSON.parse(eventData)
          this.dispatchEvent(new CustomEvent(eventType, { detail: data }))
        } catch {
          // Ignore parse errors
        }
        eventType = ''
        eventData = ''
      }
    }
  }

  close() {
    if (this.reader) {
      this.reader.cancel()
      this.reader = null
    }
  }
}
