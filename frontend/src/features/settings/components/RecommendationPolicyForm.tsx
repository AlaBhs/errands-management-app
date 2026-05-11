import { useEffect } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { FormSection } from '@/shared/components/FormSection';
import { FieldGroup } from '@/shared/components/FieldGroup';
import { useUpdateRecommendation } from '../hooks/useSystemConfig';
import type { RecommendationPolicyDto, PriorityWeightsDto } from '../types/systemConfig.types';

interface Props { initialData: RecommendationPolicyDto; }

type FormValues = RecommendationPolicyDto;

const inputCls = 'w-full px-3 py-2 border border-border rounded-lg text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ey-dark)] placeholder:text-muted-foreground';

function weightsValid(w: PriorityWeightsDto) {
  return Math.abs(w.availabilityWeight + w.proximityWeight + w.performanceWeight - 1.0) <= 0.001;
}

function WeightGroup({
  label, prefix, control,
}: {
  label: string;
  prefix: 'normalPriorityWeights' | 'urgentPriorityWeights';
  control: ReturnType<typeof useForm<FormValues>>['control'];
}) {
  const weights = useWatch({
  control,
  name: prefix,
});

const a = +weights.availabilityWeight;
const p = +weights.proximityWeight;
const f = +weights.performanceWeight;
  const sum = a + p + f;
  const valid = Math.abs(sum - 1.0) <= 0.001;

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      {(['availabilityWeight', 'proximityWeight', 'performanceWeight'] as const).map((field) => (
        <div key={field} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="capitalize">{field.replace('Weight', '')}</span>
            <span className="font-mono text-xs">{(+weights[field]).toFixed(2)}</span>
          </div>
          <Controller
            name={`${prefix}.${field}`}
            control={control}
            render={({ field: f }) => (
              <input
                type="range" min="0" max="1" step="0.01"
                value={f.value}
                onChange={(e) => f.onChange(+e.target.value)}
                className="w-full accent-[var(--ey-dark)]"
              />
            )}
          />
        </div>
      ))}
      <p className={`text-xs font-mono ${valid ? 'text-green-600' : 'text-red-500'}`}>
        Sum: {sum.toFixed(3)} {valid ? '✓' : '— must equal 1.000'}
      </p>
    </div>
  );
}

export function RecommendationPolicyForm({ initialData }: Props) {
  const { mutate, isPending } = useUpdateRecommendation();
  const { control, handleSubmit, reset, formState } = useForm<FormValues>({
  defaultValues: initialData,
});
  useEffect(() => { reset(initialData); }, [initialData, reset]);

const normalWeights = useWatch({
  control,
  name: 'normalPriorityWeights',
});

const urgentWeights = useWatch({
  control,
  name: 'urgentPriorityWeights',
});

const normalValid = weightsValid(normalWeights);
const urgentValid = weightsValid(urgentWeights);
  const canSave = formState.isDirty && normalValid && urgentValid && !isPending;

  return (
    <form onSubmit={handleSubmit((v) => mutate(v))} className="space-y-6">
      <FormSection title="Capacity Limits">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <FieldGroup label="Max Active Assignments per Courier">
            <Controller name="maxActiveAssignments" control={control}
              render={({ field }) => (
                <input type="number" min={1} {...field}
                  onChange={(e) => field.onChange(+e.target.value)}
                  className={inputCls} />
              )} />
          </FieldGroup>
          <FieldGroup label="Max Scoring Distance (km)">
            <Controller name="maxScoringDistanceKm" control={control}
              render={({ field }) => (
                <input type="number" step="0.5" min={0.1} {...field}
                  onChange={(e) => field.onChange(+e.target.value)}
                  className={inputCls} />
              )} />
          </FieldGroup>
        </div>
      </FormSection>

      <FormSection title="Priority Weights">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <WeightGroup label="Normal Priority" prefix="normalPriorityWeights" control={control} />
          <WeightGroup label="Urgent Priority" prefix="urgentPriorityWeights" control={control} />
        </div>
      </FormSection>

      <button type="submit" disabled={!canSave}
        className="px-5 py-2 bg-[var(--ey-dark)] text-white rounded-lg text-sm hover:bg-[var(--ey-text-hover)] transition-colors disabled:opacity-50">
        {isPending ? 'Saving…' : 'Save Recommendation Policy'}
      </button>
    </form>
  );
}