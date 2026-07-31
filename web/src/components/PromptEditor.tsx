import { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronUp, RotateCcw, Save, Check } from 'lucide-react';
import type { ModuleId } from '../types';
import type { SerializableLoopConfig } from '../types';
import { modules } from '../lib/modules';
import { defaultPromptConfigs } from '../lib/default-prompt-configs';
import {
  getPromptConfigsForModule,
  saveCustomPrompts,
  resetCustomPrompts,
  hasCustomPrompts,
} from '../lib/custom-prompts';

const PLACEHOLDER_HINT =
  'Variables: {{profile}}, {{companyName}}, {{industry}}, {{stage}}, {{prev_0}}, {{prev_1}}, {{prev_all}}';

export default function PromptEditor() {
  const [selectedModule, setSelectedModule] = useState<ModuleId>('business-analysis');
  const [configs, setConfigs] = useState<SerializableLoopConfig[]>([]);
  const [expandedLoop, setExpandedLoop] = useState<number | null>(0);
  const [saved, setSaved] = useState(false);

  const loadConfigs = useCallback((moduleId: ModuleId) => {
    setConfigs(structuredClone(getPromptConfigsForModule(moduleId)));
    setExpandedLoop(0);
  }, []);

  useEffect(() => {
    loadConfigs(selectedModule);
  }, [selectedModule, loadConfigs]);

  const updateLoop = (
    index: number,
    field: keyof SerializableLoopConfig,
    value: string
  ) => {
    setConfigs((prev) =>
      prev.map((loop, i) => (i === index ? { ...loop, [field]: value } : loop))
    );
  };

  const handleSave = () => {
    saveCustomPrompts(selectedModule, configs);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    resetCustomPrompts(selectedModule);
    setConfigs(structuredClone(defaultPromptConfigs[selectedModule]));
  };

  const isCustom = hasCustomPrompts(selectedModule);

  return (
    <div className="glass-card p-6 sm:p-8">
      <div className="mb-6">
        <h2 className="font-semibold">Custom Loop Prompts</h2>
        <p className="mt-1 text-sm text-slate-400">
          Customise the AI prompts for each loop. Changes apply to future generations.
        </p>
      </div>

      <div className="mb-6">
        <label className="label-text" htmlFor="prompt-module">
          Module
        </label>
        <select
          id="prompt-module"
          className="input-field"
          value={selectedModule}
          onChange={(e) => setSelectedModule(e.target.value as ModuleId)}
        >
          {modules.map((mod) => (
            <option key={mod.id} value={mod.id}>
              {mod.title}
              {hasCustomPrompts(mod.id) ? ' (customised)' : ''}
            </option>
          ))}
        </select>
      </div>

      {isCustom && (
        <div className="mb-4 rounded-lg bg-brand-500/10 px-4 py-2 text-sm text-brand-300">
          This module has custom prompts. Reset to restore defaults.
        </div>
      )}

      <div className="space-y-3">
        {configs.map((loop, index) => (
          <div key={index} className="overflow-hidden rounded-xl border border-slate-700">
            <button
              type="button"
              className="flex w-full items-center justify-between bg-slate-800/50 px-4 py-3 text-left"
              onClick={() => setExpandedLoop(expandedLoop === index ? null : index)}
            >
              <span className="font-medium">
                Loop {index + 1}: {loop.name}
              </span>
              {expandedLoop === index ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </button>

            {expandedLoop === index && (
              <div className="space-y-4 border-t border-slate-700 p-4">
                <div>
                  <label className="label-text">Loop Name</label>
                  <input
                    className="input-field"
                    value={loop.name}
                    onChange={(e) => updateLoop(index, 'name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="label-text">System Context</label>
                  <textarea
                    className="input-field min-h-[72px] resize-y"
                    value={loop.systemContext}
                    onChange={(e) => updateLoop(index, 'systemContext', e.target.value)}
                    rows={2}
                  />
                </div>
                <div>
                  <label className="label-text">Prompt Template</label>
                  <textarea
                    className="input-field min-h-[160px] resize-y font-mono text-sm"
                    value={loop.promptTemplate}
                    onChange={(e) => updateLoop(index, 'promptTemplate', e.target.value)}
                    rows={8}
                  />
                  <p className="mt-1.5 text-xs text-slate-500">{PLACEHOLDER_HINT}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button className="btn-primary text-sm" onClick={handleSave}>
          {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {saved ? 'Saved!' : 'Save Prompts'}
        </button>
        <button className="btn-secondary text-sm" onClick={handleReset}>
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </button>
      </div>
    </div>
  );
}
