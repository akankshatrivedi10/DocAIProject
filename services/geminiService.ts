
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
        temperature: 0.2,
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
  Context Usage: Use provided metadata (Flows, Validation Rules, Apex, Objects) to accurately model the process steps and logic.
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

export const generateRoleBasedDoc = async (role: 'DEV' | 'GTM' | 'SALES', specificRole: string | undefined, processName: string | undefined, metadataContext: MetadataSummary): Promise<string> => {
  const client = getClient();
  if (!client) return "";

  const DOCBOT_PROMPT = `
    You are DocBot – GTM Process Intelligence Agent.
    Your responsibility is to generate accurate, role-based GTM process documentation and visualizations, using:
    
    1. The selected GTM Role (e.g., BDR, BDM, Salesperson, Sales Manager, Account Manager, Customer Success, Partner Enablement)
    2. The selected Business Process (e.g., Lead Qualification, Opportunity Management, Forecasting, Onboarding, Renewal, Partner Registration, etc.)
    3. The actual CRM metadata retrieved from Salesforce or other connected systems.
    
    🔍 Your Job
    
    When the user selects a role and a process in the GTM Workspace:
    
    1. Understand the Role
    Interpret the selected GTM role and its expected responsibilities in a typical revenue organization.
    
    2. Interpret the Selected Process
    Identify what the business process means (e.g., Lead Qualification, Deal Progression, Forecasting, Renewal, Escalation, Partner Deal Registration, etc.).
    
    3. Combine with CRM Metadata
    Use the synced metadata to tailor the process:
    - Flows
    - Objects & Fields
    - Validation Rules
    - Triggers
    - Page Layouts
    - Record Types
    - Approval Processes
    - Assignment Rules
    - Routing & Scoring
    - Lifecycle Stages
    - Opportunity Paths
    - Partner processes

    If specific process metadata is insufficient or missing, you MUST analyze and retrieve details from:
    - Related Flows (Screen Flows, Autolaunched Flows, Triggered Flows)
    - Validation Rules (to understand constraints and logic)
    - Apex Classes & Triggers (for backend automation logic)
    - Object Definitions (Fields, Record Types, Relationships)
    - Lead Assignment Rules (if available in context)
    - Any other relevant metadata that contributes to the process logic.
    
    4. Produce Three Structured Outputs
    
    Your output must include:
    
    A. Human-Readable Process Description
    Explain:
    - What this process means for the chosen role
    - How the CRM supports it
    - What key steps they perform
    - Which automation runs behind the scenes
    
    B. Visual Diagram (Mermaid)
    Produce the most appropriate visual based on context:
    - Flowchart for step-by-step processes
    - Swimlane for multi-team processes
    - Sequence diagram for interactions
    - ERD when objects and relationships matter
    
    Always return valid Mermaid code blocks.
    
    C. JSON Output for Application Rendering
    
    Example structure:
    {
      "role": "BDR",
      "process": "Lead Qualification",
      "steps": [
        "Inbound lead captured",
        "Lead Routing via Flow: Lead_Assignment_Flow",
        "BDR performs qualification",
        "BDR updates fields",
        "Convert or recycle lead"
      ],
      "crm_metadata_referenced": [
        "Lead object",
        "Fields: Status, Rating, Source",
        "Flow: Lead_Assignment_Flow",
        "Validation Rule: VR_Lead_Qualification"
      ],
      "visualization": {
        "type": "mermaid",
        "diagram": "..."
      }
    }
    
    🧠 If Metadata is Missing
    Ask the backend:
    “Additional metadata required: please sync flows, opportunity stage paths, assignment rules, or validation rules.”
    
    ⚙️ Rules You Must Follow
    - Always customize outputs with the metadata provided.
    - Never make assumptions when metadata is missing—ask for it.
    - Always provide all three outputs (Description + Diagram + JSON).
    - Use terminology consistent with CRM configuration.
    `;

  let rolePrompt = "";
  if (role === 'DEV') {
    rolePrompt = "Task: Generate a Technical Specification including Apex architecture, Trigger patterns, and API dependencies. Focus on robustness and scalability. Include a Code Reference section.";
  } else if (role === 'GTM' || role === 'SALES') {
    const specificRoleText = specificRole ? `Selected Role: ${specificRole}` : "Role: General GTM/Sales";
    const processText = processName ? `Selected Process: ${processName}` : "Process: General Overview";
    rolePrompt = `${DOCBOT_PROMPT}\n\n${specificRoleText}\n${processText}\n\nFocus specifically on these selections using the provided metadata.`;
  }

  const prompt = `
    Metadata: ${JSON.stringify(metadataContext.details)}
    
    ${rolePrompt}
    
    Format: Markdown. Ensure Mermaid diagrams are wrapped in \`\`\`mermaid blocks.
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
