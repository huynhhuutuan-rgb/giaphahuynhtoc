export type Gender = 'Nam' | 'Nữ' | 'Khác';

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface AppUser {
  id: string;
  username: string;
  password?: string;           // Mật khẩu đăng nhập
  name: string;
  role: UserRole;
  allowedGenerations: number[]; // e.g. [3, 4] nghĩa là chỉ được thêm/sửa Đời 3 và Đời 4
  title?: string;               // e.g. "Quản trị viên gia tộc", "Trưởng phái đời 3"
  email?: string;
  avatar?: string;
  phone?: string;
  lastLogin?: string;           // Thời điểm đăng nhập gần nhất
}

export interface MemberAuditEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: 'create' | 'update' | 'add_child' | 'add_spouse' | 'delete';
  timestamp: string;            // e.g. "2026-08-26T08:50:00.000Z"
  formattedTime?: string;       // e.g. "15:48 - 26/08/2026"
  description: string;          // e.g. "Cập nhật năm mất và ghi chú"
  changedFields?: string[];     // e.g. ["Họ tên", "Năm mất", "Ghi chú"]
}

export interface FamilyMember {
  id: number;
  maGiaPha: string;          // e.g. "D01", "D02-C01", "D03-C02-P01"
  hoTen: string;             // e.g. "Huỳnh Văn A"
  gioiTinh: Gender;          // 'Nam' | 'Nữ'
  idCha: number | null;      // ID người cha
  idMe: number | null;       // ID người mẹ
  idVoChong: number | null;  // ID vợ hoặc chồng
  doiThu: number;            // Đời thứ 1, 2, 3, 4...
  namSinh: string | number;  // Năm sinh hoặc ngày sinh (e.g. 1890, "15/08/1890")
  namMat: string | number | null; // Năm mất hoặc ngày mất (null/rỗng nếu còn sống)
  ghiChu: string;            // Ghi chú (Thủy tổ, Con trai cả, Vợ...)
  thongTinCaNhan: string;    // Điện thoại, địa chỉ, nghề nghiệp, tiểu sử
  
  // Optional extended attributes
  queQuan?: string;          // Quê quán
  noiAnTang?: string;        // Nơi an táng / mộ phần
  ngayGio?: string;          // Ngày giỗ âm lịch (e.g. "15 tháng Chạp")
  avatar?: string;           // Link ảnh chân dung
  ngheNghiep?: string;       // Nghề nghiệp
  soDienThoai?: string;      // Số điện thoại
  email?: string;            // Email
  diaChiHienTai?: string;    // Địa chỉ hiện tại
  thuTuTrongGiaDinh?: number;// Thứ tự con thứ mấy (1: Con cả, 2: Con thứ 2...)

  // Thông tin hôn nhân & Phối ngẫu
  tinhTrangHonNhan?: 'Độc thân' | 'Đã kết hôn' | 'Góa' | 'Đã ly hôn' | 'Tái hôn' | string;
  ngayKetHon?: string;       // Ngày hoặc năm cưới (VD: "1985" hoặc "12/04/1985")
  hoTenVoChongNgoai?: string;// Tên phối ngẫu (nếu chưa lập hồ sơ thành viên riêng)
  queQuanVoChong?: string;   // Quê quán của vợ/chồng
  namSinhVoChong?: string | number; // Năm sinh của vợ/chồng
  ghiChuHonNhan?: string;    // Thứ bậc/Ghi chú hôn nhân (Chính thất, Kế thất, Vợ thứ...)

  // Audit Tracking Footprint
  nguoiTao?: string;              // Tên & vai trò người tạo
  ngayTao?: string;               // Ngày tạo
  nguoiCapNhatCuoi?: string;      // Tên & vai trò người sửa lần cuối
  userIdCapNhatCuoi?: string;     // ID user sửa lần cuối
  thoiGianCapNhatCuoi?: string;   // Thời gian cập nhật lần cuối
  lichSuChinhSua?: MemberAuditEntry[]; // Toàn bộ lịch sử chỉnh sửa của thành viên này
}

export interface ClanInfo {
  tenDongHo: string;         // e.g. "GIA TỘC HUỲNH VĂN"
  nguyenQuan: string;        // e.g. "Làng Cổ, Xã Đại Lộc, Tỉnh Quảng Nam"
  thuyTo: string;            // e.g. "Huỳnh Văn A"
  nhaThoTo: string;          // e.g. "Nhà thờ tộc Huỳnh, Thôn 3"
  moTa: string;              // Giới thiệu dòng tộc
  namLapPha: number;         // Năm lập gia phả
}

export interface TreeLayoutNode {
  member: FamilyMember;
  spouse?: FamilyMember;
  children: TreeLayoutNode[];
  x: number;
  y: number;
  width: number;
  height: number;
  collapsed?: boolean;
}

export interface FilterOptions {
  searchQuery: string;
  selectedGeneration: number | 'all';
  genderFilter: 'all' | 'Nam' | 'Nữ';
  livingFilter: 'all' | 'living' | 'deceased';
  branchRootId: number | 'all';
}
