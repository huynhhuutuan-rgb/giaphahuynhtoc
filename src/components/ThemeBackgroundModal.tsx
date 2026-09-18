import React, { useState } from 'react';
import { BackgroundThemeId, CustomThemeSettings } from '../types/theme';
import { THEME_PRESETS, getThemeById } from '../utils/themeConfig';
import { 
  X, 
  Palette, 
  Image as ImageIcon, 
  Sparkles, 
  Check, 
  Upload, 
  Sun, 
  Moon, 
  RotateCcw,
  Sliders,
  Eye,
  Layers
} from 'lucide-react';

interface ThemeBackgroundModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeSettings: CustomThemeSettings;
  onUpdateThemeSettings?: (newSettings: CustomThemeSettings) => void;
  onSaveThemeSettings?: (newSettings: CustomThemeSettings) => void;
}

export const ThemeBackgroundModal: React.FC<ThemeBackgroundModalProps> = ({
  isOpen,
  onClose,
  themeSettings,
  onUpdateThemeSettings,
  onSaveThemeSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'custom'>('presets');
  const [customImageUrl, setCustomImageUrl] = useState(themeSettings.customBgImageUrl || '');
  const [customBgColor, setCustomBgColor] = useState(themeSettings.customBgColor || '#fbf7ee');
  const [customOpacity, setCustomOpacity] = useState(themeSettings.customBgOpacity ?? 0.85);
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  // Sync internal state with external themeSettings
  React.useEffect(() => {
    if (isOpen) {
      setCustomImageUrl(themeSettings.customBgImageUrl || '');
      setCustomBgColor(themeSettings.customBgColor || '#fbf7ee');
      setCustomOpacity(themeSettings.customBgOpacity ?? 0.85);
      if (themeSettings.activeThemeId === 'custom') {
        setActiveTab('custom');
      }
    }
  }, [isOpen, themeSettings]);

  if (!isOpen) return null;

  const saveSettings = (newSettings: CustomThemeSettings) => {
    if (onUpdateThemeSettings) {
      onUpdateThemeSettings(newSettings);
    }
    if (onSaveThemeSettings) {
      onSaveThemeSettings(newSettings);
    }
  };

  const handleSelectPreset = (themeId: BackgroundThemeId) => {
    saveSettings({
      ...themeSettings,
      activeThemeId: themeId,
    });
    setAppliedNotification(`Đã áp dụng chủ đề: ${getThemeById(themeId).name}`);
    setTimeout(() => setAppliedNotification(null), 2500);
  };

  const handleApplyCustom = () => {
    saveSettings({
      ...themeSettings,
      activeThemeId: 'custom',
      customBgImageUrl: customImageUrl.trim() || undefined,
      customBgColor: customBgColor,
      customBgOpacity: customOpacity,
    });
    setAppliedNotification('Đã áp dụng hình nền tùy chỉnh thành công!');
    setTimeout(() => setAppliedNotification(null), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCustomImageUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const sampleBackgrounds = [
    {
      name: 'Nhà Thờ Tộc Cổ Kính',
      url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Họa Tiết Mây Trúc Thư Họa',
      url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=80',
    },
    {
      name: 'Mặt Nước Hồ Sen Thanh Khiết',
      url: 'https://images.unsplash.com/photo-1508873696983-2df5293cb32f?auto=format&fit=crop&w=1200&q=80',
    },
  ];

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
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#f4f4f5] flex items-center gap-1.5">
                <span>Hình Nền & Chủ Đề Gia Phả</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30">
                  Tươi Sáng & Trang Trọng
                </span>
              </h3>
              <p className="text-xs text-[#a1a1aa]">Lựa chọn hình nền sáng truyền thống hoặc tùy chỉnh hình ảnh nhà thờ họ</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 pt-3 pb-0 border-b border-[#27272a] flex gap-4 text-xs font-semibold shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'presets'
                ? 'border-[#c4a47c] text-[#c4a47c]'
                : 'border-transparent text-[#a1a1aa] hover:text-white'
            }`}
          >
            <Sun className="w-4 h-4" />
            <span>Bộ Chủ Đề Truyền Thống (6 Mẫu)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`pb-2.5 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'custom'
                ? 'border-[#c4a47c] text-[#c4a47c]'
                : 'border-transparent text-[#a1a1aa] hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Tải Ảnh Nền Tùy Chỉnh</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {appliedNotification && (
            <div className="p-3 bg-[#10b981]/20 border border-[#10b981]/40 rounded-xl text-xs text-[#10b981] font-semibold flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 shrink-0" />
              <span>{appliedNotification}</span>
            </div>
          )}

          {activeTab === 'presets' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {THEME_PRESETS.map((t) => {
                const isSelected = themeSettings.activeThemeId === t.id;

                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelectPreset(t.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between group ${
                      isSelected
                        ? 'border-[#c4a47c] ring-2 ring-[#c4a47c]/30 shadow-lg'
                        : 'border-[#27272a] hover:border-[#3f3f46]'
                    }`}
                    style={{
                      background: t.category === 'light' 
                        ? (isSelected ? 'rgba(39, 39, 42, 0.9)' : 'rgba(24, 24, 27, 0.8)') 
                        : 'rgba(18, 18, 20, 0.9)',
                    }}
                  >
                    {/* Visual Card Preview Box */}
                    <div 
                      className="w-full h-24 rounded-lg p-2.5 mb-3 border flex flex-col justify-between relative overflow-hidden shadow-inner"
                      style={{
                        backgroundColor: t.canvasBg,
                        borderColor: t.cardBorder,
                      }}
                    >
                      {/* Mini Preview Elements */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div 
                            className="w-4 h-4 rounded-full text-[8px] flex items-center justify-center font-bold"
                            style={{ backgroundColor: t.accentColor, color: '#ffffff' }}
                          >
                            1
                          </div>
                          <span 
                            className="text-[10px] font-bold tracking-tight font-serif"
                            style={{ color: t.textColor }}
                          >
                            Thủy Tổ Dòng Họ
                          </span>
                        </div>
                        <span 
                          className="text-[8px] px-1.5 py-0.5 rounded font-mono"
                          style={{ backgroundColor: `${t.accentColor}20`, color: t.accentColor }}
                        >
                          Đời 1
                        </span>
                      </div>

                      <div 
                        className="p-1.5 rounded border shadow-xs text-[9px] flex items-center justify-between"
                        style={{
                          backgroundColor: t.cardBg,
                          borderColor: t.cardBorder,
                          color: t.textColor,
                        }}
                      >
                        <span className="font-medium">Huỳnh Văn A</span>
                        <span className="text-[8px]" style={{ color: t.textMuted }}>1890 - 1965</span>
                      </div>

                      {/* Pattern Overlay representation */}
                      <div 
                        className="absolute inset-0 pointer-events-none opacity-40"
                        style={{ backgroundImage: t.canvasPattern, backgroundSize: '16px 16px' }}
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-sm text-[#f4f4f5] group-hover:text-[#c4a47c] transition-colors flex items-center gap-1.5">
                          <span>{t.name}</span>
                          {t.category === 'light' ? (
                            <Sun className="w-3.5 h-3.5 text-[#f59e0b]" />
                          ) : (
                            <Moon className="w-3.5 h-3.5 text-[#818cf8]" />
                          )}
                        </h4>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-[#c4a47c] text-[#0a0a0a] flex items-center justify-center font-bold">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-[#a1a1aa] mt-1">{t.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Custom Image / Background Upload Form */
            <div className="space-y-4">
              <div className="p-4 bg-[#121214] border border-[#27272a] rounded-xl space-y-3">
                <label className="block text-xs font-bold text-[#f4f4f5] mb-1">
                  1. Chọn ảnh từ máy tính hoặc dán đường dẫn ảnh trực tuyến
                </label>

                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="https://... dán link ảnh nhà thờ họ / phong cảnh"
                    className="flex-1 px-3 py-2 bg-[#09090b] border border-[#27272a] rounded-xl text-xs text-[#f4f4f5] placeholder-[#52525b] focus:outline-none focus:border-[#c4a47c]"
                  />

                  <label className="px-3 py-2 bg-[#27272a] hover:bg-[#3f3f46] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shrink-0 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải ảnh từ máy</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Sample Quick Backgrounds */}
                <div className="pt-2">
                  <span className="text-[11px] text-[#a1a1aa] font-medium block mb-1.5">
                    Gợi ý ảnh nền mẫu đẹp:
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {sampleBackgrounds.map((bg, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCustomImageUrl(bg.url)}
                        className="text-left p-1.5 rounded-lg border border-[#27272a] hover:border-[#c4a47c] bg-[#18181b] transition-all group"
                      >
                        <img
                          src={bg.url}
                          alt={bg.name}
                          className="w-full h-12 object-cover rounded-md mb-1"
                        />
                        <span className="text-[10px] text-[#d4d4d8] font-medium block truncate group-hover:text-[#c4a47c]">
                          {bg.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Adjustments: Opacity & Color */}
              <div className="p-4 bg-[#121214] border border-[#27272a] rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-[#d4d4d8] mb-1.5">
                    <span>Độ trong suốt của ảnh nền</span>
                    <span className="text-[#c4a47c] font-mono">{Math.round(customOpacity * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={customOpacity}
                    onChange={(e) => setCustomOpacity(parseFloat(e.target.value))}
                    className="w-full accent-[#c4a47c] cursor-pointer"
                  />
                  <p className="text-[10px] text-[#71717a] mt-1">Giảm độ trong suốt giúp cây gia phả rõ ràng, dễ đọc hơn.</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#d4d4d8] mb-1.5">
                    Màu sắc nền phối hòa
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customBgColor}
                      onChange={(e) => setCustomBgColor(e.target.value)}
                      className="w-9 h-9 rounded-lg border border-[#27272a] cursor-pointer bg-transparent"
                    />
                    <input
                      type="text"
                      value={customBgColor}
                      onChange={(e) => setCustomBgColor(e.target.value)}
                      className="px-2.5 py-1.5 bg-[#09090b] border border-[#27272a] rounded-lg text-xs font-mono text-[#f4f4f5] w-24"
                    />
                  </div>
                </div>
              </div>

              {/* Preview Box */}
              {customImageUrl && (
                <div className="relative h-32 rounded-xl overflow-hidden border border-[#c4a47c]/40 shadow-inner">
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ 
                      backgroundImage: `url(${customImageUrl})`,
                      opacity: customOpacity,
                      backgroundColor: customBgColor,
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                    <span className="text-xs text-white font-medium flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-[#10b981]" />
                      Xem trước ảnh nền tùy chỉnh
                    </span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handleApplyCustom}
                className="w-full py-2.5 px-4 bg-[#c4a47c] hover:bg-[#b5956d] text-[#0a0a0a] font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Áp Dụng Ảnh Nền Này</span>
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#121214] px-5 py-3 border-t border-[#27272a] text-xs flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => handleSelectPreset('hoang_kim')}
            className="text-[#a1a1aa] hover:text-[#c4a47c] flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Khôi phục mặc định (Hoàng Kim)</span>
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
