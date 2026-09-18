export interface SamplePortrait {
  id: string;
  name: string;
  gender: 'Nam' | 'Nữ';
  role: string;
  url: string;
}

export const SAMPLE_PORTRAITS: SamplePortrait[] = [
  {
    id: 'ancestor_male_1',
    name: 'Cụ Thủy Tổ / Tiền Hiền',
    gender: 'Nam',
    role: 'Cụ tổ áo the khăn đóng',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'ancestor_female_1',
    name: 'Cụ Bà / Chánh Thất',
    gender: 'Nữ',
    role: 'Cụ bà phúc hậu trang trọng',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'male_senior_2',
    name: 'Cụ Ông Trưởng Chi',
    gender: 'Nam',
    role: 'Trưởng chi / Lão niên',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'female_senior_2',
    name: 'Cụ Bà Chi Thứ',
    gender: 'Nữ',
    role: 'Cụ bà hiền từ',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'male_mid_3',
    name: 'Nam Trung Niên / Trưởng Phái',
    gender: 'Nam',
    role: 'Thành viên đời thứ 3-4',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'female_mid_3',
    name: 'Nữ Trung Niên / Dâu Gia Tộc',
    gender: 'Nữ',
    role: 'Thành viên đời thứ 3-4',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'young_male_4',
    name: 'Nam Thanh Niên',
    gender: 'Nam',
    role: 'Thế hệ kế thừa',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'young_female_4',
    name: 'Nữ Thanh Niên',
    gender: 'Nữ',
    role: 'Thế hệ kế thừa',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  },
];
