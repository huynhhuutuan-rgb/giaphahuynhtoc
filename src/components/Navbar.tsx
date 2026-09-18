import React from 'react';
import { ClanInfo, FamilyMember, AppUser } from '../types/family';
import { 
  Network, 
  Table, 
  BookOpen, 
  BarChart3, 
  Calendar, 
  Plus, 
  Upload, 
  Download, 
  FolderDown, 
  Scroll, 
  Sparkles,
  Users,
  ShieldCheck,
  UserCheck,
  History,
  Lock,
  Palette,
  GitBranch,
  CheckCircle2
} from 'lucide-react';

export type AppView = 'tree' | 'table' | 'book' | 'analytics' | 'memorials';

interface NavbarProps {
  clanInfo: ClanInfo;
  members: FamilyMember[];
  currentView: AppView;
  currentUser: AppUser;
  onViewChange: (view: AppView) => void;
  onAddNewMember: () => void;
  onOpenImportExport: () => void;
  onOpenUserManager: () => void;
  onOpenLoginModal?: () => void;
  onOpenThemeModal?: () => void;
  onOpenGenerationColorModal?: () => void;
  onLogout?: () => void;
  syncStatus?: 'synced' | 'saving' | 'ready';
}

export const Navbar: React.FC<NavbarProps> = ({
  clanInfo,
  members,
  currentView,
  currentUser,
  onViewChange,
  onAddNewMember,
  onOpenImportExport,
  onOpenUserManager,
  onOpenLoginModal,
  onOpenThemeModal,
  onOpenGenerationColorModal,
  onLogout,
  syncStatus = 'synced',
}) => {
  const maxGen = Math.max(...members.map(m => m.doiThu || 1), 1);
  const livingCount = members.filter(m => !m.namMat).length;
  const isAdmin = currentUser.role === 'admin';
  const isViewer = currentUser.role === 'viewer';

  return (
    <header className="bg-[#141414] text-[#e5e5e5] border-b border-[#262626] sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand & Clan Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#967245] text-[#0a0a0a] flex items-center justify-center font-serif font-black shadow-md border border-[#e5c07b]/40 text-lg shrink-0">
              族
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm sm:text-base text-[#e5e5e5] tracking-tight truncate uppercase">
                  {clanInfo.tenDongHo}
                </h1>
                <span className="hidden md:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#c4a47c]/15 text-[#c4a47c] border border-[#c4a47c]/30">
                  {maxGen} Thế Hệ • {members.length} Thành Viên
                </span>
              </div>
              <p className="text-[11px] text-[#737373] truncate hidden sm:block">
                {clanInfo.nguyenQuan}
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#1a1a1a] p-1 rounded-xl border border-[#2a2a2a] text-xs font-semibold">
            <button
              onClick={() => onViewChange('tree')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                currentView === 'tree'
                  ? 'bg-[#c4a47c] text-[#0a0a0a] font-bold shadow-xs'
                  : 'text-[#8a8a8a] hover:text-[#e5e5e5] hover:bg-[#262626]'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Sơ Đồ Cây Phả Hệ</span>
            </button>

            <button
              onClick={() => onViewChange('table')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                currentView === 'table'
                  ? 'bg-[#c4a47c] text-[#0a0a0a] font-bold shadow-xs'
                  : 'text-[#8a8a8a] hover:text-[#e5e5e5] hover:bg-[#262626]'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Bảng Dữ Liệu (Excel)</span>
            </button>

            <button
              onClick={() => onViewChange('book')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                currentView === 'book'
                  ? 'bg-[#c4a47c] text-[#0a0a0a] font-bold shadow-xs'
                  : 'text-[#8a8a8a] hover:text-[#e5e5e5] hover:bg-[#262626]'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Phả Ký Dòng Họ</span>
            </button>

            <button
              onClick={() => onViewChange('analytics')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                currentView === 'analytics'
                  ? 'bg-[#c4a47c] text-[#0a0a0a] font-bold shadow-xs'
                  : 'text-[#8a8a8a] hover:text-[#e5e5e5] hover:bg-[#262626]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Thống Kê</span>
            </button>

            <button
              onClick={() => onViewChange('memorials')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                currentView === 'memorials'
                  ? 'bg-[#c4a47c] text-[#0a0a0a] font-bold shadow-xs'
                  : 'text-[#8a8a8a] hover:text-[#e5e5e5] hover:bg-[#262626]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Lịch Giỗ</span>
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Real-time Sync & Auto-save Status Indicator */}
            <div 
              title="Dữ liệu gia phả được tự động lưu trữ và đồng bộ hóa tức thì"
              className="hidden xl:flex items-center gap-1.5 px-2 py-1 bg-[#18181b] border border-[#27272a] rounded-lg text-[11px] text-[#10b981]"
            >
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <span className="font-medium">Tự lưu & Đồng bộ</span>
            </div>

            {/* Theme & Line Color Modal Triggers */}
            {onOpenThemeModal && (
              <button
                onClick={onOpenThemeModal}
                title="Đổi hình nền gia phả & chủ đề sáng truyền thống"
                className="p-2 bg-[#1a1a1a] hover:bg-[#262626] border border-[#2a2a2a] text-[#d4d4d4] hover:text-[#c4a47c] rounded-lg transition-colors"
              >
                <Palette className="w-4 h-4" />
              </button>
            )}

            {onOpenGenerationColorModal && (
              <button
                onClick={onOpenGenerationColorModal}
                title="Tùy chỉnh màu đường line kết nối từng đời"
                className="p-2 bg-[#1a1a1a] hover:bg-[#262626] border border-[#2a2a2a] text-[#d4d4d4] hover:text-[#3b82f6] rounded-lg transition-colors"
              >
                <GitBranch className="w-4 h-4" />
              </button>
            )}

            {/* User Account / Login / Role Trigger Button */}
            <button
              onClick={onOpenUserManager}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all cursor-pointer ${
                isAdmin
                  ? 'bg-[#1f1a14] border-[#c4a47c]/50 text-[#e5e5e5] hover:border-[#c4a47c]'
                  : isViewer
                  ? 'bg-[#18181b] border-[#27272a] text-[#a1a1aa] hover:border-[#3f3f46]'
                  : 'bg-[#151b26] border-[#253959] text-[#e5e5e5] hover:border-[#3b82f6]'
              }`}
              title="Bấm để xem danh sách tài khoản & phân quyền đời"
            >
              <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                isAdmin ? 'bg-[#c4a47c] text-[#0a0a0a]' : isViewer ? 'bg-[#3f3f46] text-white' : 'bg-[#3b82f6] text-white'
              }`}>
                {isAdmin ? '👑' : isViewer ? '👁️' : '✍️'}
              </div>
              <div className="text-left hidden sm:block leading-tight">
                <div className="font-bold text-[11px] truncate max-w-[130px] flex items-center gap-1">
                  <span>{currentUser.name}</span>
                </div>
                <div className="text-[9.5px] text-[#8a8a8a] truncate max-w-[130px]">
                  {isAdmin ? 'Toàn quyền tất cả đời' : isViewer ? 'Chỉ đọc (Đăng nhập để sửa)' : `Sửa Đời: ${currentUser.allowedGenerations.join(', ') || 'Chưa cấp'}`}
                </div>
              </div>
            </button>

            {/* Login Button when in Guest / Viewer mode */}
            {onOpenLoginModal && isViewer && (
              <button
                onClick={onOpenLoginModal}
                className="px-3 py-1.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer animate-pulse hover:animate-none"
                title="Đăng nhập tài khoản có quyền để thêm/sửa gia phả"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Đăng Nhập</span>
              </button>
            )}

            {/* Logout to Guest button when logged in as Admin or Editor */}
            {onLogout && !isViewer && (
              <button
                onClick={onLogout}
                className="px-2.5 py-1.5 bg-[#18181b] hover:bg-[#27272a] border border-[#3f3f46] text-[#d4d4d8] hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Đăng xuất và trở về chế độ Khách xem"
              >
                <span>Đăng Xuất</span>
              </button>
            )}

            <button
              onClick={onOpenImportExport}
              className="px-2.5 py-1.5 bg-[#1a1a1a] hover:bg-[#262626] border border-[#2a2a2a] text-[#d4d4d4] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Nhập xuất Excel/CSV & Sao lưu"
            >
              <FolderDown className="w-3.5 h-3.5 text-[#c4a47c]" />
              <span className="hidden xl:inline">Excel</span>
            </button>

            <button
              onClick={onAddNewMember}
              className="px-3 py-1.5 bg-[#c4a47c] hover:bg-[#b5956d] text-[#0a0a0a] font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Người</span>
            </button>
          </div>
        </div>

        {/* Mobile View Switcher Sub-Bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-[#262626] text-xs font-medium no-scrollbar">
          <button
            onClick={() => onViewChange('tree')}
            className={`px-3 py-1 rounded-lg shrink-0 flex items-center gap-1 ${
              currentView === 'tree' ? 'bg-[#c4a47c] text-[#0a0a0a] font-bold' : 'text-[#8a8a8a]'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Sơ đồ cây</span>
          </button>
          <button
            onClick={() => onViewChange('table')}
            className={`px-3 py-1 rounded-lg shrink-0 flex items-center gap-1 ${
              currentView === 'table' ? 'bg-[#c4a47c] text-[#0a0a0a] font-bold' : 'text-[#8a8a8a]'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Bảng dữ liệu</span>
          </button>
          <button
            onClick={() => onViewChange('book')}
            className={`px-3 py-1 rounded-lg shrink-0 flex items-center gap-1 ${
              currentView === 'book' ? 'bg-[#c4a47c] text-[#0a0a0a] font-bold' : 'text-[#8a8a8a]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Phả ký</span>
          </button>
          <button
            onClick={() => onViewChange('analytics')}
            className={`px-3 py-1 rounded-lg shrink-0 flex items-center gap-1 ${
              currentView === 'analytics' ? 'bg-[#c4a47c] text-[#0a0a0a] font-bold' : 'text-[#8a8a8a]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Thống kê</span>
          </button>
          <button
            onClick={() => onViewChange('memorials')}
            className={`px-3 py-1 rounded-lg shrink-0 flex items-center gap-1 ${
              currentView === 'memorials' ? 'bg-[#c4a47c] text-[#0a0a0a] font-bold' : 'text-[#8a8a8a]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Lịch giỗ</span>
          </button>
        </div>
      </div>
    </header>
  );
};
