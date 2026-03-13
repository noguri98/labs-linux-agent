export interface ChatRequest {
  model: string;
  prompt: string;
  stream?: boolean;
}

export interface ChatResponse {
  response: string;
  thinking?: string;
  tools?: {
    name: string;
    arguments: any;
    result?: string;
  }[];
}

const BACKEND_HOST = process.env.NEXT_PUBLIC_ADMIN_BACKEND_HOST || "localhost";
const BACKEND_URL = `http://${BACKEND_HOST}:8000`;

export const chatService = {
  async sendMessage(params: ChatRequest): Promise<Response> {
    const response = await fetch(`${BACKEND_URL}/ollama`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stream: true, // 항상 스트리밍 사용
        ...params,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Server error: ${response.status}`);
    }

    return response;
  },
};
