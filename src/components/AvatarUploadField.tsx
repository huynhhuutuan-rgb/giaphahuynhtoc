import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Link as LinkIcon, 
  Trash2, 
  Sparkles, 
  Maximize2, 
  Image as ImageIcon,
  Check,
  User,
  Info
} from 'lucide-react';
import { SAMPLE_PORTRAITS, SamplePortrait } from '../data/samplePortraits';
import { Gender } from '../types/family';

interface AvatarUploadFieldProps {
  avatarUrl: string | undefined;
  gender: Gender;
  memberName: string;
  onChange: (url: string | undefined) => void;
  onPreview10x20cm?: () => void;
}

export const AvatarUploadField: React.FC<AvatarUploadFieldProps> = ({
  avatarUrl,
  gender,
  memberName,
  onChange,
  onPreview10x20cm,
}) => {
  const [tab, setTab] = useState<'upload' | 'url' | 'samples'>('upload');
  const [urlInput, setUrlInput] = useState<string>(avatarUrl || '');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [dragOver, setDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter sample portraits by gender
  const relevantSamples = SAMPLE_PORTRAITS.filter(p => p.gender === (gender === 'Nữ' ? 'Nữ' : 'Nam'));

  // Process file upload with client-side canvas resizing for crisp, lightweight storage
  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh (JPG, PNG, WebP)');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Create canvas to resize to reasonable max dimension (e.g. max height 1000px, 1:2 portrait crop/fit)
        const canvas = document.createElement('canvas');
        const maxDim = 900;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Export as compressed JPEG base64 string
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          onChange(compressedDataUrl);
          setUrlInput(compressedDataUrl);
        }
        setIsProcessing(false);
      };
      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
    } else {
      onChange(undefined);
    }
  };

  const handleClear = () => {
    onChange(undefined);
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-3.5 bg-[#171717] rounded-xl border border-[#2a2a2a] space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#262626] pb-2">
        <div className="flex items-center gap-1.5 font-bold text-[#c4a47c]">
          <Camera className="w-4 h-4 text-[#c4a47c]" />
          <span className="uppercase tracking-wider text-[11px]">Ảnh Chân Dung &amp; Avatar Cá Nhân</span>
        </div>
        <span className="text-[10px] text-[#c4a47c] flex items-center gap-1">
          <span>📏 Hỗ trợ phóng to tối đa 10x20cm (Khổ 1:2)</span>
        </span>
      </div>

      {/* Main Avatar Layout: Preview Container + Controls */}
      <div className="flex flex-col sm:flex-row items-start gap-4">
        
        {/* 10x20cm Proportion Mini Preview Box */}
        <div className="flex flex-col items-center shrink-0 mx-auto sm:mx-0">
          <div 
            className="relative rounded-xl overflow-hidden border-2 border-[#3d2f1f] bg-[#121212] flex items-center justify-center group shadow-md"
            style={{
              width: '90px',
              height: '180px', // Exact 10cm x 20cm (1:2 aspect ratio preview)
            }}
          >
            {avatarUrl ? (
              <>
                <img
                  src={avatarUrl}
                  alt={memberName || 'Chân dung'}
                  className="w-full h-full object-cover object-top"
                  referrerPolicy="no-referrer"
                />
                
                {/* 10x20cm Tag */}
                <div className="absolute top-1 left-1 bg-black/80 text-[#c4a47c] text-[8px] font-mono px-1 py-0.2 rounded">
                  10x20cm
                </div>

                {/* Hover overlay with zoom button */}
                <div 
                  onClick={onPreview10x20cm}
                  className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 cursor-pointer p-1 text-center"
                  title="Bấm để phóng to tối đa 10x20cm"
                >
                  <Maximize2 className="w-4 h-4 text-[#c4a47c]" />
                  <span className="text-[9px] text-[#e5e5e5] font-semibold leading-tight">
                    Phóng to 10x20cm
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-[#555] p-2 text-center">
                <User className="w-8 h-8 text-[#444] mb-1" />
                <span className="text-[9px] font-medium text-[#777]">Chưa có ảnh</span>
                <span className="text-[8px] font-mono text-[#555] mt-0.5">Khổ 10x20</span>
              </div>
            )}
          </div>

          {/* Quick buttons under preview */}
          {avatarUrl && (
            <div className="flex items-center gap-1 mt-1.5">
              {onPreview10x20cm && (
                <button
                  type="button"
                  onClick={onPreview10x20cm}
                  className="px-1.5 py-0.5 bg-[#1f1a14] border border-[#3d2f1f] text-[#c4a47c] hover:text-[#e0b880] rounded text-[10px] flex items-center gap-1 font-medium"
                  title="Phóng to xem thử"
                >
                  <Maximize2 className="w-3 h-3" />
                  <span>Phóng to</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-[#f87171] hover:bg-[#2d1417] rounded transition-colors"
                title="Xóa ảnh"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Upload / Link / Sample Tabs & Inputs */}
        <div className="flex-1 w-full space-y-2.5">
          
          {/* Tab selector */}
          <div className="flex items-center gap-1 bg-[#121212] p-1 rounded-lg border border-[#262626]">
            <button
              type="button"
              onClick={() => setTab('upload')}
              className={`flex-1 py-1 px-2 rounded-md text-[11px] font-medium flex items-center justify-center gap-1 transition-colors ${
                tab === 'upload' ? 'bg-[#222222] text-[#c4a47c] font-bold shadow-xs' : 'text-[#8a8a8a] hover:text-[#e5e5e5]'
              }`}
            >
              <Upload className="w-3 h-3" />
              <span>Tải file từ máy</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('url')}
              className={`flex-1 py-1 px-2 rounded-md text-[11px] font-medium flex items-center justify-center gap-1 transition-colors ${
                tab === 'url' ? 'bg-[#222222] text-[#c4a47c] font-bold shadow-xs' : 'text-[#8a8a8a] hover:text-[#e5e5e5]'
              }`}
            >
              <LinkIcon className="w-3 h-3" />
              <span>Dán Link ảnh (URL)</span>
            </button>
            <button
              type="button"
              onClick={() => setTab('samples')}
              className={`flex-1 py-1 px-2 rounded-md text-[11px] font-medium flex items-center justify-center gap-1 transition-colors ${
                tab === 'samples' ? 'bg-[#222222] text-[#c4a47c] font-bold shadow-xs' : 'text-[#8a8a8a] hover:text-[#e5e5e5]'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>Ảnh mẫu ({gender})</span>
            </button>
          </div>

          {/* Tab 1: File Upload */}
          {tab === 'upload' && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileChange(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-3 sm:p-4 text-center cursor-pointer transition-colors ${
                dragOver 
                  ? 'border-[#c4a47c] bg-[#1f1a14]' 
                  : 'border-[#333333] hover:border-[#4d3c2a] bg-[#141414]'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
              
              <div className="flex flex-col items-center gap-1 text-xs">
                <div className="w-8 h-8 rounded-full bg-[#1c1813] border border-[#3d2f1f] text-[#c4a47c] flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <p className="font-semibold text-[#e5e5e5]">
                  {isProcessing ? 'Đang nén & tối ưu ảnh...' : 'Nhấp để chọn ảnh hoặc kéo thả vào đây'}
                </p>
                <p className="text-[10px] text-[#737373]">
                  Hỗ trợ JPG, PNG, WebP • Tự động căn chỉnh & tối ưu tỷ lệ 10x20cm
                </p>
              </div>
            </div>
          )}

          {/* Tab 2: Direct URL */}
          {tab === 'url' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/anh-chan-dung.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-[#141414] border border-[#333333] rounded-lg text-[#e5e5e5] focus:ring-2 focus:ring-[#c4a47c] focus:outline-hidden text-xs"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  className="px-3 py-1.5 bg-[#c4a47c] hover:bg-[#b5956d] text-[#0a0a0a] font-bold rounded-lg text-xs transition-colors shrink-0"
                >
                  Áp dụng
                </button>
              </div>
              <p className="text-[10px] text-[#737373]">
                Dán link ảnh từ Unsplash, Google Photos, Imgur hoặc website lưu trữ ảnh gia tộc.
              </p>
            </div>
          )}

          {/* Tab 3: Sample Portraits */}
          {tab === 'samples' && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {relevantSamples.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => {
                      onChange(sample.url);
                      setUrlInput(sample.url);
                    }}
                    className={`relative rounded-lg overflow-hidden border p-1 text-left flex items-center gap-2 transition-all ${
                      avatarUrl === sample.url
                        ? 'border-[#c4a47c] bg-[#1f1a14] ring-1 ring-[#c4a47c]'
                        : 'border-[#2c2c2c] bg-[#141414] hover:border-[#444]'
                    }`}
                  >
                    <img
                      src={sample.url}
                      alt={sample.name}
                      className="w-9 h-14 object-cover rounded shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-[#e5e5e5] truncate leading-tight">
                        {sample.name}
                      </p>
                      <p className="text-[9px] text-[#737373] truncate mt-0.5">
                        {sample.role}
                      </p>
                    </div>
                    {avatarUrl === sample.url && (
                      <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#c4a47c] text-[#0a0a0a] flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
