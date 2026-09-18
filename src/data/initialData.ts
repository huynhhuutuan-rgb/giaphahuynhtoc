import { FamilyMember, ClanInfo, AppUser } from '../types/family';

export const DEFAULT_USERS: AppUser[] = [
  {
    id: 'user_admin',
    username: 'admin',
    password: 'admin123',
    name: 'Admin - Quản Trị Tối Cao',
    role: 'admin',
    title: 'Trưởng Ban Gia Phả (Toàn quyền hệ thống)',
    allowedGenerations: [], // Admin có toàn quyền tất cả các đời
    email: 'admin@giapha.vn',
  },
  {
    id: 'user_editor_gen34',
    username: 'user2_doi34',
    password: '123456',
    name: 'User 2 - Phụ Trách Đời 3 & 4',
    role: 'editor',
    title: 'Biên Tập Viên (Được Admin cấp sửa Đời 3, 4)',
    allowedGenerations: [3, 4],
    email: 'user2.bientap@giapha.vn',
  },
  {
    id: 'user_editor_gen5',
    username: 'user3_doi5',
    password: '123456',
    name: 'User 3 - Thư Ký Đời 5',
    role: 'editor',
    title: 'Thư Ký Chi Phái (Được cấp sửa Đời 5)',
    allowedGenerations: [5],
    email: 'user3.thuky@giapha.vn',
  },
  {
    id: 'user_viewer',
    username: 'khach',
    password: '123456',
    name: 'Khách Thăm Quan (Chỉ xem)',
    role: 'viewer',
    title: 'Thành Viên Tra Cứu (Chỉ xem dữ liệu)',
    allowedGenerations: [],
    email: 'khach@giapha.vn',
  },
];

export const INITIAL_CLAN_INFO: ClanInfo = {
  tenDongHo: 'GIA TỘC HUỲNH ĐẠI TỘC',
  nguyenQuan: 'Làng Diên Hồng, Huyện Điện Bàn, Tỉnh Quảng Nam',
  thuyTo: 'Huỳnh Văn A (Đời thứ 1)',
  nhaThoTo: 'Nhà Thờ Tộc Huỳnh - Chi Phái 1',
  moTa: 'Gia phả lưu truyền nối dõi tông đường, con cháu hiếu thảo thuận hòa, rạng danh tổ tiên qua các thế hệ.',
  namLapPha: 1950,
};

