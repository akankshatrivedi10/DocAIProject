import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage, MetadataSummary } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.warn("API_KEY not found in environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

const SYSTEM_INSTRUCTION = `
You are SalesforceDocBot, an expert Salesforce Technical Architect and Business Analyst.
Your goal is to analyze Salesforce metadata, explain complex technical concepts to non-technical users, 
and generate Mermaid.js diagrams for process visualization.

When answering:
1. Be concise and accurate.
2. Reference specific metadata items (Fields, Classes, Flows) provided in the context.
3. If generating a diagram, output ONLY the valid Mermaid.js syntax without backticks or markdown blocks if specifically asked for "raw syntax", otherwise wrap in markdown code blocks.
4. When asked for documentation, use professional Markdown formatting with headers, lists, and tables.
`;

export const generateChatResponse = async (
  history: ChatMessage[], 
  currentMessage: string, 
  metadataContext: MetadataSummary | undefined
): Promise<string> => {
  const client = getClient();
  if (!client) return "Error: API Key missing. Please configure process.env.API_KEY.";

  const contextString = metadataContext 
    ? `CURRENT ORG METADATA CONTEXT: ${JSON.stringify(metadataContext.details)}`
    : "NO METADATA CONTEXT AVAILABLE.";

  const prompt = `
  ${contextString}
  
  User Query: ${currentMessage}
  `;

  try {
    const response: GenerateContentResponse = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.2, // Low temperature for factual accuracy
      }
    });
    
    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Sorry, I encountered an error connecting to the AI service.";
  }
};

export const generateDiagramSyntax = async (description: string, metadataContext: MetadataSummary | undefined): Promise<string> => {
  const client = getClient();
  if (!client) return "";

  const contextString = metadataContext 
    ? `Context: ${JSON.stringify(metadataContext.details)}`
    : "";

  const prompt = `
  ${contextString}
  
  Task: Create a Mermaid.js diagram for: "${description}".
  Type: Sequence Diagram, Flowchart, or ER Diagram (choose best fit).
  Rule: Return ONLY the raw Mermaid code string. Do not include \`\`\`mermaid or markdown blocks.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini Diagram Error:", error);
    return "";
  }
};

export const generateTechnicalDoc = async (type: string, metadataContext: MetadataSummary): Promise<string> => {
    const client = getClient();
    if (!client) return "";
  
    const prompt = `
    Metadata: ${JSON.stringify(metadataContext.details)}
    
    Task: Write a comprehensive ${type} document for this Salesforce Org.
    Format: Markdown.
    Structure:
    1. Overview
    2. Key Objects & Relationships
    3. Automation Logic (Flows/Triggers)
    4. Recommendations for improvement
    `;
  
    try {
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      return response.text || "";
    } catch (error) {
      console.error("Gemini Doc Error:", error);
      return "Error generating documentation.";
    }
};
