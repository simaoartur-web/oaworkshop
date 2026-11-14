import {
  Axis3d,
  Box,
  Compass,
  Focus,
  Grid3x3,
  HelpCircle,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useState } from 'react';
import type { AppLanguage } from '../../data/types';
import type { ModelCameraPreset } from './contracts';
import { getModelViewerDictionary } from './i18n';

export interface ModelViewerControlsProps {
  language?: AppLanguage;
  activePreset: ModelCameraPreset;
  showGrid: boolean;
  showAxes: boolean;
  wireframe: boolean;
  disabled?: boolean;
  onSelectPreset: (preset: ModelCameraPreset) => void;
  onRecenter: () => void;
  onResetInitialView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleGrid: () => void;
  onToggleAxes: () => void;
  onToggleWireframe: () => void;
}

export function ModelViewerControls({
  language = 'pt',
  activePreset,
  showGrid,
  showAxes,
  wireframe,
  disabled = false,
  onSelectPreset,
  onRecenter,
  onResetInitialView,
  onZoomIn,
  onZoomOut,
  onToggleGrid,
  onToggleAxes,
  onToggleWireframe,
}: ModelViewerControlsProps) {
  const dict = getModelViewerDictionary(language);
  const [showHelp, setShowHelp] = useState(false);

  const cameraButtons: Array<{ id: ModelCameraPreset; label: string }> = [
    { id: 'isometric', label: dict.controls.isometricView },
    { id: 'top', label: dict.controls.topView },
    { id: 'front', label: dict.controls.frontView },
    { id: 'side', label: dict.controls.sideView },
  ];

  return (
    <div className="w-full bg-[#111111] border border-white/10">
      <div
        role="toolbar"
        aria-label={dict.controls.toolbarLabel}
        className="p-2.5 sm:p-3 flex flex-wrap items-center justify-between gap-2"
      >
        {/* Camera Presets */}
        <div
          role="group"
          aria-label={dict.controls.cameraGroupLabel}
          className="flex flex-wrap items-center gap-1.5"
        >
          {cameraButtons.map((btn) => {
            const isActive = activePreset === btn.id;
            return (
              <button
                key={btn.id}
                type="button"
                disabled={disabled}
                aria-pressed={isActive}
                onClick={() => onSelectPreset(btn.id)}
                className={`min-h-[44px] px-3 py-2 text-xs font-medium uppercase tracking-[0.12em] border transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  isActive
                    ? 'bg-[#A65D4A] border-[#A65D4A] text-white'
                    : 'bg-[#181818] border-white/12 text-[#E0E0E0] hover:border-[#A65D4A]'
                }`}
              >
                <Compass size={14} strokeWidth={1.6} aria-hidden="true" />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>

        {/* Framing & Zoom Controls */}
        <div
          role="group"
          aria-label={dict.controls.actionsGroupLabel}
          className="flex flex-wrap items-center gap-1.5"
        >
          <button
            type="button"
            disabled={disabled}
            onClick={onRecenter}
            className="min-h-[44px] px-3 py-2 bg-[#181818] border border-white/12 hover:border-[#A65D4A] text-xs font-medium uppercase tracking-[0.12em] text-[#E0E0E0] inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Focus size={14} strokeWidth={1.6} aria-hidden="true" />
            <span>{dict.controls.recenterModel}</span>
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={onResetInitialView}
            className="min-h-[44px] px-3 py-2 bg-[#181818] border border-white/12 hover:border-[#A65D4A] text-xs font-medium uppercase tracking-[0.12em] text-[#E0E0E0] inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw size={14} strokeWidth={1.6} aria-hidden="true" />
            <span>{dict.controls.resetInitialView}</span>
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={onZoomIn}
            aria-label={dict.controls.zoomIn}
            title={dict.controls.zoomIn}
            className="min-h-[44px] min-w-[44px] px-2.5 py-2 bg-[#181818] border border-white/12 hover:border-[#A65D4A] text-xs font-medium text-[#E0E0E0] inline-flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ZoomIn size={16} strokeWidth={1.6} aria-hidden="true" />
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={onZoomOut}
            aria-label={dict.controls.zoomOut}
            title={dict.controls.zoomOut}
            className="min-h-[44px] min-w-[44px] px-2.5 py-2 bg-[#181818] border border-white/12 hover:border-[#A65D4A] text-xs font-medium text-[#E0E0E0] inline-flex items-center justify-center transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ZoomOut size={16} strokeWidth={1.6} aria-hidden="true" />
          </button>
        </div>

        {/* Spatial Overlays & Help */}
        <div
          role="group"
          aria-label={dict.controls.spatialGroupLabel}
          className="flex flex-wrap items-center gap-1.5"
        >
          <button
            type="button"
            disabled={disabled}
            aria-pressed={showGrid}
            onClick={onToggleGrid}
            className={`min-h-[44px] px-3 py-2 text-xs font-medium uppercase tracking-[0.12em] border transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              showGrid
                ? 'bg-[#222222] border-[#A65D4A] text-white'
                : 'bg-[#181818] border-white/12 text-[#BDBDBD] hover:border-white/30'
            }`}
          >
            <Grid3x3 size={14} strokeWidth={1.6} aria-hidden="true" />
            <span>{dict.controls.toggleGrid}</span>
          </button>

          <button
            type="button"
            disabled={disabled}
            aria-pressed={showAxes}
            onClick={onToggleAxes}
            className={`min-h-[44px] px-3 py-2 text-xs font-medium uppercase tracking-[0.12em] border transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              showAxes
                ? 'bg-[#222222] border-[#A65D4A] text-white'
                : 'bg-[#181818] border-white/12 text-[#BDBDBD] hover:border-white/30'
            }`}
          >
            <Axis3d size={14} strokeWidth={1.6} aria-hidden="true" />
            <span>{dict.controls.toggleAxes}</span>
          </button>

          <button
            type="button"
            disabled={disabled}
            aria-pressed={wireframe}
            onClick={onToggleWireframe}
            className={`min-h-[44px] px-3 py-2 text-xs font-medium uppercase tracking-[0.12em] border transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              wireframe
                ? 'bg-[#222222] border-[#A65D4A] text-white'
                : 'bg-[#181818] border-white/12 text-[#BDBDBD] hover:border-white/30'
            }`}
          >
            <Box size={14} strokeWidth={1.6} aria-hidden="true" />
            <span>{dict.controls.toggleWireframe}</span>
          </button>

          <button
            type="button"
            aria-expanded={showHelp}
            onClick={() => setShowHelp((prev) => !prev)}
            className={`min-h-[44px] px-3 py-2 text-xs font-medium uppercase tracking-[0.12em] border transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
              showHelp
                ? 'bg-[#222222] border-[#A65D4A] text-white'
                : 'bg-[#181818] border-white/12 text-[#E0E0E0] hover:border-white/30'
            }`}
          >
            <HelpCircle size={14} strokeWidth={1.6} aria-hidden="true" />
            <span>{dict.controls.toggleHelp}</span>
          </button>
        </div>
      </div>

      {showHelp && (
        <div
          data-testid="model-viewer-help-drawer"
          className="px-4 py-3 bg-[#181818] border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-[#E0E0E0]"
        >
          <div className="sm:col-span-2 lg:col-span-4">
            <p className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#CE826D]">
              {dict.controls.helpTitle}
            </p>
          </div>
          <p className="leading-relaxed text-[#BDBDBD]">{dict.controls.helpRotate}</p>
          <p className="leading-relaxed text-[#BDBDBD]">{dict.controls.helpZoom}</p>
          <p className="leading-relaxed text-[#BDBDBD]">{dict.controls.helpPan}</p>
          <p className="leading-relaxed text-[#BDBDBD]">{dict.controls.helpKeyboard}</p>
        </div>
      )}
    </div>
  );
}
