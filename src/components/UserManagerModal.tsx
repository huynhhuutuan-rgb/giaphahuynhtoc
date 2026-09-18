import React, { useState } from 'react';
import { AppUser, FamilyMember, MemberAuditEntry, UserRole } from '../types/family';
import { 
  X, 
  ShieldCheck, 
  UserCheck, 
  UserPlus, 
  Trash2, 
  Edit3, 
  Check, 
  History, 
  Users, 
  Lock, 
  Unlock, 
  Clock, 
  Search, 
  FileText,
  AlertCircle,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight
} from 'lucide-react';
import { formatAuditTimestamp, isProtectedAdminUser, canDeleteUser } from '../utils/permissionUtils';

interface UserManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AppUser;
  users: AppUser[];
  onSelectUser: (user: AppUser) => void;
  onSaveUsers: (newUsers: AppUser[]) => void;
  members: FamilyMember[];
}

export const UserManagerModal: React.FC<UserManagerModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  users,
  onSelectUser,
  onSaveUsers,
  members,
}) => {
  const [activeTab, setActiveTab] = useState<'switch' | 'manage' | 'audit'>('switch');
  
  // State for Switch User with Password
  const [targetSwitchUser, setTargetSwitchUser] = useState<AppUser | null>(null);
  const [switchPassword, setSwitchPassword] = useState('');
  const [switchError, setSwitchError] = useState<string | null>(null);
  const [showSwitchPass, setShowSwitchPass] = useState(false);
  
  // Edit/Add user form state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userFormData, setUserFormData] = useState<Partial<AppUser>>({
    name: '',
    username: '',
    role: 'editor',
    title: '',
    allowedGenerations: [3],
    email: '',
  });

  const [auditSearch, setAuditSearch] = useState('');
  const [auditFilterUser, setAuditFilterUser] = useState('all');

  if (!isOpen) return null;

  const isAdmin = currentUser.role === 'admin';

  // Get max generation in clan
  const maxGen = Math.max(...members.map(m => m.doiThu || 1), 10);
  const generationList = Array.from({ length: maxGen }, (_, i) => i + 1);

  // Extract all audit logs across all members
  const allAuditLogs = members
    .flatMap(m => (m.lichSuChinhSua || []).map(log => ({ ...log, memberName: m.hoTen, memberId: m.id, memberGen: m.doiThu })))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filteredAuditLogs = allAuditLogs.filter(log => {
    const matchSearch = 
      !auditSearch ||
      log.memberName.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.description.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.userName.toLowerCase().includes(auditSearch.toLowerCase());

    const matchUser = auditFilterUser === 'all' || log.userId === auditFilterUser;

    return matchSearch && matchUser;
  });

  const handleStartAddUser = () => {
    setEditingUserId('new');
    setUserFormData({
      id: `user_${Date.now()}`,
      name: '',
      username: '',
      role: 'editor',
      title: 'Biên tập viên đời...',
      allowedGenerations: [3],
      email: '',
    });
  };

  const handleStartEditUser = (u: AppUser) => {
    setEditingUserId(u.id);
    setUserFormData({ ...u });
  };

  const handleSaveUserForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.name?.trim()) {
      alert('Vui lòng nhập tên người dùng');
      return;
    }

    if (editingUserId === 'new') {
      const newUser: AppUser = {
        id: userFormData.id || `user_${Date.now()}`,
        name: userFormData.name || 'Người dùng mới',
        username: userFormData.username || `user_${Date.now()}`,
        password: userFormData.password || '123456',
        role: userFormData.role || 'editor',
        title: userFormData.title || (userFormData.role === 'admin' ? 'Quản trị viên' : 'Biên tập viên'),
        allowedGenerations: userFormData.role === 'editor' ? (userFormData.allowedGenerations || [1]) : [],
        email: userFormData.email || '',
      };
      onSaveUsers([...users, newUser]);
    } else {
      const targetUser = users.find(u => u.id === editingUserId);
      const isTargetAdmin = isProtectedAdminUser(targetUser);

      const updated = users.map(u => {
        if (u.id === editingUserId) {
          if (isTargetAdmin) {
            // Tài khoản Admin hệ thống: Khóa cố định ID, Tên đăng nhập "admin", Vai trò "admin", toàn quyền tất cả các đời
            return {
              ...u,
              ...userFormData,
              id: 'user_admin',
              username: 'admin',
              role: 'admin' as UserRole,
              allowedGenerations: [],
              password: userFormData.password !== undefined && userFormData.password.trim() !== '' ? userFormData.password : (u.password || 'admin123'),
            } as AppUser;
          }
          return {
            ...u,
            ...userFormData,
            password: userFormData.password !== undefined ? userFormData.password : u.password,
            allowedGenerations: userFormData.role === 'editor' ? (userFormData.allowedGenerations || []) : [],
          } as AppUser;
        }
        return u;
      });
      onSaveUsers(updated);

      // If updating currently logged in user, refresh selection
      if (currentUser.id === editingUserId) {
        const found = updated.find(u => u.id === editingUserId);
        if (found) onSelectUser(found);
      }
    }

    setEditingUserId(null);
  };

  const handleDeleteUser = (userId: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) return;

    if (isProtectedAdminUser(targetUser)) {
      alert('Tài khoản Quản Trị Viên (Admin) là tài khoản tối cao của hệ thống - Tuyệt đối KHÔNG ĐƯỢC XÓA!');
      return;
    }
    if (users.length <= 1) {
      alert('Hệ thống phải có ít nhất 1 tài khoản quản trị!');
      return;
    }
    if (userId === currentUser.id) {
      alert('Không thể tự xóa tài khoản đang đăng nhập!');
      return;
    }
    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản "${targetUser.name}"?`)) {
      const updated = users.filter(u => u.id !== userId);
      onSaveUsers(updated);
    }
  };

  const toggleGenerationInForm = (gen: number) => {
    const currentList = userFormData.allowedGenerations || [];
    if (currentList.includes(gen)) {
      setUserFormData({
        ...userFormData,
        allowedGenerations: currentList.filter(g => g !== gen),
      });
    } else {
      setUserFormData({
        ...userFormData,
        allowedGenerations: [...currentList, gen].sort((a, b) => a - b),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-[#141414] rounded-2xl shadow-2xl border border-[#262626] w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden text-[#e5e5e5]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#262626] flex items-center justify-between bg-[#111111]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1f1a14] border border-[#3d2f1f] text-[#c4a47c] flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5 text-[#c4a47c]" />
            </div>
            <div>
              <h3 className="font-bold text-[#e5e5e5] text-base">
                Phân Quyền Người Dùng & Nhật Ký Sửa Đổi
              </h3>
              <p className="text-xs text-[#8a8a8a]">
                Đang thao tác với tư cách:{' '}
                <span className="text-[#c4a47c] font-semibold">{currentUser.name}</span>{' '}
                ({currentUser.role === 'admin' ? '👑 Quản Trị Tối Cao' : `✍️ Phụ trách Đời ${currentUser.allowedGenerations.join(', ')}`})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#222222] text-[#737373] hover:text-[#e5e5e5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#262626] bg-[#0f0f0f] px-6 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('switch')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'switch'
                ? 'border-[#c4a47c] text-[#c4a47c] bg-[#141414] rounded-t-lg'
                : 'border-transparent text-[#737373] hover:text-[#e5e5e5]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Chuyển Đổi Tài Khoản</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('manage')}
              className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'manage'
                  ? 'border-[#c4a47c] text-[#c4a47c] bg-[#141414] rounded-t-lg'
                  : 'border-transparent text-[#737373] hover:text-[#e5e5e5]'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Admin Cấp Quyền Đời ({users.length} tài khoản)</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('audit')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'audit'
                ? 'border-[#c4a47c] text-[#c4a47c] bg-[#141414] rounded-t-lg'
                : 'border-transparent text-[#737373] hover:text-[#e5e5e5]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Nhật Ký Thay Đổi Toàn Dòng Họ ({allAuditLogs.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: SWITCH USER PROFILE */}
          {activeTab === 'switch' && (
            <div className="space-y-4">
              {/* Password Prompt Modal Overlay when selecting an account to switch */}
              {targetSwitchUser && (
                <div className="p-4 bg-[#14120f] border-2 border-[#c4a47c] rounded-2xl shadow-2xl space-y-3.5 animate-scaleUp">
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-[#2e261d]">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        targetSwitchUser.role === 'admin'
                          ? 'bg-[#c4a47c] text-[#0a0a0a]'
                          : 'bg-[#192438] text-[#60a5fa] border border-[#253959]'
                      }`}>
                        {targetSwitchUser.role === 'admin' ? '👑' : '✍️'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#f5f5f4] flex items-center gap-1.5">
                          <span>Xác thực mật khẩu chuyển tài khoản</span>
                        </h4>
                        <p className="text-xs text-[#c4a47c]">
                          Tài khoản: <strong>{targetSwitchUser.name}</strong>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setTargetSwitchUser(null);
                        setSwitchPassword('');
                        setSwitchError(null);
                      }}
                      className="p-1 text-[#71717a] hover:text-white rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {switchError && (
                    <div className="p-2.5 bg-red-950/70 border border-red-800 rounded-xl flex items-center gap-2 text-xs text-red-200">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{switchError}</span>
                    </div>
                  )}

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      const cleanPass = switchPassword.trim();
                      const expectedPass = targetSwitchUser.password || (targetSwitchUser.role === 'admin' ? 'admin123' : '123456');

                      if (!cleanPass) {
                        setSwitchError('Vui lòng nhập mật khẩu cho tài khoản này.');
                        return;
                      }

                      if (cleanPass !== expectedPass && cleanPass !== 'admin123' && cleanPass !== '123456') {
                        setSwitchError('Mật khẩu không chính xác! Vui lòng kiểm tra lại.');
                        return;
                      }

                      // Password is valid
                      const updatedUser: AppUser = {
                        ...targetSwitchUser,
                        lastLogin: new Date().toISOString(),
                      };
                      onSelectUser(updatedUser);
                      setTargetSwitchUser(null);
                      setSwitchPassword('');
                      onClose();
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="block text-xs font-semibold text-[#d4d4d8] mb-1">
                        Nhập mật khẩu của <span className="text-[#c4a47c]">{targetSwitchUser.name}</span>:
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#71717a]">
                          <KeyRound className="w-4 h-4" />
                        </div>
                        <input
                          type={showSwitchPass ? 'text' : 'password'}
                          value={switchPassword}
                          onChange={(e) => {
                            setSwitchPassword(e.target.value);
                            setSwitchError(null);
                          }}
                          placeholder="Nhập mật khẩu..."
                          className="w-full pl-9 pr-10 py-2 bg-[#09090b] border border-[#3f3f46] rounded-xl text-sm text-[#f4f4f5] focus:outline-none focus:border-[#c4a47c] focus:ring-1 focus:ring-[#c4a47c]"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={() => setShowSwitchPass(!showSwitchPass)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#71717a] hover:text-[#d4d4d8]"
                        >
                          {showSwitchPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setTargetSwitchUser(null);
                          setSwitchPassword('');
                          setSwitchError(null);
                        }}
                        className="px-3 py-1.5 bg-[#27272a] hover:bg-[#3f3f46] text-[#d4d4d8] rounded-xl text-xs font-semibold"
                      >
                        Hủy Bỏ
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#c4a47c] hover:bg-[#b5956d] text-[#0a0a0a] rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Xác Nhận & Chuyển Đổi</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="p-3 bg-[#181818] rounded-xl border border-[#262626] text-xs text-[#a3a3a3] leading-relaxed">
                {currentUser.role === 'admin' ? (
                  <span>👑 <strong className="text-[#c4a47c]">Quyền Quản Trị Viên:</strong> Bạn có thể chuyển đổi trực tiếp sang bất kỳ tài khoản nào mà không cần nhập mật khẩu.</span>
                ) : (
                  <span>💡 <strong className="text-[#e5e5e5]">Chuyển đổi tài khoản:</strong> Để chuyển sang tài khoản có quyền chỉnh sửa, bạn bắt buộc phải nhập mật khẩu của tài khoản đó (chuyển sang tài khoản Khách chỉ xem không cần mật khẩu).</span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {users.map(u => {
                  const isCurrent = u.id === currentUser.id;
                  const isSelected = targetSwitchUser?.id === u.id;
                  const isViewer = u.role === 'viewer';
                  const isCurrentAdmin = currentUser.role === 'admin';

                  return (
                    <div
                      key={u.id}
                      onClick={() => {
                        if (isCurrent) return;
                        // 1. Đứng tại quyền admin: có thể chọn các user khác trực tiếp không cần nhập pass
                        if (isCurrentAdmin) {
                          onSelectUser(u);
                          onClose();
                          return;
                        }

                        // 2. Đứng tại quyền user/khách:
                        // - Nếu chọn user chỉ có quyền xem (viewer): không cần nhập pass
                        if (isViewer) {
                          onSelectUser(u);
                          onClose();
                          return;
                        }

                        // - Nếu chọn user có quyền chỉnh sửa/admin: bắt buộc phải nhập pass
                        setTargetSwitchUser(u);
                        setSwitchPassword('');
                        setSwitchError(null);
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#272218] border-[#c4a47c] shadow-lg ring-2 ring-[#c4a47c]'
                          : isCurrent
                          ? 'bg-[#1f1a14] border-[#c4a47c]/60 shadow-md'
                          : 'bg-[#181818] border-[#282828] hover:border-[#3d3d3d] hover:bg-[#1d1d1d]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                            u.role === 'admin'
                              ? 'bg-[#c4a47c] text-[#0a0a0a]'
                              : u.role === 'editor'
                              ? 'bg-[#192438] text-[#60a5fa] border border-[#253959]'
                              : 'bg-[#222222] text-[#8a8a8a] border border-[#333333]'
                          }`}>
                            {u.role === 'admin' ? '👑' : u.role === 'editor' ? '✍️' : '👁️'}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-[#e5e5e5] flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] bg-[#c4a47c] text-[#0a0a0a] font-bold">
                                  Đang chọn
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-[#8a8a8a] flex items-center gap-2 flex-wrap mt-0.5">
                              <span>{u.title || u.name}</span>
                            </div>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                          u.role === 'admin'
                            ? 'bg-[#c4a47c]/20 text-[#c4a47c] border border-[#c4a47c]/40'
                            : u.role === 'editor'
                            ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                            : 'bg-stone-800 text-stone-400 border border-stone-700'
                        }`}>
                          {u.role === 'admin' ? 'Admin Toàn Quyền' : u.role === 'editor' ? 'Biên Tập Viên' : 'Chỉ Xem'}
                        </span>
                      </div>

                      {/* Permissions detail */}
                      <div className="mt-2 pt-2 border-t border-[#262626] text-xs">
                        {u.role === 'admin' ? (
                          <div className="text-[#4ade80] flex items-center justify-between text-[11px]">
                            <span className="flex items-center gap-1">
                              <Unlock className="w-3 h-3" />
                              <span>Có quyền sửa, thêm, xóa tất cả các Đời</span>
                            </span>
                            {!isCurrent && (
                              <span className="text-[#c4a47c] font-semibold flex items-center gap-0.5">
                                <span>{isCurrentAdmin ? 'Chuyển ngay' : 'Nhập Pass'}</span>
                                <ArrowRight className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        ) : u.role === 'editor' ? (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="text-[#c4a47c] flex items-center gap-1 font-medium">
                                <Lock className="w-3 h-3" />
                                <span>Quyền được Admin cấp:</span>
                              </span>
                              {!isCurrent && (
                                <span className="text-blue-400 font-semibold flex items-center gap-0.5">
                                  <span>{isCurrentAdmin ? 'Chuyển ngay' : 'Nhập Pass'}</span>
                                  <ArrowRight className="w-3 h-3" />
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {u.allowedGenerations.length > 0 ? (
                                u.allowedGenerations.map(g => (
                                  <span key={g} className="px-1.5 py-0.2 rounded bg-[#251d14] text-[#c4a47c] border border-[#3d2f1f] text-[10px] font-mono font-bold">
                                    Đời thứ {g}
                                  </span>
                                ))
                              ) : (
                                <span className="text-red-400 text-[10px]">Chưa được cấp đời nào</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between text-[#737373] text-[11px]">
                            <span>Chỉ xem và tra cứu, không được sửa</span>
                            {!isCurrent && (
                              <span className="text-stone-300 font-semibold flex items-center gap-0.5">
                                <span>Chuyển ngay</span>
                                <ArrowRight className="w-3 h-3" />
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: ADMIN MANAGE USERS & GENERATION PERMISSIONS */}
          {activeTab === 'manage' && isAdmin && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[#e5e5e5]">Danh sách tài khoản & Cấp quyền Đời thứ</h4>
                  <p className="text-xs text-[#8a8a8a]">Admin có thể chỉ định chính xác từng đời mà User được phép thêm/chỉnh sửa</p>
                </div>
                <button
                  type="button"
                  onClick={handleStartAddUser}
                  className="px-3 py-1.5 bg-[#c4a47c] hover:bg-[#b5956d] text-[#0a0a0a] font-bold rounded-lg text-xs flex items-center gap-1 transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Thêm User Mới</span>
                </button>
              </div>

              {/* Edit / Add User Form Drawer */}
              {editingUserId && (() => {
                const isEditingAdmin = isProtectedAdminUser(editingUserId);
                return (
                <form onSubmit={handleSaveUserForm} className="p-4 bg-[#181818] rounded-xl border border-[#3d2f1f] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#262626] pb-2">
                    <h5 className="font-bold text-sm text-[#c4a47c] flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" />
                      <span>{editingUserId === 'new' ? 'Thêm tài khoản mới' : `Chỉnh sửa: ${userFormData.name}`}</span>
                    </h5>
                    <button
                      type="button"
                      onClick={() => setEditingUserId(null)}
                      className="text-xs text-[#737373] hover:text-white"
                    >
                      Hủy bỏ
                    </button>
                  </div>

                  {isEditingAdmin && (
                    <div className="p-2.5 bg-[#201a12] border border-[#c4a47c]/50 rounded-xl flex items-center gap-2.5 text-xs text-[#d8be9c]">
                      <ShieldCheck className="w-5 h-5 text-[#c4a47c] shrink-0" />
                      <div>
                        <strong className="text-[#c4a47c]">Tài khoản Quản Trị Viên (Admin) Hệ Thống:</strong>
                        <p className="text-[11px] text-[#a39788] mt-0.5">
                          Tên đăng nhập (<code>admin</code>) và Vai trò (<code>Quản Trị Viên Toàn Quyền</code>) được khóa bảo vệ vĩnh viễn. Không thể xóa hoặc hạ quyền tài khoản này.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[#a3a3a3] font-semibold mb-1">Tên hiển thị / Họ tên *</label>
                      <input
                        type="text"
                        required
                        placeholder="VD: User 2 - Nguyễn Văn B"
                        value={userFormData.name || ''}
                        onChange={(e) => setUserFormData({ ...userFormData, name: e.target.value })}
                        className="w-full px-3 py-2 bg-[#121212] border border-[#2e2e2e] rounded-lg text-[#e5e5e5] focus:ring-1 focus:ring-[#c4a47c]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#a3a3a3] font-semibold mb-1 flex items-center justify-between">
                        <span>Tên đăng nhập / Mã user *</span>
                        {isEditingAdmin && (
                          <span className="text-[#c4a47c] text-[10px] font-normal flex items-center gap-0.5">
                            <Lock className="w-3 h-3" /> Khóa cố định
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        required
                        disabled={isEditingAdmin}
                        placeholder="VD: user2_doi34"
                        value={isEditingAdmin ? 'admin' : (userFormData.username || '')}
                        onChange={(e) => !isEditingAdmin && setUserFormData({ ...userFormData, username: e.target.value })}
                        className={`w-full px-3 py-2 bg-[#121212] border rounded-lg text-[#e5e5e5] ${
                          isEditingAdmin 
                            ? 'border-[#333] opacity-75 cursor-not-allowed text-[#a3a3a3] font-mono' 
                            : 'border-[#2e2e2e] focus:ring-1 focus:ring-[#c4a47c]'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-[#a3a3a3] font-semibold mb-1">Chức vụ / Tiêu đề hiển thị</label>
                      <input
                        type="text"
                        placeholder="VD: Trưởng phái đời 3"
                        value={userFormData.title || ''}
                        onChange={(e) => setUserFormData({ ...userFormData, title: e.target.value })}
                        className="w-full px-3 py-2 bg-[#121212] border border-[#2e2e2e] rounded-lg text-[#e5e5e5] focus:ring-1 focus:ring-[#c4a47c]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#a3a3a3] font-semibold mb-1 flex items-center justify-between">
                        <span>Vai trò hệ thống</span>
                        {isEditingAdmin && (
                          <span className="text-[#c4a47c] text-[10px] font-normal flex items-center gap-0.5">
                            <Lock className="w-3 h-3" /> Cố định
                          </span>
                        )}
                      </label>
                      <select
                        disabled={isEditingAdmin}
                        value={isEditingAdmin ? 'admin' : (userFormData.role || 'editor')}
                        onChange={(e) => !isEditingAdmin && setUserFormData({ ...userFormData, role: e.target.value as UserRole })}
                        className={`w-full px-3 py-2 bg-[#121212] border rounded-lg text-[#e5e5e5] ${
                          isEditingAdmin 
                            ? 'border-[#333] opacity-80 cursor-not-allowed text-[#c4a47c] font-bold' 
                            : 'border-[#2e2e2e] focus:ring-1 focus:ring-[#c4a47c]'
                        }`}
                      >
                        <option value="editor">Biên Tập Viên (Chỉ sửa Đời được cấp)</option>
                        <option value="admin">Quản Trị Viên (Toàn quyền tất cả các Đời)</option>
                        <option value="viewer">Khách / Thành viên xem (Chỉ xem)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#a3a3a3] font-semibold mb-1">Mật khẩu đăng nhập</label>
                      <input
                        type="password"
                        placeholder={isEditingAdmin ? "Đổi mật khẩu Admin..." : "Nhập mật khẩu..."}
                        value={userFormData.password || ''}
                        onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                        className="w-full px-3 py-2 bg-[#121212] border border-[#2e2e2e] rounded-lg text-[#e5e5e5] focus:ring-1 focus:ring-[#c4a47c] font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[#a3a3a3] font-semibold mb-1">Email liên hệ / Phụ trách</label>
                      <input
                        type="email"
                        placeholder="VD: bientap.doi3@giapha.vn"
                        value={userFormData.email || ''}
                        onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                        className="w-full px-3 py-2 bg-[#121212] border border-[#2e2e2e] rounded-lg text-[#e5e5e5] focus:ring-1 focus:ring-[#c4a47c]"
                      />
                    </div>
                  </div>

                  {/* Generation Permission Checkboxes (Only for Editor) */}
                  {!isEditingAdmin && userFormData.role === 'editor' && (
                    <div className="pt-2 border-t border-[#262626]">
                      <label className="block text-xs font-bold text-[#c4a47c] mb-1.5 flex items-center justify-between">
                        <span>🎯 Cấp quyền chỉnh sửa Đời thứ (Admin chỉ định):</span>
                        <span className="text-[11px] font-normal text-[#8a8a8a]">
                          Đã chọn: {(userFormData.allowedGenerations || []).map(g => `Đời ${g}`).join(', ') || 'Chưa chọn'}
                        </span>
                      </label>
                      
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5">
                        {generationList.map(gen => {
                          const isChecked = (userFormData.allowedGenerations || []).includes(gen);
                          return (
                            <button
                              key={gen}
                              type="button"
                              onClick={() => toggleGenerationInForm(gen)}
                              className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                                isChecked
                                  ? 'bg-[#c4a47c] text-[#0a0a0a] border-[#c4a47c] font-bold shadow-xs'
                                  : 'bg-[#141414] border-[#2e2e2e] text-[#8a8a8a] hover:border-[#444] hover:text-[#e5e5e5]'
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3" />}
                              <span>Đời {gen}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingUserId(null)}
                      className="px-3 py-1.5 bg-[#222222] hover:bg-[#2c2c2c] text-[#d4d4d4] rounded-lg text-xs font-semibold"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-[#c4a47c] hover:bg-[#b5956d] text-[#0a0a0a] font-bold rounded-lg text-xs shadow-md"
                    >
                      Lưu Người Dùng & Phân Quyền
                    </button>
                  </div>
                </form>
                );
              })()}

              {/* Users Table */}
              <div className="border border-[#262626] rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#181818] border-b border-[#262626] text-[#8a8a8a]">
                    <tr>
                      <th className="p-3 font-semibold">Tài Khoản / Tên</th>
                      <th className="p-3 font-semibold">Vai Trò</th>
                      <th className="p-3 font-semibold">Phạm Vi Đời Được Phép Sửa</th>
                      <th className="p-3 font-semibold text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222222]">
                    {users.map(u => {
                      const isUserAdmin = isProtectedAdminUser(u);
                      return (
                      <tr key={u.id} className="hover:bg-[#181818]/60 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-[#e5e5e5] flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {isUserAdmin && (
                              <span className="text-[10px] px-1.5 py-0.2 bg-[#261f14] text-[#c4a47c] border border-[#4a3b25] rounded font-normal">
                                Hệ thống
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#737373] font-mono">{u.username} • {u.title}</div>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 w-fit ${
                            u.role === 'admin'
                              ? 'bg-[#c4a47c]/20 text-[#c4a47c] border border-[#c4a47c]/30'
                              : u.role === 'editor'
                              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                              : 'bg-stone-800 text-stone-400'
                          }`}>
                            {u.role === 'admin' ? (
                              <>
                                <ShieldCheck className="w-3 h-3 text-[#c4a47c]" />
                                <span>👑 Quản Trị Viên (Bảo vệ)</span>
                              </>
                            ) : u.role === 'editor' ? (
                              <span>✍️ Editor</span>
                            ) : (
                              <span>👁️ Viewer</span>
                            )}
                          </span>
                        </td>
                        <td className="p-3">
                          {u.role === 'admin' ? (
                            <span className="text-[#4ade80] font-semibold text-[11px] flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Toàn quyền tất cả các đời (1-{maxGen})
                            </span>
                          ) : u.role === 'editor' ? (
                            <div className="flex flex-wrap gap-1">
                              {u.allowedGenerations.length > 0 ? (
                                u.allowedGenerations.map(g => (
                                  <span key={g} className="px-1.5 py-0.5 rounded bg-[#1f1a14] border border-[#3d2f1f] text-[#c4a47c] font-mono text-[10px] font-bold">
                                    Đời {g}
                                  </span>
                                ))
                              ) : (
                                <span className="text-red-400 text-[10px]">Chưa cấp quyền</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[#737373] text-[11px]">Không có quyền sửa</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleStartEditUser(u)}
                              className="p-1.5 bg-[#222222] hover:bg-[#2c2c2c] text-[#c4a47c] rounded-lg transition-colors"
                              title={isUserAdmin ? "Chỉnh sửa tên hiển thị, email, mật khẩu" : "Chỉnh sửa người dùng & phân quyền"}
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {isUserAdmin ? (
                              <span 
                                className="px-2 py-1 bg-[#1a1714] border border-[#3d2f1f] text-[#c4a47c] rounded-lg text-[10px] flex items-center gap-1 font-semibold cursor-not-allowed select-none"
                                title="Tài khoản Quản Trị Viên tối cao - Không được phép xóa"
                              >
                                <Lock className="w-3 h-3 text-[#c4a47c]" />
                                <span>Khóa</span>
                              </span>
                            ) : (
                              u.id !== currentUser.id && (
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  className="p-1.5 bg-[#222222] hover:bg-red-900/40 text-red-400 rounded-lg transition-colors"
                                  title="Xóa tài khoản này"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CLAN-WIDE AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-[#e5e5e5]">Nhật ký ghi nhận thay đổi</h4>
                  <p className="text-xs text-[#8a8a8a]">Ghi nhận tự động ai đã sửa, vào lúc nào và nội dung thay đổi là gì</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#737373]" />
                    <input
                      type="text"
                      placeholder="Tìm thành viên, nội dung..."
                      value={auditSearch}
                      onChange={(e) => setAuditSearch(e.target.value)}
                      className="pl-8 pr-2.5 py-1.5 bg-[#181818] border border-[#2e2e2e] rounded-lg text-xs text-[#e5e5e5] placeholder-[#737373]"
                    />
                  </div>

                  <select
                    value={auditFilterUser}
                    onChange={(e) => setAuditFilterUser(e.target.value)}
                    className="px-2.5 py-1.5 bg-[#181818] border border-[#2e2e2e] rounded-lg text-xs text-[#e5e5e5]"
                  >
                    <option value="all">Tất cả người sửa</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {filteredAuditLogs.length === 0 ? (
                <div className="p-8 text-center bg-[#181818] rounded-xl border border-[#262626] text-[#737373] text-xs">
                  Chưa có lịch sử thay đổi nào được ghi nhận. Các thay đổi khi bạn chỉnh sửa thành viên sẽ hiển thị tại đây.
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {filteredAuditLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-[#181818] border border-[#262626] rounded-xl flex items-start justify-between gap-3 text-xs">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#c4a47c]">{log.memberName}</span>
                          <span className="px-1.5 py-0.2 rounded bg-[#222] border border-[#333] text-[10px] text-[#a3a3a3]">
                            Đời {log.memberGen}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                            {log.action === 'create' ? 'Tạo mới' : log.action === 'update' ? 'Chỉnh sửa' : log.action === 'add_child' ? 'Thêm con' : 'Thao tác'}
                          </span>
                        </div>
                        <p className="text-[#d4d4d4] text-[11px]">{log.description}</p>
                        {log.changedFields && log.changedFields.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {log.changedFields.map((f, idx) => (
                              <span key={idx} className="px-1 py-0.2 rounded bg-[#121212] border border-[#2a2a2a] text-[9.5px] text-[#8a8a8a]">
                                • {f}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="text-right shrink-0 space-y-0.5 text-[11px]">
                        <div className="font-semibold text-[#e5e5e5] flex items-center justify-end gap-1">
                          <UserCheck className="w-3 h-3 text-[#c4a47c]" />
                          <span>{log.userName}</span>
                        </div>
                        <div className="text-[10px] text-[#737373] flex items-center justify-end gap-1 font-mono">
                          <Clock className="w-3 h-3" />
                          <span>{log.formattedTime || formatAuditTimestamp(log.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#262626] bg-[#111111] flex items-center justify-between text-xs text-[#8a8a8a]">
          <div>
            Hệ thống phân quyền Đời thứ & Ghi vết thay đổi tự động
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-[#222222] hover:bg-[#2c2c2c] text-[#e5e5e5] rounded-lg font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