// Dữ liệu mẫu chuẩn 15 thành viên ban đầu đúng y hệt bảng ảnh của người dùng
export const INITIAL_MEMBERS: FamilyMember[] = [
  {
    id: 1,
    maGiaPha: 'D01',
    hoTen: 'Huỳnh Văn A',
    gioiTinh: 'Nam',
    idCha: null,
    idMe: null,
    idVoChong: 2,
    doiThu: 1,
    namSinh: 1890,
    namMat: 1950,
    ghiChu: 'Thủy tổ',
    thongTinCaNhan: 'Cụ tổ khai sinh dòng họ, đỗ tú tài, phong tặng Tiền Hiền',
    queQuan: 'Quảng Nam',
    noiAnTang: 'Nghĩa trang gia tộc Đồi Trâm',
    ngayGio: '12 tháng Giêng',
    thuTuTrongGiaDinh: 1,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 2,
    maGiaPha: '',
    hoTen: 'Trần Thị B',
    gioiTinh: 'Nữ',
    idCha: null,
    idMe: null,
    idVoChong: 1,
    doiThu: 1,
    namSinh: 1895,
    namMat: 1960,
    ghiChu: 'Vợ ông A',
    thongTinCaNhan: 'Chánh thất cụ Thủy tổ Huỳnh Văn A, từ bi nhân hậu',
    queQuan: 'Quảng Nam',
    noiAnTang: 'Nghĩa trang gia tộc Đồi Trâm',
    ngayGio: '08 tháng 4 Âm lịch',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 3,
    maGiaPha: 'D02-C01',
    hoTen: 'Huỳnh Văn C',
    gioiTinh: 'Nam',
    idCha: 1,
    idMe: 2,
    idVoChong: null,
    doiThu: 2,
    namSinh: 1920,
    namMat: 1990,
    ghiChu: 'Con trai cả ông A',
    thongTinCaNhan: 'Chi trưởng, tham gia kháng chiến',
    queQuan: 'Quảng Nam',
    noiAnTang: 'Nghĩa trang Liệt sĩ Huyện',
    ngayGio: '15 tháng 8 Âm lịch',
    thuTuTrongGiaDinh: 1,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 4,
    maGiaPha: 'D02-C02',
    hoTen: 'Huỳnh Văn E',
    gioiTinh: 'Nam',
    idCha: 1,
    idMe: 2,
    idVoChong: 5,
    doiThu: 2,
    namSinh: 1922,
    namMat: 1995,
    ghiChu: 'Con trai thứ 2 ông A',
    thongTinCaNhan: 'Chi thứ 2, phát triển nghề truyền thống và canh nông',
    queQuan: 'Quảng Nam',
    noiAnTang: 'Khu lăng mộ gia tộc',
    ngayGio: '20 tháng Chạp',
    thuTuTrongGiaDinh: 2,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 5,
    maGiaPha: '',
    hoTen: 'Lê Thị D',
    gioiTinh: 'Nữ',
    idCha: null,
    idMe: null,
    idVoChong: 4,
    doiThu: 2,
    namSinh: 1925,
    namMat: 2000,
    ghiChu: 'Vợ ông E',
    thongTinCaNhan: 'Đức hạnh đoan trang, hết lòng chăm lo con cháu',
    queQuan: 'Đà Nẵng',
    noiAnTang: 'Khu lăng mộ gia tộc',
    ngayGio: '03 tháng 9 Âm lịch',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 6,
    maGiaPha: 'D03-C02-P01',
    hoTen: 'Huỳnh Văn F',
    gioiTinh: 'Nam',
    idCha: 4,
    idMe: 5,
    idVoChong: 7,
    doiThu: 3,
    namSinh: 1950,
    namMat: null,
    ghiChu: 'Con trai cả ông E',
    thongTinCaNhan: 'Trưởng phái 1 nhánh 2, Kỹ sư nông nghiệp nghỉ hưu',
    queQuan: 'Quảng Nam',
    soDienThoai: '0912 345 678',
    diaChiHienTai: 'Đà Nẵng',
    thuTuTrongGiaDinh: 1,
  },
  {
    id: 7,
    maGiaPha: '',
    hoTen: 'Nguyễn Thị Kim Chi (ABC)',
    gioiTinh: 'Nữ',
    idCha: null,
    idMe: null,
    idVoChong: 6,
    doiThu: 3,
    namSinh: 1955,
    namMat: null,
    ghiChu: 'Vợ ông F',
    thongTinCaNhan: 'Giáo viên ưu tú nghỉ hưu',
    queQuan: 'Huế',
    soDienThoai: '0912 345 679',
  },
  {
    id: 8,
    maGiaPha: 'D03-C02-P02',
    hoTen: 'Huỳnh Thị G',
    gioiTinh: 'Nữ',
    idCha: 4,
    idMe: 5,
    idVoChong: 9,
    doiThu: 3,
    namSinh: 1960,
    namMat: null,
    ghiChu: 'Con gái cả ông E',
    thongTinCaNhan: 'Kinh doanh thương mại tại TP. Hồ Chí Minh',
    queQuan: 'Quảng Nam',
    soDienThoai: '0903 111 222',
    diaChiHienTai: 'Quận 1, TP. Hồ Chí Minh',
    thuTuTrongGiaDinh: 2,
  },
  {
    id: 9,
    maGiaPha: '',
    hoTen: 'Trịnh Quốc Dũng (DEF)',
    gioiTinh: 'Nam',
    idCha: null,
    idMe: null,
    idVoChong: 8,
    doiThu: 3,
    namSinh: 1970,
    namMat: null,
    ghiChu: 'Chồng bà G',
    thongTinCaNhan: 'Bác sĩ chuyên khoa II',
    queQuan: 'Hà Nội',
    soDienThoai: '0903 111 223',
  },
  {
    id: 10,
    maGiaPha: 'D03-C02-P03',
    hoTen: 'Huỳnh Văn H',
    gioiTinh: 'Nam',
    idCha: 4,
    idMe: 5,
    idVoChong: 11,
    doiThu: 3,
    namSinh: 1978,
    namMat: null,
    ghiChu: 'Con trai thứ ông E',
    thongTinCaNhan: 'Doanh nhân, nhà hảo tâm đóng góp xây dựng nhà thờ tộc',
    queQuan: 'Quảng Nam',
    soDienThoai: '0988 555 666',
    diaChiHienTai: 'Hà Nội',
    thuTuTrongGiaDinh: 3,
  },
  {
    id: 11,
    maGiaPha: '',
    hoTen: 'Phạm Hồng Nhung (AAA)',
    gioiTinh: 'Nữ',
    idCha: null,
    idMe: null,
    idVoChong: 10,
    doiThu: 3,
    namSinh: 1979,
    namMat: null,
    ghiChu: 'Vợ ông H',
    thongTinCaNhan: 'Thạc sĩ Quản trị Kinh doanh',
    queQuan: 'Hải Phòng',
    soDienThoai: '0988 555 667',
  },
  {
    id: 12,
    maGiaPha: 'D04-C02-P01-N01',
    hoTen: 'Huỳnh Văn I',
    gioiTinh: 'Nam',
    idCha: 6,
    idMe: 7,
    idVoChong: null,
    doiThu: 4,
    namSinh: 2006,
    namMat: null,
    ghiChu: 'Con trai cả ông F',
    thongTinCaNhan: 'Sinh viên Đại học Bách Khoa, đạt học bổng quốc tế',
    queQuan: 'Quảng Nam',
    diaChiHienTai: 'Đà Nẵng',
    thuTuTrongGiaDinh: 1,
  },
  {
    id: 13,
    maGiaPha: 'D04-C02-P02-N01',
    hoTen: 'Trịnh Huỳnh Anh Khoa (Huỳnh Văn K)',
    gioiTinh: 'Nam',
    idCha: 9,
    idMe: 8,
    idVoChong: null,
    doiThu: 4,
    namSinh: 2008,
    namMat: null,
    ghiChu: 'Con trai cả ông G & bà DEF',
    thongTinCaNhan: 'Học sinh chuyên Tin học, đạt giải Nhì cấp Quốc gia',
    queQuan: 'TP. Hồ Chí Minh',
    diaChiHienTai: 'TP. Hồ Chí Minh',
    thuTuTrongGiaDinh: 1,
  },
  {
    id: 14,
    maGiaPha: 'D04-C02-P02-N02',
    hoTen: 'Trịnh Huỳnh Minh Long (Huỳnh Văn L)',
    gioiTinh: 'Nam',
    idCha: 9,
    idMe: 8,
    idVoChong: null,
    doiThu: 4,
    namSinh: 2005,
    namMat: null,
    ghiChu: 'Con trai thứ ông G & bà DEF',
    thongTinCaNhan: 'Du học sinh tại Melbourne, Úc',
    queQuan: 'TP. Hồ Chí Minh',
    diaChiHienTai: 'Australia',
    thuTuTrongGiaDinh: 2,
  },
  {
    id: 15,
    maGiaPha: 'D04-C02-P03-N01',
    hoTen: 'Huỳnh Gia Bảo (Huỳnh Văn L2)',
    gioiTinh: 'Nam',
    idCha: 10,
    idMe: 11,
    idVoChong: null,
    doiThu: 4,
    namSinh: 2006,
    namMat: null,
    ghiChu: 'Con trai cả ông H',
    thongTinCaNhan: 'Học sinh trung học xuất sắc, năng nổ phong trào thể thao',
    queQuan: 'Hà Nội',
    diaChiHienTai: 'Hà Nội',
    thuTuTrongGiaDinh: 1,
  },
];

