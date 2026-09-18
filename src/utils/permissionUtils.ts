import { AppUser, FamilyMember, MemberAuditEntry } from '../types/family';

export const NO_PERMISSION_MESSAGE = 'Bạn chưa được phân quyền điều chỉnh thông tin này';

/**
 * Kiểm tra xem một user có phải là tài khoản Admin hệ thống được bảo vệ hay không.
 * Tài khoản này không được phép xóa và không được phép hạ quyền hoặc thay đổi username cốt lõi.
 */
export function isProtectedAdminUser(user: AppUser | string | null | undefined): boolean {
  if (!user) return false;
  if (typeof user === 'string') {
    return user === 'user_admin' || user === 'admin';
  }
  return user.id === 'user_admin' || user.username === 'admin';
}

/**
 * Kiểm tra xem tài khoản này có được phép xóa hay không.
 * Tài khoản Admin hệ thống (user_admin hoặc role admin) tuyệt đối không được xóa.
 */
export function canDeleteUser(userToDelete: AppUser | null | undefined): boolean {
  if (!userToDelete) return false;
  return !isProtectedAdminUser(userToDelete);
}

/**
 * Kiểm tra xem user hiện tại có quyền thêm/chỉnh sửa thành viên ở đời thứ `generation` hay không.
 * - Admin: Toàn quyền tất cả các đời.
 * - Editor: Chỉ được phép nếu `generation` nằm trong danh sách `allowedGenerations` do Admin cấp.
 * - Viewer: Không có quyền sửa bất kỳ đời nào.
 */
export function canUserEditGeneration(user: AppUser | null | undefined, generation: number): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role === 'editor') {
    return Array.isArray(user.allowedGenerations) && user.allowedGenerations.includes(generation);
  }
  return false;
}

/**
 * Kiểm tra quyền thêm con cho một người ở đời `parentGen` (con sẽ là đời `parentGen + 1`).
 */
export function canUserAddChild(user: AppUser | null | undefined, parentGen: number): boolean {
  const childGen = parentGen + 1;
  return canUserEditGeneration(user, childGen);
}

/**
 * Kiểm tra quyền xóa thành viên ở đời `generation` hoặc FamilyMember object.
 */
export function canUserDeleteMember(user: AppUser | null | undefined, target: FamilyMember | number): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  const generation = typeof target === 'number' ? target : target.doiThu;
  if (user.role === 'editor') {
    return Array.isArray(user.allowedGenerations) && user.allowedGenerations.includes(generation);
  }
  return false;
}

/**
 * Ghi nhận Audit Log vào đối tượng FamilyMember
 */
export function recordAuditLog(
  oldMember: FamilyMember | null,
  newMember: FamilyMember,
  user: AppUser,
  customActionDesc?: string
): FamilyMember {
  const isCreate = !oldMember;
  const action: MemberAuditEntry['action'] = isCreate ? 'create' : 'update';
  const diff = oldMember 
    ? diffMemberChanges(oldMember, newMember) 
    : { description: customActionDesc || 'Tạo mới thành viên vào gia phả', changedFields: [] };
  
  const entry = createAuditLogEntry(
    user,
    action,
    customActionDesc || diff.description,
    diff.changedFields
  );

  const existingLogs = newMember.lichSuChinhSua || oldMember?.lichSuChinhSua || [];
  const updatedLogs = [entry, ...existingLogs];

  return {
    ...newMember,
    nguoiTao: newMember.nguoiTao || (isCreate ? `${user.name} (${user.role === 'admin' ? 'Admin' : 'Ban biên tập'})` : undefined),
    ngayTao: newMember.ngayTao || (isCreate ? formatAuditTimestamp() : undefined),
    nguoiCapNhatCuoi: `${user.name} (${user.role === 'admin' ? 'Admin' : 'Ban biên tập'})`,
    userIdCapNhatCuoi: user.id,
    thoiGianCapNhatCuoi: formatAuditTimestamp(),
    lichSuChinhSua: updatedLogs,
  };
}

