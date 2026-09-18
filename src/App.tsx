import React, { useState, useEffect, useCallback } from 'react';
import { FamilyMember, ClanInfo, AppUser } from './types/family';
import { CustomThemeSettings } from './types/theme';
import { INITIAL_MEMBERS, INITIAL_CLAN_INFO, DEFAULT_USERS, generateLargeClanData } from './data/initialData';
import { DEFAULT_THEME_SETTINGS } from './utils/themeConfig';
import { Navbar, AppView } from './components/Navbar';
import { FamilyTreeCanvas } from './components/FamilyTreeCanvas';
import { DataTable } from './components/DataTable';
import { ClanBookView } from './components/ClanBookView';
import { AnalyticsView } from './components/AnalyticsView';
import { MemorialCalendar } from './components/MemorialCalendar';
import { MemberModal, ModalMode } from './components/MemberModal';
import { ImportExportModal } from './components/ImportExportModal';
import { UserManagerModal } from './components/UserManagerModal';
import { PortraitViewerModal } from './components/PortraitViewerModal';
import { LoginModal } from './components/LoginModal';
import { ThemeBackgroundModal } from './components/ThemeBackgroundModal';
import { GenerationColorModal } from './components/GenerationColorModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { canUserEditGeneration, canUserDeleteMember, recordAuditLog, NO_PERMISSION_MESSAGE, isProtectedAdminUser } from './utils/permissionUtils';
import { ShieldAlert, X } from 'lucide-react';
import { DataSyncService } from './services/dataSyncService';

const STORAGE_KEY = 'GIAPHA_MEMBERS_DATA_V2';
const CLAN_INFO_KEY = 'GIAPHA_CLAN_INFO_V2';
const USERS_STORAGE_KEY = 'GIAPHA_USERS_DATA_V2';
const CURRENT_USER_KEY = 'GIAPHA_CURRENT_USER_V2';
const THEME_SETTINGS_KEY = 'GIAPHA_THEME_SETTINGS_V2';

