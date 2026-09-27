import { api } from "./api";

export type AssistantResponse = {
  answer: string;
  sources: { title: string; source_type: string; route?: string | null }[];
  suggested_actions: { label: string; route: string }[];
  grounded: boolean;
};

export const assistantApi = {
  ask: (message: string, language: "en" | "hi" | "mr" = "en") =>
    api.request<AssistantResponse>("/assistant/ask", {
      method: "POST",
      body: JSON.stringify({ message, language }),
    }),
};