/**
 * Quyền quản lý người dùng & phân quyền hệ thống (chỉ Admin)
 */
export function canUserManageUsers(user: AppUser | null | undefined): boolean {
  return !!user && user.role === 'admin';
}

/**
 * Quyền nhập xuất file & thiết lập gia tộc (Admin hoặc Editor được cấp phép)
 */
export function canUserImportExport(user: AppUser | null | undefined): boolean {
  if (!user) return false;
  return user.role === 'admin';
}

/**
 * Định dạng thời gian theo chuẩn Việt Nam dễ đọc
 */
export function formatAuditTimestamp(dateInput?: string | Date): string {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) return String(dateInput || '');

  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();

  return `${hours}:${minutes} - ${day}/${month}/${year}`;
}

/**
 * So sánh chi tiết các trường thay đổi giữa dữ liệu cũ và dữ liệu mới
 */
export function diffMemberChanges(
  oldMember: FamilyMember,
  newData: Partial<FamilyMember>
): { description: string; changedFields: string[] } {
  const changes: string[] = [];
  const fieldsMap: Record<string, string> = {
    hoTen: 'Họ tên',
    gioiTinh: 'Giới tính',
    doiThu: 'Đời thứ',
    maGiaPha: 'Mã gia phả',
    namSinh: 'Năm sinh',
    namMat: 'Năm mất / Trạng thái',
    ghiChu: 'Ghi chú',
    thongTinCaNhan: 'Thông tin cá nhân',
    idCha: 'Người cha',
    idMe: 'Người mẹ',
    idVoChong: 'Phối ngẫu (Vợ/Chồng)',
    queQuan: 'Quê quán',
    noiAnTang: 'Nơi an táng',
    ngayGio: 'Ngày giỗ',
    soDienThoai: 'Số điện thoại',
    avatar: 'Ảnh đại diện',
    tinhTrangHonNhan: 'Tình trạng hôn nhân',
    ngayKetHon: 'Ngày cưới/kết hôn',
    hoTenVoChongNgoai: 'Họ tên vợ/chồng',
    queQuanVoChong: 'Quê quán phối ngẫu',
    ghiChuHonNhan: 'Ghi chú hôn nhân',
  };

  Object.keys(fieldsMap).forEach((key) => {
    const k = key as keyof FamilyMember;
    if (newData[k] !== undefined && String(newData[k] ?? '') !== String(oldMember[k] ?? '')) {
      const fieldName = fieldsMap[key];
      const oldVal = oldMember[k] ? `"${oldMember[k]}"` : '(trống)';
      const newVal = newData[k] ? `"${newData[k]}"` : '(trống)';
      changes.push(`${fieldName}: ${oldVal} → ${newVal}`);
    }
  });

  const changedFieldNames = Object.keys(fieldsMap)
    .filter(key => {
      const k = key as keyof FamilyMember;
      return newData[k] !== undefined && String(newData[k] ?? '') !== String(oldMember[k] ?? '');
    })
    .map(key => fieldsMap[key]);

  const description = changes.length > 0
    ? `Cập nhật ${changes.length} mục: ${changes.slice(0, 3).join(', ')}${changes.length > 3 ? '...' : ''}`
    : 'Cập nhật thông tin thành viên';

  return {
    description,
    changedFields: changedFieldNames,
  };
}

/**
 * Tạo bản ghi lịch sử Audit Log
 */
export function createAuditLogEntry(
  user: AppUser,
  action: MemberAuditEntry['action'],
  description: string,
  changedFields?: string[]
): MemberAuditEntry {
  const now = new Date();
  return {
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    action,
    timestamp: now.toISOString(),
    formattedTime: formatAuditTimestamp(now),
    description,
    changedFields: changedFields || [],
  };
}
