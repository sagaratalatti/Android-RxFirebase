export type ModuleId = 'business-analysis' | 'audit' | 'gtm' | 'social-media';

export interface StartupProfile {
  companyName: string;
  industry: string;
  stage: 'idea' | 'mvp' | 'early-revenue' | 'growth' | 'scale';
  targetMarket: string;
  valueProposition: string;
  competitors: string;
  goals: string;
}

export interface LoopIteration {
  id: string;
  loopNumber: number;
  prompt: string;
  response: string;
  timestamp: number;
  refinement?: string;
}

export interface GenerationSession {
  id: string;
  moduleId: ModuleId;
  profile: StartupProfile;
  iterations: LoopIteration[];
  status: 'idle' | 'generating' | 'complete' | 'error';
  finalOutput?: string;
  createdAt: number;
}

export interface ModuleConfig {
  id: ModuleId;
  title: string;
  description: string;
  icon: string;
  color: string;
  loopCount: number;
  outputLabel: string;
}

export interface LoopPromptTemplate {
  moduleId: ModuleId;
  loops: {
    name: string;
    systemContext: string;
    buildPrompt: (profile: StartupProfile, previousOutputs: string[]) => string;
  }[];
}

export interface SerializableLoopConfig {
  name: string;
  systemContext: string;
  promptTemplate: string;
}

export interface SavedGeneration {
  id: string;
  moduleId: ModuleId;
  moduleTitle: string;
  companyName: string;
  profile: StartupProfile;
  iterations: { loopNumber: number; name: string; response: string }[];
  finalOutput: string;
  usedLiveAI: boolean;
  createdAt: number;
}

export type CustomPromptOverrides = Partial<Record<ModuleId, SerializableLoopConfig[]>>;
