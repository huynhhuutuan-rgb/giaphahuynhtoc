import * as XLSX from 'xlsx';
import { FamilyMember, Gender } from '../types/family';

// Map các tên cột có thể có trong file Excel/CSV của người dùng sang thuộc tính chuẩn
const COLUMN_MAPPINGS: Record<string, string> = {
  // ID
  id: 'id',
  id_hethong: 'id',
  id_thanhvien: 'id',
  stt: 'id',
  ma_so: 'id',
  
  // MaGiaPha
  magiapha: 'maGiaPha',
  mahienthi: 'maGiaPha',
  ma_so_gia_pha: 'maGiaPha',
  ma: 'maGiaPha',
  code: 'maGiaPha',

  // HoTen
  hoten: 'hoTen',
  ho_ten: 'hoTen',
  ten: 'hoTen',
  full_name: 'hoTen',
  name: 'hoTen',

  // GioiTinh
  gioitinh: 'gioiTinh',
  gioi_tinh: 'gioiTinh',
  gender: 'gioiTinh',
  sex: 'gioiTinh',

  // ID_Cha
  id_cha: 'idCha',
  idcha: 'idCha',
  cha_id: 'idCha',
  parent_id: 'idCha',
  father_id: 'idCha',

  // ID_Me
  id_me: 'idMe',
  idme: 'idMe',
  me_id: 'idMe',
  mother_id: 'idMe',

  // ID_VoChong
  id_vochong: 'idVoChong',
  id_vo_chong: 'idVoChong',
  idvochong: 'idVoChong',
  id_phuthe: 'idVoChong',
  spouse_id: 'idVoChong',

  // DoiThu
  doithu: 'doiThu',
  doi_thu: 'doiThu',
  doi: 'doiThu',
  generation: 'doiThu',
  the_he: 'doiThu',

  // NamSinh
  namsinh: 'namSinh',
  nam_sinh: 'namSinh',
  ngaysinh: 'namSinh',
  ngay_sinh: 'namSinh',
  birth_year: 'namSinh',

  // NamMat
  nammat: 'namMat',
  nam_mat: 'namMat',
  ngaymat: 'namMat',
  ngay_mat: 'namMat',
  death_year: 'namMat',

  // GhiChu
  ghichu: 'ghiChu',
  ghi_chu: 'ghiChu',
  note: 'ghiChu',
  notes: 'ghiChu',

  // ThongTinCaNhan
  thongtincanhan: 'thongTinCaNhan',
  thong_tin_ca_nhan: 'thongTinCaNhan',
  tieusu: 'thongTinCaNhan',
  tieu_su: 'thongTinCaNhan',
  info: 'thongTinCaNhan',
  details: 'thongTinCaNhan',
  quequan: 'queQuan',
  que_quan: 'queQuan',
};

function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_]/g, '')
    .trim();
}

function parseNumberOrNull(val: any): number | null {
  if (val === undefined || val === null || val === '') return null;
  const num = Number(val);
  return isNaN(num) ? null : num;
}

function cleanString(val: any): string {
  if (val === undefined || val === null) return '';
  return String(val).trim();
}

