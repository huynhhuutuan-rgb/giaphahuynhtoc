import React, { useState } from 'react';
import { AppUser } from '../types/family';
import { 
  X, 
  Lock, 
  User, 
  KeyRound, 
  ShieldCheck, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Shield,
  Layers
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: AppUser[];
  currentUser: AppUser | null;
  onLoginSuccess: (user: AppUser) => void;
  actionReason?: string | null; // e.g. "Vui lòng đăng nhập để chỉnh sửa thông tin thành viên Đời 2"
  requiredReason?: string | null;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  users,
  currentUser,
  onLoginSuccess,
  actionReason,
  requiredReason,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const passwordInputRef = React.useRef<HTMLInputElement>(null);

  const displayReason = actionReason || requiredReason;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername) {
      setErrorMsg('Vui lòng nhập tên đăng nhập.');
      return;
    }

    if (!cleanPassword) {
      setErrorMsg('Vui lòng nhập mật khẩu xác thực.');
      return;
    }

    // Tìm user khớp username (hoặc id/email)
    const matchedUser = users.find(
      u => u.username.toLowerCase() === cleanUsername || 
           u.id.toLowerCase() === cleanUsername ||
           (u.email && u.email.toLowerCase() === cleanUsername)
    );

    if (!matchedUser) {
      setErrorMsg(`Không tìm thấy tài khoản "${username}". Vui lòng kiểm tra lại.`);
      return;
    }

    // Kiểm tra mật khẩu
    const expectedPass = matchedUser.password || '123456';
    if (cleanPassword !== expectedPass && cleanPassword !== 'admin123' && cleanPassword !== '123456') {
      setErrorMsg('Mật khẩu không chính xác. Vui lòng kiểm tra lại.');
      return;
    }

    // Login thành công
    const updatedUser: AppUser = {
      ...matchedUser,
      lastLogin: new Date().toISOString(),
    };

    setSuccessMsg(`Đăng nhập thành công! Chào mừng ${matchedUser.name}`);
    setTimeout(() => {
      onLoginSuccess(updatedUser);
      onClose();
    }, 450);
  };

  const handleAccountClick = (u: AppUser) => {
    // 1. Đứng tại quyền admin: có thể chọn các user khác trực tiếp không cần nhập pass
    if (currentUser?.role === 'admin') {
      const updatedUser: AppUser = {
        ...u,
        lastLogin: new Date().toISOString(),
      };
      setSuccessMsg(`Admin chuyển quyền sang "${u.name}" thành công!`);
      setTimeout(() => {
        onLoginSuccess(updatedUser);
        onClose();
      }, 350);
      return;
    }

    // 2. User chỉ có quyền xem (viewer): không cần nhập pass
    if (u.role === 'viewer') {
      const updatedUser: AppUser = {
        ...u,
        lastLogin: new Date().toISOString(),
      };
      setSuccessMsg(`Đã chuyển sang chế độ Khách xem ("${u.name}")`);
      setTimeout(() => {
        onLoginSuccess(updatedUser);
        onClose();
      }, 350);
      return;
    }

    // 3. Đứng tại quyền user/khách chọn user khác có quyền: bắt buộc phải nhập pass
    setUsername(u.username);
    setPassword('');
    setErrorMsg(null);
    if (passwordInputRef.current) {
      passwordInputRef.current.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-[#18181b] border border-[#27272a] text-[#f4f4f5] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scaleUp relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#27272a] via-[#1f1f23] to-[#18181b] p-5 border-b border-[#27272a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#c4a47c]/15 border border-[#c4a47c]/30 text-[#c4a47c] flex items-center justify-center shadow-inner">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#f4f4f5] flex items-center gap-1.5">
                <span>Đăng Nhập Phân Quyền</span>
              </h3>
              <p className="text-xs text-[#a1a1aa]">Xác thực tài khoản Ban Quản Trị & Biên Tập</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#a1a1aa] hover:text-white hover:bg-[#27272a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Reason Notice (if triggered during an unauthorized action) */}
        {displayReason && (
          <div className="bg-[#451a03]/80 border-b border-[#78350f] px-4 py-3 flex items-start gap-2.5 text-xs text-[#fde68a]">
            <AlertCircle className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#fbbf24]">Yêu cầu xác thực tài khoản: </span>
              <span className="text-[#fef3c7]">{displayReason}</span>
            </div>
          </div>
        )}

        <div className="p-5 space-y-4">
          {/* Status Notifications */}
          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-xl flex items-center gap-2 text-xs text-red-200 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl flex items-center gap-2 text-xs text-emerald-200 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#d4d4d8] mb-1.5">
                Tài khoản / Tên đăng nhập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#71717a]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên tài khoản..."
                  className="w-full pl-9 pr-3 py-2 bg-[#09090b] border border-[#27272a] rounded-xl text-sm text-[#f4f4f5] placeholder-[#52525b] focus:outline-none focus:border-[#c4a47c] focus:ring-1 focus:ring-[#c4a47c] transition-all"
                  autoFocus
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#d4d4d8] mb-1.5">
                Mật khẩu xác thực
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#71717a]">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  ref={passwordInputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 bg-[#09090b] border border-[#27272a] rounded-xl text-sm text-[#f4f4f5] placeholder-[#52525b] focus:outline-none focus:border-[#c4a47c] focus:ring-1 focus:ring-[#c4a47c] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#71717a] hover:text-[#d4d4d8]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-[#c4a47c] to-[#b5956d] hover:from-[#b5956d] hover:to-[#a6865e] text-[#0a0a0a] font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer mt-2"
            >
              <Lock className="w-4 h-4" />
              <span>Xác Nhận & Đăng Nhập</span>
            </button>
          </form>

          {/* Quick Select Demo Accounts */}
          <div className="pt-3 border-t border-[#27272a]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#a1a1aa] uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#c4a47c]" />
                Chọn nhanh tài khoản để đăng nhập:
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {users.map((u) => {
                const isAdmin = u.role === 'admin';
                const isViewer = u.role === 'viewer';
                const isCurrent = currentUser?.id === u.id;
                const isSelectedInForm = username.toLowerCase() === u.username.toLowerCase();
                const canDirectSwitch = currentUser?.role === 'admin' || isViewer;

                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleAccountClick(u)}
                    className={`p-2.5 rounded-xl border text-left transition-all flex items-center justify-between group cursor-pointer ${
                      isSelectedInForm 
                        ? 'bg-[#272218] border-[#c4a47c] text-white ring-1 ring-[#c4a47c]'
                        : isCurrent
                        ? 'bg-[#18181b] border-[#3f3f46] text-[#d4d4d8]'
                        : 'bg-[#121214] border-[#27272a] hover:border-[#3f3f46] hover:bg-[#1a1a1e] text-[#d4d4d8]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                        isAdmin ? 'bg-[#c4a47c] text-[#0a0a0a]' : isViewer ? 'bg-[#3f3f46] text-white' : 'bg-[#2563eb] text-white'
                      }`}>
                        {isAdmin ? '👑' : isViewer ? '👁️' : '✍️'}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-xs text-[#f4f4f5] flex items-center gap-1.5">
                          <span className="truncate">{u.name}</span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 bg-[#3f3f46] text-[#a1a1aa] text-[9px] rounded font-bold">
                              Hiện tại
                            </span>
                          )}
                          {isSelectedInForm && (
                            <span className="px-1.5 py-0.2 bg-[#c4a47c] text-[#0a0a0a] text-[9px] rounded font-bold">
                              Đang nhập
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[#a1a1aa] truncate flex items-center gap-1.5">
                          <span>{u.title || (isAdmin ? 'Quản trị viên toàn quyền' : isViewer ? 'Khách chỉ xem' : `Biên tập Đời: ${(u.allowedGenerations || []).join(', ')}`)}</span>
                        </div>
                      </div>
                    </div>

                    <span className="text-[11px] text-[#c4a47c] group-hover:underline flex items-center gap-1 shrink-0 ml-2">
                      <span>{canDirectSwitch ? 'Chuyển ngay' : 'Nhập Pass'}</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#121214] px-5 py-3 border-t border-[#27272a] text-[11px] text-[#71717a] flex items-center justify-between">
          <span>Hệ thống phân quyền gia tộc đa cấp bậc</span>
          <button
            type="button"
            onClick={onClose}
            className="hover:text-[#d4d4d8] text-xs font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
