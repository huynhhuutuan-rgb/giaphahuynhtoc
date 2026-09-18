import React from 'react';
import { FamilyMember } from '../types/family';
import { 
  User, 
  Heart, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Sparkles, 
  Phone, 
  MapPin, 
  ChevronDown, 
  ChevronUp,
  Award,
  Maximize2,
  Frame
} from 'lucide-react';
import { CARD_WIDTH, CARD_HEIGHT, SPOUSE_CARD_WIDTH, COUPLE_GAP } from '../utils/treeLayout';

interface MemberCardProps {
  member: FamilyMember;
  spouse?: FamilyMember;
  hasChildren: boolean;
  childrenCount: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onSelectMember: (member: FamilyMember) => void;
  onEditMember: (member: FamilyMember) => void;
  onDeleteMember: (member: FamilyMember) => void;
  onAddChild: (parent: FamilyMember, spouse?: FamilyMember) => void;
  onAddSpouse: (member: FamilyMember) => void;
  onPreviewPortrait?: (member: FamilyMember) => void;
  isHighlighted?: boolean;
  generationColor?: string;
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  spouse,
  hasChildren,
  childrenCount,
  isCollapsed,
  onToggleCollapse,
  onSelectMember,
  onEditMember,
  onDeleteMember,
  onAddChild,
  onAddSpouse,
  onPreviewPortrait,
  isHighlighted,
  generationColor,
}) => {
  const isMale = member.gioiTinh === 'Nam';
  const isDeceased = !!member.namMat;
  
  // Tính tuổi hoặc thọ
  const getAgeOrLifespan = (m: FamilyMember) => {
    const birth = typeof m.namSinh === 'number' ? m.namSinh : parseInt(String(m.namSinh)) || null;
    const death = typeof m.namMat === 'number' ? m.namMat : parseInt(String(m.namMat)) || null;

    if (birth && death) {
      return `${birth} - ${death} (Thọ ${death - birth}t)`;
    } else if (birth) {
      const currentYear = new Date().getFullYear();
      return `Sinh năm ${birth} (${currentYear - birth}t)`;
    } else if (death) {
      return `Mất năm ${death}`;
    }
    return '';
  };

  return (
    <div className="flex items-center select-none" style={{ gap: `${COUPLE_GAP}px` }}>
      {/* Primary Member Box */}
      <div
        id={`card-member-${member.id}`}
        onClick={() => onSelectMember(member)}
        style={{ width: `${CARD_WIDTH}px`, height: `${CARD_HEIGHT}px` }}
        className={`group relative rounded-xl border transition-all duration-200 cursor-pointer shadow-md flex flex-col justify-between p-3 ${
          isHighlighted
            ? 'ring-4 ring-[#c4a47c] border-[#c4a47c] bg-[#1f1a14] shadow-lg shadow-[#c4a47c]/20 scale-105 z-20'
            : isDeceased
            ? 'bg-[#141414]/95 border-[#262626] hover:border-[#3d3d3d]'
            : isMale
            ? 'bg-[#12161f] border-[#1f293d] hover:border-[#3b82f6]/60'
            : 'bg-[#1a1217] border-[#3b1f2e] hover:border-[#ec4899]/60'
        }`}
      >
        {/* Top Header Row: Generation Badge & Lineage Code */}
        <div className="flex items-center justify-between gap-1.5 text-xs">
          <div className="flex items-center gap-1">
            <span
              style={generationColor ? {
                backgroundColor: `${generationColor}26`,
                color: generationColor,
                borderColor: `${generationColor}66`,
              } : undefined}
              className={`px-1.5 py-0.5 rounded text-[10px] font-bold tracking-tight border ${
                !generationColor ? (
                  member.doiThu === 1
                    ? 'bg-[#c4a47c] text-[#0a0a0a] border-[#c4a47c] shadow-xs'
                    : 'bg-[#222222] text-[#d4d4d4] border-[#2e2e2e]'
                ) : ''
              }`}
            >
              Đời {member.doiThu}
            </span>
            {member.maGiaPha && (
              <span className="font-mono text-[10px] px-1 py-0.5 rounded bg-[#1c1c1c] border border-[#2a2a2a] text-[#a3a3a3] truncate max-w-[85px]">
                {member.maGiaPha}
              </span>
            )}
          </div>

          {/* Status Badge: Alive or Deceased */}
          {isDeceased ? (
            <span className="inline-flex items-center gap-1 text-[10px] text-[#737373] font-serif italic">
              <span className="w-1.5 h-1.5 rounded-full bg-[#525252]"></span>
              Đã khuất
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Còn sống
            </span>
          )}
        </div>

        {/* Center: Avatar & Full Name */}
        <div className="flex items-center gap-2.5 my-1">
          <div
            onClick={(e) => {
              if (onPreviewPortrait && member.avatar) {
                e.stopPropagation();
                onPreviewPortrait(member);
              }
            }}
            title={member.avatar ? "Bấm xem ảnh chân dung phóng to 10x20cm" : member.hoTen}
            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border shadow-xs transition-transform hover:scale-110 ${
              isDeceased
                ? 'bg-[#1c1c1c] text-[#737373] border-[#2a2a2a]'
                : isMale
                ? 'bg-[#192438] text-[#60a5fa] border-[#253959]'
                : 'bg-[#2d1822] text-[#f472b6] border-[#4a2337]'
            }`}
          >
            {member.avatar ? (
              <img
                src={member.avatar}
                alt={member.hoTen}
                className="w-full h-full rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <User className="w-5 h-5" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4
              className="text-sm font-bold text-[#e5e5e5] truncate leading-tight group-hover:text-[#c4a47c] transition-colors"
              title={member.hoTen}
            >
              {member.hoTen}
            </h4>
            <p className="text-[11px] text-[#8a8a8a] truncate mt-0.5 font-sans">
              {getAgeOrLifespan(member) || (member.ghiChu ? member.ghiChu : 'Thành viên dòng tộc')}
            </p>
          </div>
        </div>

        {/* Bottom Note or Info */}
        <div className="flex items-center justify-between text-[11px] text-[#8a8a8a] border-t border-[#222222] pt-1.5 mt-0.5">
          <span className="truncate max-w-[130px] italic text-[10.5px] text-[#737373]">
            {member.ghiChu || (member.queQuan ? `Quê: ${member.queQuan}` : 'Huỳnh Tộc')}
          </span>
          <span className="text-[10px] font-mono text-[#525252]">#{member.id}</span>
        </div>

        {/* Floating Quick Action Overlay on Hover */}
        <div className="absolute -top-3 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-[#1a1a1a]/95 backdrop-blur-md text-white p-1 rounded-lg shadow-xl border border-[#2e2e2e] z-30">
          <button
            title="Xem chân dung phóng to 10x20cm"
            onClick={(e) => {
              e.stopPropagation();
              if (onPreviewPortrait) onPreviewPortrait(member);
              else onSelectMember(member);
            }}
            className="p-1 hover:bg-[#2a2a2a] rounded transition-colors text-[#e0b880] hover:text-white"
          >
            <Frame className="w-3.5 h-3.5" />
          </button>
          <button
            title="Xem chi tiết"
            onClick={(e) => {
              e.stopPropagation();
              onSelectMember(member);
            }}
            className="p-1 hover:bg-[#2a2a2a] rounded transition-colors text-[#d4d4d4] hover:text-white"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            title="Chỉnh sửa thông tin"
            onClick={(e) => {
              e.stopPropagation();
              onEditMember(member);
            }}
            className="p-1 hover:bg-[#2a2a2a] rounded transition-colors text-[#c4a47c]"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            title="Thêm con"
            onClick={(e) => {
              e.stopPropagation();
              onAddChild(member, spouse);
            }}
            className="p-1 hover:bg-[#2a2a2a] rounded transition-colors text-emerald-400"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          {!spouse && (
            <button
              title="Thêm vợ/chồng"
              onClick={(e) => {
                e.stopPropagation();
                onAddSpouse(member);
              }}
              className="p-1 hover:bg-[#2a2a2a] rounded transition-colors text-pink-400"
            >
              <Heart className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            title="Xóa"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteMember(member);
            }}
            className="p-1 hover:bg-red-600/80 rounded transition-colors text-red-400 hover:text-white"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Expand/Collapse Button if has children */}
        {hasChildren && onToggleCollapse && (
          <button
            title={isCollapsed ? `Mở rộng ${childrenCount} người con` : 'Thu gọn nhánh'}
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse();
            }}
            className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-0.5 shadow-md border transition-all z-20 ${
              isCollapsed
                ? 'bg-[#c4a47c] hover:bg-[#b5956d] text-[#0a0a0a] font-bold border-[#c4a47c]'
                : 'bg-[#1c1c1c] hover:bg-[#282828] text-[#d4d4d4] border-[#2e2e2e]'
            }`}
          >
            {isCollapsed ? (
              <>
                <span>+{childrenCount} con</span>
                <ChevronDown className="w-3 h-3" />
              </>
            ) : (
              <>
                <ChevronUp className="w-3 h-3" />
              </>
            )}
          </button>
        )}
      </div>

      {/* Marriage Symbol connector */}
      {spouse && (
        <div className="flex items-center justify-center shrink-0">
          <div className="w-5 h-5 rounded-full bg-[#2d1822] border border-[#4a2337] text-[#f472b6] flex items-center justify-center shadow-xs">
            <Heart className="w-3 h-3 fill-[#f472b6] text-[#f472b6]" />
          </div>
        </div>
      )}

      {/* Spouse Card (if present) */}
      {spouse && (
        <div
          id={`card-member-${spouse.id > 0 ? spouse.id : `spouse-${member.id}`}`}
          onClick={() => onSelectMember(spouse.id > 0 ? spouse : member)}
          style={{ width: `${SPOUSE_CARD_WIDTH}px`, height: `${CARD_HEIGHT}px` }}
          className={`group relative rounded-xl border transition-all duration-200 cursor-pointer shadow-md flex flex-col justify-between p-3 ${
            spouse.namMat
              ? 'bg-[#141414]/95 border-[#262626] hover:border-[#3d3d3d]'
              : spouse.gioiTinh === 'Nữ'
              ? 'bg-[#1a1217] border-[#3b1f2e] hover:border-[#ec4899]/60'
              : 'bg-[#12161f] border-[#1f293d] hover:border-[#3b82f6]/60'
          }`}
        >
          {/* Top Spouse Header */}
          <div className="flex items-center justify-between text-xs">
            <span className="px-1.5 py-0.5 rounded bg-[#2d1822] text-[#f472b6] border border-[#4a2337] font-medium text-[10px]">
              {spouse.gioiTinh === 'Nữ' ? 'Vợ (Dâu)' : 'Chồng (Rể)'}
            </span>
            {spouse.namMat ? (
              <span className="text-[10px] text-[#737373] font-serif italic">Đã khuất</span>
            ) : (
              <span className="text-[10px] text-emerald-400 font-medium">Còn sống</span>
            )}
          </div>

          {/* Center Spouse Info */}
          <div className="flex items-center gap-2 my-1">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border overflow-hidden ${
                spouse.namMat
                  ? 'bg-[#1c1c1c] text-[#737373] border-[#2a2a2a]'
                  : spouse.gioiTinh === 'Nữ'
                  ? 'bg-[#2d1822] text-[#f472b6] border-[#4a2337]'
                  : 'bg-[#192438] text-[#60a5fa] border-[#253959]'
              }`}
            >
              {spouse.avatar ? (
                <img
                  src={spouse.avatar}
                  alt={spouse.hoTen}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-4 h-4" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h5
                className="text-xs font-bold text-[#e5e5e5] truncate leading-tight group-hover:text-[#f472b6] transition-colors"
                title={spouse.hoTen}
              >
                {spouse.hoTen}
              </h5>
              <p className="text-[10px] text-[#8a8a8a] truncate mt-0.5">
                {getAgeOrLifespan(spouse) || (spouse.queQuan ? `Quê: ${spouse.queQuan}` : (spouse.ghiChu || 'Phối ngẫu'))}
              </p>
            </div>
          </div>

          {/* Bottom info */}
          <div className="flex items-center justify-between text-[10.5px] text-[#8a8a8a] border-t border-[#222222] pt-1">
            <span className="truncate max-w-[110px] italic text-[#a3a3a3]" title={spouse.ghiChu || spouse.thongTinCaNhan || 'Phối ngẫu'}>
              {spouse.ghiChu || (spouse.queQuan ? `Quê: ${spouse.queQuan}` : 'Chính thất')}
            </span>
            <span className="font-mono text-[9px] text-[#737373]">
              {spouse.id > 0 ? `#${spouse.id}` : 'Dâu/Rể'}
            </span>
          </div>

          {/* Spouse Quick Actions */}
          <div className="absolute -top-3 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-[#1a1a1a]/95 backdrop-blur-md text-white p-1 rounded-lg shadow-xl border border-[#2e2e2e] z-30">
            <button
              title="Xem chi tiết"
              onClick={(e) => {
                e.stopPropagation();
                onSelectMember(spouse.id > 0 ? spouse : member);
              }}
              className="p-1 hover:bg-[#2a2a2a] rounded transition-colors text-[#d4d4d4] hover:text-white"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
            <button
              title="Chỉnh sửa thông tin"
              onClick={(e) => {
                e.stopPropagation();
                onEditMember(spouse.id > 0 ? spouse : member);
              }}
              className="p-1 hover:bg-[#2a2a2a] rounded transition-colors text-[#c4a47c]"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              title="Xóa phối ngẫu"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteMember(spouse.id > 0 ? spouse : member);
              }}
              className="p-1 hover:bg-red-600/80 rounded transition-colors text-red-400 hover:text-white"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
