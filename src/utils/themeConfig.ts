import { BackgroundTheme, BackgroundThemeId, GenerationColorConfig, CustomThemeSettings } from '../types/theme';

export const THEME_PRESETS: BackgroundTheme[] = [
  {
    id: 'hoang_kim',
    name: 'Hoàng Kim Thư Quán',
    subtitle: 'Nền sáng vàng đồng cổ kính, thanh tao cung đình',
    category: 'light',
    canvasBg: '#fbf7ee',
    canvasPattern: 'radial-gradient(#d6c096 1.4px, transparent 1.4px)',
    cardBg: '#ffffff',
    cardBorder: '#e8dbbe',
    textColor: '#1f1b14',
    textMuted: '#665d50',
    accentColor: '#b48535',
    previewThumb: 'linear-gradient(135deg, #fbf7ee 0%, #ecdcb9 100%)',
  },
  {
    id: 'giay_diep',
    name: 'Giấy Điệp Truyền Thống',
    subtitle: 'Màu giấy ngà cổ truyền, tôn vinh nét đẹp cội nguồn',
    category: 'light',
    canvasBg: '#f7f4ea',
    canvasPattern: 'radial-gradient(#c7b99c 1.2px, transparent 1.2px)',
    cardBg: '#fffdf9',
    cardBorder: '#dfd5be',
    textColor: '#24201a',
    textMuted: '#6e6557',
    accentColor: '#966d33',
    previewThumb: 'linear-gradient(135deg, #f9f6ee 0%, #dfd5be 100%)',
  },
  {
    id: 'truc_chi',
    name: 'Trúc Chỉ Thanh Nhã',
    subtitle: 'Nền giấy sáng thanh khiết, trang trọng và tinh tế',
    category: 'light',
    canvasBg: '#faf9f5',
    canvasPattern: 'radial-gradient(#d1cfc7 1.2px, transparent 1.2px)',
    cardBg: '#ffffff',
    cardBorder: '#e2dfd5',
    textColor: '#1c1b18',
    textMuted: '#68655c',
    accentColor: '#059669',
    previewThumb: 'linear-gradient(135deg, #faf9f5 0%, #d5e8dc 100%)',
  },
  {
    id: 'bach_ngoc',
    name: 'Bạch Ngọc Tinh Khôi',
    subtitle: 'Nền sáng trắng hiện đại, độ tương phản cao sắc nét',
    category: 'light',
    canvasBg: '#f8fafc',
    canvasPattern: 'radial-gradient(#cbd5e1 1.2px, transparent 1.2px)',
    cardBg: '#ffffff',
    cardBorder: '#e2e8f0',
    textColor: '#0f172a',
    textMuted: '#64748b',
    accentColor: '#2563eb',
    previewThumb: 'linear-gradient(135deg, #f8fafc 0%, #dbeafe 100%)',
  },
  {
    id: 'thu_hoa',
    name: 'Thư Họa Sơn Thủy',
    subtitle: 'Màu trà nhạt cổ điển, họa tiết phong cảnh trang nhã',
    category: 'light',
    canvasBg: '#f5f0e6',
    canvasPattern: 'radial-gradient(#cbbca6 1.4px, transparent 1.4px)',
    cardBg: '#fffefb',
    cardBorder: '#d9cdb8',
    textColor: '#29231c',
    textMuted: '#706456',
    accentColor: '#b45309',
    previewThumb: 'linear-gradient(135deg, #f5f0e6 0%, #d8c3a5 100%)',
  },
  {
    id: 'dem_huyen',
    name: 'Đêm Huyền Bí (Dark Mode)',
    subtitle: 'Nền đen mun ánh kim sang trọng, bảo vệ mắt ban đêm',
    category: 'dark',
    canvasBg: '#0f0f10',
    canvasPattern: 'radial-gradient(#2b2b2b 1.3px, transparent 1.3px)',
    cardBg: '#181819',
    cardBorder: '#2d2d30',
    textColor: '#f1f1f1',
    textMuted: '#9e9e9e',
    accentColor: '#c4a47c',
    previewThumb: 'linear-gradient(135deg, #181819 0%, #000000 100%)',
  },
];

// Bộ màu mặc định chuẩn từng đời
export const DEFAULT_GENERATION_COLORS: Record<number, string> = {
  1: '#d97706', // Đời 1: Hoàng Kim Rực Rỡ (Amber Gold)
  2: '#059669', // Đời 2: Lục Bảo Hoàng Gia (Emerald)
  3: '#2563eb', // Đời 3: Lam Ngọc Cung Đình (Royal Blue)
  4: '#7c3aed', // Đời 4: Tím Thạch Anh (Violet)
  5: '#db2777', // Đời 5: Hồng Ngọc Quý Phái (Rose Pink)
  6: '#ea580c', // Đời 6: Cam Chu Sa (Vermilion Orange)
  7: '#0d9488', // Đời 7: Thanh Trúc (Teal Cyan)
  8: '#4f46e5', // Đời 8: Chàm Hoàng Tộc (Indigo)
  9: '#ca8a04', // Đời 9: Hoàng Thổ (Yellow Bronze)
  10: '#0284c7', // Đời 10+: Hải Lam Sâu Thẳm (Sky Ocean)
};

