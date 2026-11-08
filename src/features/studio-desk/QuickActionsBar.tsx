import {
  ArrowDownRight,
  CheckCheck,
  Columns2,
  Eye,
  Filter,
  GlobeLock,
  Layers3,
  LayoutGrid,
  RotateCcw,
} from 'lucide-react';
import type {
  DeskFilterScope,
  DeskPresentationMode,
} from '../../data/studioDeskTypes';
import type { StudioDeskDictionary } from './i18n';

interface QuickActionsBarProps {
  deskDict: StudioDeskDictionary;
  scope: DeskFilterScope;
  onScopeChange: (scope: DeskFilterScope) => void;
  presentationMode: DeskPresentationMode;
  onPresentationModeChange: (mode: DeskPresentationMode) => void;
  onInspectFeaturedBrief: () => void;
  onJumpToPriorities: () => void;
  onCompleteNextTask: () => void;
  hasNextPendingTask: boolean;
  onResetDemo: () => void;
  onOpenFutureNotice: (kind: 'viewer' | 'publish') => void;
  roleQuickLabel: string;
}

export function QuickActionsBar({
  deskDict,
  scope,
  onScopeChange,
  presentationMode,
  onPresentationModeChange,
  onInspectFeaturedBrief,
  onJumpToPriorities,
  onCompleteNextTask,
  hasNextPendingTask,
  onResetDemo,
  onOpenFutureNotice,
  roleQuickLabel,
}: QuickActionsBarProps) {
  const scopeOptions: { value: DeskFilterScope; label: string }[] = [
    { value: 'all', label: deskDict.quickActions.scopeAll },
    {
      value: 'role_focus',
      label: `${deskDict.quickActions.scopeRoleFocus} (${roleQuickLabel})`,
    },
    { value: 'attention', label: deskDict.quickActions.scopeAttention },
  ];

  return (
    <section
      aria-label={deskDict.quickActions.barLabel}
      className="border border-white/12 bg-[#0A0A0A] px-4 sm:px-6 py-4 space-y-3"
    >
      {/* Row 1: Desk Scope Filter + Presentation Mode Toggle */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 pb-3 oa-hairline-b">
        <div
          role="group"
          aria-label={deskDict.quickActions.barLabel}
          className="flex flex-wrap items-center gap-1.5"
        >
          <span className="inline-flex items-center gap-1.5 pr-2 text-[11px] font-medium uppercase tracking-[0.18em] text-[#BDBDBD]">
            <Filter size={13} strokeWidth={1.4} aria-hidden="true" />
            <span>{deskDict.quickActions.scopePrefix}</span>
          </span>

          {scopeOptions.map((option) => {
            const active = scope === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onScopeChange(option.value)}
                aria-pressed={active}
                className={`min-h-[44px] px-3 py-1.5 text-xs tracking-[0.06em] border transition-colors cursor-pointer ${
                  active
                    ? 'border-[#A65D4A] bg-[#A65D4A]/22 text-white font-medium'
                    : 'border-white/14 bg-[#141414] text-[#BDBDBD] hover:text-white hover:border-white/32'
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {/* Presentation Mode Toggle (Editorial vs Technical List) */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onPresentationModeChange('editorial')}
            aria-pressed={presentationMode === 'editorial'}
            className={`min-h-[44px] px-3 py-1.5 text-xs tracking-[0.08em] uppercase border inline-flex items-center gap-2 transition-colors cursor-pointer ${
              presentationMode === 'editorial'
                ? 'border-[#A65D4A] bg-[#A65D4A]/22 text-white font-medium'
                : 'border-white/14 bg-[#141414] text-[#BDBDBD] hover:text-white hover:border-white/32'
            }`}
          >
            <LayoutGrid size={14} strokeWidth={1.4} aria-hidden="true" />
            <span>{deskDict.quickActions.modeEditorial}</span>
          </button>

          <button
            type="button"
            onClick={() => onPresentationModeChange('technical')}
            aria-pressed={presentationMode === 'technical'}
            className={`min-h-[44px] px-3 py-1.5 text-xs tracking-[0.08em] uppercase border inline-flex items-center gap-2 transition-colors cursor-pointer ${
              presentationMode === 'technical'
                ? 'border-[#A65D4A] bg-[#A65D4A]/22 text-white font-medium'
                : 'border-white/14 bg-[#141414] text-[#BDBDBD] hover:text-white hover:border-white/32'
            }`}
          >
            <Columns2 size={14} strokeWidth={1.4} aria-hidden="true" />
            <span>{deskDict.quickActions.modeTechnical}</span>
          </button>
        </div>
      </div>

      {/* Row 2: Quick Local Utility Actions + Honest Future Capability Markers */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onInspectFeaturedBrief}
            className="min-h-[44px] px-3.5 py-2 border border-white/16 bg-[#161616] hover:border-[#A65D4A] text-xs font-medium uppercase tracking-[0.14em] text-white inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Eye size={14} strokeWidth={1.45} aria-hidden="true" />
            <span>{deskDict.quickActions.openFeaturedBrief}</span>
          </button>

          <button
            type="button"
            onClick={onJumpToPriorities}
            className="min-h-[44px] px-3.5 py-2 border border-white/14 bg-transparent hover:border-white/32 text-xs uppercase tracking-[0.14em] text-[#E0E0E0] hover:text-white inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <ArrowDownRight size={14} strokeWidth={1.45} aria-hidden="true" />
            <span>{deskDict.quickActions.jumpPriorities}</span>
          </button>

          <button
            type="button"
            onClick={onCompleteNextTask}
            disabled={!hasNextPendingTask}
            className={`min-h-[44px] px-3.5 py-2 text-xs font-medium uppercase tracking-[0.14em] inline-flex items-center gap-2 transition-colors ${
              hasNextPendingTask
                ? 'bg-[#A65D4A] hover:bg-[#B86B57] text-white cursor-pointer'
                : 'border border-white/12 bg-[#161616] text-[#9E9E9E] cursor-not-allowed'
            }`}
          >
            <CheckCheck size={14} strokeWidth={1.6} aria-hidden="true" />
            <span>
              {hasNextPendingTask
                ? deskDict.quickActions.completeNextTask
                : deskDict.quickActions.allTasksCompleted}
            </span>
          </button>

          <button
            type="button"
            onClick={onResetDemo}
            className="min-h-[44px] px-3.5 py-2 border border-white/14 bg-transparent hover:border-white/32 text-xs uppercase tracking-[0.14em] text-[#BDBDBD] hover:text-white inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw size={14} strokeWidth={1.4} aria-hidden="true" />
            <span>{deskDict.quickActions.resetDemo}</span>
          </button>
        </div>

        {/* Future Modules Clearly Identified (No Fake Upload or Publishing) */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenFutureNotice('viewer')}
            className="min-h-[44px] px-3 py-1.5 border border-dashed border-white/22 bg-[#121212] hover:border-white/40 text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD] hover:text-white inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Layers3 size={13} strokeWidth={1.4} aria-hidden="true" />
            <span>{deskDict.quickActions.futureViewerLabel}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenFutureNotice('publish')}
            className="min-h-[44px] px-3 py-1.5 border border-dashed border-white/22 bg-[#121212] hover:border-white/40 text-[11px] uppercase tracking-[0.14em] text-[#BDBDBD] hover:text-white inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <GlobeLock size={13} strokeWidth={1.4} aria-hidden="true" />
            <span>{deskDict.quickActions.futurePublishLabel}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
