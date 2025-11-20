export enum Tab {
  DASHBOARD = 'DASHBOARD',
  CONNECT = 'CONNECT',
  METADATA = 'METADATA',
  DOCS = 'DOCS',
  VISUALS = 'VISUALS',
  CHAT = 'CHAT',
  INTEGRATIONS = 'INTEGRATIONS'
}

export enum OrgType {
  PRODUCTION = 'Production',
  SANDBOX = 'Sandbox',
  SCRATCH = 'Scratch Org'
}

export enum ConnectionStatus {
  DISCONNECTED = 'Disconnected',
  CONNECTING = 'Connecting',
  CONNECTED = 'Connected',
  ERROR = 'Error'
}

export interface Org {
  id: string;
  name: string;
  alias: string;
  type: OrgType;
  status: ConnectionStatus;
  lastSync?: string;
  metadataSummary?: MetadataSummary;
}

export interface MetadataSummary {
  apexClasses: number;
  triggers: number;
  flows: number;
  customObjects: number;
  permissions: number;
  fetchedAt: Date;
  details?: any; // Mocking the full JSON payload
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
  orgId?: string;
}

export interface GeneratedDoc {
  id: string;
  title: string;
  type: 'Technical' | 'Process' | 'UserGuide';
  content: string; // Markdown
  createdAt: Date;
  orgId: string;
}

export interface Diagram {
  id: string;
  title: string;
  mermaidCode: string;
  orgId: string;
}
