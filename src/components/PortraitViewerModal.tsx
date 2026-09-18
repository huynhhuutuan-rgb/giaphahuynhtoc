import React, { useState, useRef } from 'react';
import { FamilyMember } from '../types/family';
import { 
  X, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Printer, 
  Download, 
  Maximize2, 
  Minimize2, 
  User, 
  Award, 
  Calendar, 
  MapPin, 
  Sparkles,
  Frame,
  Check,
  Share2,
  Info
} from 'lucide-react';

interface PortraitViewerModalProps {
  member: FamilyMember | null;
  onClose: () => void;
}

type FrameStyle = 'gold_clan' | 'classic_wood' | 'modern_minimal' | 'no_frame';

export const PortraitViewerModal: React.FC<PortraitViewerModalProps> = ({
  member,
  onClose,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(100); // 100% = chuẩn 10x20cm
  const [rotation, setRotation] = useState<number>(0);
  const [frameStyle, setFrameStyle] = useState<FrameStyle>('gold_clan');
  const [showPlaque, setShowPlaque] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const portraitContainerRef = useRef<HTMLDivElement>(null);

  if (!member) return null;

  const isDeceased = !!member.namMat;
  const isMale = member.gioiTinh === 'Nam';

  // Calculate age / lifespan
  const birth = member.namSinh;
  const death = member.namMat;
  const lifespan = (birth && death) ? `${birth} - ${death}` : birth ? `Sinh năm ${birth}` : death ? `Mất năm ${death}` : 'Chưa rõ';

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!member.avatar) return;
    const link = document.createElement('a');
    link.href = member.avatar;
    link.download = `ChanDung_10x20cm_${member.maGiaPha || 'ThanhVien'}_${member.hoTen.replace(/\s+/g, '_')}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div 
      className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className={`bg-[#121212] rounded-2xl shadow-2xl border border-[#2a2a2a] w-full ${
          isFullscreen ? 'max-w-6xl h-[96vh]' : 'max-w-4xl max-h-[92vh]'
        } flex flex-col overflow-hidden text-[#e5e5e5] transition-all`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Toolbar */}
        <div className="px-4 sm:px-6 py-3 border-b border-[#262626] flex items-center justify-between bg-[#0d0d0d] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1f1a14] border border-[#3d2f1f] text-[#c4a47c] flex items-center justify-center font-bold">
              <Frame className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#e5e5e5] flex items-center gap-2">
                <span>Ảnh Chân Dung Cá Nhân</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1c1c1c] border border-[#2e2e2e] text-[#c4a47c]">
                  Kích thước phóng to tối đa 10x20 cm (Tỉ lệ 1:2)
                </span>
              </h3>
              <p className="text-xs text-[#8a8a8a] hidden sm:block">
                {member.hoTen} • Đời thứ {member.doiThu} {member.maGiaPha ? `• Mã ${member.maGiaPha}` : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Frame style selector */}
            <div className="hidden md:flex items-center bg-[#1a1a1a] rounded-lg p-0.5 border border-[#2e2e2e] text-xs">
              <button
                onClick={() => setFrameStyle('gold_clan')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  frameStyle === 'gold_clan' ? 'bg-[#c4a47c] text-[#0a0a0a] font-bold' : 'text-[#a3a3a3] hover:text-white'
                }`}
                title="Khung viền vàng đồng gia tộc"
              >
                Khung Hoàng Kim
              </button>
              <button
                onClick={() => setFrameStyle('classic_wood')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  frameStyle === 'classic_wood' ? 'bg-[#3b271d] text-amber-100 font-bold' : 'text-[#a3a3a3] hover:text-white'
                }`}
                title="Khung gỗ mun cổ điển"
              >
                Khung Gỗ Mun
              </button>
              <button
                onClick={() => setFrameStyle('modern_minimal')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  frameStyle === 'modern_minimal' ? 'bg-[#2a2a2a] text-white font-bold' : 'text-[#a3a3a3] hover:text-white'
                }`}
                title="Viền tối giản"
              >
                Tối Giản
              </button>
            </div>

            {/* Print button */}
            <button
              onClick={handlePrint}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#262626] border border-[#2e2e2e] text-[#d4d4d4] hover:text-white text-xs flex items-center gap-1.5 transition-colors"
              title="In ảnh chân dung khổ 10x20cm"
            >
              <Printer className="w-4 h-4 text-[#c4a47c]" />
              <span className="hidden sm:inline">In 10x20cm</span>
            </button>

            {/* Download button if image exists */}
            {member.avatar && (
              <button
                onClick={handleDownload}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#1a1a1a] hover:bg-[#262626] border border-[#2e2e2e] text-[#d4d4d4] hover:text-white text-xs flex items-center gap-1.5 transition-colors"
                title="Tải ảnh về máy"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Tải về</span>
              </button>
            )}

            {/* Fullscreen toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg hover:bg-[#222] text-[#8a8a8a] hover:text-white transition-colors"
              title={isFullscreen ? "Thu nhỏ" : "Phóng to cửa sổ"}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-[#222] text-[#8a8a8a] hover:text-white transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewport Canvas with Zoom & 10x20cm Ratio Frame */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 flex flex-col items-center justify-center bg-[#080808] relative">
          
          {/* Zoom & Rotation Floating Control Bar */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-[#141414]/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#2e2e2e] shadow-xl text-xs">
            <button
              onClick={() => setZoomLevel(prev => Math.max(50, prev - 15))}
              className="p-1 hover:bg-[#262626] rounded-full text-[#a3a3a3] hover:text-white transition-colors"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <span className="font-mono text-[11px] font-bold text-[#c4a47c] px-1 min-w-[45px] text-center">
              {zoomLevel}%
            </span>

            <button
              onClick={() => setZoomLevel(prev => Math.min(200, prev + 15))}
              className="p-1 hover:bg-[#262626] rounded-full text-[#a3a3a3] hover:text-white transition-colors"
              title="Phóng to"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-3.5 bg-[#333] mx-1"></div>

            <button
              onClick={() => setZoomLevel(100)}
              className="px-2 py-0.5 hover:bg-[#262626] rounded-full text-[10px] text-[#d4d4d4] font-medium transition-colors"
              title="Khổ chuẩn 10x20cm (100%)"
            >
              10x20cm chuẩn
            </button>

            <button
              onClick={() => setRotation(prev => (prev + 90) % 360)}
              className="p-1 hover:bg-[#262626] rounded-full text-[#a3a3a3] hover:text-white transition-colors"
              title="Xoay ảnh 90°"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setShowPlaque(!showPlaque)}
              className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-colors ${
                showPlaque ? 'bg-[#222] text-[#c4a47c]' : 'text-[#737373] hover:text-[#a3a3a3]'
              }`}
              title="Bật/tắt biển tên chân dung"
            >
              Biển tên: {showPlaque ? 'Bật' : 'Tắt'}
            </button>
          </div>

          {/* Portrait Framed Showcase Container */}
          <div 
            ref={portraitContainerRef}
            className="my-auto transition-transform duration-200 flex flex-col items-center print:m-0 print:p-0"
            style={{
              transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
            }}
          >
            {/*
              10x20cm Ratio Frame:
              In 96 DPI: 10cm ≈ 378px, 20cm ≈ 756px.
              Ratio width:height is exactly 1:2.
            */}
            <div 
              className={`relative flex flex-col items-center justify-between rounded-xl overflow-hidden shadow-2xl transition-all ${
                frameStyle === 'gold_clan'
                  ? 'bg-gradient-to-b from-[#1c1813] to-[#0d0c0a] border-8 border-[#8c6d3d] ring-2 ring-[#c4a47c]/60 p-3 shadow-[#c4a47c]/15'
                  : frameStyle === 'classic_wood'
                  ? 'bg-gradient-to-b from-[#241711] to-[#120b08] border-8 border-[#3b2316] ring-2 ring-[#5e3822] p-3 shadow-black/80'
                  : frameStyle === 'modern_minimal'
                  ? 'bg-[#141414] border-4 border-[#333333] p-2'
                  : 'bg-transparent p-0'
              }`}
              style={{
                width: '320px',
                height: '640px', // Exact 10cm x 20cm (1:2 aspect ratio)
                maxWidth: '85vw',
                maxHeight: '75vh',
                aspectRatio: '1 / 2',
              }}
            >
              {/* Gold Ornamental Corner Accents for Gold Clan Frame */}
              {frameStyle === 'gold_clan' && (
                <>
                  <div className="absolute top-1 left-1 w-4 h-4 border-t-2 border-l-2 border-[#e6ca9c] pointer-events-none z-10" />
                  <div className="absolute top-1 right-1 w-4 h-4 border-t-2 border-r-2 border-[#e6ca9c] pointer-events-none z-10" />
                  <div className="absolute bottom-1 left-1 w-4 h-4 border-b-2 border-l-2 border-[#e6ca9c] pointer-events-none z-10" />
                  <div className="absolute bottom-1 right-1 w-4 h-4 border-b-2 border-r-2 border-[#e6ca9c] pointer-events-none z-10" />
                </>
              )}

              {/* Deceased Ribbon or Honor Badge */}
              {isDeceased ? (
                <div className="absolute top-2 right-2 z-20 bg-black/85 text-neutral-300 border border-neutral-700 text-[10px] font-serif px-2 py-0.5 rounded shadow-md flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400"></span>
                  <span>Di ảnh kính nhớ</span>
                </div>
              ) : (
                <div className="absolute top-2 right-2 z-20 bg-[#1f1a14]/90 text-[#c4a47c] border border-[#3d2f1f] text-[10px] font-bold px-2 py-0.5 rounded shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#c4a47c]" />
                  <span>Đời thứ {member.doiThu}</span>
                </div>
              )}

              {/* Ratio & Dimension indicator tag */}
              <div className="absolute top-2 left-2 z-20 bg-black/75 text-[#a3a3a3] border border-[#2e2e2e] text-[9.5px] font-mono px-1.5 py-0.5 rounded">
                Khổ 10x20cm (1:2)
              </div>

              {/* Image Center View */}
              <div className="w-full flex-1 flex items-center justify-center overflow-hidden rounded-lg bg-[#0a0a0a] relative my-1">
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.hoTen}
                    className="w-full h-full object-cover object-top transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-6 text-[#737373] space-y-3">
                    <div className="w-24 h-24 rounded-full bg-[#181818] border border-[#2a2a2a] flex items-center justify-center text-4xl font-bold text-[#c4a47c]">
                      {member.hoTen ? member.hoTen.charAt(0) : <User className="w-12 h-12" />}
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-semibold text-[#a3a3a3]">Chưa có ảnh chân dung</p>
                      <p className="text-[10px] text-[#525252]">Vào chỉnh sửa thành viên để tải ảnh lên (khổ dọc 10x20cm)</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Ceremonial Name Plaque / Kim Bài Tôn Nghiêm */}
              {showPlaque && (
                <div 
                  className={`w-full text-center p-2.5 rounded-lg border shrink-0 space-y-1 ${
                    frameStyle === 'gold_clan'
                      ? 'bg-gradient-to-r from-[#211a12] via-[#2d2216] to-[#211a12] border-[#4a3922] text-[#f3e3cd]'
                      : frameStyle === 'classic_wood'
                      ? 'bg-[#1a100a] border-[#382013] text-[#e8d2c2]'
                      : 'bg-[#181818] border-[#2a2a2a] text-[#e5e5e5]'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#c4a47c]">
                      Đời thứ {member.doiThu}
                    </span>
                    {member.maGiaPha && (
                      <span className="text-[9.5px] font-mono px-1 py-0.2 rounded bg-black/40 text-[#c4a47c] border border-[#3d2f1f]">
                        {member.maGiaPha}
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm tracking-wide text-[#ffffff] font-serif uppercase">
                    {isDeceased ? `Cố ${member.hoTen}` : member.hoTen}
                  </h4>

                  <div className="text-[10px] text-[#a3a3a3] font-serif flex items-center justify-center gap-2">
                    <span>{lifespan}</span>
                    {member.gioiTinh && <span>• {member.gioiTinh}</span>}
                  </div>

                  {member.ghiChu && (
                    <div className="text-[9.5px] text-[#c4a47c] italic font-medium truncate px-1">
                      {member.ghiChu}
                    </div>
                  )}

                  {member.ngayGio && (
                    <div className="text-[9px] text-amber-300/80 pt-0.5">
                      Kỵ nhật: {member.ngayGio}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer info & Guidance */}
        <div className="px-4 sm:px-6 py-2.5 bg-[#0e0e0e] border-t border-[#222222] flex flex-wrap items-center justify-between text-xs text-[#737373] shrink-0 gap-2">
          <div className="flex items-center gap-2 text-[11px]">
            <Info className="w-3.5 h-3.5 text-[#c4a47c] shrink-0" />
            <span>
              Tỉ lệ ảnh chân dung dọc <strong>10 x 20 cm (1:2)</strong> chuẩn khung ảnh thờ phụng, kỷ yếu và lưu trữ gia phả truyền thống.
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span>Phím tắt: Cuộn chuột để xem • Nhấp <strong>In 10x20cm</strong> để in ấn</span>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-[#222] hover:bg-[#2c2c2c] text-[#d4d4d4] rounded text-xs transition-colors font-medium cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