export function parseExcelOrCsvData(fileBuffer: ArrayBuffer): {
  success: boolean;
  members: FamilyMember[];
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];
  const members: FamilyMember[] = [];

  try {
    const workbook = XLSX.read(fileBuffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      return { success: false, members: [], errors: ['File Excel/CSV không có bảng tính nào!'], warnings: [] };
    }

    const worksheet = workbook.Sheets[firstSheetName];
    const rawJson = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

    if (rawJson.length === 0) {
      return { success: false, members: [], errors: ['Bảng tính không có dòng dữ liệu nào.'], warnings: [] };
    }

    // Duyệt qua từng dòng
    let autoIdCounter = 1;
    const existingIds = new Set<number>();

    rawJson.forEach((row, index) => {
      const rowNum = index + 2; // Excel row numbering
      const mapped: Record<string, any> = {};

      for (const [origKey, val] of Object.entries(row)) {
        const normKey = normalizeKey(origKey);
        const mappedProp = COLUMN_MAPPINGS[normKey] || normKey;
        mapped[mappedProp] = val;
      }

      // Validate or create ID
      let id = parseNumberOrNull(mapped.id);
      if (id === null || id <= 0) {
        id = autoIdCounter;
        warnings.push(`Dòng ${rowNum}: Chưa có ID, tự động gán ID = ${id}`);
      }
      while (existingIds.has(id)) {
        id = autoIdCounter++;
      }
      existingIds.add(id);
      if (id >= autoIdCounter) autoIdCounter = id + 1;

      // Họ tên
      const hoTen = cleanString(mapped.hoTen);
      if (!hoTen) {
        warnings.push(`Dòng ${rowNum}: Bỏ trống họ tên, ghi tạm "Thành viên ID ${id}"`);
      }

      // Giới tính
      let gioiTinh: Gender = 'Nam';
      const gtRaw = cleanString(mapped.gioiTinh).toLowerCase();
      if (gtRaw.startsWith('nữ') || gtRaw.startsWith('nu') || gtRaw === 'female' || gtRaw === 'f') {
        gioiTinh = 'Nữ';
      } else if (gtRaw.startsWith('khác') || gtRaw === 'other') {
        gioiTinh = 'Khác';
      }

      // Đời thứ
      let doiThu = parseNumberOrNull(mapped.doiThu) || 1;

      // Mã gia phả
      let maGiaPha = cleanString(mapped.maGiaPha);

      // Quan hệ
      const idCha = parseNumberOrNull(mapped.idCha);
      const idMe = parseNumberOrNull(mapped.idMe);
      const idVoChong = parseNumberOrNull(mapped.idVoChong);

      // Năm sinh / Năm mất
      const namSinh = cleanString(mapped.namSinh) || '';
      const namMatRaw = cleanString(mapped.namMat);
      const namMat = namMatRaw ? namMatRaw : null;

      const ghiChu = cleanString(mapped.ghiChu);
      const thongTinCaNhan = cleanString(mapped.thongTinCaNhan);

      members.push({
        id,
        maGiaPha,
        hoTen: hoTen || `Thành viên #${id}`,
        gioiTinh,
        idCha,
        idMe,
        idVoChong,
        doiThu,
        namSinh,
        namMat,
        ghiChu,
        thongTinCaNhan,
      });
    });

    // Auto-calculate generations if missing or recalculate based on parents
    members.forEach(member => {
      if (member.idCha) {
        const parent = members.find(m => m.id === member.idCha);
        if (parent && (!member.doiThu || member.doiThu <= parent.doiThu)) {
          member.doiThu = parent.doiThu + 1;
        }
      } else if (member.idMe) {
        const parent = members.find(m => m.id === member.idMe);
        if (parent && (!member.doiThu || member.doiThu <= parent.doiThu)) {
          member.doiThu = parent.doiThu + 1;
        }
      }
      // Đồng bộ hai chiều vợ/chồng nếu một bên có mà bên kia chưa có
      if (member.idVoChong) {
        const spouse = members.find(m => m.id === member.idVoChong);
        if (spouse && !spouse.idVoChong) {
          spouse.idVoChong = member.id;
          if (!spouse.doiThu) spouse.doiThu = member.doiThu;
        }
      }
    });

    return {
      success: true,
      members,
      errors: [],
      warnings,
    };
  } catch (err: any) {
    return {
      success: false,
      members: [],
      errors: ['Lỗi khi xử lý file: ' + (err?.message || 'Định dạng file không hợp lệ')],
      warnings: [],
    };
  }
}

