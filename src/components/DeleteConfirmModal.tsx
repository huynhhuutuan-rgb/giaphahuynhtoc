import React from 'react';
import { FamilyMember } from '../types/family';
import { Trash2, AlertTriangle, X, User } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  member: FamilyMember | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  member,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-[#171717] border border-red-900/40 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-[#e5e5e5]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="p-4 bg-[#231517] border-b border-red-900/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-red-400 font-bold text-base">
            <div className="p-2 bg-red-950/80 rounded-xl border border-red-800/40">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <span>Xác nhận xóa thành viên</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#a3a3a3] hover:text-white hover:bg-[#2e2e2e] rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-sm">
          <p className="text-[#d4d4d4]">
            Bạn có chắc chắn muốn xóa thành viên sau khỏi cơ sở dữ liệu gia phả?
          </p>

          {/* Member Card Preview */}
          <div className="p-3.5 bg-[#121212] border border-[#2b2222] rounded-xl flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-[#1c1917] border border-[#3d2f2f] flex items-center justify-center shrink-0 overflow-hidden">
              {member.avatar ? (
                <img
                  src={member.avatar}
                  alt={member.hoTen}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <User className="w-6 h-6 text-[#737373]" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-[#f3e8d2] text-base truncate">{member.hoTen}</h4>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-[#c4a47c]/20 text-[#c4a47c] border border-[#c4a47c]/30">
                  Đời {member.doiThu}
                </span>
              </div>
              <p className="text-xs text-[#a3a3a3] truncate mt-0.5 font-mono">
                {member.maGiaPha ? `Mã: ${member.maGiaPha}` : ''} {member.ghiChu ? `• ${member.ghiChu}` : ''}
              </p>
            </div>
          </div>

          <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl text-xs text-red-300 leading-relaxed">
            ⚠️ <strong>Lưu ý quan trọng:</strong> Thao tác xóa sẽ đồng thời gỡ bỏ các liên kết cha mẹ, vợ/chồng liên quan tới thành viên này trong cây gia phả.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#141414] border-t border-[#262626] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#262626] hover:bg-[#333333] text-[#d4d4d4] font-medium rounded-xl text-xs transition-colors cursor-pointer"
          >
            Hủy bỏ
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-red-900/30 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xác nhận xóa</span>
          </button>
        </div>
      </div>
    </div>
  );
};
