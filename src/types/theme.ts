export type BackgroundThemeId = 
  | 'hoang_kim'    // Hoàng Kim Thư Quán (Sáng vàng đồng ấm áp)
  | 'giay_diep'    // Giấy Điệp Cổ Truyền (Sáng kem ngà truyền thống)
  | 'truc_chi'     // Trúc Chỉ Nghệ Thuật (Sáng tinh khiết nhã nhặn)
  | 'bach_ngoc'    // Bạch Ngọc Tinh Khôi (Sáng trắng hiện đại sắc nét)
  | 'thu_hoa'      // Thư Họa Sơn Thủy (Sáng phong cảnh cổ điển)
  | 'dem_huyen'    // Đêm Huyền Bí (Nền tối viền vàng sang trọng)
  | 'custom';      // Hình nền hoặc màu tùy chỉnh của người dùng

export interface BackgroundTheme {
  id: BackgroundThemeId;
  name: string;
  subtitle: string;
  category: 'light' | 'dark' | 'custom';
  canvasBg: string;              // Màu nền CSS
  canvasPattern?: string;        // SVG pattern / Radial gradient / Image
  cardBg: string;                // Màu nền thẻ thành viên
  cardBorder: string;            // Viền thẻ
  textColor: string;             // Màu chữ chính
  textMuted: string;             // Màu chữ phụ
  accentColor: string;           // Màu nhấn chủ đạo
  previewThumb: string;          // Màu hoặc gradient minh họa
}

export type LineStyle = 'solid' | 'dashed' | 'curved';
export type LineColorMode = 'byParent' | 'byChild' | 'monochrome';

export interface GenerationColorConfig {
  // Mapping từ đời thứ (1, 2, 3...) sang mã màu Hex
  generationColors: Record<number, string>;
  defaultColor: string;
  lineStyle: LineStyle;
  lineWidth: number; // 2, 3, 4
  colorMode: LineColorMode;
  showGenBadge: boolean;
  highlightGlow: boolean;
}

export interface CustomThemeSettings {
  activeThemeId: BackgroundThemeId;
  customBgImageUrl?: string;
  customBgColor?: string;
  customBgOpacity?: number; // 0.1 to 1.0
  customBgBlur?: number;    // 0 to 10px
  generationColorConfig: GenerationColorConfig;
}