// Hàm tạo danh sách lớn hơn (ví dụ 100 - 400 thành viên đa thế hệ) để thử nghiệm tải trọng và sơ đồ lớn
export function generateLargeClanData(targetCount: number = 120): FamilyMember[] {
  const result: FamilyMember[] = [...INITIAL_MEMBERS];
  let nextId = 16;

  const hoList = ['Huỳnh', 'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ', 'Phan', 'Bùi', 'Đặng'];
  const tenDemNam = ['Văn', 'Quang', 'Hữu', 'Đức', 'Trọng', 'Thế', 'Minh', 'Đình', 'Thành'];
  const tenDemNu = ['Thị', 'Thanh', 'Ngọc', 'Phương', 'Bích', 'Mai', 'Thùy', 'Hải'];
  const tenChinhNam = ['Hùng', 'Tuấn', 'Dũng', 'Nam', 'Tùng', 'Bách', 'Cường', 'Phúc', 'Việt', 'Bình', 'Hải', 'Khang', 'Thịnh', 'Khoa'];
  const tenChinhNu = ['Lan', 'Hoa', 'Mai', 'Linh', 'Thảo', 'Trang', 'Hương', 'Hà', 'Dung', 'Yến', 'Ngân', 'Quyên', 'Tú', 'Nguyệt'];

  // Tạo thêm các đời thứ 4, đời thứ 5, đời thứ 6
  const eligibleParents = result.filter(m => m.doiThu >= 3 && m.gioiTinh === 'Nam');
  
  for (const parent of eligibleParents) {
    if (result.length >= targetCount) break;
    
    // Tạo 2-3 con cho mỗi phụ huynh
    const numChildren = Math.floor(Math.random() * 2) + 2;
    for (let c = 1; c <= numChildren; c++) {
      if (result.length >= targetCount) break;

      const isMale = Math.random() > 0.45;
      const gen = parent.doiThu + 1;
      const birthYear = typeof parent.namSinh === 'number' ? parent.namSinh + 25 + (c * 3) : 2010 + c;
      const ho = 'Huỳnh';
      const dem = isMale ? tenDemNam[Math.floor(Math.random() * tenDemNam.length)] : tenDemNu[Math.floor(Math.random() * tenDemNu.length)];
      const ten = isMale ? tenChinhNam[Math.floor(Math.random() * tenChinhNam.length)] : tenChinhNu[Math.floor(Math.random() * tenChinhNu.length)];
      const fullName = `${ho} ${dem} ${ten}`;

      const childId = nextId++;
      let spouseId: number | null = null;

      // Nếu đủ tuổi có thể tạo vợ/chồng
      const hasSpouse = birthYear < 2005 && Math.random() > 0.3;
      if (hasSpouse) {
        spouseId = nextId++;
        const spouseHo = hoList[Math.floor(Math.random() * hoList.length)];
        const spouseDem = !isMale ? tenDemNam[Math.floor(Math.random() * tenDemNam.length)] : tenDemNu[Math.floor(Math.random() * tenDemNu.length)];
        const spouseTen = !isMale ? tenChinhNam[Math.floor(Math.random() * tenChinhNam.length)] : tenChinhNu[Math.floor(Math.random() * tenChinhNu.length)];
        
        result.push({
          id: spouseId,
          maGiaPha: '',
          hoTen: `${spouseHo} ${spouseDem} ${spouseTen}`,
          gioiTinh: isMale ? 'Nữ' : 'Nam',
          idCha: null,
          idMe: null,
          idVoChong: childId,
          doiThu: gen,
          namSinh: birthYear + (isMale ? -2 : 2),
          namMat: null,
          ghiChu: `${isMale ? 'Vợ' : 'Chồng'} ${fullName}`,
          thongTinCaNhan: `Cư trú tại Đà Nẵng / TP.HCM`,
          queQuan: `${spouseHo} Gia Trang`,
        });
      }

      result.push({
        id: childId,
        maGiaPha: `D0${gen}-N${parent.id}-C${c}`,
        hoTen: fullName,
        gioiTinh: isMale ? 'Nam' : 'Nữ',
        idCha: parent.id,
        idMe: parent.idVoChong,
        idVoChong: spouseId,
        doiThu: gen,
        namSinh: birthYear,
        namMat: birthYear < 1940 ? birthYear + 75 : null,
        ghiChu: `Con ${isMale ? 'trai' : 'gái'} thứ ${c} của ${parent.hoTen}`,
        thongTinCaNhan: `Đời thứ ${gen} dòng họ Huỳnh`,
        queQuan: 'Quảng Nam',
        thuTuTrongGiaDinh: c,
      });
    }
  }

  return result;
}
