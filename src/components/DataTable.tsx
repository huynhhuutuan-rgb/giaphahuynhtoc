import React, { useState, useMemo } from 'react';
import { FamilyMember, AppUser } from '../types/family';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Download, 
  FileSpreadsheet, 
  UserPlus, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Lock,
  History,
  ShieldAlert,
  Frame,
  User
} from 'lucide-react';
import { exportToExcel, exportToCSV } from '../utils/excelHelper';
import { canUserEditGeneration, canUserDeleteMember } from '../utils/permissionUtils';

interface DataTableProps {
  members: FamilyMember[];
  currentUser?: AppUser;
  onSelectMember: (member: FamilyMember) => void;
  onEditMember: (member: FamilyMember) => void;
  onDeleteMember: (member: FamilyMember) => void;
  onAddChild: (parent: FamilyMember) => void;
  onAddNewMember: () => void;
  onJumpToTree: (member: FamilyMember) => void;
  onPreviewPortrait?: (member: FamilyMember) => void;
  onPermissionNotice?: (msg?: string) => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  members,
  currentUser,
  onSelectMember,
  onEditMember,
  onDeleteMember,
  onAddChild,
  onAddNewMember,
  onJumpToTree,
  onPreviewPortrait,
  onPermissionNotice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGen, setSelectedGen] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof FamilyMember>('id');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 15;

  const handleSort = (field: keyof FamilyMember) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const generations = useMemo(() => {
    return Array.from(new Set<number>(members.map(m => m.doiThu || 1))).sort((a: number, b: number) => a - b);
  }, [members]);

  const branches = useMemo(() => {
    const branchSet = new Set<string>();
    members.forEach(m => {
      if (m.maGiaPha) {
        const matches = m.maGiaPha.match(/[CPN]\d+/gi);
        if (matches) {
          matches.forEach(b => branchSet.add(b.toUpperCase()));
        }
      }
    });
    return Array.from(branchSet).sort();
  }, [members]);

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      // Search
      const term = searchTerm.toLowerCase();
      const matchSearch = 
        !searchTerm ||
        m.hoTen.toLowerCase().includes(term) ||
        (m.maGiaPha && m.maGiaPha.toLowerCase().includes(term)) ||
        (m.ghiChu && m.ghiChu.toLowerCase().includes(term)) ||
        (m.thongTinCaNhan && m.thongTinCaNhan.toLowerCase().includes(term)) ||
        String(m.id) === term;

      // Gen filter
      const matchGen = selectedGen === 'all' || m.doiThu === Number(selectedGen);

      // Branch filter (Cành / Phái / Nhánh)
      const matchBranch = 
        selectedBranch === 'all' || 
        (m.maGiaPha && m.maGiaPha.toUpperCase().includes(selectedBranch));

      // Gender filter
      const matchGender = selectedGender === 'all' || m.gioiTinh === selectedGender;

      // Status filter
      const matchStatus = 
        selectedStatus === 'all' ||
        (selectedStatus === 'living' && !m.namMat) ||
        (selectedStatus === 'deceased' && !!m.namMat);

      return matchSearch && matchGen && matchBranch && matchGender && matchStatus;
    }).sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (valA === undefined || valA === null) valA = '';
      if (valB === undefined || valB === null) valB = '';

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc 
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [members, searchTerm, selectedGen, selectedGender, selectedStatus, sortField, sortAsc]);

  const totalPages = Math.ceil(filteredMembers.length / itemsPerPage) || 1;
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredMembers.slice(start, start + itemsPerPage);
  }, [filteredMembers, currentPage]);

  const getNameById = (id: number | null | undefined) => {
    if (!id) return '-';
    const found = members.find(m => m.id === id);
    return found ? `#${found.id} - ${found.hoTen}` : `#${id}`;
  };

  return (
    <div className="bg-[#141414] rounded-xl border border-[#262626] shadow-xl flex flex-col h-[calc(100vh-140px)] min-h-[580px] overflow-hidden text-[#e5e5e5]">
      {/* Table Header Bar with Filters and Actions */}
      <div className="p-4 border-b border-[#262626] bg-[#181818]/90 flex flex-wrap items-center justify-between gap-3">
        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-[#737373] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên, mã gia phả, ID, ghi chú..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-3 py-1.5 text-xs bg-[#1c1c1c] border border-[#2e2e2e] text-[#e5e5e5] placeholder-[#737373] rounded-lg w-60 sm:w-72 focus:outline-hidden focus:ring-2 focus:ring-[#c4a47c]"
            />
          </div>

          {/* Filter by Generation */}
          <select
            value={selectedGen}
            onChange={(e) => {
              const val = e.target.value;
              setSelectedGen(val);
              setCurrentPage(1);
              if (val !== 'all' && currentUser && currentUser.role === 'editor' && !canUserEditGeneration(currentUser, Number(val))) {
                if (onPermissionNotice) {
                  onPermissionNotice('Bạn chưa được phân quyền điều chỉnh thông tin này');
                }
              }
            }}
            className="text-xs px-2.5 py-1.5 bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg text-[#d4d4d4] focus:outline-hidden focus:ring-2 focus:ring-[#c4a47c]"
          >
            <option value="all">Tất cả các đời ({generations.length} đời)</option>
            {generations.map(g => (
              <option key={g} value={g}>Đời thứ {g}</option>
            ))}
          </select>

          {/* Filter by Branch / Cành / Phái */}
          {branches.length > 0 && (
            <select
              value={selectedBranch}
              onChange={(e) => {
                setSelectedBranch(e.target.value);
                setCurrentPage(1);
              }}
              className="text-xs px-2.5 py-1.5 bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg text-[#d4d4d4] focus:outline-hidden focus:ring-2 focus:ring-[#c4a47c] font-mono"
            >
              <option value="all">Tất cả Cành/Phái/Nhánh ({branches.length})</option>
              {branches.map(b => (
                <option key={b} value={b}>Nhánh {b}</option>
              ))}
            </select>
          )}

          {/* Filter by Gender */}
          <select
            value={selectedGender}
            onChange={(e) => {
              setSelectedGender(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs px-2.5 py-1.5 bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg text-[#d4d4d4] focus:outline-hidden focus:ring-2 focus:ring-[#c4a47c]"
          >
            <option value="all">Tất cả giới tính</option>
            <option value="Nam">Nam</option>
            <option value="Nữ">Nữ</option>
          </select>

          {/* Filter by Status */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs px-2.5 py-1.5 bg-[#1c1c1c] border border-[#2e2e2e] rounded-lg text-[#d4d4d4] focus:outline-hidden focus:ring-2 focus:ring-[#c4a47c]"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="living">Còn sống</option>
            <option value="deceased">Đã khuất</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToExcel(members)}
            className="px-3 py-1.5 bg-[#132a1e] hover:bg-[#1a3828] border border-[#1e4d34] text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Xuất file Excel đúng định dạng"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Xuất Excel</span>
          </button>
          
          <button
            onClick={onAddNewMember}
            className="px-3.5 py-1.5 bg-[#c4a47c] hover:bg-[#b5956d] text-[#0a0a0a] rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm thành viên</span>
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#1a1a1a] sticky top-0 z-10 text-[#d4d4d4] font-bold border-b border-[#262626]">
            <tr>
              <th onClick={() => handleSort('id')} className="py-2.5 px-3 cursor-pointer hover:bg-[#262626] w-14">
                <div className="flex items-center gap-1">
                  <span>ID</span>
                  <ArrowUpDown className="w-3 h-3 text-[#737373]" />
                </div>
              </th>
              <th onClick={() => handleSort('maGiaPha')} className="py-2.5 px-3 cursor-pointer hover:bg-[#262626] w-28">
                <div className="flex items-center gap-1">
                  <span>Mã Gia Phả</span>
                  <ArrowUpDown className="w-3 h-3 text-[#737373]" />
                </div>
              </th>
              <th onClick={() => handleSort('hoTen')} className="py-2.5 px-3 cursor-pointer hover:bg-[#262626] min-w-[150px]">
                <div className="flex items-center gap-1">
                  <span>Họ Tên</span>
                  <ArrowUpDown className="w-3 h-3 text-[#737373]" />
                </div>
              </th>
              <th onClick={() => handleSort('gioiTinh')} className="py-2.5 px-3 cursor-pointer hover:bg-[#262626] w-20">
                <div className="flex items-center gap-1">
                  <span>Giới Tính</span>
                  <ArrowUpDown className="w-3 h-3 text-[#737373]" />
                </div>
              </th>
              <th className="py-2.5 px-3 w-28 text-[#a3a3a3]">ID_Cha</th>
              <th className="py-2.5 px-3 w-28 text-[#a3a3a3]">ID_Me</th>
              <th className="py-2.5 px-3 w-28 text-[#a3a3a3]">ID_VoChong</th>
              <th onClick={() => handleSort('doiThu')} className="py-2.5 px-3 cursor-pointer hover:bg-[#262626] w-20 text-center">
                <div className="flex items-center justify-center gap-1">
                  <span>Đời Thứ</span>
                  <ArrowUpDown className="w-3 h-3 text-[#737373]" />
                </div>
              </th>
              <th onClick={() => handleSort('namSinh')} className="py-2.5 px-3 cursor-pointer hover:bg-[#262626] w-24">
                <div className="flex items-center gap-1">
                  <span>Năm Sinh</span>
                  <ArrowUpDown className="w-3 h-3 text-[#737373]" />
                </div>
              </th>
              <th onClick={() => handleSort('namMat')} className="py-2.5 px-3 cursor-pointer hover:bg-[#262626] w-24">
                <div className="flex items-center gap-1">
                  <span>Năm Mất</span>
                  <ArrowUpDown className="w-3 h-3 text-[#737373]" />
                </div>
              </th>
              <th className="py-2.5 px-3 min-w-[140px] text-[#a3a3a3]">Ghi Chú</th>
              <th className="py-2.5 px-3 min-w-[180px] text-[#a3a3a3]">Thông tin cá nhân</th>
              <th className="py-2.5 px-3 w-28 text-center sticky right-0 bg-[#1a1a1a]">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222222] text-[#d4d4d4] font-sans">
            {paginatedMembers.length > 0 ? (
              paginatedMembers.map((m) => (
                <tr 
                  key={m.id} 
                  className="hover:bg-[#1f1a14]/60 transition-colors group"
                >
                  <td className="py-2.5 px-3 font-mono font-bold text-[#e5e5e5]">{m.id}</td>
                  <td className="py-2.5 px-3 font-mono font-medium text-[#c4a47c]">
                    {m.maGiaPha || <span className="text-[#525252]">-</span>}
                  </td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        onClick={(e) => {
                          if (onPreviewPortrait) {
                            e.stopPropagation();
                            onPreviewPortrait(m);
                          } else {
                            onSelectMember(m);
                          }
                        }}
                        className={`w-7 h-10 rounded-md flex items-center justify-center shrink-0 border overflow-hidden cursor-pointer shadow-xs transition-transform hover:scale-110 ${
                          m.namMat
                            ? 'bg-[#1c1c1c] text-[#737373] border-[#2a2a2a]'
                            : m.gioiTinh === 'Nam'
                            ? 'bg-[#192438] text-[#60a5fa] border-[#253959]'
                            : 'bg-[#2d1822] text-[#f472b6] border-[#4a2337]'
                        }`}
                        title="Bấm phóng to chân dung 10x20cm"
                      >
                        {m.avatar ? (
                          <img
                            src={m.avatar}
                            alt={m.hoTen}
                            className="w-full h-full object-cover object-top"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <User className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <button
                        onClick={() => onSelectMember(m)}
                        className="font-bold text-[#e5e5e5] hover:text-[#c4a47c] hover:underline flex items-center gap-1.5 text-left"
                      >
                        <span>{m.hoTen}</span>
                      </button>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                        m.gioiTinh === 'Nam'
                          ? 'bg-[#192438] text-[#60a5fa] border-[#253959]'
                          : 'bg-[#2d1822] text-[#f472b6] border-[#4a2337]'
                      }`}
                    >
                      {m.gioiTinh}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-[#a3a3a3] truncate max-w-[120px]" title={getNameById(m.idCha)}>
                    {m.idCha ? (
                      <span className="font-mono bg-[#1c1c1c] border border-[#2a2a2a] px-1 py-0.5 rounded text-[#d4d4d4]">
                        {getNameById(m.idCha)}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-[#a3a3a3] truncate max-w-[120px]" title={getNameById(m.idMe)}>
                    {m.idMe ? (
                      <span className="font-mono bg-[#1c1c1c] border border-[#2a2a2a] px-1 py-0.5 rounded text-[#d4d4d4]">
                        {getNameById(m.idMe)}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-[#a3a3a3] truncate max-w-[140px]" title={getNameById(m.idVoChong) || m.hoTenVoChongNgoai || ''}>
                    {m.idVoChong ? (
                      <span className="font-mono bg-[#2d1822] text-[#f472b6] px-1 py-0.5 rounded border border-[#4a2337]">
                        {getNameById(m.idVoChong)}
                      </span>
                    ) : m.hoTenVoChongNgoai ? (
                      <span className="bg-[#2d1822] text-[#f472b6] px-1.5 py-0.5 rounded border border-[#4a2337] text-[11px]">
                        {m.hoTenVoChongNgoai}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="font-bold px-2 py-0.5 rounded bg-[#1c1c1c] border border-[#2a2a2a] text-[#c4a47c] text-[11px]">
                      {m.doiThu}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[#a3a3a3]">{m.namSinh || '-'}</td>
                  <td className="py-2.5 px-3 font-mono">
                    {m.namMat ? (
                      <span className="text-[#737373] font-serif italic">{m.namMat}</span>
                    ) : (
                      <span className="text-emerald-400 text-[10.5px] font-sans">Còn sống</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 italic text-[#8a8a8a]">{m.ghiChu || '-'}</td>
                  <td className="py-2.5 px-3 text-[#8a8a8a] max-w-[240px] truncate" title={m.thongTinCaNhan}>
                    {m.thongTinCaNhan || '-'}
                  </td>
                  
                  {/* Action Column */}
                  <td className="py-2 px-2 text-center sticky right-0 bg-[#141414] group-hover:bg-[#1f1a14] border-l border-[#262626]">
                    {(() => {
                      const canEdit = currentUser ? canUserEditGeneration(currentUser, m.doiThu) : true;
                      const canDelete = currentUser ? canUserDeleteMember(currentUser, m) : true;

                      return (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            title="Xem vị trí trên sơ đồ cây"
                            onClick={() => onJumpToTree(m)}
                            className="p-1 hover:bg-[#262626] text-[#c4a47c] rounded transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>

                          <button
                            title={canEdit ? "Chỉnh sửa" : "Bạn chưa được phân quyền điều chỉnh thông tin này"}
                            onClick={() => {
                              if (!canEdit) {
                                alert('Bạn chưa được phân quyền điều chỉnh thông tin này');
                                if (onPermissionNotice) onPermissionNotice('Bạn chưa được phân quyền điều chỉnh thông tin này');
                              }
                              onEditMember(m);
                            }}
                            className={`p-1 rounded transition-colors cursor-pointer ${
                              canEdit 
                                ? 'hover:bg-[#262626] text-[#d4d4d4] hover:text-white' 
                                : 'hover:bg-[#2a1d12] text-amber-500/70 hover:text-amber-400'
                            }`}
                          >
                            {canEdit ? <Edit3 className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            title={canEdit ? "Thêm con" : "Bạn chưa được phân quyền điều chỉnh thông tin này"}
                            onClick={() => {
                              if (!canEdit) {
                                alert('Bạn chưa được phân quyền điều chỉnh thông tin này');
                                if (onPermissionNotice) onPermissionNotice('Bạn chưa được phân quyền điều chỉnh thông tin này');
                              }
                              onAddChild(m);
                            }}
                            className={`p-1 rounded transition-colors cursor-pointer ${
                              canEdit 
                                ? 'hover:bg-[#262626] text-emerald-400' 
                                : 'hover:bg-[#1e293b] text-blue-400/60 hover:text-blue-400'
                            }`}
                          >
                            <UserPlus className="w-3.5 h-3.5" />
                          </button>

                          {canDelete ? (
                            <button
                              title="Xóa thành viên khỏi gia phả"
                              onClick={() => onDeleteMember(m)}
                              className="p-1 hover:bg-red-950/60 text-red-400 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : null}
                        </div>
                      );
                    })()}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={13} className="py-12 text-center text-[#737373] italic">
                  Không tìm thấy thành viên nào phù hợp với bộ lọc.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Table Pagination & Stats */}
      <div className="p-3 border-t border-[#262626] bg-[#181818]/90 flex flex-wrap items-center justify-between text-xs text-[#8a8a8a]">
        <div>
          Hiển thị <span className="font-bold text-[#e5e5e5]">{filteredMembers.length}</span> / {members.length} thành viên dòng họ
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded border border-[#2e2e2e] bg-[#1c1c1c] text-[#d4d4d4] hover:bg-[#262626] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="font-semibold text-[#d4d4d4]">
            Trang {currentPage} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded border border-[#2e2e2e] bg-[#1c1c1c] text-[#d4d4d4] hover:bg-[#262626] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
