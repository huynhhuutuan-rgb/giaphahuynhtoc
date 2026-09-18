import React, { useState } from 'react';
import { FamilyMember } from '../types/family';
import { Calendar, MapPin, Search, Heart, Award, Sparkles, User } from 'lucide-react';

interface MemorialCalendarProps {
  members: FamilyMember[];
  onSelectMember: (member: FamilyMember) => void;
}

export const MemorialCalendar: React.FC<MemorialCalendarProps> = ({
  members,
  onSelectMember,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Lọc các thành viên đã mất
  const deceasedMembers = members
    .filter(m => !!m.namMat)
    .sort((a, b) => (a.doiThu || 1) - (b.doiThu || 1));

  const filteredDeceased = deceasedMembers.filter(m => {
    const q = searchTerm.toLowerCase();
    return (
      m.hoTen.toLowerCase().includes(q) ||
      (m.ngayGio && m.ngayGio.toLowerCase().includes(q)) ||
      (m.noiAnTang && m.noiAnTang.toLowerCase().includes(q))
    );
  });

  return (
    <div className="bg-[#0a0a0a] rounded-xl border border-[#262626] p-4 sm:p-6 overflow-y-auto h-[calc(100vh-140px)] min-h-[580px] space-y-6 text-[#e5e5e5]">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-[#141414] border border-[#262626] rounded-xl shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#c4a47c] text-[#0a0a0a] flex items-center justify-center shadow-md font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[#e5e5e5] text-base">Lịch Giỗ &amp; Kính Nhớ Tổ Tiên</h3>
            <p className="text-xs text-[#8a8a8a]">
              Tổng hợp ngày kỵ nhật, mộ phần và tiểu sử các bậc tiền nhân trong dòng tộc
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên, ngày giỗ, mộ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg text-[#e5e5e5] placeholder-[#737373] focus:outline-hidden focus:ring-2 focus:ring-[#c4a47c]"
          />
        </div>
      </div>

      {/* Grid of Memorial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDeceased.map(m => {
          const birth = m.namSinh;
          const death = m.namMat;
          const age = (birth && death && typeof death === 'number' && typeof birth === 'number') 
            ? death - birth 
            : null;

          return (
            <div
              key={m.id}
              onClick={() => onSelectMember(m)}
              className="p-4 rounded-xl bg-[#141414] border border-[#262626] hover:border-[#c4a47c]/60 hover:bg-[#1a1714] shadow-sm transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1f1a14] border border-[#3d2f1f] text-[#c4a47c]">
                    Đời {m.doiThu}
                  </span>
                  <span className="text-[10.5px] font-serif text-[#737373] italic">
                    ID #{m.id}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1f1a14] text-[#c4a47c] flex items-center justify-center font-bold text-sm border border-[#3d2f1f] shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-[#e5e5e5] group-hover:text-[#c4a47c] transition-colors truncate">
                      {m.hoTen}
                    </h4>
                    <p className="text-xs text-[#8a8a8a]">
                      {birth ? `Sinh: ${birth}` : ''} {death ? `• Mất: ${death}` : ''}
                      {age ? ` (${age} tuổi)` : ''}
                    </p>
                  </div>
                </div>

                {m.ghiChu && (
                  <p className="text-xs text-[#a3a3a3] mt-2 font-medium italic">
                    {m.ghiChu}
                  </p>
                )}
              </div>

              {/* Footer Memorial details */}
              <div className="pt-2 border-t border-[#262626] space-y-1.5 text-xs text-[#d4d4d4]">
                <div className="flex items-center gap-1.5 text-[#c4a47c] font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-[#c4a47c] shrink-0" />
                  <span>Ngày giỗ: {m.ngayGio || 'Chưa cập nhật ngày kỵ'}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[#8a8a8a] text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-[#737373] shrink-0" />
                  <span className="truncate">Nơi an táng: {m.noiAnTang || m.queQuan || 'Nghĩa trang gia tộc'}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDeceased.length === 0 && (
        <div className="p-12 text-center text-[#737373] italic bg-[#141414] rounded-xl border border-[#262626]">
          Không tìm thấy ngày kỵ hoặc bậc tiền nhân nào phù hợp.
        </div>
      )}
    </div>
  );
};
