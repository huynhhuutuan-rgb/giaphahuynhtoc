import React, { useState, useMemo } from 'react';
import { FamilyMember, AppUser } from '../types/family';
import { canUserEditGeneration, NO_PERMISSION_MESSAGE } from '../utils/permissionUtils';
import { 
  GitBranch, 
  Layers, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Hash, 
  Users, 
  Zap, 
  HelpCircle,
  Tag,
  Lock
} from 'lucide-react';

interface BranchHierarchySuggestProps {
  allMembers: FamilyMember[];
  currentCode: string;
  currentGen: number;
  selectedFatherId?: number | null;
  selectedMotherId?: number | null;
  currentUser?: AppUser;
  onPermissionNotice?: (msg?: string) => void;
  onSelectCode: (code: string, gen?: number) => void;
  onAutoGenerate?: () => void;
}

export const BranchHierarchySuggest: React.FC<BranchHierarchySuggestProps> = ({
  allMembers,
  currentCode,
  currentGen,
  selectedFatherId,
  selectedMotherId,
  currentUser,
  onPermissionNotice,
  onSelectCode,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'existing' | 'builder' | 'guide'>('existing');

  const checkPermissionAndSelect = (code: string, gen?: number) => {
    if (gen && currentUser && !canUserEditGeneration(currentUser, gen)) {
      alert(NO_PERMISSION_MESSAGE);
      if (onPermissionNotice) onPermissionNotice(NO_PERMISSION_MESSAGE);
    }
    onSelectCode(code, gen);
  };

  // Hierarchy Analyzer
  const hierarchyData = useMemo(() => {
    const genMap = new Map<number, { count: number; codes: Set<string>; members: string[] }>();
    const canhSet = new Set<string>();
    const phaiSet = new Set<string>();
    const nhanhSet = new Set<string>();
    const fullCodeMap = new Map<string, { memberNames: string[]; gen: number; count: number }>();

    allMembers.forEach(m => {
      const gen = m.doiThu || 1;
      if (!genMap.has(gen)) {
        genMap.set(gen, { count: 0, codes: new Set(), members: [] });
      }
      const gInfo = genMap.get(gen)!;
      gInfo.count += 1;
      if (gInfo.members.length < 3) {
        gInfo.members.push(m.hoTen);
      }

      if (m.maGiaPha && m.maGiaPha.trim()) {
        const code = m.maGiaPha.trim().toUpperCase();
        gInfo.codes.add(code);

        // Track full codes
        if (!fullCodeMap.has(code)) {
          fullCodeMap.set(code, { memberNames: [], gen, count: 0 });
        }
        const cInfo = fullCodeMap.get(code)!;
        cInfo.count += 1;
        cInfo.memberNames.push(m.hoTen);

        // Extract Cành (Cxx), Phái (Pxx), Nhánh (Nxx)
        const matchC = code.match(/C(\d+)/i);
        if (matchC) canhSet.add(`C${matchC[1].padStart(2, '0')}`);

        const matchP = code.match(/P(\d+)/i);
        if (matchP) phaiSet.add(`P${matchP[1].padStart(2, '0')}`);

        const matchN = code.match(/N(\d+)/i);
        if (matchN) nhanhSet.add(`N${matchN[1].padStart(2, '0')}`);
      }
    });

    const sortedGens = Array.from(genMap.keys()).sort((a, b) => a - b);
    const sortedCanhs = Array.from(canhSet).sort();
    const sortedPhais = Array.from(phaiSet).sort();
    const sortedNhanhs = Array.from(nhanhSet).sort();

    // Default presets if empty
    if (sortedCanhs.length === 0) sortedCanhs.push('C01', 'C02', 'C03');
    if (sortedPhais.length === 0) sortedPhais.push('P01', 'P02');
    if (sortedNhanhs.length === 0) sortedNhanhs.push('N01', 'N02');

    return {
      genMap,
      sortedGens,
      sortedCanhs,
      sortedPhais,
      sortedNhanhs,
      fullCodeMap,
      totalCodes: fullCodeMap.size,
    };
  }, [allMembers]);

  // Code Builder State
  const [builderGen, setBuilderGen] = useState<number>(currentGen || 1);
  const [builderCanh, setBuilderCanh] = useState<string>('C01');
  const [builderPhai, setBuilderPhai] = useState<string>('none');
  const [builderNhanh, setBuilderNhanh] = useState<string>('none');

  // Preview generated code
  const builtCode = useMemo(() => {
    const dPart = `D${String(builderGen).padStart(2, '0')}`;
    const parts = [dPart];
    if (builderCanh !== 'none') parts.push(builderCanh);
    if (builderPhai !== 'none') parts.push(builderPhai);
    if (builderNhanh !== 'none') parts.push(builderNhanh);
    return parts.join('-');
  }, [builderGen, builderCanh, builderPhai, builderNhanh]);

  // Smart Auto Generator based on Father / Mother
  const handleAutoSuggestFromParents = () => {
    const parentId = selectedFatherId || selectedMotherId;
    if (parentId) {
      const parent = allMembers.find(m => m.id === parentId);
      if (parent) {
        const nextGen = (parent.doiThu || 1) + 1;
        const siblings = allMembers.filter(
          m => m.idCha === parent.id || m.idMe === parent.id
        );
        const childIndex = siblings.length + 1;
        const childIndexPad = String(childIndex).padStart(2, '0');

        let autoCode = '';
        if (parent.maGiaPha && parent.maGiaPha.trim()) {
          const parentCode = parent.maGiaPha.trim().toUpperCase();
          // If parent is D01 -> child is D02-C01, D02-C02...
          if (/^D\d+$/i.test(parentCode)) {
            autoCode = `D${String(nextGen).padStart(2, '0')}-C${childIndexPad}`;
          } else if (/^D\d+-C\d+$/i.test(parentCode)) {
            // Parent has Cành -> child has Phái: D03-C01-P01
            const cMatch = parentCode.match(/C\d+/i);
            const cStr = cMatch ? cMatch[0].toUpperCase() : 'C01';
            autoCode = `D${String(nextGen).padStart(2, '0')}-${cStr}-P${childIndexPad}`;
          } else if (/^D\d+-C\d+-P\d+$/i.test(parentCode)) {
            // Parent has Phái -> child has Nhánh: D04-C01-P01-N01
            const parts = parentCode.split('-');
            const cPart = parts[1] || 'C01';
            const pPart = parts[2] || 'P01';
            autoCode = `D${String(nextGen).padStart(2, '0')}-${cPart}-${pPart}-N${childIndexPad}`;
          } else {
            autoCode = `${parentCode}-N${childIndexPad}`;
          }
        } else {
          autoCode = `D${String(nextGen).padStart(2, '0')}-C${childIndexPad}`;
        }

        checkPermissionAndSelect(autoCode, nextGen);
        setBuilderGen(nextGen);
        return;
      }
    }

    // Default fallback
    const gen = currentGen || 1;
    const defaultCode = `D${String(gen).padStart(2, '0')}-C01`;
    checkPermissionAndSelect(defaultCode, gen);
    setBuilderGen(gen);
  };

  return (
    <div className="mt-1 space-y-1.5">
      {/* Action triggers bar */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 text-[11px]">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#1f1a14] border border-[#3d2f1f] text-[#c4a47c] hover:bg-[#2a2218] transition-colors font-medium cursor-pointer"
        >
          <GitBranch className="w-3.5 h-3.5" />
          <span>Gợi ý Đời - Cành - Phái - Nhánh</span>
          {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        <button
          type="button"
          onClick={handleAutoSuggestFromParents}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#1c241d] border border-[#2b3d2d] text-[#4ade80] hover:bg-[#233324] transition-colors font-medium cursor-pointer"
          title="Tự động tính mã kế thừa từ Cha/Mẹ đã chọn"
        >
          <Zap className="w-3 h-3 text-[#4ade80]" />
          <span>⚡ Tự tạo mã theo Cha/Mẹ</span>
        </button>
      </div>

      {/* Quick Existing Chips (when closed or open) */}
      {!isOpen && hierarchyData.sortedGens.length > 0 && (
        <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none text-[10px]">
          <span className="text-[#737373] whitespace-nowrap">Đời đang có:</span>
          {hierarchyData.sortedGens.slice(0, 6).map(g => (
            <button
              key={g}
              type="button"
              onClick={() => {
                const prefix = `D${String(g).padStart(2, '0')}-C01`;
                checkPermissionAndSelect(prefix, g);
              }}
              className={`px-1.5 py-0.5 rounded border transition-colors cursor-pointer whitespace-nowrap ${
                currentGen === g 
                  ? 'bg-[#c4a47c]/20 border-[#c4a47c] text-[#c4a47c] font-semibold' 
                  : 'bg-[#181818] border-[#2e2e2e] text-[#a3a3a3] hover:text-[#e5e5e5] hover:border-[#444]'
              }`}
            >
              Đời {g} (D{String(g).padStart(2, '0')})
            </button>
          ))}
        </div>
      )}

      {/* Popover / Collapsible Panel */}
      {isOpen && (
        <div className="p-3 bg-[#121212] border border-[#2e2e2e] rounded-xl shadow-xl space-y-3 animate-in fade-in-50 duration-150">
          {/* Sub Navigation Tabs */}
          <div className="flex border-b border-[#262626] pb-1 gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('existing')}
              className={`pb-1.5 px-2 border-b-2 flex items-center gap-1 transition-colors cursor-pointer ${
                activeTab === 'existing'
                  ? 'border-[#c4a47c] text-[#c4a47c]'
                  : 'border-transparent text-[#737373] hover:text-[#d4d4d4]'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Nhánh đã có ({hierarchyData.totalCodes})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('builder')}
              className={`pb-1.5 px-2 border-b-2 flex items-center gap-1 transition-colors cursor-pointer ${
                activeTab === 'builder'
                  ? 'border-[#c4a47c] text-[#c4a47c]'
                  : 'border-transparent text-[#737373] hover:text-[#d4d4d4]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bộ ghép mã 4 cấp (D-C-P-N)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`pb-1.5 px-2 border-b-2 flex items-center gap-1 transition-colors cursor-pointer ${
                activeTab === 'guide'
                  ? 'border-[#c4a47c] text-[#c4a47c]'
                  : 'border-transparent text-[#737373] hover:text-[#d4d4d4]'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Quy ước chuẩn</span>
            </button>
          </div>

          {/* TAB 1: EXISTING BRANCHES */}
          {activeTab === 'existing' && (
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              <div className="text-[11px] text-[#8a8a8a] flex items-center justify-between">
                <span>Nhấp vào mã để chọn hoặc áp dụng ngay:</span>
                <span className="text-[#c4a47c]">Tổng cộng {hierarchyData.sortedGens.length} Đời trong dòng họ</span>
              </div>

              {hierarchyData.sortedGens.map(g => {
                const gData = hierarchyData.genMap.get(g);
                const codesInGen = Array.from(gData?.codes || []);

                return (
                  <div key={g} className="p-2 rounded-lg bg-[#181818] border border-[#262626] space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#e5e5e5] flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#c4a47c]" />
                        Đời thứ {g} (Thế hệ {g})
                      </span>
                      <span className="text-[10px] text-[#737373]">
                        {gData?.count} thành viên
                      </span>
                    </div>

                    {codesInGen.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {codesInGen.map((code: string) => {
                          const info = hierarchyData.fullCodeMap.get(code);
                          const isCurrent = currentCode === code;
                          return (
                            <button
                              key={code}
                              type="button"
                              onClick={() => {
                                checkPermissionAndSelect(code, g);
                                setIsOpen(false);
                              }}
                              className={`px-2 py-1 rounded-md text-xs font-mono flex items-center gap-1.5 border transition-all cursor-pointer ${
                                isCurrent
                                  ? 'bg-[#c4a47c] text-[#0a0a0a] border-[#c4a47c] font-bold shadow-xs'
                                  : 'bg-[#222222] border-[#333333] text-[#d4d4d4] hover:border-[#c4a47c] hover:text-[#c4a47c]'
                              }`}
                              title={`Người mang mã: ${info?.memberNames.join(', ')}`}
                            >
                              <span>{code}</span>
                              {info && info.memberNames.length > 0 && (
                                <span className={`text-[10px] truncate max-w-[120px] ${isCurrent ? 'text-black/80' : 'text-[#8a8a8a]'}`}>
                                  ({info.memberNames[0]})
                                </span>
                              )}
                              {isCurrent && <Check className="w-3 h-3 text-black" />}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-[11px] text-[#737373]">
                        <span>Chưa có mã cụ thể</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newCode = `D${String(g).padStart(2, '0')}-C01`;
                            checkPermissionAndSelect(newCode, g);
                            setIsOpen(false);
                          }}
                          className="text-[#c4a47c] hover:underline cursor-pointer"
                        >
                          + Tạo mã mẫu D{String(g).padStart(2, '0')}-C01
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: 4-SEGMENT CODE BUILDER */}
          {activeTab === 'builder' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {/* 1. Đời (Generation) */}
                <div>
                  <label className="block text-[#a3a3a3] font-medium mb-1 flex items-center gap-1">
                    <span className="text-[#c4a47c] font-bold">1.</span> Đời (D)
                  </label>
                  <select
                    value={builderGen}
                    onChange={(e) => setBuilderGen(Number(e.target.value))}
                    className="w-full px-2 py-1.5 bg-[#181818] border border-[#2e2e2e] rounded-lg text-[#e5e5e5] font-mono text-xs focus:ring-1 focus:ring-[#c4a47c]"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(g => (
                      <option key={g} value={g}>
                        D{String(g).padStart(2, '0')} (Đời {g})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Cành (Branch) */}
                <div>
                  <label className="block text-[#a3a3a3] font-medium mb-1 flex items-center gap-1">
                    <span className="text-[#c4a47c] font-bold">2.</span> Cành / Chi (C)
                  </label>
                  <select
                    value={builderCanh}
                    onChange={(e) => setBuilderCanh(e.target.value)}
                    className="w-full px-2 py-1.5 bg-[#181818] border border-[#2e2e2e] rounded-lg text-[#e5e5e5] font-mono text-xs focus:ring-1 focus:ring-[#c4a47c]"
                  >
                    <option value="none">-- Không ghi --</option>
                    <option value="C01">C01 (Chi/Cành 1)</option>
                    <option value="C02">C02 (Chi/Cành 2)</option>
                    <option value="C03">C03 (Chi/Cành 3)</option>
                    <option value="C04">C04 (Chi/Cành 4)</option>
                    <option value="C05">C05 (Chi/Cành 5)</option>
                    <option value="C06">C06 (Chi/Cành 6)</option>
                  </select>
                </div>

                {/* 3. Phái (Lineage) */}
                <div>
                  <label className="block text-[#a3a3a3] font-medium mb-1 flex items-center gap-1">
                    <span className="text-[#c4a47c] font-bold">3.</span> Phái (P)
                  </label>
                  <select
                    value={builderPhai}
                    onChange={(e) => setBuilderPhai(e.target.value)}
                    className="w-full px-2 py-1.5 bg-[#181818] border border-[#2e2e2e] rounded-lg text-[#e5e5e5] font-mono text-xs focus:ring-1 focus:ring-[#c4a47c]"
                  >
                    <option value="none">-- Không có --</option>
                    <option value="P01">P01 (Phái 1)</option>
                    <option value="P02">P02 (Phái 2)</option>
                    <option value="P03">P03 (Phái 3)</option>
                    <option value="P04">P04 (Phái 4)</option>
                    <option value="P05">P05 (Phái 5)</option>
                  </select>
                </div>

                {/* 4. Nhánh (Sub-branch) */}
                <div>
                  <label className="block text-[#a3a3a3] font-medium mb-1 flex items-center gap-1">
                    <span className="text-[#c4a47c] font-bold">4.</span> Nhánh (N)
                  </label>
                  <select
                    value={builderNhanh}
                    onChange={(e) => setBuilderNhanh(e.target.value)}
                    className="w-full px-2 py-1.5 bg-[#181818] border border-[#2e2e2e] rounded-lg text-[#e5e5e5] font-mono text-xs focus:ring-1 focus:ring-[#c4a47c]"
                  >
                    <option value="none">-- Không có --</option>
                    <option value="N01">N01 (Nhánh 1)</option>
                    <option value="N02">N02 (Nhánh 2)</option>
                    <option value="N03">N03 (Nhánh 3)</option>
                    <option value="N04">N04 (Nhánh 4)</option>
                    <option value="N05">N05 (Nhánh 5)</option>
                  </select>
                </div>
              </div>

              {/* Preview & Apply button */}
              <div className="p-2.5 rounded-lg bg-[#1a1610] border border-[#3d2f1f] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#a3a3a3] block">Mã tổng hợp xem trước:</span>
                  <span className="text-sm font-mono font-bold text-[#c4a47c]">{builtCode}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    checkPermissionAndSelect(builtCode, builderGen);
                    setIsOpen(false);
                  }}
                  className="px-3 py-1.5 bg-[#c4a47c] hover:bg-[#b5956d] text-[#0a0a0a] font-bold rounded-lg text-xs flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Áp Dụng Mã Này</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: CONVENTION GUIDE */}
          {activeTab === 'guide' && (
            <div className="p-3 bg-[#181818] rounded-lg border border-[#262626] text-xs text-[#a3a3a3] space-y-2 leading-relaxed">
              <div className="font-semibold text-[#e5e5e5] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#c4a47c]" />
                <span>Quy chuẩn đặt mã Gia Phả Việt Nam:</span>
              </div>
              <ul className="space-y-1 text-[11px] list-disc list-inside">
                <li><strong className="text-[#e5e5e5]">D (Đời / Thế hệ)</strong>: D01 (Thủy tổ đời 1), D02 (Đời 2), D03 (Đời 3)...</li>
                <li><strong className="text-[#e5e5e5]">C (Cành / Chi)</strong>: C01 (Chi trưởng), C02 (Chi thứ hai), C03 (Chi thứ ba)...</li>
                <li><strong className="text-[#e5e5e5]">P (Phái)</strong>: Phân phái trong từng chi (P01, P02...)</li>
                <li><strong className="text-[#e5e5e5]">N (Nhánh / Phân chi nhỏ)</strong>: Thứ tự con cháu nhánh nhỏ (N01, N02...)</li>
              </ul>
              <div className="p-2 bg-[#121212] rounded border border-[#2a2a2a] text-[10px] text-[#c4a47c] font-mono">
                Ví dụ: <span className="font-bold">D03-C01-P02</span> = Đời 3, thuộc Chi 1, Phái thứ 2.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
