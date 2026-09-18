import React, { useState, useEffect } from 'react';
import { FamilyMember, Gender, AppUser, MemberAuditEntry } from '../types/family';
import { 
  X, 
  User, 
  Heart, 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  MapPin, 
  Phone, 
  FileText, 
  ShieldCheck,
  Award,
  Users,
  ChevronRight,
  GitBranch,
  Lock,
  History,
  Clock,
  UserCheck,
  AlertCircle,
  Zap,
  Sparkles,
  Maximize2,
  Frame
} from 'lucide-react';
import { BranchHierarchySuggest } from './BranchHierarchySuggest';
import { AvatarUploadField } from './AvatarUploadField';
import { PortraitViewerModal } from './PortraitViewerModal';
import { 
  canUserEditGeneration, 
  canUserAddChild, 
  canUserDeleteMember,
  diffMemberChanges, 
  createAuditLogEntry, 
  formatAuditTimestamp 
} from '../utils/permissionUtils';

export type ModalMode = 'view' | 'edit' | 'add_child' | 'add_spouse' | 'add_new' | 'add_parent';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  member: FamilyMember | null;
  currentUser: AppUser;
  targetParent?: FamilyMember | null;
  targetSpouse?: FamilyMember | null;
  allMembers: FamilyMember[];
  onSave: (memberData: Partial<FamilyMember>, mode: ModalMode) => void;
  onDelete?: (member: FamilyMember) => void;
  onStartEdit?: (member: FamilyMember) => void;
  onSwitchMember?: (member: FamilyMember) => void;
  onStartAddChild?: (parent: FamilyMember, spouse?: FamilyMember) => void;
  onStartAddSpouse?: (member: FamilyMember) => void;
  onRequireLogin?: (reason?: string) => void;
  onPermissionNotice?: (msg?: string) => void;
}

/**
 * Tự động tính toán mã gia phả và đời thứ kế thừa theo người Cha
 */