// Các bộ phối màu mẫu cho từng đời (Color Palettes Presets)
export const PALETTE_PRESETS: { id: string; name: string; description: string; colors: Record<number, string> }[] = [
  {
    id: 'ngu_hanh',
    name: 'Ngũ Hành Tương Sinh (Khuyên Dùng)',
    description: 'Mỗi thế hệ một sắc thái phong thủy rực rỡ, phân biệt trực quan tuyệt đối',
    colors: {
      1: '#d97706', // Kim/Thổ: Vàng Hoàng Kim
      2: '#059669', // Mộc: Xanh Lục Bảo
      3: '#2563eb', // Thủy: Xanh Lam Ngọc
      4: '#7c3aed', // Tím Cung Đình
      5: '#db2777', // Hỏa: Đỏ Hồng Ngọc
      6: '#ea580c', // Cam Chu Sa
      7: '#0d9488', // Thanh Trúc
      8: '#4f46e5', // Chàm Quý Phái
      9: '#b45309', // Đồng Cổ
      10: '#0284c7', // Lam Hải
    },
  },
  {
    id: 'cung_dinh_hue',
    name: 'Cung Đình Đại Việt',
    description: 'Bộ màu hoàng tộc trang trọng, nhã nhặn, tôn nghiêm gia tộc',
    colors: {
      1: '#b48535', // Vàng Đế Vương
      2: '#8b5cf6', // Tím Hoàng Gia
      3: '#0284c7', // Xanh Thiên Thanh
      4: '#15803d', // Xanh Cổ Thụ
      5: '#c2410c', // Đỏ Gạch Cung Điện
      6: '#a855f7', // Tím Hoa Cà
      7: '#0891b2', // Xanh Ngọc Bích
      8: '#475569', // Xám Đá Cổ
      9: '#d97706', // Hoàng Yến
      10: '#1e40af', // Xanh Thẫm
    },
  },
  {
    id: 'cau_vong',
    name: 'Cầu Vồng Tươi Sáng (Vibrant)',
    description: 'Các sắc màu tươi sáng hiện đại, trẻ trung, nhận diện thế hệ siêu rõ',
    colors: {
      1: '#ef4444', // Đỏ tươi
      2: '#f97316', // Cam rực
      3: '#eab308', // Vàng nắng
      4: '#22c55e', // Xanh lá
      5: '#06b6d4', // Xanh lơ
      6: '#3b82f6', // Xanh biển
      7: '#8b5cf6', // Tím hoa
      8: '#ec4899', // Hồng phấn
      9: '#14b8a6', // Ngọc bích
      10: '#6366f1', // Lam tím
    },
  },
  {
    id: 'hoang_kim_dong_dieu',
    name: 'Hoàng Kim Sang Trọng (Đồng Nhất)',
    description: 'Gam màu vàng đồng quý phái truyền thống cho toàn bộ gia tộc',
    colors: {
      1: '#b48535',
      2: '#c49a45',
      3: '#a17228',
      4: '#b88938',
      5: '#9c6c22',
      6: '#c99f4a',
      7: '#a8792e',
      8: '#8f5f19',
      9: '#ba8b3a',
      10: '#ab7c2d',
    },
  },
];

export const DEFAULT_THEME_SETTINGS: CustomThemeSettings = {
  activeThemeId: 'hoang_kim', // Default to bright warm golden theme
  customBgOpacity: 0.9,
  customBgBlur: 0,
  generationColorConfig: {
    generationColors: { ...DEFAULT_GENERATION_COLORS },
    defaultColor: '#c4a47c',
    lineStyle: 'solid',
    lineWidth: 3,
    colorMode: 'byParent',
    showGenBadge: true,
    highlightGlow: true,
  },
};

/**
 * Lấy mã màu của một đời thứ bất kỳ
 */
export function getGenerationColor(gen: number, config?: GenerationColorConfig): string {
  if (!config) return DEFAULT_GENERATION_COLORS[gen] || '#c4a47c';
  if (config.generationColors && config.generationColors[gen]) {
    return config.generationColors[gen];
  }
  // Fallback pattern if gen > 10
  const baseIndex = ((gen - 1) % 10) + 1;
  return DEFAULT_GENERATION_COLORS[baseIndex] || config.defaultColor || '#c4a47c';
}

/**
 * Lấy theme object theo ID
 */
export function getThemeById(themeId: BackgroundThemeId): BackgroundTheme {
  const found = THEME_PRESETS.find(t => t.id === themeId);
  return found || THEME_PRESETS[0];
}
