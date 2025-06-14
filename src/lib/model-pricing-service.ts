import type { ModelType } from "./types";

interface ModelPricing {
  input_cost_per_token: number;
  output_cost_per_token: number;
  mode: string;
  supports_vision: boolean;
}

interface ModelPricingData {
  [key: string]: ModelPricing;
}

export class ModelPricingService {
  private pricingData: ModelPricingData = {};

  async initialize() {
    try {
      const response = await fetch(
        "https://raw.githubusercontent.com/BerriAI/litellm/afe8abc768958efc329755de322fff450955eb36/model_prices_and_context_window.json"
      );
      const data = await response.json();
      this.pricingData = data;
    } catch (error) {
      console.error("Failed to fetch model pricing data:", error);
    }
  }

  getModelPricing(model: ModelType): ModelPricing | null {
    // Map our model types to LiteLLM model names
    const modelMapping: Record<ModelType, string> = {
      "gpt-4.1": "gpt-4-vision-preview",
      "gpt-4.1-mini": "gpt-4-vision-preview",
      "gpt-4.1-nano": "gpt-4-vision-preview",
      "o4-mini": "gpt-4-vision-preview",
      "gpt-4o": "gpt-4-vision-preview",
      "gpt-4o-mini": "gpt-4-vision-preview",
      cua: "gpt-4-vision-preview",
      o1: "gpt-4-vision-preview",
      "o1-pro": "gpt-4-vision-preview",
      o3: "gpt-4-vision-preview",
    };

    const liteLLMModel = modelMapping[model];
    return this.pricingData[liteLLMModel] || null;
  }

  calculateCost(model: ModelType, tokens: number): number {
    const pricing = this.getModelPricing(model);
    if (!pricing) return 0;

    // For vision models, we use input_cost_per_token
    return tokens * pricing.input_cost_per_token;
  }
}
