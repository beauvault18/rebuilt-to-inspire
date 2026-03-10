export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatRequest {
  message: string;
  trainer_name: string;
  user_name: string;
  cancer_type?: string;
  treatment_phase?: string;
  has_fitness_plan: boolean;
  has_nutrition_plan: boolean;
  conversation_history: { role: "user" | "assistant"; content: string }[];
}

export interface ChatResponse {
  reply: string;
}
