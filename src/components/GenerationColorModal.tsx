import React, { useState } from 'react';
import { GenerationColorConfig, LineColorMode, LineStyle } from '../types/theme';
import { 
  PALETTE_PRESETS, 
  DEFAULT_GENERATION_COLORS,
  getGenerationColor 
} from '../utils/themeConfig';
import { 
  X, 
  GitBranch, 
  Sparkles, 
  Check, 
  RotateCcw, 
  Layers, 
  Sliders,
  Palette,
  Eye
} from 'lucide-react';

interface GenerationColorModalProps {
  isOpen: boolean;
  onClose: () => void;
  config?: GenerationColorConfig;
  colorConfig?: GenerationColorConfig;
  onUpdateConfig?: (newConfig: GenerationColorConfig) => void;
  onSaveColorConfig?: (newConfig: GenerationColorConfig) => void;
  maxGenerationInTree?: number;
  maxGenerations?: number;
}

export const GenerationColorModal: React.FC<GenerationColorModalProps> = ({
  isOpen,
  onClose,
  config: propConfig,
  colorConfig,
  onUpdateConfig,
  onSaveColorConfig,
  maxGenerationInTree,
  maxGenerations,
}) => {
  const activeConfig = propConfig || colorConfig || {
    colorMode: 'byChild',
    generationColors: DEFAULT_GENERATION_COLORS,
    lineWidth: 3,
    lineStyle: 'solid',
  };

  const handleConfigChange = (newConfig: GenerationColorConfig) => {
    if (onUpdateConfig) onUpdateConfig(newConfig);
    if (onSaveColorConfig) onSaveColorConfig(newConfig);
  };

  const [selectedGenTab, setSelectedGenTab] = useState<number>(1);
  const totalGenerations = Math.max(maxGenerationInTree || maxGenerations || 8, 8);
  const genList = Array.from({ length: totalGenerations }, (_, i) => i + 1);

  if (!isOpen) return null;

  const handleApplyPreset = (presetColors: Record<number, string>) => {
    handleConfigChange({
      ...activeConfig,
      generationColors: { ...presetColors },
    });
  };

  const handleColorChange = (gen: number, newHex: string) => {
    handleConfigChange({
      ...activeConfig,
      generationColors: {
        ...activeConfig.generationColors,
        [gen]: newHex,
      },
    });
  };

  const handleLineStyleChange = (style: LineStyle) => {
    handleConfigChange({
      ...activeConfig,
      lineStyle: style,
    });
  };

  const handleLineWidthChange = (width: number) => {
    handleConfigChange({
      ...activeConfig,
      lineWidth: width,
    });
  };

  const handleColorModeChange = (mode: LineColorMode) => {
    handleConfigChange({
      ...activeConfig,
      colorMode: mode,
    });
  };

  const handleResetDefaults = () => {
    handleConfigChange({
      generationColors: { ...DEFAULT_GENERATION_COLORS },
      defaultColor: '#c4a47c',
      lineStyle: 'solid',
      lineWidth: 3,
      colorMode: 'byParent',
      showGenBadge: true,
      highlightGlow: true,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-[#18181b] border border-[#27272a] text-[#f4f4f5] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-scaleUp max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#27272a] via-[#1f1f23] to-[#18181b] p-5 border-b border-[#27272a] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c4a47c]/15 border border-[#c4a47c]/30 text-[#c4a47c] flex items-center justify-center shadow-inner">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#f4f4f5] flex items-center gap-1.5">
                <span>Tùy Chỉnh Màu Line Nối Từng Đời</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#3b82f6]/20 text-[#60a5fa] border border-[#3b82f6]/30">
                  Phân Biệt Thế Hệ
                </span>
              </h3>
              <p className="text-xs text-[#a1a1aa]">Tự do chọn màu sắc riêng biệt cho từng nhánh thế hệ hoặc chọn bảng màu mẫu</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* 1. Curated Palette Presets */}
          <div>
            <label className="block text-xs font-bold text-[#f4f4f5] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#c4a47c]" />
              <span>1. Chọn Bộ Màu Sắc Mẫu Nhanh</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PALETTE_PRESETS.map((preset) => {
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset.colors)}
                    className="p-3 bg-[#121214] hover:bg-[#1f1f23] border border-[#27272a] hover:border-[#c4a47c] rounded-xl text-left transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-[#f4f4f5] group-hover:text-[#c4a47c]">
                        {preset.name}
                      </span>
                    </div>

                    {/* Color Swatch Bars */}
                    <div className="flex items-center gap-1 my-1.5 h-3 rounded-full overflow-hidden bg-[#27272a] p-0.5">
                      {Object.keys(preset.colors).slice(0, 8).map((gKey) => {
                        const gNum = Number(gKey);
                        return (
                          <div
                            key={gNum}
                            className="flex-1 h-full rounded-xs transition-transform hover:scale-125"
                            style={{ backgroundColor: preset.colors[gNum] }}
                            title={`Đời ${gNum}: ${preset.colors[gNum]}`}
                          />
                        );
                      })}
                    </div>

                    <p className="text-[10.5px] text-[#71717a] leading-tight">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Generation-by-Generation Custom Color Picker */}
          <div>
            <label className="block text-xs font-bold text-[#f4f4f5] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#c4a47c]" />
              <span>2. Tự Chọn Màu Cho Từng Đời Riêng Biệt</span>
            </label>

            <div className="bg-[#121214] border border-[#27272a] rounded-xl p-3.5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {genList.map((gen) => {
                  const currentColor = getGenerationColor(gen, activeConfig);

                  return (
                    <div
                      key={gen}
                      className="p-2 bg-[#18181b] border border-[#27272a] rounded-lg flex items-center justify-between gap-2 shadow-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: currentColor }}
                        >
                          {gen}
                        </div>
                        <span className="text-xs font-semibold text-[#e4e4e7] truncate">
                          Đời {gen}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <input
                          type="color"
                          value={currentColor}
                          onChange={(e) => handleColorChange(gen, e.target.value)}
                          className="w-7 h-7 rounded border border-[#3f3f46] cursor-pointer bg-transparent"
                          title={`Bấm chọn màu Đời ${gen}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 3. Line Style & Thickness & Mode Settings */}
          <div>
            <label className="block text-xs font-bold text-[#f4f4f5] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#c4a47c]" />
              <span>3. Kiểu Dáng & Độ Dày Đường Line</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Line Thickness */}
              <div className="p-3 bg-[#121214] border border-[#27272a] rounded-xl space-y-2">
                <span className="text-xs font-semibold text-[#d4d4d8] block">
                  Độ dày đường line
                </span>
                <div className="flex gap-1.5">
                  {[2, 3, 4].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => handleLineWidthChange(w)}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                        activeConfig.lineWidth === w
                          ? 'bg-[#c4a47c] text-[#0a0a0a] border-[#c4a47c]'
                          : 'bg-[#18181b] text-[#a1a1aa] border-[#27272a] hover:text-white'
                      }`}
                    >
                      {w}px {w === 2 ? '(Mảnh)' : w === 3 ? '(Vừa)' : '(Đậm)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Line Style */}
              <div className="p-3 bg-[#121214] border border-[#27272a] rounded-xl space-y-2">
                <span className="text-xs font-semibold text-[#d4d4d8] block">
                  Kiểu nét vẽ
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleLineStyleChange('solid')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      activeConfig.lineStyle === 'solid'
                        ? 'bg-[#c4a47c] text-[#0a0a0a] border-[#c4a47c]'
                        : 'bg-[#18181b] text-[#a1a1aa] border-[#27272a] hover:text-white'
                    }`}
                  >
                    Liền Nét
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLineStyleChange('dashed')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      activeConfig.lineStyle === 'dashed'
                        ? 'bg-[#c4a47c] text-[#0a0a0a] border-[#c4a47c]'
                        : 'bg-[#18181b] text-[#a1a1aa] border-[#27272a] hover:text-white'
                    }`}
                  >
                    Nét Đứt
                  </button>
                </div>
              </div>

              {/* Color Mode */}
              <div className="p-3 bg-[#121214] border border-[#27272a] rounded-xl space-y-2">
                <span className="text-xs font-semibold text-[#d4d4d8] block">
                  Màu theo thế hệ
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleColorModeChange('byParent')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      activeConfig.colorMode === 'byParent'
                        ? 'bg-[#c4a47c] text-[#0a0a0a] border-[#c4a47c]'
                        : 'bg-[#18181b] text-[#a1a1aa] border-[#27272a] hover:text-white'
                    }`}
                  >
                    Theo Đời Cha
                  </button>
                  <button
                    type="button"
                    onClick={() => handleColorModeChange('byChild')}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                      activeConfig.colorMode === 'byChild'
                        ? 'bg-[#c4a47c] text-[#0a0a0a] border-[#c4a47c]'
                        : 'bg-[#18181b] text-[#a1a1aa] border-[#27272a] hover:text-white'
                    }`}
                  >
                    Theo Đời Con
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-[#121214] px-5 py-3 border-t border-[#27272a] text-xs flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-[#a1a1aa] hover:text-[#c4a47c] flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục màu mặc định</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#27272a] hover:bg-[#3f3f46] text-white rounded-lg font-semibold transition-colors"
          >
            Hoàn tất
          </button>
        </div>
      </div>
    </div>
  );
};