// Xuất file Excel đúng định dạng như bảng của người dùng
export function exportToExcel(members: FamilyMember[], clanName: string = 'Gia_Pha_Dong_Ho') {
  const exportData = members.map(m => ({
    ID: m.id,
    MaGiaPha: m.maGiaPha || '',
    HoTen: m.hoTen,
    GioiTinh: m.gioiTinh,
    ID_Cha: m.idCha ?? '',
    ID_Me: m.idMe ?? '',
    ID_VoChong: m.idVoChong ?? '',
    DoiThu: m.doiThu,
    NamSinh: m.namSinh ?? '',
    NamMat: m.namMat ?? '',
    GhiChu: m.ghiChu || '',
    'Thông tin cá nhân': m.thongTinCaNhan || '',
    QueQuan: m.queQuan || '',
    NoiAnTang: m.noiAnTang || '',
    NgayGio: m.ngayGio || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 6 },  // ID
    { wch: 18 }, // MaGiaPha
    { wch: 24 }, // HoTen
    { wch: 10 }, // GioiTinh
    { wch: 9 },  // ID_Cha
    { wch: 9 },  // ID_Me
    { wch: 12 }, // ID_VoChong
    { wch: 8 },  // DoiThu
    { wch: 12 }, // NamSinh
    { wch: 12 }, // NamMat
    { wch: 25 }, // GhiChu
    { wch: 35 }, // Thong tin ca nhan
    { wch: 20 }, // QueQuan
    { wch: 25 }, // NoiAnTang
    { wch: 18 }, // NgayGio
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'GiaPha');

  const fileName = `${clanName.replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

// Xuất file CSV
export function exportToCSV(members: FamilyMember[], clanName: string = 'Gia_Pha_Dong_Ho') {
  const exportData = members.map(m => ({
    ID: m.id,
    MaGiaPha: m.maGiaPha || '',
    HoTen: m.hoTen,
    GioiTinh: m.gioiTinh,
    ID_Cha: m.idCha ?? '',
    ID_Me: m.idMe ?? '',
    ID_VoChong: m.idVoChong ?? '',
    DoiThu: m.doiThu,
    NamSinh: m.namSinh ?? '',
    NamMat: m.namMat ?? '',
    GhiChu: m.ghiChu || '',
    ThongTinCaNhan: m.thongTinCaNhan || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  
  const blob = new Blob(['\uFEFF' + csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${clanName}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Tải file mẫu Excel chuẩn cho người dùng nhập liệu
export function downloadExcelTemplate() {
  const sampleData = [
    {
      ID: 1,
      MaGiaPha: 'D01',
      HoTen: 'Huỳnh Văn A',
      GioiTinh: 'Nam',
      ID_Cha: '',
      ID_Me: '',
      ID_VoChong: 2,
      DoiThu: 1,
      NamSinh: 1890,
      NamMat: 1950,
      GhiChu: 'Thủy tổ',
      'Thông tin cá nhân': 'Cụ tổ khai sinh dòng họ',
    },
    {
      ID: 2,
      MaGiaPha: '',
      HoTen: 'Trần Thị B',
      GioiTinh: 'Nữ',
      ID_Cha: '',
      ID_Me: '',
      ID_VoChong: 1,
      DoiThu: 1,
      NamSinh: 1895,
      NamMat: 1960,
      GhiChu: 'Vợ ông A',
      'Thông tin cá nhân': 'Chánh thất cụ Thủy tổ',
    },
    {
      ID: 3,
      MaGiaPha: 'D02-C01',
      HoTen: 'Huỳnh Văn C',
      GioiTinh: 'Nam',
      ID_Cha: 1,
      ID_Me: 2,
      ID_VoChong: '',
      DoiThu: 2,
      NamSinh: 1920,
      NamMat: 1990,
      GhiChu: 'Con trai cả ông A',
      'Thông tin cá nhân': 'Chi trưởng',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'MauNhapGiaPha');
  XLSX.writeFile(workbook, 'Mau_Nhap_Lieu_Gia_Pha.xlsx');
}
