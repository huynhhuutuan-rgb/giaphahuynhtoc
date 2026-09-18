import React from 'react';
import { FamilyMember, ClanInfo } from '../types/family';
import { 
  Printer, 
  BookOpen, 
  Scroll, 
  Award, 
  Users, 
  MapPin, 
  Calendar,
  Sparkles,
  User,
  Frame
} from 'lucide-react';

interface ClanBookViewProps {
  members: FamilyMember[];
  clanInfo: ClanInfo;
  onSelectMember: (member: FamilyMember) => void;
  onPreviewPortrait?: (member: FamilyMember) => void;
}

export const ClanBookView: React.FC<ClanBookViewProps> = ({
  members,
  clanInfo,
  onSelectMember,
  onPreviewPortrait,
}) => {
  // Nhóm thành viên theo từng đời
  const generations = Array.from(new Set<number>(members.map(m => m.doiThu || 1))).sort((a: number, b: number) => a - b);

  const getSpouse = (member: FamilyMember) => {
    if (!member.idVoChong) return null;
    return members.find(m => m.id === member.idVoChong);
  };

  const getChildren = (member: FamilyMember) => {
    return members.filter(m => m.idCha === member.id || m.idMe === member.id);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-[#0a0a0a] rounded-xl border border-[#262626] p-4 sm:p-6 overflow-y-auto h-[calc(100vh-140px)] min-h-[580px]">
      {/* Top action bar */}
      <div className="max-w-4xl mx-auto flex items-center justify-between mb-6 print:hidden">
        <div className="flex items-center gap-2 text-[#e5e5e5]">
          <BookOpen className="w-5 h-5 text-[#c4a47c]" />
          <span className="font-bold text-sm">Gia Phả Ký Sự - Bản Đọc &amp; Lưu Trữ Dòng Họ</span>
        </div>
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-[#c4a47c] hover:bg-[#b5956d] text-[#0a0a0a] rounded-lg text-xs font-bold flex items-center gap-2 shadow-md transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>In Gia Phả / Xuất PDF</span>
        </button>
      </div>

      {/* Book Container with elegant traditional paper aesthetic */}
      <div className="max-w-4xl mx-auto bg-[#141414] text-[#e5e5e5] border border-[#262626] shadow-2xl rounded-2xl p-6 sm:p-12 space-y-8 font-serif print:shadow-none print:border-0 print:p-0 print:bg-white print:text-black">
        {/* Book Header / Frontispiece */}
        <div className="text-center border-b-2 border-[#c4a47c]/40 pb-8 space-y-3">
          <div className="inline-block p-2.5 rounded-full border-2 border-[#c4a47c] bg-[#1f1a14] mb-2 shadow-md">
            <Scroll className="w-8 h-8 text-[#c4a47c]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-wide uppercase text-[#e5e5e5]">
            {clanInfo.tenDongHo}
          </h1>
          <p className="text-sm italic text-[#a3a3a3] max-w-xl mx-auto">
            {clanInfo.moTa}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-sans text-[#8a8a8a] pt-3">
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#c4a47c]" />
              <span>{clanInfo.nguyenQuan}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-[#c4a47c]" />
              <span>Thủy tổ: {clanInfo.thuyTo}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#c4a47c]" />
              <span>Lập phả: Năm {clanInfo.namLapPha}</span>
            </div>
          </div>
        </div>

        {/* Generational Chapters */}
        <div className="space-y-10">
          {generations.map(gen => {
            const genMembers = members.filter(m => m.doiThu === gen && m.gioiTinh === 'Nam');
            // Nếu đời này không có nam giới là chủ hộ, lấy tất cả
            const primaryMembers = genMembers.length > 0 ? genMembers : members.filter(m => m.doiThu === gen);

            return (
              <section key={gen} className="space-y-5">
                {/* Generation Banner */}
                <div className="flex items-center gap-3 border-b border-[#262626] pb-2">
                  <div className="w-8 h-8 rounded-lg bg-[#c4a47c] text-[#0a0a0a] flex items-center justify-center font-bold text-sm font-sans shadow-md">
                    {gen}
                  </div>
                  <h2 className="text-lg font-bold uppercase tracking-wider text-[#c4a47c]">
                    {gen === 1 ? 'ĐỜI THỨ NHẤT (Khởi Tổ / Tiền Hiền)' : `ĐỜI THỨ ${gen}`}
                  </h2>
                  <span className="text-xs text-[#737373] font-sans ml-auto">
                    {primaryMembers.length} gia đình / chi nhánh
                  </span>
                </div>

                {/* List of members in this generation */}
                <div className="grid grid-cols-1 gap-4 font-sans">
                  {primaryMembers.map(m => {
                    const spouse = getSpouse(m);
                    const children = getChildren(m);

                    return (
                      <div
                        key={m.id}
                        onClick={() => onSelectMember(m)}
                        className="p-4 rounded-xl bg-[#181818] border border-[#262626] shadow-sm hover:border-[#c4a47c]/60 hover:bg-[#1e1a14]/60 transition-all cursor-pointer group"
                      >
                        {/* Member title line */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#262626] pb-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-[#1f1a14] border border-[#3d2f1f] text-[#c4a47c]">
                              {m.maGiaPha || `ID #${m.id}`}
                            </span>
                            <h3 className="font-bold text-[#e5e5e5] text-sm group-hover:text-[#c4a47c] transition-colors">
                              {m.hoTen}
                            </h3>
                            {m.ghiChu && (
                              <span className="text-xs text-[#737373] italic">
                                ({m.ghiChu})
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {m.avatar && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onPreviewPortrait) onPreviewPortrait(m);
                                  else onSelectMember(m);
                                }}
                                className="px-2 py-0.5 bg-[#1f1a14] hover:bg-[#2e2316] border border-[#3d2f1f] text-[#c4a47c] text-[10.5px] rounded font-medium flex items-center gap-1 transition-colors cursor-pointer"
                                title="Xem ảnh chân dung phóng to 10x20cm"
                              >
                                <Frame className="w-3 h-3" />
                                <span>Ảnh 10x20cm</span>
                              </button>
                            )}
                            <div className="text-xs text-[#8a8a8a] font-serif">
                              {m.namMat ? (
                                <span>Sinh: {m.namSinh || '?'} • Mất: {m.namMat}</span>
                              ) : (
                                <span className="text-emerald-400 font-medium">Sinh: {m.namSinh || '?'} (Còn sống)</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Details */}
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs text-[#d4d4d4]">
                          {/* Portrait preview thumbnail */}
                          {m.avatar && (
                            <div className="md:col-span-2 flex justify-start">
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onPreviewPortrait) onPreviewPortrait(m);
                                  else onSelectMember(m);
                                }}
                                className="w-16 h-24 rounded-lg overflow-hidden border border-[#3d2f1f] shadow-md relative group/thumb cursor-pointer shrink-0 bg-[#121212]"
                                title="Bấm xem ảnh chân dung phóng to 10x20cm"
                              >
                                <img
                                  src={m.avatar}
                                  alt={m.hoTen}
                                  className="w-full h-full object-cover object-top group-hover/thumb:scale-105 transition-transform"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute bottom-0 inset-x-0 bg-black/75 text-[7px] text-[#c4a47c] font-mono text-center py-0.5">
                                  10x20cm
                                </div>
                              </div>
                            </div>
                          )}

                          <div className={m.avatar ? "md:col-span-5" : "md:col-span-6"}>
                            {spouse && (
                              <p className="mb-1">
                                <span className="font-semibold text-[#e5e5e5]">Phối ngẫu: </span>
                                <span>{spouse.hoTen}</span>
                                {spouse.namSinh && <span className="text-[#8a8a8a]"> (Sinh {spouse.namSinh})</span>}
                                {spouse.ghiChu && <span className="italic text-[#737373]"> - {spouse.ghiChu}</span>}
                              </p>
                            )}

                            {m.thongTinCaNhan && (
                              <p className="text-[#8a8a8a] italic">
                                "{m.thongTinCaNhan}"
                              </p>
                            )}
                          </div>

                          <div className={m.avatar ? "md:col-span-5" : "md:col-span-6"}>
                            {children.length > 0 && (
                              <div>
                                <span className="font-semibold text-[#e5e5e5] block mb-1">
                                  Sinh hạ {children.length} người con:
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {children.map(child => (
                                    <span
                                      key={child.id}
                                      className={`px-2 py-0.5 rounded text-[11px] border font-medium ${
                                        child.gioiTinh === 'Nam'
                                          ? 'bg-[#192438] border-[#253959] text-[#60a5fa]'
                                          : 'bg-[#2d1822] border-[#4a2337] text-[#f472b6]'
                                      }`}
                                    >
                                      {child.hoTen} ({child.gioiTinh}{child.namSinh ? `, ${child.namSinh}` : ''})
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {m.ngayGio && (
                              <div className="mt-2 text-[11px] text-[#c4a47c] font-serif">
                                <strong>Ngày giỗ:</strong> {m.ngayGio} {m.noiAnTang ? `• Mộ phần: ${m.noiAnTang}` : ''}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-[#c4a47c]/40 pt-6 text-center text-xs text-[#737373] font-sans">
          Gia phả lưu truyền vạn đại • Con cháu phụng sao nghiêm cẩn • {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};
