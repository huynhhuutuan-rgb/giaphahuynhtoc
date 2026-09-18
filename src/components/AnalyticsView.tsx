import React, { useMemo } from 'react';
import { FamilyMember } from '../types/family';
import { 
  Users, 
  Layers, 
  Heart, 
  Calendar, 
  Award, 
  TrendingUp, 
  PieChart, 
  Sparkles,
  MapPin
} from 'lucide-react';

interface AnalyticsViewProps {
  members: FamilyMember[];
  onSelectMember: (member: FamilyMember) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  members,
  onSelectMember,
}) => {
  const stats = useMemo(() => {
    const total = members.length;
    const maleCount = members.filter(m => m.gioiTinh === 'Nam').length;
    const femaleCount = members.filter(m => m.gioiTinh === 'Nữ').length;
    const deceasedCount = members.filter(m => !!m.namMat).length;
    const livingCount = total - deceasedCount;

    const generationsMap: Record<number, number> = {};
    members.forEach(m => {
      const g = m.doiThu || 1;
      generationsMap[g] = (generationsMap[g] || 0) + 1;
    });

    const generationsList = Object.entries(generationsMap)
      .map(([gen, count]) => ({ gen: Number(gen), count }))
      .sort((a, b) => a.gen - b.gen);

    const maxGen = Math.max(...generationsList.map(g => g.gen), 1);

    // Tính tuổi thọ trung bình của những người đã mất
    let totalLifespan = 0;
    let lifespanCount = 0;
    members.forEach(m => {
      const b = typeof m.namSinh === 'number' ? m.namSinh : parseInt(String(m.namSinh)) || null;
      const d = typeof m.namMat === 'number' ? m.namMat : parseInt(String(m.namMat)) || null;
      if (b && d && d >= b) {
        totalLifespan += (d - b);
        lifespanCount++;
      }
    });
    const avgLifespan = lifespanCount > 0 ? Math.round(totalLifespan / lifespanCount) : 75;

    return {
      total,
      maleCount,
      femaleCount,
      deceasedCount,
      livingCount,
      generationsList,
      maxGen,
      avgLifespan,
    };
  }, [members]);

  const maxCountInGen = Math.max(...stats.generationsList.map(g => g.count), 1);

  return (
    <div className="bg-[#0a0a0a] rounded-xl border border-[#262626] p-4 sm:p-6 overflow-y-auto h-[calc(100vh-140px)] min-h-[580px] space-y-6 text-[#e5e5e5]">
      {/* 4 Stat Hero Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#141414] border border-[#262626] shadow-md">
          <div className="flex items-center justify-between text-[#8a8a8a] mb-2">
            <span className="text-xs font-semibold">Tổng thành viên</span>
            <Users className="w-4 h-4 text-[#c4a47c]" />
          </div>
          <div className="text-2xl font-bold text-[#e5e5e5]">{stats.total}</div>
          <p className="text-[11px] text-[#737373] mt-1">Đã lưu trong gia phả</p>
        </div>

        <div className="p-4 rounded-xl bg-[#141414] border border-[#262626] shadow-md">
          <div className="flex items-center justify-between text-[#8a8a8a] mb-2">
            <span className="text-xs font-semibold">Số thế hệ (Đời)</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-[#e5e5e5]">{stats.maxGen} Đời</div>
          <p className="text-[11px] text-[#737373] mt-1">Nối tiếp tông đường</p>
        </div>

        <div className="p-4 rounded-xl bg-[#141414] border border-[#262626] shadow-md">
          <div className="flex items-center justify-between text-[#8a8a8a] mb-2">
            <span className="text-xs font-semibold">Tỷ lệ Nam / Nữ</span>
            <Heart className="w-4 h-4 text-pink-400" />
          </div>
          <div className="text-2xl font-bold text-[#e5e5e5]">
            {stats.maleCount} <span className="text-sm font-normal text-[#737373]">/</span> {stats.femaleCount}
          </div>
          <p className="text-[11px] text-[#737373] mt-1">
            {Math.round((stats.maleCount / (stats.total || 1)) * 100)}% Nam • {Math.round((stats.femaleCount / (stats.total || 1)) * 100)}% Nữ
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#141414] border border-[#262626] shadow-md">
          <div className="flex items-center justify-between text-[#8a8a8a] mb-2">
            <span className="text-xs font-semibold">Hiện trạng sinh sống</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-[#e5e5e5]">
            {stats.livingCount} <span className="text-xs font-normal text-emerald-400">sống</span>
          </div>
          <p className="text-[11px] text-[#737373] mt-1">{stats.deceasedCount} người đã khuất</p>
        </div>
      </div>

      {/* Generation Breakdown Chart */}
      <div className="p-5 bg-[#141414] rounded-xl border border-[#262626] shadow-md space-y-4">
        <h4 className="font-bold text-[#e5e5e5] text-sm flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#c4a47c]" />
          <span>Phân Bố Số Lượng Thành Viên Qua Các Đời</span>
        </h4>

        <div className="space-y-3 pt-2">
          {stats.generationsList.map(({ gen, count }) => {
            const percentage = Math.round((count / stats.total) * 100);
            const barWidth = Math.round((count / maxCountInGen) * 100);

            return (
              <div key={gen} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#d4d4d4]">
                    {gen === 1 ? 'Đời 1 (Khởi tổ)' : `Đời thứ ${gen}`}
                  </span>
                  <span className="text-[#8a8a8a] font-mono">
                    {count} người ({percentage}%)
                  </span>
                </div>
                <div className="h-3 w-full bg-[#222222] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#967245] to-[#c4a47c] rounded-full transition-all duration-500"
                    style={{ width: `${barWidth}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two columns: Demographic & Branch distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Demographics Card */}
        <div className="p-5 bg-[#141414] rounded-xl border border-[#262626] shadow-md space-y-3">
          <h4 className="font-bold text-[#e5e5e5] text-sm flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-400" />
            <span>Cơ Cấu Giới Tính &amp; Thọ Số</span>
          </h4>

          <div className="space-y-3 text-xs pt-2">
            <div>
              <div className="flex justify-between mb-1 text-[#d4d4d4] font-medium">
                <span>Nam giới ({stats.maleCount})</span>
                <span>Nữ giới ({stats.femaleCount})</span>
              </div>
              <div className="h-3 w-full bg-[#2d1822] rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${(stats.maleCount / (stats.total || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-[#1a1a1a] border border-[#2e2e2e] mt-3 text-[#d4d4d4] space-y-1">
              <div className="font-semibold text-[#e5e5e5]">Tuổi thọ bình quân: {stats.avgLifespan} tuổi</div>
              <p className="text-[11px] text-[#737373]">
                Tính toán dựa trên niên đại năm sinh và năm mất của các bậc tiền nhân được ghi chép trong gia phả.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Branch Summary */}
        <div className="p-5 bg-[#141414] rounded-xl border border-[#262626] shadow-md space-y-3">
          <h4 className="font-bold text-[#e5e5e5] text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#c4a47c]" />
            <span>Các Chi Nhánh Dòng Tộc</span>
          </h4>

          <div className="space-y-2 text-xs">
            {members.filter(m => m.doiThu === 2 && m.gioiTinh === 'Nam').map(branchLeader => {
              // Đếm con cháu của nhánh này
              const descendants = members.filter(m => {
                let curr: FamilyMember | undefined = m;
                while (curr && curr.doiThu > 2) {
                  const parentId = curr.idCha || curr.idMe;
                  curr = members.find(p => p.id === parentId);
                  if (curr?.id === branchLeader.id) return true;
                }
                return false;
              });

              return (
                <div
                  key={branchLeader.id}
                  onClick={() => onSelectMember(branchLeader)}
                  className="p-2.5 rounded-lg bg-[#181818] hover:bg-[#1f1a14] border border-[#262626] cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div>
                    <div className="font-bold text-[#e5e5e5]">
                      Chi {branchLeader.hoTen}
                    </div>
                    <div className="text-[10px] text-[#737373]">
                      {branchLeader.ghiChu || `Đời thứ ${branchLeader.doiThu}`}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#241c12] border border-[#42321e] text-[#c4a47c] font-bold font-mono text-[11px]">
                    {descendants.length + 1} thành viên
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
