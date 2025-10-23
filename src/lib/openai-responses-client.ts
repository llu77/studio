// frontend/lib/openai-responses-client.ts

interface CreateResponseParams {
  input: any;
  instructions?: string;
  tools?: any[];
  stream?: boolean;
}

interface Conversation {
    id: string;
    // Add other conversation properties as needed
}

interface ResponseStream extends AsyncGenerator<any> {
    // Define stream properties if any
}

interface ResponsesAPIClient {
  createResponse(params: CreateResponseParams): Promise<ResponseStream | any>
  getResponse(responseId: string): Promise<any>
  createConversation(items?: any[]): Promise<Conversation>
  addToConversation(conversationId: string, items: any[]): Promise<void>
}

class OpenAIResponsesClient implements ResponsesAPIClient {
  private apiKey: string
  private baseURL = 'https://api.openai.com/v1'
  private ws: WebSocket | null = null
  private conversationId: string | null = null
  private lastResponseId: string | null = null
  
  constructor(apiKey: string) {
    this.apiKey = apiKey
  }
  
  async createResponse(params: CreateResponseParams): Promise<ResponseStream | any> {
    try {
      const response = await fetch(`${this.baseURL}/responses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          input: params.input,
          instructions: params.instructions,
          previous_response_id: this.lastResponseId,
          conversation: this.conversationId,
          tools: params.tools || [
            { type: 'web_search' },
            { type: 'file_search' },
            { type: 'code_interpreter' }
          ],
          store: true,
          stream: params.stream ?? true,
          include: [
            'web_search_call.action.sources',
            'code_interpreter_call.outputs',
            'file_search_call.results'
          ]
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`API request failed: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`)
      }
      
      if (params.stream) {
        return this.handleStreamResponse(response)
      } else {
        const data = await response.json()
        this.lastResponseId = data.id
        return data
      }
    } catch (error) {
      console.error('Error creating response:', error)
      throw error
    }
  }
  
  private async *handleStreamResponse(response: Response): AsyncGenerator<any> {
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    
    while (reader) {
      const { done, value } = await reader.read()
      if (done) break
      
      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6)
          if (data === '[DONE]') continue
          
          try {
            const event = JSON.parse(data)
            
            // Store response ID for continuity
            if (event.type === 'response.created') {
              this.lastResponseId = event.response.id
            }
            
            yield event
          } catch (e) {
            console.error('Failed to parse SSE:', e)
          }
        }
      }
    }
  }

  async getResponse(responseId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseURL}/responses/${responseId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Failed to get response: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`)
      }
      
      return response.json();
    } catch (error) {
      console.error('Error getting response:', error)
      throw error
    }
  }
  
  async createConversation(items: any[] = []): Promise<Conversation> {
    try {
      const response = await fetch(`${this.baseURL}/conversations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Failed to create conversation: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`)
      }
      
      const conversation = await response.json()
      this.conversationId = conversation.id
      return conversation
    } catch (error) {
      console.error('Error creating conversation:', error)
      throw error
    }
  }

  async addToConversation(conversationId: string, items: any[]): Promise<void> {
    try {
      const response = await fetch(`${this.baseURL}/conversations/${conversationId}/items`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ items })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Failed to add to conversation: ${response.status} ${response.statusText}. ${JSON.stringify(errorData)}`)
      }
    } catch (error) {
      console.error('Error adding to conversation:', error)
      throw error
    }
  }
  
  connectWebSocket(clientId: string, onMessage: (event: any) => void) {
    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000'
      this.ws = new WebSocket(`${wsUrl}/ws/${clientId}`)
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          onMessage(data)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }
      
      this.ws.onopen = () => {
        console.log('WebSocket connected')
      }
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }
      
      this.ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason)
      }
    } catch (error) {
      console.error('Error connecting WebSocket:', error)
      throw error
    }
  }
  
  sendMessage(type: string, data: any) {
    try {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type,
          ...data,
          previous_response_id: this.lastResponseId
        }))
      } else {
        console.warn('WebSocket is not open. Current state:', this.ws?.readyState)
      }
    } catch (error) {
      console.error('Error sending WebSocket message:', error)
      throw error
    }
  }
}

export const responsesClient = new OpenAIResponsesClient(
  process.env.NEXT_PUBLIC_OPENAI_API_KEY!
)
