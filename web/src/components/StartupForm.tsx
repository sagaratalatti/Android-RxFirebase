import type { StartupProfile } from '../types';
import { stageLabels } from '../lib/modules';

interface StartupFormProps {
  profile: StartupProfile;
  onChange: (profile: StartupProfile) => void;
  disabled?: boolean;
}

export default function StartupForm({ profile, onChange, disabled }: StartupFormProps) {
  const update = (field: keyof StartupProfile, value: string) => {
    onChange({ ...profile, [field]: value });
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className="label-text" htmlFor="companyName">
            Company Name *
          </label>
          <input
            id="companyName"
            className="input-field"
            placeholder="Acme Inc."
            value={profile.companyName}
            onChange={(e) => update('companyName', e.target.value)}
            disabled={disabled}
            required
          />
        </div>
        <div>
          <label className="label-text" htmlFor="industry">
            Industry *
          </label>
          <input
            id="industry"
            className="input-field"
            placeholder="SaaS, FinTech, HealthTech..."
            value={profile.industry}
            onChange={(e) => update('industry', e.target.value)}
            disabled={disabled}
            required
          />
        </div>
      </div>

      <div>
        <label className="label-text" htmlFor="stage">
          Stage *
        </label>
        <select
          id="stage"
          className="input-field"
          value={profile.stage}
          onChange={(e) => update('stage', e.target.value)}
          disabled={disabled}
        >
          {Object.entries(stageLabels).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="label-text" htmlFor="targetMarket">
          Target Market *
        </label>
        <input
          id="targetMarket"
          className="input-field"
          placeholder="SMB marketers, enterprise HR teams..."
          value={profile.targetMarket}
          onChange={(e) => update('targetMarket', e.target.value)}
          disabled={disabled}
          required
        />
      </div>

      <div>
        <label className="label-text" htmlFor="valueProposition">
          Value Proposition *
        </label>
        <textarea
          id="valueProposition"
          className="input-field min-h-[80px] resize-y"
          placeholder="What unique value does your startup deliver?"
          value={profile.valueProposition}
          onChange={(e) => update('valueProposition', e.target.value)}
          disabled={disabled}
          required
          rows={3}
        />
      </div>

      <div>
        <label className="label-text" htmlFor="competitors">
          Key Competitors
        </label>
        <input
          id="competitors"
          className="input-field"
          placeholder="Competitor A, Competitor B..."
          value={profile.competitors}
          onChange={(e) => update('competitors', e.target.value)}
          disabled={disabled}
        />
      </div>

      <div>
        <label className="label-text" htmlFor="goals">
          Current Goals *
        </label>
        <textarea
          id="goals"
          className="input-field min-h-[80px] resize-y"
          placeholder="Raise seed round, reach 100 customers, launch in EU..."
          value={profile.goals}
          onChange={(e) => update('goals', e.target.value)}
          disabled={disabled}
          required
          rows={3}
        />
      </div>
    </div>
  );
}

export const emptyProfile: StartupProfile = {
  companyName: '',
  industry: '',
  stage: 'mvp',
  targetMarket: '',
  valueProposition: '',
  competitors: '',
  goals: '',
};

export function isProfileValid(profile: StartupProfile): boolean {
  return Boolean(
    profile.companyName.trim() &&
      profile.industry.trim() &&
      profile.targetMarket.trim() &&
      profile.valueProposition.trim() &&
      profile.goals.trim()
  );
}