export default function App() {
  // 1. Core State
  const [members, setMembers] = useState<FamilyMember[]>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Lỗi đọc localStorage:', e);
    }
    return INITIAL_MEMBERS;
  });

  const [clanInfo, setClanInfo] = useState<ClanInfo>(() => {
    try {
      const cached = localStorage.getItem(CLAN_INFO_KEY);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.error('Lỗi đọc clanInfo localStorage:', e);
    }
    return INITIAL_CLAN_INFO;
  });

  // User Management & RBAC State
  const [users, setUsers] = useState<AppUser[]>(() => {
    try {
      const cached = localStorage.getItem(USERS_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Lỗi đọc users từ localStorage:', e);
    }
    return DEFAULT_USERS;
  });

  const [currentUser, setCurrentUser] = useState<AppUser>(() => {
    try {
      const cached = localStorage.getItem(CURRENT_USER_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.id) return parsed;
      }
    } catch (e) {
      console.error('Lỗi đọc currentUser từ localStorage:', e);
    }
    // Mặc định khi vào app là Khách (Chỉ có quyền xem)
    return DEFAULT_USERS.find(u => u.role === 'viewer') || DEFAULT_USERS[3];
  });

  // Theme & Generation Colors State
  const [themeSettings, setThemeSettings] = useState<CustomThemeSettings>(() => {
    try {
      const cached = localStorage.getItem(THEME_SETTINGS_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.activeThemeId) {
          return {
            ...DEFAULT_THEME_SETTINGS,
            ...parsed,
            generationColorConfig: {
              ...DEFAULT_THEME_SETTINGS.generationColorConfig,
              ...(parsed.generationColorConfig || {}),
              generationColors: {
                ...DEFAULT_THEME_SETTINGS.generationColorConfig.generationColors,
                ...(parsed.generationColorConfig?.generationColors || {}),
              },
            },
          };
        }
      }
    } catch (e) {
      console.error('Lỗi đọc themeSettings từ localStorage:', e);
    }
    return DEFAULT_THEME_SETTINGS;
  });

  // 2. View State
  const [currentView, setCurrentView] = useState<AppView>('tree');
  const [highlightedMemberId, setHighlightedMemberId] = useState<number | null>(null);

  // 3. Modals State
  const [isMemberModalOpen, setIsMemberModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<ModalMode>('view');
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [targetParent, setTargetParent] = useState<FamilyMember | null>(null);
  const [targetSpouse, setTargetSpouse] = useState<FamilyMember | null>(null);

  const [isImportExportOpen, setIsImportExportOpen] = useState<boolean>(false);
  const [isUserManagerOpen, setIsUserManagerOpen] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState<boolean>(false);
  const [isGenerationColorModalOpen, setIsGenerationColorModalOpen] = useState<boolean>(false);
  const [portraitMember, setPortraitMember] = useState<FamilyMember | null>(null);
  const [memberPendingDelete, setMemberPendingDelete] = useState<FamilyMember | null>(null);

  // Pending action to execute after successful login
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [loginRequiredReason, setLoginRequiredReason] = useState<string>('');
  const [permissionNotice, setPermissionNotice] = useState<string | null>(null);

  const showPermissionNotice = (msg = NO_PERMISSION_MESSAGE) => {
    setPermissionNotice(msg);
    setTimeout(() => {
      setPermissionNotice(curr => (curr === msg ? null : curr));
    }, 4500);
  };

  // Auto-Save & Broadcast Realtime Sync across tabs
  useEffect(() => {
    DataSyncService.saveState(members, clanInfo, users, currentUser, themeSettings);
  }, [members, clanInfo, users, currentUser, themeSettings]);

  // Subscribe to Cross-Tab Synchronization
  useEffect(() => {
    const unsubscribe = DataSyncService.subscribeToCrossTabSync(() => {
      try {
        const cachedMembers = localStorage.getItem(STORAGE_KEY);
        if (cachedMembers) setMembers(JSON.parse(cachedMembers));

        const cachedClan = localStorage.getItem(CLAN_INFO_KEY);
        if (cachedClan) setClanInfo(JSON.parse(cachedClan));

        const cachedUsers = localStorage.getItem(USERS_STORAGE_KEY);
        if (cachedUsers) setUsers(JSON.parse(cachedUsers));

        const cachedTheme = localStorage.getItem(THEME_SETTINGS_KEY);
        if (cachedTheme) setThemeSettings(JSON.parse(cachedTheme));
      } catch (e) {
        console.error('Error syncing cross tab updates', e);
      }
    });

    return () => unsubscribe();
  }, []);

  // Save to LocalStorage explicitly
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
      localStorage.setItem(CLAN_INFO_KEY, JSON.stringify(clanInfo));
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
      localStorage.setItem(THEME_SETTINGS_KEY, JSON.stringify(themeSettings));
    } catch (e) {
      console.error('Lỗi lưu dữ liệu localStorage:', e);
    }
  }, [members, clanInfo, users, currentUser, themeSettings]);

  // ================= AUTH GUARD HELPER =================
  const requireAuth = useCallback(
    (action: () => void, targetGeneration?: number, reasonMessage?: string) => {
      // If user is a viewer, they cannot perform any edit action without logging in
      if (currentUser.role === 'viewer') {
        showPermissionNotice(NO_PERMISSION_MESSAGE);
        setLoginRequiredReason(
          reasonMessage || `${NO_PERMISSION_MESSAGE}. Vui lòng đăng nhập tài khoản có thẩm quyền để thực hiện.`
        );
        setPendingAction(() => action);
        setIsLoginModalOpen(true);
        return false;
      }

      // If user is an editor and target generation is provided, check if allowed
      if (targetGeneration && !canUserEditGeneration(currentUser, targetGeneration)) {
        showPermissionNotice(NO_PERMISSION_MESSAGE);
        setLoginRequiredReason(
          `${NO_PERMISSION_MESSAGE}. Tài khoản "${currentUser.name}" chỉ được cấp quyền sửa Đời: ${
            currentUser.allowedGenerations.join(', ') || 'Chưa cấp'
          } (thành viên này thuộc Đời ${targetGeneration}).`
        );
        setPendingAction(() => action);
        setIsLoginModalOpen(true);
        return false;
      }

      action();
      return true;
    },
    [currentUser]
  );

  // Handle successful login
  const handleLoginSuccess = (loggedInUser: AppUser) => {
    setCurrentUser(loggedInUser);
    setIsLoginModalOpen(false);

    // Update lastLogin in users list
    setUsers(prev =>
      prev.map(u =>
        u.id === loggedInUser.id
          ? { ...u, lastLogin: new Date().toISOString() }
          : u
      )
    );

    // Run pending action if available
    if (pendingAction) {
      setTimeout(() => {
        pendingAction();
        setPendingAction(null);
      }, 100);
    }
  };

  // Đăng xuất và trở về người dùng Khách (Chỉ xem)
  const handleLogoutToGuest = () => {
    const guestUser = users.find(u => u.role === 'viewer') || DEFAULT_USERS.find(u => u.role === 'viewer') || DEFAULT_USERS[3];
    setCurrentUser(guestUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(guestUser));
  };

  // ================= CRUD HANDLERS WITH RBAC =================

  // Chọn xem chi tiết thành viên (Viewer & Guest are always allowed)
  const handleSelectMember = (member: FamilyMember) => {
    setSelectedMember(member);
    setModalMode('view');
    setIsMemberModalOpen(true);
  };

  // Mở modal chỉnh sửa (Requires Auth & RBAC)
  const handleEditMember = (member: FamilyMember) => {
    requireAuth(
      () => {
        setSelectedMember(member);
        setModalMode('edit');
        setIsMemberModalOpen(true);
      },
      member.doiThu,
      `Vui lòng đăng nhập để chỉnh sửa thông tin thành viên "${member.hoTen}" (Đời ${member.doiThu}).`
    );
  };

  // Mở modal thêm con (Requires Auth & RBAC on child generation)
  const handleAddChild = (parent: FamilyMember, spouse?: FamilyMember) => {
    const childGen = (parent.doiThu || 1) + 1;
    requireAuth(
      () => {
        setTargetParent(parent);
        setTargetSpouse(spouse || null);
        setModalMode('add_child');
        setIsMemberModalOpen(true);
      },
      childGen,
      `Vui lòng đăng nhập để thêm con (Đời thứ ${childGen}) cho "${parent.hoTen}".`
    );
  };

  // Mở modal thêm phối ngẫu (Requires Auth & RBAC)
  const handleAddSpouse = (member: FamilyMember) => {
    requireAuth(
      () => {
        setTargetSpouse(member);
        setModalMode('add_spouse');
        setIsMemberModalOpen(true);
      },
      member.doiThu,
      `Vui lòng đăng nhập để thêm vợ/chồng (Đời ${member.doiThu}) cho "${member.hoTen}".`
    );
  };

  // Mở modal thêm thành viên mới tinh
  const handleAddNewMember = () => {
    requireAuth(
      () => {
        setSelectedMember(null);
        setTargetParent(null);
        setTargetSpouse(null);
        setModalMode('add_new');
        setIsMemberModalOpen(true);
      },
      undefined,
      'Vui lòng đăng nhập tài khoản có quyền để thêm thành viên mới vào gia phả.'
    );
  };

  // Lưu thông tin từ Modal với phân quyền và ghi nhận lịch sử thay đổi (Audit)
  const handleSaveMember = (formData: Partial<FamilyMember>, mode: ModalMode) => {
    const targetGen = formData.doiThu || (selectedMember?.doiThu || 1);

    // Kiểm tra quyền sửa đời này
    if (!canUserEditGeneration(currentUser, targetGen)) {
      showPermissionNotice(NO_PERMISSION_MESSAGE);
      alert(NO_PERMISSION_MESSAGE);
      return;
    }

    if (mode === 'edit' && selectedMember) {
      // Chỉnh sửa thành viên hiện có
      let nextAllMembers: FamilyMember[] = [];
      setMembers(prev => {
        const updated = prev.map(m => {
          if (m.id === selectedMember.id) {
            // Ghi nhận Audit Log nếu chưa có trong formData
            const nextData = { ...m, ...formData } as FamilyMember;
            if (!formData.lichSuChinhSua || formData.lichSuChinhSua.length === (m.lichSuChinhSua?.length || 0)) {
              const audited = recordAuditLog(m, nextData, currentUser, 'Chỉnh sửa thông tin thành viên');
              return audited;
            }
            return nextData;
          }
          // Nếu đổi người phối ngẫu, đồng bộ 2 chiều
          if (formData.idVoChong && m.id === formData.idVoChong) {
            return { 
              ...m, 
              idVoChong: selectedMember.id,
              tinhTrangHonNhan: m.tinhTrangHonNhan || 'Đã kết hôn',
            };
          }
          // Nếu trước đó là vợ/chồng nhưng giờ bị gỡ
          if (m.idVoChong === selectedMember.id && formData.idVoChong !== m.id) {
            return { ...m, idVoChong: null };
          }
          return m;
        });
        nextAllMembers = updated;
        return updated;
      });

      // Tự động tạo bản snapshot lưu trữ với dữ liệu mới
      setTimeout(() => {
        DataSyncService.createBackupSnapshot(
          nextAllMembers.length > 0 ? nextAllMembers : members, 
          clanInfo, 
          `Chỉnh sửa thành viên "${formData.hoTen || selectedMember.hoTen}" lúc ${new Date().toLocaleTimeString('vi-VN')}`
        );
      }, 50);
    } else {
      // Thêm mới thành viên
      const maxId = members.reduce((max, m) => Math.max(max, m.id), 0);
      const newId = maxId + 1;
      const initialNew: FamilyMember = {
        ...formData,
        id: newId,
        maGiaPha: formData.maGiaPha || `D0${formData.doiThu || 1}`,
        hoTen: formData.hoTen || `Thành viên #${newId}`,
        gioiTinh: formData.gioiTinh || 'Nam',
        idCha: formData.idCha ?? null,
        idMe: formData.idMe ?? null,
        idVoChong: formData.idVoChong ?? null,
        doiThu: formData.doiThu || 1,
        namSinh: formData.namSinh || '',
        namMat: formData.namMat ?? null,
        ghiChu: formData.ghiChu || '',
        thongTinCaNhan: formData.thongTinCaNhan || '',
        queQuan: formData.queQuan || '',
        noiAnTang: formData.noiAnTang || '',
        ngayGio: formData.ngayGio || '',
        thuTuTrongGiaDinh: formData.thuTuTrongGiaDinh || 1,
        tinhTrangHonNhan: formData.tinhTrangHonNhan || (formData.idVoChong || formData.hoTenVoChongNgoai ? 'Đã kết hôn' : 'Độc thân'),
      };

      // Gắn Audit log khởi tạo
      const newMember = recordAuditLog(null, initialNew, currentUser, 'Thêm mới thành viên vào gia phả');

      let nextAllMembers: FamilyMember[] = [];
      setMembers(prev => {
        const list = [...prev, newMember];
        // Nếu có phối ngẫu, đồng bộ ngược lại 2 chiều
        if (newMember.idVoChong) {
          const spouseIdx = list.findIndex(m => m.id === newMember.idVoChong);
          if (spouseIdx !== -1) {
            list[spouseIdx] = { 
              ...list[spouseIdx], 
              idVoChong: newMember.id,
              tinhTrangHonNhan: list[spouseIdx].tinhTrangHonNhan || 'Đã kết hôn',
            };
          }
        }
        nextAllMembers = list;
        return list;
      });

      // Tự động focus vào người mới tạo trên cây
      setHighlightedMemberId(newId);

      // Tự động tạo bản snapshot lưu trữ với dữ liệu mới
      setTimeout(() => {
        DataSyncService.createBackupSnapshot(
          nextAllMembers.length > 0 ? nextAllMembers : [...members, newMember], 
          clanInfo, 
          `Thêm thành viên "${newMember.hoTen}" lúc ${new Date().toLocaleTimeString('vi-VN')}`
        );
      }, 50);
    }

    setIsMemberModalOpen(false);
  };

  // Xóa thành viên với phân quyền và mở modal xác nhận an toàn
  const handleDeleteMember = (memberToDelete: FamilyMember) => {
    requireAuth(
      () => {
        if (!canUserDeleteMember(currentUser, memberToDelete)) {
          showPermissionNotice(NO_PERMISSION_MESSAGE);
          return;
        }

        setMemberPendingDelete(memberToDelete);
      },
      memberToDelete.doiThu,
      `Vui lòng đăng nhập để xóa thành viên "${memberToDelete.hoTen}" (Đời ${memberToDelete.doiThu}).`
    );
  };

  // Xác nhận xóa thành viên sau khi người dùng bấm đồng ý trong modal
  const handleConfirmDelete = () => {
    if (!memberPendingDelete) return;
    const targetId = memberPendingDelete.id;
    const targetName = memberPendingDelete.hoTen;

    setMembers(prev => {
      // Gỡ bỏ liên kết cha, mẹ, vợ/chồng của người bị xóa ở các node khác
      return prev
        .filter(m => m.id !== targetId)
        .map(m => {
          const next = { ...m };
          if (next.idCha === targetId) next.idCha = null;
          if (next.idMe === targetId) next.idMe = null;
          if (next.idVoChong === targetId) next.idVoChong = null;
          return next;
        });
    });

    if (selectedMember?.id === targetId) {
      setSelectedMember(null);
      setIsMemberModalOpen(false);
    }

    DataSyncService.createBackupSnapshot(
      members.filter(m => m.id !== targetId),
      clanInfo,
      `Đã xóa thành viên "${targetName}" khỏi gia phả`
    );

    setMemberPendingDelete(null);
  };

  // Chuyển sang thành viên khác khi đang mở modal
  const handleSwitchMember = (target: FamilyMember) => {
    setSelectedMember(target);
    setModalMode('view');
  };

  // Nhảy từ bảng danh sách sang cây sơ đồ và highlight người đó
  const handleJumpToTree = (member: FamilyMember) => {
    setHighlightedMemberId(member.id);
    setCurrentView('tree');
  };

  // Nạp toàn bộ danh sách mới (từ Excel / CSV / JSON)
  const handleImportData = (newMembers: FamilyMember[]) => {
    setMembers(newMembers);
    DataSyncService.createBackupSnapshot(newMembers, clanInfo, 'Nhập dữ liệu mới từ file');
  };

  // Khôi phục mẫu ban đầu
  const handleResetToSample = () => {
    setMembers(INITIAL_MEMBERS);
    setClanInfo(INITIAL_CLAN_INFO);
    setHighlightedMemberId(null);
  };

  // Nạp mẫu gia tộc lớn 120 thành viên
  const handleLoadLargeDemo = () => {
    const largeData = generateLargeClanData(120);
    setMembers(largeData);
    setHighlightedMemberId(null);
  };

  // Lưu danh sách người dùng với cơ chế bảo vệ tài khoản Admin vĩnh viễn
  const handleSaveUsers = (newUsers: AppUser[]) => {
    const adminDefault = DEFAULT_USERS.find(u => u.id === 'user_admin') || DEFAULT_USERS[0];
    let safeUsers = [...newUsers];
    const adminIndex = safeUsers.findIndex(u => isProtectedAdminUser(u));

    if (adminIndex === -1) {
      // Nếu danh sách thiếu tài khoản admin, tự động thêm lại
      safeUsers = [adminDefault, ...safeUsers];
    } else {
      // Đảm bảo thông tin cốt lõi của tài khoản Admin được bảo vệ tuyệt đối: ID, username, role, allowedGenerations
      safeUsers[adminIndex] = {
        ...safeUsers[adminIndex],
        id: 'user_admin',
        username: 'admin',
        role: 'admin',
        allowedGenerations: [],
      };
    }

    setUsers(safeUsers);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col font-sans text-[#e5e5e5] selection:bg-[#c4a47c]/30 selection:text-[#f3e8d2]">
      {/* Top Navigation Bar with User & RBAC status, Theme, and Color triggers */}
      <Navbar
        clanInfo={clanInfo}
        members={members}
        currentView={currentView}
        currentUser={currentUser}
        onViewChange={setCurrentView}
        onAddNewMember={handleAddNewMember}
        onOpenImportExport={() => setIsImportExportOpen(true)}
        onOpenUserManager={() => setIsUserManagerOpen(true)}
        onOpenLoginModal={() => {
          setLoginRequiredReason('');
          setPendingAction(null);
          setIsLoginModalOpen(true);
        }}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onOpenGenerationColorModal={() => setIsGenerationColorModalOpen(true)}
        onLogout={handleLogoutToGuest}
        syncStatus="synced"
      />

      {/* Main Content Area based on Selected View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5">
        {currentView === 'tree' && (
          <FamilyTreeCanvas
            members={members}
            onSelectMember={handleSelectMember}
            onEditMember={handleEditMember}
            onDeleteMember={handleDeleteMember}
            onAddChild={handleAddChild}
            onAddSpouse={handleAddSpouse}
            onPreviewPortrait={(m) => setPortraitMember(m)}
            highlightedMemberId={highlightedMemberId}
            onClearHighlight={() => setHighlightedMemberId(null)}
            themeSettings={themeSettings}
            onOpenThemeModal={() => setIsThemeModalOpen(true)}
            onOpenGenerationColorModal={() => setIsGenerationColorModalOpen(true)}
          />
        )}

        {currentView === 'table' && (
          <DataTable
            members={members}
            currentUser={currentUser}
            onSelectMember={handleSelectMember}
            onEditMember={handleEditMember}
            onDeleteMember={handleDeleteMember}
            onAddChild={(p) => handleAddChild(p)}
            onAddNewMember={handleAddNewMember}
            onJumpToTree={handleJumpToTree}
            onPreviewPortrait={(m) => setPortraitMember(m)}
            onPermissionNotice={showPermissionNotice}
          />
        )}

        {currentView === 'book' && (
          <ClanBookView
            members={members}
            clanInfo={clanInfo}
            onSelectMember={handleSelectMember}
            onPreviewPortrait={(m) => setPortraitMember(m)}
          />
        )}

        {currentView === 'analytics' && (
          <AnalyticsView
            members={members}
            onSelectMember={handleSelectMember}
          />
        )}

        {currentView === 'memorials' && (
          <MemorialCalendar
            members={members}
            onSelectMember={handleSelectMember}
          />
        )}
      </main>

      {/* Member Details / Edit / Add Modal */}
      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        mode={modalMode}
        member={selectedMember}
        targetParent={targetParent}
        targetSpouse={targetSpouse}
        allMembers={members}
        currentUser={currentUser}
        onSave={handleSaveMember}
        onDelete={handleDeleteMember}
        onStartEdit={handleEditMember}
        onSwitchMember={handleSwitchMember}
        onStartAddChild={handleAddChild}
        onStartAddSpouse={handleAddSpouse}
        onRequireLogin={(reason) => requireAuth(() => {}, undefined, reason)}
        onPermissionNotice={showPermissionNotice}
      />

      {/* Custom Confirmation Modal for Deleting Members */}
      <DeleteConfirmModal
        isOpen={!!memberPendingDelete}
        member={memberPendingDelete}
        onClose={() => setMemberPendingDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Dedicated 10x20cm Portrait Lightbox Modal */}
      {portraitMember && (
        <PortraitViewerModal
          member={portraitMember}
          onClose={() => setPortraitMember(null)}
        />
      )}

      {/* Import / Export & Backup Modal */}
      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        members={members}
        clanInfo={clanInfo}
        onImportData={handleImportData}
        onResetToSample={handleResetToSample}
        onLoadLargeDemo={handleLoadLargeDemo}
      />

      {/* User Management & Audit Log Modal */}
      <UserManagerModal
        isOpen={isUserManagerOpen}
        onClose={() => setIsUserManagerOpen(false)}
        currentUser={currentUser}
        users={users}
        members={members}
        onSelectUser={setCurrentUser}
        onSaveUsers={handleSaveUsers}
      />

      {/* Login & Authentication Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => {
          setIsLoginModalOpen(false);
          setPendingAction(null);
        }}
        users={users}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        requiredReason={loginRequiredReason}
      />

      {/* Theme & Bright Backgrounds Modal */}
      <ThemeBackgroundModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        themeSettings={themeSettings}
        onUpdateThemeSettings={setThemeSettings}
        onSaveThemeSettings={setThemeSettings}
      />

      {/* Dynamic Generation Line Color Customization Modal */}
      <GenerationColorModal
        isOpen={isGenerationColorModalOpen}
        onClose={() => setIsGenerationColorModalOpen(false)}
        config={themeSettings.generationColorConfig}
        colorConfig={themeSettings.generationColorConfig}
        maxGenerationInTree={Math.max(...members.map(m => m.doiThu || 1), 10)}
        onUpdateConfig={(newConfig) => {
          setThemeSettings(prev => ({
            ...prev,
            generationColorConfig: newConfig,
          }));
        }}
      />

      {/* Floating Permission Notification Toast */}
      {permissionNotice && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300 max-w-lg w-[92%] sm:w-auto">
          <div className="bg-[#18110e]/95 border border-[#ea580c] text-[#ffedd5] px-4 py-3 rounded-xl shadow-2xl flex items-center justify-between gap-3 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#ea580c]/20 border border-[#ea580c]/40 text-[#f97316] flex items-center justify-center shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-white">
                {permissionNotice}
              </p>
            </div>
            <button
              onClick={() => setPermissionNotice(null)}
              className="p-1 text-[#a8a29e] hover:text-white rounded-md hover:bg-[#292524] transition-colors"
              title="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