function autoGenerateCodeFromFather(
  father: FamilyMember | null | undefined,
  allMembers: FamilyMember[],
  currentMemberId?: number
): { code: string; gen: number; childOrder: number } {
  if (!father) {
    return { code: 'D01', gen: 1, childOrder: 1 };
  }
  const nextGen = (father.doiThu || 1) + 1;
  const existingSiblings = allMembers.filter(
    m => (m.idCha === father.id || m.idMe === father.id) && m.id !== currentMemberId
  );
  const childOrder = existingSiblings.length + 1;
  const padOrder = String(childOrder).padStart(2, '0');

  let code = '';
  if (father.maGiaPha && father.maGiaPha.trim()) {
    const parentCode = father.maGiaPha.trim().toUpperCase();
    if (/^D\d+$/i.test(parentCode)) {
      // D01 -> D02-C01
      code = `D${String(nextGen).padStart(2, '0')}-C${padOrder}`;
    } else if (/^D\d+-C\d+$/i.test(parentCode)) {
      // D02-C01 -> D03-C01-P01
      const cMatch = parentCode.match(/C\d+/i);
      const cStr = cMatch ? cMatch[0].toUpperCase() : 'C01';
      code = `D${String(nextGen).padStart(2, '0')}-${cStr}-P${padOrder}`;
    } else if (/^D\d+-C\d+-P\d+$/i.test(parentCode)) {
      // D03-C01-P01 -> D04-C01-P01-N01
      const parts = parentCode.split('-');
      const cPart = parts[1] || 'C01';
      const pPart = parts[2] || 'P01';
      code = `D${String(nextGen).padStart(2, '0')}-${cPart}-${pPart}-N${padOrder}`;
    } else {
      code = `${parentCode}-N${padOrder}`;
    }
  } else {
    code = `D${String(nextGen).padStart(2, '0')}-C${padOrder}`;
  }

  return { code, gen: nextGen, childOrder };
}

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  mode,
  member,
  currentUser,
  targetParent,
  targetSpouse,
  allMembers,
  onSave,
  onDelete,
  onStartEdit,
  onSwitchMember,
  onStartAddChild,
  onStartAddSpouse,
  onRequireLogin,
  onPermissionNotice,
}) => {
  const [formData, setFormData] = useState<Partial<FamilyMember>>({});
  const [showHistory, setShowHistory] = useState(false);
  const [autoCodeNotice, setAutoCodeNotice] = useState<string | null>(null);
  const [showPortraitZoom, setShowPortraitZoom] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setShowHistory(false);
    setAutoCodeNotice(null);

    if (mode === 'edit' && member) {
      const reverseSpouse = allMembers.find(m => m.idVoChong === member.id && m.id !== member.id);
      setFormData({ 
        ...member,
        idVoChong: member.idVoChong ?? (reverseSpouse ? reverseSpouse.id : null),
      });
    } else if (mode === 'add_child' && targetParent) {
      const isFather = targetParent.gioiTinh === 'Nam';
      const fatherObj = isFather ? targetParent : (targetSpouse || null);
      const motherObj = !isFather ? targetParent : (targetSpouse || null);

      const { code, gen, childOrder } = autoGenerateCodeFromFather(fatherObj, allMembers);

      setFormData({
        hoTen: '',
        gioiTinh: 'Nam',
        idCha: fatherObj?.id || null,
        idMe: motherObj?.id || null,
        idVoChong: null,
        doiThu: gen,
        maGiaPha: code,
        namSinh: '',
        namMat: null,
        tinhTrangHonNhan: 'Độc thân',
        ghiChu: `Con thứ ${childOrder} của ${targetParent.hoTen}`,
        thongTinCaNhan: '',
        queQuan: targetParent.queQuan || 'Quảng Nam',
        thuTuTrongGiaDinh: childOrder,
      });

      setAutoCodeNotice(`⚡ Đã tự sinh mã Đời ${gen} (${code}) theo Cha ${fatherObj?.hoTen || targetParent.hoTen}`);
    } else if (mode === 'add_spouse' && targetSpouse) {
      setFormData({
        hoTen: '',
        gioiTinh: targetSpouse.gioiTinh === 'Nam' ? 'Nữ' : 'Nam',
        idCha: null,
        idMe: null,
        idVoChong: targetSpouse.id,
        doiThu: targetSpouse.doiThu || 1,
        maGiaPha: '',
        namSinh: '',
        namMat: null,
        tinhTrangHonNhan: 'Đã kết hôn',
        ghiChu: `${targetSpouse.gioiTinh === 'Nam' ? 'Vợ' : 'Chồng'} ${targetSpouse.hoTen}`,
        ghiChuHonNhan: targetSpouse.gioiTinh === 'Nam' ? 'Chính thất (Vợ cả)' : 'Chồng',
        thongTinCaNhan: '',
        queQuan: '',
      });
    } else if (mode === 'add_new') {
      const maxId = allMembers.reduce((max, m) => Math.max(max, m.id), 0);
      const initialGen = currentUser.role === 'editor' && currentUser.allowedGenerations.length > 0
        ? currentUser.allowedGenerations[0]
        : 1;

      setFormData({
        id: maxId + 1,
        hoTen: '',
        gioiTinh: 'Nam',
        idCha: null,
        idMe: null,
        idVoChong: null,
        doiThu: initialGen,
        maGiaPha: `D0${initialGen}`,
        namSinh: '',
        namMat: null,
        tinhTrangHonNhan: 'Độc thân',
        ghiChu: '',
        thongTinCaNhan: '',
      });
    }
  }, [isOpen, mode, member, targetParent, targetSpouse, allMembers, currentUser]);

  if (!isOpen) return null;

  // Lấy các liên kết họ hàng cho view mode
  const currentMember = member || allMembers[0];
  const father = allMembers.find(m => m.id === currentMember?.idCha);
  const mother = allMembers.find(m => m.id === currentMember?.idMe);
  const spouse = allMembers.find(m => m.id === currentMember?.idVoChong) || 
                 allMembers.find(m => m.idVoChong === currentMember?.id && m.id !== currentMember?.id);
  const children = allMembers.filter(
    m => m.idCha === currentMember?.id || m.idMe === currentMember?.id
  );
  const siblings = allMembers.filter(
    m => m.id !== currentMember?.id && 
         ((currentMember?.idCha && m.idCha === currentMember.idCha) || 
          (currentMember?.idMe && m.idMe === currentMember.idMe))
  );

  // Permission Checks
  const canEditCurrent = currentMember ? canUserEditGeneration(currentUser, currentMember.doiThu) : false;
  const canAddChildCurrent = currentMember ? canUserAddChild(currentUser, currentMember.doiThu) : false;
  const canDeleteCurrent = currentMember ? canUserDeleteMember(currentUser, currentMember.doiThu) : false;

  // Form submission check
  const targetGen = formData.doiThu || 1;
  const isFormGenAllowed = canUserEditGeneration(currentUser, targetGen);

  // Hàm xử lý khi chọn/thay đổi đời thứ (Generation)
  const handleGenerationChange = (newGen: number) => {
    if (!canUserEditGeneration(currentUser, newGen)) {
      alert('Bạn chưa được phân quyền điều chỉnh thông tin này');
      if (onPermissionNotice) {
        onPermissionNotice('Bạn chưa được phân quyền điều chỉnh thông tin này');
      }
    }
    setFormData(prev => ({ ...prev, doiThu: newGen }));
  };

  // Xử lý khi người dùng chọn Cha trong form (Tự động sinh mã gia phả)
  const handleFatherChange = (fatherId: number | null) => {
    if (fatherId) {
      const fatherObj = allMembers.find(m => m.id === fatherId);
      if (fatherObj) {
        const { code, gen, childOrder } = autoGenerateCodeFromFather(fatherObj, allMembers, formData.id);
        if (!canUserEditGeneration(currentUser, gen)) {
          alert('Bạn chưa được phân quyền điều chỉnh thông tin này');
          if (onPermissionNotice) {
            onPermissionNotice('Bạn chưa được phân quyền điều chỉnh thông tin này');
          }
        }
        setFormData(prev => ({
          ...prev,
          idCha: fatherId,
          doiThu: gen,
          maGiaPha: code,
          thuTuTrongGiaDinh: childOrder,
          // Tự động gán Mẹ nếu người cha đã có vợ và người mẹ đang để trống
          idMe: prev.idMe || fatherObj.idVoChong || null,
          queQuan: prev.queQuan || fatherObj.queQuan || '',
        }));
        setAutoCodeNotice(`✨ Tự động cập nhật theo Cha "${fatherObj.hoTen}": Đời ${gen} • Mã: ${code} (Con thứ ${childOrder})`);
      } else {
        setFormData(prev => ({ ...prev, idCha: fatherId }));
      }
    } else {
      setFormData(prev => ({ ...prev, idCha: null }));
      setAutoCodeNotice(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.hoTen?.trim()) {
      alert('Vui lòng nhập Họ và Tên!');
      return;
    }

    if (!isFormGenAllowed) {
      alert('Bạn chưa được phân quyền điều chỉnh thông tin này');
      return;
    }

    const now = new Date();
    const timestampFormatted = formatAuditTimestamp(now);
    const userSignature = `${currentUser.name} (${currentUser.role === 'admin' ? 'Admin' : `Biên tập Đời ${currentUser.allowedGenerations.join(',')}`})`;

    let auditEntry: MemberAuditEntry;

    if (mode === 'edit' && member) {
      const diff = diffMemberChanges(member, formData);
      auditEntry = createAuditLogEntry(
        currentUser,
        'update',
        diff.description,
        diff.changedFields
      );
    } else if (mode === 'add_child') {
      auditEntry = createAuditLogEntry(
        currentUser,
        'add_child',
        `Thêm con "${formData.hoTen}" cho ${targetParent?.hoTen || 'thành viên'}`
      );
    } else if (mode === 'add_spouse') {
      auditEntry = createAuditLogEntry(
        currentUser,
        'add_spouse',
        `Thêm phối ngẫu "${formData.hoTen}" cho ${targetSpouse?.hoTen || 'thành viên'}`
      );
    } else {
      auditEntry = createAuditLogEntry(
        currentUser,
        'create',
        `Tạo mới thành viên "${formData.hoTen}" (Đời ${targetGen})`
      );
    }

    const previousHistory = (member && member.lichSuChinhSua) ? member.lichSuChinhSua : [];
    const updatedHistory = [auditEntry, ...previousHistory];

    const finalFormData: Partial<FamilyMember> = {
      ...formData,
      nguoiCapNhatCuoi: userSignature,
      userIdCapNhatCuoi: currentUser.id,
      thoiGianCapNhatCuoi: now.toISOString(),
      lichSuChinhSua: updatedHistory,
      ...(mode !== 'edit' ? { nguoiTao: userSignature, ngayTao: now.toISOString() } : {}),
    };

    onSave(finalFormData, mode);
  };

  const isViewMode = mode === 'view';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-[#141414] rounded-2xl shadow-2xl border border-[#262626] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-[#e5e5e5]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#262626] flex items-center justify-between bg-[#111111]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1f1a14] border border-[#3d2f1f] text-[#c4a47c] flex items-center justify-center font-bold">
              {mode === 'view' ? <User className="w-5 h-5" /> : <Edit3 className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-[#e5e5e5] text-base leading-tight flex items-center gap-2">
                <span>
                  {mode === 'view' && (member?.hoTen || 'Chi tiết thành viên')}
                  {mode === 'edit' && `Chỉnh sửa: ${member?.hoTen}`}
                  {mode === 'add_child' && `Thêm con cho: ${targetParent?.hoTen}`}
                  {mode === 'add_spouse' && `Thêm phối ngẫu cho: ${targetSpouse?.hoTen}`}
                  {mode === 'add_new' && 'Thêm thành viên mới vào dòng tộc'}
                </span>
                {!isViewMode && (
                  <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-[#1c1c1c] border border-[#2e2e2e] text-[#c4a47c]">
                    Sửa bởi: {currentUser.name}
                  </span>
                )}
              </h3>
              <p className="text-xs text-[#8a8a8a]">
                {mode === 'view' ? (
                  `Đời thứ ${member?.doiThu || 1} • Mã: ${member?.maGiaPha || 'Chưa đặt'} • ID: #${member?.id}`
                ) : (
                  'Điền thông tin thành viên (Thông tin Cha/Mẹ ở đầu form giúp tự động tạo Mã Gia Phả)'
                )}
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isViewMode && currentMember ? (
            <div className="space-y-6">
              {/* Member Top Hero Profile */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-[#181818] border border-[#262626]">
                <div className="flex items-center gap-3.5">
                  {/* Portrait Avatar Container with 10x20cm click to zoom */}
                  <div
                    onClick={() => setShowPortraitZoom(true)}
                    className={`relative w-16 h-24 rounded-xl flex items-center justify-center text-xl font-bold shadow-md border-2 overflow-hidden cursor-pointer group shrink-0 transition-transform hover:scale-105 ${
                      currentMember.namMat
                        ? 'bg-[#1a1a1a] text-[#8a8a8a] border-[#3d3d3d]'
                        : currentMember.gioiTinh === 'Nam'
                        ? 'bg-[#192438] text-[#60a5fa] border-[#253959]'
                        : 'bg-[#2d1822] text-[#f472b6] border-[#4a2337]'
                    }`}
                    title="Bấm để phóng to ảnh chân dung tối đa khổ 10x20cm"
                  >
                    {currentMember.avatar ? (
                      <img 
                        src={currentMember.avatar} 
                        alt={currentMember.hoTen} 
                        className="w-full h-full object-cover object-top" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-1">
                        <span className="text-xl font-bold">
                          {currentMember.hoTen.charAt(0)}
                        </span>
                        <span className="text-[8px] font-mono text-[#8a8a8a] mt-0.5">10x20cm</span>
                      </div>
                    )}

                    {/* Hover Zoom Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-0.5">
                      <Maximize2 className="w-4 h-4 text-[#c4a47c]" />
                      <span className="text-[8px] font-bold text-[#c4a47c]">Phóng to</span>
                    </div>

                    {/* Badge on corner */}
                    <div className="absolute bottom-0 inset-x-0 bg-black/75 py-0.5 text-center text-[7.5px] font-mono text-[#c4a47c]">
                      10x20cm
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-lg font-bold text-[#e5e5e5]">{currentMember.hoTen}</h4>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#1f1a14] text-[#c4a47c] border border-[#3d2f1f]">
                        Đời {currentMember.doiThu}
                      </span>
                      {currentMember.tinhTrangHonNhan && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#2d1a24] text-[#f472b6] border border-[#4a2337]">
                          {currentMember.tinhTrangHonNhan}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setShowPortraitZoom(true)}
                        className="px-2 py-0.5 bg-[#1f1a14] hover:bg-[#2a2216] border border-[#3d2f1f] text-[#c4a47c] text-[10.5px] rounded font-medium flex items-center gap-1 transition-colors cursor-pointer"
                        title="Xem ảnh phóng to tối đa 10x20cm"
                      >
                        <Frame className="w-3 h-3" />
                        <span>Phóng to 10x20cm</span>
                      </button>
                    </div>
                    <div className="text-xs text-[#8a8a8a] mt-1.5 flex flex-wrap items-center gap-2">
                      <span className="font-medium text-[#d4d4d4]">{currentMember.gioiTinh}</span>
                      <span>•</span>
                      <span>
                        {currentMember.namMat ? (
                          `Sinh ${currentMember.namSinh || '?'} - Mất ${currentMember.namMat}`
                        ) : (
                          `Sinh năm ${currentMember.namSinh || 'Chưa rõ'}`
                        )}
                      </span>
                      {currentMember.maGiaPha && (
                        <>
                          <span>•</span>
                          <span className="font-mono bg-[#111111] px-1.5 py-0.5 rounded border border-[#2e2e2e] text-[#c4a47c]">
                            {currentMember.maGiaPha}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  {canAddChildCurrent ? (
                    <button
                      onClick={() => onStartAddChild && onStartAddChild(currentMember, spouse)}
                      className="px-3 py-1.5 bg-[#c4a47c] hover:bg-[#b5956d] text-[#0a0a0a] text-xs font-bold rounded-lg shadow-sm flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm con</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (onRequireLogin) {
                          onClose();
                          onRequireLogin(`Bạn chưa được phân quyền điều chỉnh thông tin này. Vui lòng đăng nhập tài khoản có thẩm quyền để thêm con cho "${currentMember.hoTen}".`);
                        }
                      }}
                      title="Bạn chưa được phân quyền điều chỉnh thông tin này"
                      className="px-3 py-1.5 bg-[#1c1917] hover:bg-[#292524] text-[#a8a29e] text-xs font-semibold rounded-lg flex items-center gap-1 border border-[#44403c] transition-colors cursor-pointer"
                    >
                      <Lock className="w-3 h-3 text-[#f59e0b]" />
                      <span>Thêm con (Cần quyền)</span>
                    </button>
                  )}

                  {canEditCurrent ? (
                    <button
                      onClick={() => {
                        if (onStartEdit) {
                          onStartEdit(currentMember);
                        } else {
                          onSave(currentMember, 'edit');
                        }
                      }}
                      className="px-3 py-1.5 bg-[#222222] hover:bg-[#2c2c2c] border border-[#333333] text-[#e5e5e5] text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Chỉnh sửa</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (onRequireLogin) {
                          onClose();
                          onRequireLogin(`Bạn chưa được phân quyền điều chỉnh thông tin này. Vui lòng đăng nhập tài khoản có thẩm quyền để sửa thành viên "${currentMember.hoTen}".`);
                        }
                      }}
                      title="Bạn chưa được phân quyền điều chỉnh thông tin này"
                      className="px-3 py-1.5 bg-[#1e1b18] hover:bg-[#2c241d] border border-[#78350f]/60 text-[#fde68a] text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-[#f59e0b]" />
                      <span>Đăng nhập để sửa</span>
                    </button>
                  )}

                  {canDeleteCurrent && onDelete && (
                    <button
                      type="button"
                      onClick={() => onDelete(currentMember)}
                      className="px-3 py-1.5 bg-[#2a1316] hover:bg-[#3d181c] border border-red-900/50 text-[#f87171] text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                      title="Xóa thành viên khỏi gia phả"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Permission Banner Notice for current user if restricted */}
              {!canEditCurrent && (
                <div className="p-3 bg-[#1e1711] border border-[#3d2a1a] rounded-xl flex items-center gap-2.5 text-xs text-[#d4a373]">
                  <Lock className="w-4 h-4 text-[#c4a47c] shrink-0" />
                  <div>
                    <strong>Bạn chưa được phân quyền điều chỉnh thông tin này.</strong> {currentUser.role === 'viewer' ? 'Bạn đang ở chế độ Chỉ Xem.' : `Tài khoản "${currentUser.name}" chỉ được cấp quyền sửa Đời: ${currentUser.allowedGenerations.join(', ') || 'Chưa cấp'}.`}
                  </div>
                </div>
              )}

              {/* Bio & Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#8a8a8a]">Thông tin cá nhân</h5>
                  <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2 text-[#d4d4d4]">
                      <FileText className="w-4 h-4 text-[#737373] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-[#e5e5e5]">Ghi chú / Danh phận: </span>
                        {currentMember.ghiChu || 'Chưa cập nhật'}
                      </div>
                    </div>
                    {currentMember.queQuan && (
                      <div className="flex items-start gap-2 text-[#d4d4d4]">
                        <MapPin className="w-4 h-4 text-[#737373] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-[#e5e5e5]">Quê quán: </span>
                          {currentMember.queQuan}
                        </div>
                      </div>
                    )}
                    {currentMember.soDienThoai && (
                      <div className="flex items-start gap-2 text-[#d4d4d4]">
                        <Phone className="w-4 h-4 text-[#737373] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-[#e5e5e5]">Điện thoại: </span>
                          {currentMember.soDienThoai}
                        </div>
                      </div>
                    )}
                    {currentMember.thongTinCaNhan && (
                      <div className="p-3 bg-[#181818] rounded-lg border border-[#262626] text-[#d4d4d4] leading-relaxed text-xs">
                        {currentMember.thongTinCaNhan}
                      </div>
                    )}
                  </div>
                </div>

                {/* Marriage & Memorial Block */}
                <div className="space-y-3">
                  {/* Marriage Info */}
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#f472b6] flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5" />
                    <span>Hôn nhân & Gia đình</span>
                  </h5>
                  <div className="p-3 rounded-xl bg-[#201419] border border-[#3d1e2b] text-xs space-y-1.5">
                    <div className="flex items-center justify-between text-[#d4d4d4]">
                      <span className="text-[#8a8a8a]">Tình trạng:</span>
                      <span className="font-semibold text-[#f472b6]">{currentMember.tinhTrangHonNhan || (spouse ? 'Đã kết hôn' : 'Chưa cập nhật')}</span>
                    </div>

                    {(spouse || currentMember.hoTenVoChongNgoai) && (
                      <div className="flex items-center justify-between text-[#d4d4d4]">
                        <span className="text-[#8a8a8a]">Vợ / Chồng:</span>
                        <span className="font-bold text-[#e5e5e5]">{spouse ? spouse.hoTen : currentMember.hoTenVoChongNgoai}</span>
                      </div>
                    )}

                    {currentMember.ngayKetHon && (
                      <div className="flex items-center justify-between text-[#d4d4d4]">
                        <span className="text-[#8a8a8a]">Năm / Ngày cưới:</span>
                        <span className="text-[#c4a47c]">{currentMember.ngayKetHon}</span>
                      </div>
                    )}

                    {currentMember.ghiChuHonNhan && (
                      <div className="flex items-center justify-between text-[#d4d4d4]">
                        <span className="text-[#8a8a8a]">Thứ bậc / Danh phận:</span>
                        <span className="text-[#e5e5e5]">{currentMember.ghiChuHonNhan}</span>
                      </div>
                    )}

                    {currentMember.queQuanVoChong && (
                      <div className="flex items-center justify-between text-[#d4d4d4]">
                        <span className="text-[#8a8a8a]">Quê quán phối ngẫu:</span>
                        <span className="text-[#d4d4d4]">{currentMember.queQuanVoChong}</span>
                      </div>
                    )}
                  </div>

                  {/* Memorial & Anniversaries */}
                  <h5 className="text-xs font-bold uppercase tracking-wider text-[#8a8a8a] pt-1">Tưởng niệm & Mộ phần</h5>
                  <div className="space-y-2 text-xs">
                    {currentMember.namMat ? (
                      <>
                        <div className="flex items-start gap-2 text-[#d4d4d4]">
                          <Calendar className="w-4 h-4 text-[#c4a47c] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-[#e5e5e5]">Ngày giỗ âm lịch: </span>
                            <span className="text-[#c4a47c]">{currentMember.ngayGio || 'Chưa cập nhật'}</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-2 text-[#d4d4d4]">
                          <MapPin className="w-4 h-4 text-[#737373] shrink-0 mt-0.5" />
                          <div>
                            <span className="font-semibold text-[#e5e5e5]">Nơi an táng / Mộ phần: </span>
                            {currentMember.noiAnTang || 'Nghĩa trang gia tộc'}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="p-3 bg-[#132219] text-[#4ade80] rounded-lg border border-[#1f382a] text-xs">
                        Thành viên hiện đang sinh sống, sinh hoạt cùng gia đình và dòng tộc.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Family Relations Tree List */}
              <div className="border-t border-[#262626] pt-4 space-y-4">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#8a8a8a] flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-[#c4a47c]" />
                  <span>Các mối quan hệ thân tộc</span>
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Cha Mẹ */}
                  <div className="p-3 rounded-xl bg-[#181818] border border-[#262626] text-xs">
                    <span className="font-bold text-[#d4d4d4] block mb-1.5">Cha & Mẹ</span>
                    {father ? (
                      <button
                        onClick={() => onSwitchMember && onSwitchMember(father)}
                        className="w-full text-left p-1.5 rounded hover:bg-[#222222] font-semibold text-[#e5e5e5] flex items-center justify-between"
                      >
                        <span>Cha: {father.hoTen}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#737373]" />
                      </button>
                    ) : (
                      <span className="text-[#737373] italic block py-0.5">Chưa có thông tin cha</span>
                    )}

                    {mother ? (
                      <button
                        onClick={() => onSwitchMember && onSwitchMember(mother)}
                        className="w-full text-left p-1.5 rounded hover:bg-[#222222] font-semibold text-[#e5e5e5] flex items-center justify-between mt-1"
                      >
                        <span>Mẹ: {mother.hoTen}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#737373]" />
                      </button>
                    ) : (
                      <span className="text-[#737373] italic block py-0.5">Chưa có thông tin mẹ</span>
                    )}
                  </div>

                  {/* Vợ / Chồng */}
                  <div className="p-3 rounded-xl bg-[#201419] border border-[#3d1e2b] text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-[#f472b6]">Phối ngẫu (Vợ/Chồng)</span>
                      {!spouse && canEditCurrent && (
                        <button
                          onClick={() => onStartAddSpouse && onStartAddSpouse(currentMember)}
                          className="text-[10px] text-[#f472b6] hover:underline font-semibold"
                        >
                          + Thêm
                        </button>
                      )}
                    </div>
                    {spouse ? (
                      <button
                        onClick={() => onSwitchMember && onSwitchMember(spouse)}
                        className="w-full text-left p-1.5 rounded hover:bg-[#2d1822] font-semibold text-[#e5e5e5] flex items-center justify-between"
                      >
                        <span>{spouse.hoTen}</span>
                        <ChevronRight className="w-3.5 h-3.5 text-[#f472b6]" />
                      </button>
                    ) : currentMember.hoTenVoChongNgoai ? (
                      <div className="p-1.5 text-[#d4d4d4] font-medium">
                        {currentMember.hoTenVoChongNgoai}
                      </div>
                    ) : (
                      <span className="text-[#737373] italic block py-1">Chưa cập nhật phối ngẫu</span>
                    )}
                  </div>

                  {/* Con Cái */}
                  <div className="p-3 rounded-xl bg-[#1f1b15] border border-[#3d2e1f] text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-[#c4a47c]">Con cái ({children.length})</span>
                      {canAddChildCurrent && (
                        <button
                          onClick={() => onStartAddChild && onStartAddChild(currentMember, spouse)}
                          className="text-[10px] text-[#c4a47c] hover:underline font-semibold"
                        >
                          + Thêm con
                        </button>
                      )}
                    </div>
                    {children.length > 0 ? (
                      <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                        {children.map(c => (
                          <button
                            key={c.id}
                            onClick={() => onSwitchMember && onSwitchMember(c)}
                            className="w-full text-left p-1 rounded hover:bg-[#2a2216] font-medium text-[#e5e5e5] flex items-center justify-between text-[11px]"
                          >
                            <span className="truncate">{c.hoTen}</span>
                            <span className="text-[10px] text-[#8a8a8a] shrink-0">{c.gioiTinh}</span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[#737373] italic block py-1">Chưa có thông tin con</span>
                    )}
                  </div>
                </div>
              </div>

              {/* AUDIT LOG & REVISION FOOTPRINT */}
              <div className="border-t border-[#262626] pt-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#8a8a8a]">
                    <UserCheck className="w-4 h-4 text-[#c4a47c]" />
                    <span>
                      {currentMember.nguoiCapNhatCuoi ? (
                        <>
                          Sửa đổi lần cuối bởi: <strong className="text-[#e5e5e5]">{currentMember.nguoiCapNhatCuoi}</strong>
                          {currentMember.thoiGianCapNhatCuoi && (
                            <span className="text-[#737373] ml-1">
                              ({formatAuditTimestamp(currentMember.thoiGianCapNhatCuoi)})
                            </span>
                          )}
                        </>
                      ) : (
                        <span>Dữ liệu khởi tạo ban đầu</span>
                      )}
                    </span>
                  </div>

                  {currentMember.lichSuChinhSua && currentMember.lichSuChinhSua.length > 0 && (
                    <button
                      onClick={() => setShowHistory(!showHistory)}
                      className="text-[11px] text-[#c4a47c] hover:underline font-semibold flex items-center gap-1"
                    >
                      <History className="w-3 h-3" />
                      <span>{showHistory ? 'Ẩn lịch sử' : `Xem lịch sử (${currentMember.lichSuChinhSua.length})`}</span>
                    </button>
                  )}
                </div>

                {showHistory && currentMember.lichSuChinhSua && currentMember.lichSuChinhSua.length > 0 && (
                  <div className="p-3 bg-[#111111] rounded-xl border border-[#262626] space-y-2 mt-2 max-h-48 overflow-y-auto">
                    {currentMember.lichSuChinhSua.map((log) => (
                      <div key={log.id} className="p-2 bg-[#181818] rounded-lg border border-[#222222] text-[11px] space-y-1">
                        <div className="flex items-center justify-between text-[#8a8a8a]">
                          <span className="font-semibold text-[#e5e5e5] flex items-center gap-1">
                            <span>👤 {log.userName}</span>
                            <span className="text-[9.5px] px-1 rounded bg-[#222] text-[#c4a47c]">
                              {log.userRole === 'admin' ? 'Admin' : 'Editor'}
                            </span>
                          </span>
                          <span className="text-[10px] text-[#737373] font-mono">
                            {log.formattedTime || formatAuditTimestamp(log.timestamp)}
                          </span>
                        </div>
                        <p className="text-[#d4d4d4]">{log.description}</p>
                        {log.changedFields && log.changedFields.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {log.changedFields.map((field, idx) => (
                              <span key={idx} className="px-1 py-0.2 rounded bg-[#121212] border border-[#2a2a2a] text-[9.5px] text-[#8a8a8a]">
                                {field}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Form Edit / Add */
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              
              {/* Permission restriction warning banner if not allowed */}
              {!isFormGenAllowed && (
                <div className="p-3 bg-red-950/40 border border-red-800/50 rounded-xl flex items-center gap-2 text-red-300">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <div>
                    Bạn không được Admin cấp quyền sửa đổi <strong>Đời thứ {targetGen}</strong>. Quyền chỉnh sửa của bạn: <strong>Đời {currentUser.allowedGenerations.join(', ') || 'Chưa cấp'}</strong>.
                  </div>
                </div>
              )}

              {/* SECTION 1 (REQUIREMENT 1): THÔNG TIN CHA - MẸ ĐƯỢC ĐƯA LÊN ĐẦU FORM & TỰ SINH MÃ (REQUIREMENT 2) */}
              <div className="p-3.5 bg-[#171717] rounded-xl border border-[#2a2a2a] space-y-3">
                <div className="flex items-center justify-between border-b border-[#262626] pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-[#c4a47c]">
                    <Users className="w-4 h-4 text-[#c4a47c]" />
                    <span className="uppercase tracking-wider text-[11px]">1. Quan hệ Tiền bối (Cha & Mẹ)</span>
                  </div>
                  <span className="text-[10px] text-[#8a8a8a]">
                    ⚡ Chọn Cha để tự động tạo Mã Gia Phả & Đời thứ
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Người Cha */}
                  <div>
                    <label className="block font-semibold text-[#d4d4d4] mb-1 flex items-center justify-between">
                      <span>Người Cha (ID_Cha)</span>
                      <span className="text-[10px] text-[#c4a47c]">⚡ Tự động tính mã</span>
                    </label>
                    <select
                      value={formData.idCha ?? ''}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : null;
                        handleFatherChange(val);
                      }}
                      className="w-full px-3 py-2 bg-[#1f1f1f] border border-[#333333] rounded-lg text-[#e5e5e5] focus:ring-2 focus:ring-[#c4a47c] focus:outline-hidden text-xs font-medium"
                    >
                      <option value="">-- Không chọn cha (Thủy tổ / Đời 1) --</option>
                      {allMembers
                        .filter(m => m.id !== formData.id && m.gioiTinh === 'Nam')
                        .map(m => (
                          <option key={m.id} value={m.id}>
                            #{m.id} - {m.hoTen} (Đời {m.doiThu} {m.maGiaPha ? `• ${m.maGiaPha}` : ''})
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Người Mẹ */}
                  <div>
                    <label className="block font-semibold text-[#d4d4d4] mb-1">
                      Người Mẹ (ID_Me)
                    </label>
                    <select
                      value={formData.idMe ?? ''}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : null;
                        setFormData({ ...formData, idMe: val });
                      }}
                      className="w-full px-3 py-2 bg-[#1f1f1f] border border-[#333333] rounded-lg text-[#e5e5e5] focus:ring-2 focus:ring-[#c4a47c] focus:outline-hidden text-xs"
                    >
                      <option value="">-- Không chọn mẹ / Chưa rõ --</option>
                      {allMembers
                        .filter(m => m.id !== formData.id && m.gioiTinh === 'Nữ')
                        .map(m => (
                          <option key={m.id} value={m.id}>
                            #{m.id} - {m.hoTen} (Đời {m.doiThu})
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                {/* Auto Code Notification Banner */}
                {autoCodeNotice && (
                  <div className="p-2.5 bg-[#1f1b13] border border-[#423320] rounded-lg flex items-center justify-between text-[11px] text-[#e0b880] animate-in fade-in">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#c4a47c] shrink-0" />
                      <span>{autoCodeNotice}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 2: ẢNH CHÂN DUNG & AVATAR CÁ NHÂN (HỖ TRỢ PHÓNG TO 10x20CM) */}
              <AvatarUploadField
                avatarUrl={formData.avatar}
                gender={formData.gioiTinh || 'Nam'}
                memberName={formData.hoTen || ''}
                onChange={(url) => setFormData({ ...formData, avatar: url })}
                onPreview10x20cm={() => setShowPortraitZoom(true)}
              />

              {/* SECTION 3: THÔNG TIN THÀNH VIÊN, MÃ GIA PHẢ & ĐỜI THỨ */}
              <div className="p-3.5 bg-[#171717] rounded-xl border border-[#2a2a2a] space-y-3">
                <div className="flex items-center gap-1.5 font-bold text-[#c4a47c] border-b border-[#262626] pb-2">
                  <User className="w-4 h-4 text-[#c4a47c]" />
                  <span className="uppercase tracking-wider text-[11px]">3. Thông tin Thành viên & Mã Gia Phả</span>
                </div>

                {/* Row: HoTen & GioiTinh & ThuTu */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-[#d4d4d4] mb-1">
                      Họ và Tên <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Huỳnh Văn B"
                      value={formData.hoTen || ''}
                      onChange={(e) => setFormData({ ...formData, hoTen: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1f1f1f] border border-[#333333] rounded-lg text-[#e5e5e5] focus:ring-2 focus:ring-[#c4a47c] focus:outline-hidden text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#d4d4d4] mb-1">Giới tính</label>
                    <select
                      value={formData.gioiTinh || 'Nam'}
                      onChange={(e) => setFormData({ ...formData, gioiTinh: e.target.value as Gender })}
                      className="w-full px-3 py-2 bg-[#1f1f1f] border border-[#333333] rounded-lg text-[#e5e5e5] focus:ring-2 focus:ring-[#c4a47c] focus:outline-hidden text-xs"
                    >
                      <option value="Nam" className="bg-[#1a1a1a] text-[#e5e5e5]">Nam</option>
                      <option value="Nữ" className="bg-[#1a1a1a] text-[#e5e5e5]">Nữ</option>
                      <option value="Khác" className="bg-[#1a1a1a] text-[#e5e5e5]">Khác</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#d4d4d4] mb-1">Thứ tự con</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="VD: 1 (Con cả)"
                      value={formData.thuTuTrongGiaDinh || ''}
                      onChange={(e) => setFormData({ ...formData, thuTuTrongGiaDinh: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 bg-[#1f1f1f] border border-[#333333] rounded-lg text-[#e5e5e5] focus:ring-2 focus:ring-[#c4a47c] focus:outline-hidden text-xs"
                    />
                  </div>
                </div>

                {/* Row: MaGiaPha & DoiThu */}
                <div className="space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-[#d4d4d4] mb-1 flex items-center justify-between">
                        <span>Mã Gia Phả (D-C-S)</span>
                        <span className="text-[10px] text-[#c4a47c] font-normal">Đời - Cành - Phái - Nhánh</span>
                      </label>
                      <input
                        type="text"
                        list="ma-gia-pha-suggestions-list"
                        placeholder="VD: D03-C02-P01"
                        value={formData.maGiaPha || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          const matchD = val.match(/^D(\d+)/i);
                          if (matchD) {
                            const parsedGen = parseInt(matchD[1], 10);
                            if (parsedGen) {
                              handleGenerationChange(parsedGen);
                            }
                            setFormData(prev => ({ ...prev, maGiaPha: val, doiThu: parsedGen || prev.doiThu }));
                          } else {
                            setFormData(prev => ({ ...prev, maGiaPha: val }));
                          }
                        }}
                        className="w-full px-3 py-2 bg-[#1f1f1f] border border-[#333333] rounded-lg text-[#e5e5e5] focus:ring-2 focus:ring-[#c4a47c] focus:outline-hidden font-mono text-xs"
                      />

                      <datalist id="ma-gia-pha-suggestions-list">
                        {allMembers
                          .filter(m => m.maGiaPha && m.maGiaPha.trim())
                          .map(m => (
                            <option key={m.id} value={m.maGiaPha}>
                              {m.hoTen} (Đời {m.doiThu})
                            </option>
                          ))}
                        <option value="D01" label="Thủy tổ đời 1" />
                        <option value="D02-C01" label="Đời 2 - Cành/Chi 1" />
                        <option value="D02-C02" label="Đời 2 - Cành/Chi 2" />
                        <option value="D03-C01-P01" label="Đời 3 - Chi 1 - Phái 1" />
                        <option value="D03-C01-P02" label="Đời 3 - Chi 1 - Phái 2" />
                        <option value="D04-C01-P01-N01" label="Đời 4 - Nhánh 1" />
                      </datalist>
                    </div>

                    <div>
                      <label className="block font-semibold text-[#d4d4d4] mb-1 flex items-center justify-between">
                        <span>Đời thứ (Thế hệ) <span className="text-red-400">*</span></span>
                        {currentUser.role === 'editor' && (
                          <span className="text-[10px] text-[#c4a47c]">
                            Quyền của bạn: Đời {currentUser.allowedGenerations.join(', ') || 'Không có'}
                          </span>
                        )}
                      </label>
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            max="50"
                            required
                            value={formData.doiThu || 1}
                            onChange={(e) => handleGenerationChange(parseInt(e.target.value) || 1)}
                            className={`w-full px-3 py-2 bg-[#1f1f1f] border rounded-lg text-[#e5e5e5] focus:ring-2 focus:ring-[#c4a47c] focus:outline-hidden text-xs font-semibold ${
                              !isFormGenAllowed ? 'border-red-500/80 bg-red-950/20' : 'border-[#333333]'
                            }`}
                          />
                          {currentUser.role === 'editor' && currentUser.allowedGenerations.length > 0 && (
                            <div className="flex items-center gap-1 shrink-0">
                              {currentUser.allowedGenerations.map(g => (
                                <button
                                  key={g}
                                  type="button"
                                  onClick={() => handleGenerationChange(g)}
                                  className={`px-2 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                                    formData.doiThu === g
                                      ? 'bg-[#c4a47c] text-black border-[#c4a47c]'
                                      : 'bg-[#222] border-[#444] text-[#c4a47c] hover:bg-[#333]'
                                  }`}
                                  title={`Chọn Đời ${g}`}
                                >
                                  Đời {g}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Quick generation picker dropdown or pills */}
                        <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none text-[10px]">
                          <span className="text-[#737373] whitespace-nowrap">Chọn nhanh đời:</span>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map(g => {
                            const isAllowed = canUserEditGeneration(currentUser, g);
                            const isSelected = formData.doiThu === g;
                            return (
                              <button
                                key={g}
                                type="button"
                                onClick={() => handleGenerationChange(g)}
                                className={`px-1.5 py-0.5 rounded border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                                  isSelected
                                    ? isAllowed 
                                      ? 'bg-[#c4a47c] text-black border-[#c4a47c] font-bold'
                                      : 'bg-red-900/60 text-red-200 border-red-600 font-bold'
                                    : isAllowed
                                      ? 'bg-[#181818] border-[#2e2e2e] text-[#a3a3a3] hover:text-[#e5e5e5]'
                                      : 'bg-[#181818] border-red-900/40 text-red-400/70 hover:text-red-300'
                                }`}
                                title={isAllowed ? `Đời ${g} (Có quyền)` : `Đời ${g} (Chưa được phân quyền)`}
                              >
                                <span>Đời {g}</span>
                                {!isAllowed && <Lock className="w-2.5 h-2.5 text-red-400" />}
                              </button>
                            );
                          })}
                        </div>

                        {!isFormGenAllowed && (
                          <div className="p-2 bg-red-950/40 border border-red-800/60 rounded-lg text-red-300 text-[11px] flex items-center gap-1.5 font-medium animate-in fade-in-50">
                            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            <span>Bạn chưa được phân quyền điều chỉnh thông tin này (Đời thứ {targetGen})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Interactive Branch Hierarchy Suggestion Panel */}
                  <BranchHierarchySuggest
                    allMembers={allMembers}
                    currentCode={formData.maGiaPha || ''}
                    currentGen={formData.doiThu || 1}
                    selectedFatherId={formData.idCha}
                    selectedMotherId={formData.idMe}
                    currentUser={currentUser}
                    onPermissionNotice={onPermissionNotice}
                    onSelectCode={(code, gen) => {
                      if (gen !== undefined) {
                        handleGenerationChange(gen);
                      }
                      setFormData(prev => ({
                        ...prev,
                        maGiaPha: code,
                        doiThu: gen !== undefined ? gen : prev.doiThu,
                      }));
                    }}
                  />
                </div>

                {/* Sinh - Mất - Quê Quán */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-[#d4d4d4] mb-1">Năm sinh / Ngày sinh</label>
                    <input
                      type="text"
                      placeholder="VD: 1950 hoặc 15/08/1950"
                      value={formData.namSinh || ''}
                      onChange={(e) => setFormData({ ...formData, namSinh: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1f1f1f] border border-[#333333] rounded-lg text-[#e5e5e5] focus:ring-2 focus:ring-[#c4a47c] focus:outline-hidden text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#d4d4d4] mb-1">Năm mất (Để trống nếu còn sống)</label>
                    <input
                      type="text"
                      placeholder="VD: 2015 hoặc để trống"
                      value={formData.namMat || ''}
                      onChange={(e) => setFormData({ ...formData, namMat: e.target.value || null })}
                      className="w-full px-3 py-2 bg-[#1f1f1f] border border-[#333333] rounded-lg text-[#e5e5e5] focus:ring-2 focus:ring-[#c4a47c] focus:outline-hidden text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#d4d4d4] mb-1">Quê quán</label>
                    <input
                      type="text"
                      placeholder="VD: Đại Lộc, Quảng Nam"
                      value={formData.queQuan || ''}
                      onChange={(e) => setFormData({ ...formData, queQuan: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1f1f1f] border border-[#333333] rounded-lg text-[#e5e5e5] focus:ring-2 focus:ring-[#c4a47c] focus:outline-hidden text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 3 (REQUIREMENT 3): THÔNG TIN HÔN NHÂN & PHỐI NGẪU (VỢ / CHỒNG) */}
              <div className="p-3.5 bg-[#171416] rounded-xl border border-[#3d1e2b] space-y-3">
                <div className="flex items-center justify-between border-b border-[#331c26] pb-2">
                  <div className="flex items-center gap-1.5 font-bold text-[#f472b6]">
                    <Heart className="w-4 h-4 text-[#f472b6]" />
                    <span className="uppercase tracking-wider text-[11px]">3. Thông tin Hôn nhân & Phối ngẫu (Vợ / Chồng)</span>
                  </div>
                  <span className="text-[10px] text-[#f472b6]/70">Lập gia đình & Ghi nhận dâu/rể</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Tình trạng hôn nhân */}
                  <div>
                    <label className="block font-semibold text-[#d4d4d4] mb-1">Tình trạng hôn nhân</label>
                    <select
                      value={formData.tinhTrangHonNhan || 'Độc thân'}
                      onChange={(e) => setFormData({ ...formData, tinhTrangHonNhan: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1f1a1d] border border-[#3d2330] rounded-lg text-[#e5e5e5] focus:ring-2 focus:ring-[#f472b6] focus:outline-hidden text-xs font-medium"
                    >
                      <option value="Độc thân">Độc thân</option>
                      <option value="Đã kết hôn">Đã kết hôn</option>
                      <option value="Góa">Góa / Vợ chồng đã mất</option>
                      <option value="Đã ly hôn">Đã ly hôn</option>
                      <option value="Tái hôn">Tái hôn</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>

                  {/* Phối ngẫu trong gia tộc */}
                  <div>
                    <label className="block font-semibold text-[#d4d4d4] mb-1">
                      Phối ngẫu trong cây (ID_VoChong)
                    </label>
                    <select
                      value={formData.idVoChong ?? ''}
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : null;
                        setFormData({ ...formData, idVoChong: val });
                      }}
                      className="w-full px-3 py-2 bg-[#1f1a1d] border border-[#3d2330] rounded-lg text-[#e5e5e5] focus:ring-2 focus:ring-[#f472b6] focus:outline-hidden text-xs"
                    >
                      <option value="">-- Không chọn hồ sơ cây --</option>
                      {allMembers
                        .filter(m => m.id !== formData.id && m.gioiTinh !== formData.gioiTinh)
                        .map(m => (
                          <option key={m.id} value={m.id}>
                            #{m.id} - {m.hoTen} ({m.gioiTinh} - Đời {m.doiThu})
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Họ tên Vợ/Chồng ngoài gia tộc */}
                  <div>
                    <label className="block font-semibold text-[#d4d4d4] mb-1">
                      Họ tên Vợ/Chồng (Dâu/Rể)
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Nguyễn Thị C"
                      value={formData.hoTenVoChongNgoai || ''}
                      onChange={(e) => setFormData({ ...formData, hoTenVoChongNgoai: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1f1a1d] border border-[#3d2330] rounded-lg text-[#e5e5e5] focus:ring-2 focus:ring-[#f472b6] focus:outline-hidden text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Năm/Ngày kết hôn */}
                  <div>
                    <label className="block font-semibold text-[#d4d4d4] mb-1">Năm / Ngày kết hôn</label>
                    <input
                      type="text"
                      placeholder="VD: 1980 hoặc 12/04/1980"
                      value={formData.ngayKetHon || ''}
                      onChange={(e) => setFormData({ ...formData, ngayKetHon: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1f1a1d] border border-[#3d2330] rounded-lg text-[#e5e5e5] focus:ring-2 focus:ring-[#f472b6] focus:outline-hidden text-xs"
                    />
                  </div>

                  {/* Quê quán của Vợ/Chồng */}
                  <div>
                    <label className="block font-semibold text-[#d4d4d4] mb-1">Quê quán Vợ/Chồng</label>
                    <input
                      type="text"
                      placeholder="VD: Duy Xuyên, Quảng Nam"
                      value={formData.queQuanVoChong || ''}
                      onChange={(e) => setFormData({ ...formData, queQuanVoChong: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1f1a1d] border border-[#3d2330] rounded-lg text-[#e5e5e5] focus:ring-2 focus:ring-[#f472b6] focus:outline-hidden text-xs"
                    />
                  </div>

                  {/* Thứ bậc / Ghi chú hôn nhân */}
                  <div>
                    <label className="block font-semibold text-[#d4d4d4] mb-1">Thứ bậc / Ghi chú hôn nhân</label>
                    <input
                      type="text"
                      placeholder="VD: Chính thất (Vợ cả), Kế thất, Vợ thứ..."
                      value={formData.ghiChuHonNhan || ''}
                      onChange={(e) => setFormData({ ...formData, ghiChuHonNhan: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1f1a1d] border border-[#3d2330] rounded-lg text-[#e5e5e5] focus:ring-2 focus:ring-[#f472b6] focus:outline-hidden text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: THÔNG TIN BỔ SUNG & TƯỞNG NIỆM */}
              <div className="p-3.5 bg-[#171717] rounded-xl border border-[#2a2a2a] space-y-3">
                <div className="flex items-center gap-1.5 font-bold text-[#c4a47c] border-b border-[#262626] pb-2">
                  <FileText className="w-4 h-4 text-[#c4a47c]" />
                  <span className="uppercase tracking-wider text-[11px]">4. Ghi chú, Tưởng niệm & Tiểu sử</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-[#d4d4d4] mb-1">Ngày giỗ âm lịch</label>
                    <input
                      type="text"
                      placeholder="VD: 15 tháng Giêng"
                      value={formData.ngayGio || ''}
                      onChange={(e) => setFormData({ ...formData, ngayGio: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1f1f1f] border border-[#333333] rounded-lg text-[#e5e5e5] focus:ring-2 focus:ring-[#c4a47c] focus:outline-hidden text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#d4d4d4] mb-1">Nơi an táng / Mộ phần</label>
                    <input
                      type="text"
                      placeholder="VD: Nghĩa trang tộc Huỳnh"
                      value={formData.noiAnTang || ''}
                      onChange={(e) => setFormData({ ...formData, noiAnTang: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1f1f1f] border border-[#333333] rounded-lg text-[#e5e5e5] focus:ring-2 focus:ring-[#c4a47c] focus:outline-hidden text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[#d4d4d4] mb-1">Số điện thoại</label>
                    <input
                      type="text"
                      placeholder="VD: 0905 123 456"
                      value={formData.soDienThoai || ''}
                      onChange={(e) => setFormData({ ...formData, soDienThoai: e.target.value })}
                      className="w-full px-3 py-2 bg-[#1f1f1f] border border-[#333333] rounded-lg text-[#e5e5e5] focus:ring-2 focus:ring-[#c4a47c] focus:outline-hidden text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#d4d4d4] mb-1">
                    Ghi chú danh xưng / Danh phận (VD: Thủy tổ, Con trai cả, Trưởng phái 1...)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Con trai cả ông E, Trưởng phái 1"
                    value={formData.ghiChu || ''}
                    onChange={(e) => setFormData({ ...formData, ghiChu: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1f1f1f] border border-[#333333] rounded-lg text-[#e5e5e5] focus:ring-2 focus:ring-[#c4a47c] focus:outline-hidden text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#d4d4d4] mb-1">
                    Thông tin cá nhân / Tiểu sử / Sự nghiệp
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ghi chú thêm về cuộc đời, sự nghiệp, học vấn, đóng góp cho dòng họ..."
                    value={formData.thongTinCaNhan || ''}
                    onChange={(e) => setFormData({ ...formData, thongTinCaNhan: e.target.value })}
                    className="w-full px-3 py-2 bg-[#1f1f1f] border border-[#333333] rounded-lg text-[#e5e5e5] focus:ring-2 focus:ring-[#c4a47c] focus:outline-hidden text-xs"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-between pt-3 border-t border-[#262626]">
                {mode === 'edit' && member && onDelete && canDeleteCurrent ? (
                  <button
                    type="button"
                    onClick={() => onDelete(member)}
                    className="px-3 py-2 bg-[#2d1417] hover:bg-[#3d181c] text-[#f87171] font-semibold rounded-lg flex items-center gap-1.5 transition-colors text-xs cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa người này</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-[#222222] hover:bg-[#2c2c2c] text-[#d4d4d4] font-medium rounded-lg text-xs transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={!isFormGenAllowed}
                    className={`px-5 py-2 rounded-lg shadow-sm text-xs font-bold transition-colors ${
                      isFormGenAllowed
                        ? 'bg-[#c4a47c] hover:bg-[#b5956d] text-[#0a0a0a] cursor-pointer'
                        : 'bg-[#333333] text-[#777777] cursor-not-allowed'
                    }`}
                  >
                    {mode === 'edit' ? 'Lưu thay đổi' : 'Thêm vào gia phả'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* 10x20cm Portrait Lightbox Modal */}
      {showPortraitZoom && (
        <PortraitViewerModal
          member={
            isViewMode 
              ? currentMember 
              : ({
                  ...formData,
                  hoTen: formData.hoTen || 'Thành viên',
                  doiThu: formData.doiThu || 1,
                  gioiTinh: formData.gioiTinh || 'Nam',
                  avatar: formData.avatar,
                } as FamilyMember)
          }
          onClose={() => setShowPortraitZoom(false)}
        />
      )}
    </div>
  );
};

