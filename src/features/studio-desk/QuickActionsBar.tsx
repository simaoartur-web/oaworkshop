import {
  ArrowUpRight,
  Columns2,
  Eye,
  Filter,
  GlobeLock,
  Layers3,
  LayoutGrid,
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
  onOpenNextPriority: () => void;
  hasNextOpenPriority: boolean;
  onInspectFeaturedBrief: () => void;
  onOpenFutureNotice: (kind: 'viewer' | 'publish') => void;
  roleQuickLabel: string;
}

export function QuickActionsBar({
  deskDict,
  scope,
  onScopeChange,
  presentationMode,
  onPresentationModeChange,
  onOpenNextPriority,
  hasNextOpenPriority,
  onInspectFeaturedBrief,
  onOpenFutureNotice,
  roleQuickLabel,
}: QuickActionsBarProps) {
  const scopeOptions: { value: DeskFilterScope; label: string }[] = [
    { value: 'my_work', label: deskDict.quickActions.scopeMyWork },
    {
      value: 'role_focus',
      label: `${deskDict.quickActions.scopeRoleFocus} (${roleQuickLabel})`,
    },
    { value: 'all', label: deskDict.quickActions.scopeAll },
    { value: 'attention', label: deskDict.quickActions.scopeAttention },
  ];

  return (
    <section
      aria-label={deskDict.quickActions.barLabel}
      className="border border-white/12 bg-[#0D0D0D]"
    >
      {/* Primary Tier: Essential Daily Workflow (Open Next Priority, Featured Project, Work Scope) */}
      <div className="px-4 sm:px-6 py-3.5 flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onOpenNextPriority}
            disabled={!hasNextOpenPriority}
            className={`min-h-[44px] px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] inline-flex items-center gap-2 transition-colors ${
              hasNextOpenPriority
                ? 'bg-[#A65D4A] hover:bg-[#B86B57] text-white cursor-pointer'
                : 'border border-white/12 bg-[#161616] text-[#9E9E9E] cursor-not-allowed'
            }`}
          >
            <ArrowUpRight size={14} strokeWidth={1.6} aria-hidden="true" />
            <span>
              {hasNextOpenPriority
                ? deskDict.quickActions.openNextPriority
                : deskDict.quickActions.noOpenPriorities}
            </span>
          </button>

          <button
            type="button"
            onClick={onInspectFeaturedBrief}
            className="min-h-[44px] px-3.5 py-2 border border-white/18 bg-[#151515] hover:border-[#A65D4A] text-xs font-medium uppercase tracking-[0.14em] text-white inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Eye size={14} strokeWidth={1.45} aria-hidden="true" />
            <span>{deskDict.quickActions.openFeaturedBrief}</span>
          </button>
        </div>

        {/* Desk Personalization Scope Filter ('O meu trabalho' default first) */}
        <div
          role="group"
          aria-label={deskDict.quickActions.scopePrefix}
          className="flex flex-wrap items-center gap-1.5"
        >
          <span className="inline-flex items-center gap-1.5 pr-1.5 text-[11px] font-medium uppercase tracking-[0.16em] text-[#BDBDBD]">
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
                className={`min-h-[44px] px-3 py-1.5 text-xs tracking-[0.05em] border transition-colors cursor-pointer ${
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
      </div>

      {/* Secondary Tier: View Density Preferences & Planned Future Capabilities (Reset Demo removed — lives in Settings) */}
      <div
        role="region"
        aria-label={deskDict.quickActions.secondaryGroupLabel}
        className="px-4 sm:px-6 py-2 bg-[#080808] oa-hairline-t flex flex-wrap items-center justify-between gap-2.5"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="pr-1.5 text-[11px] uppercase tracking-[0.14em] text-[#9E9E9E]">
            {deskDict.quickActions.viewPrefix}
          </span>

          <button
            type="button"
            onClick={() => onPresentationModeChange('editorial')}
            aria-pressed={presentationMode === 'editorial'}
            className={`min-h-[44px] px-3 py-1.5 text-xs tracking-[0.06em] uppercase border inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
              presentationMode === 'editorial'
                ? 'border-[#A65D4A]/80 bg-[#A65D4A]/18 text-white font-medium'
                : 'border-white/12 bg-transparent text-[#BDBDBD] hover:text-white hover:border-white/30'
            }`}
          >
            <LayoutGrid size={13} strokeWidth={1.4} aria-hidden="true" />
            <span>{deskDict.quickActions.modeEditorial}</span>
          </button>

          <button
            type="button"
            onClick={() => onPresentationModeChange('technical')}
            aria-pressed={presentationMode === 'technical'}
            className={`min-h-[44px] px-3 py-1.5 text-xs tracking-[0.06em] uppercase border inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
              presentationMode === 'technical'
                ? 'border-[#A65D4A]/80 bg-[#A65D4A]/18 text-white font-medium'
                : 'border-white/12 bg-transparent text-[#BDBDBD] hover:text-white hover:border-white/30'
            }`}
          >
            <Columns2 size={13} strokeWidth={1.4} aria-hidden="true" />
            <span>{deskDict.quickActions.modeTechnical}</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] uppercase tracking-[0.14em] text-[#9E9E9E] hidden sm:inline">
            {deskDict.quickActions.futurePrefix}
          </span>

          <button
            type="button"
            onClick={() => onOpenFutureNotice('viewer')}
            className="min-h-[44px] px-3 py-1.5 border border-dashed border-white/18 bg-[#101010] hover:border-white/38 text-[11px] uppercase tracking-[0.12em] text-[#BDBDBD] hover:text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Layers3 size={13} strokeWidth={1.4} aria-hidden="true" />
            <span>{deskDict.quickActions.futureViewerLabel}</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenFutureNotice('publish')}
            className="min-h-[44px] px-3 py-1.5 border border-dashed border-white/18 bg-[#101010] hover:border-white/38 text-[11px] uppercase tracking-[0.12em] text-[#BDBDBD] hover:text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <GlobeLock size={13} strokeWidth={1.4} aria-hidden="true" />
            <span>{deskDict.quickActions.futurePublishLabel}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
