import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  User,
  Phone,
  MapPin,
  ArrowRight,
  Lock,
  RefreshCw,
  AlertCircle,
  Eye,
  EyeOff,
  UserPlus,
} from 'lucide-react';
import { UserProfile } from '../types';
import { api, saveAdminToken, clearAdminToken } from '../utils/api';
import { LocationPickerModal } from './LocationPickerModal';

const AUTHORIZED_ADMIN_EMAIL = 'sonuvarma891@gmail.com';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile, adminToken?: string) => void;
  initialTab?: 'login' | 'signup' | 'forgot_password';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialTab = 'login',
}) => {
  const [tab, setTab] = useState<'login' | 'signup'>(initialTab === 'signup' ? 'signup' : 'login');

  // Login inputs (Email ID OR 10-digit Mobile Number + Password)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup inputs
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [signupCity, setSignupCity] = useState('Delhi');
  const [signupState, setSignupState] = useState('Delhi (NCT)');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTab(initialTab === 'signup' ? 'signup' : 'login');
      setErrorMessage('');
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const isTypingPhone =
    loginIdentifier.trim().length > 0 &&
    !loginIdentifier.includes('@') &&
    /^[+\d\s-]+$/.test(loginIdentifier.trim());

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanId = loginIdentifier.trim();
    const cleanPass = loginPassword.trim();

    if (!cleanId) {
      setErrorMessage('Kirpya apna Email ID ya 10-digit Mobile Number enter karein.');
      return;
    }
    if (cleanPass.length < 4) {
      setErrorMessage('Kirpya kam se kam 4 characters ka Password enter karein.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.loginWithPassword({
        identifier: cleanId,
        password: cleanPass,
      });

      if (!res.success || !res.user) {
        setErrorMessage(res.error || 'Login nahi ho paya. Kirpya apna Email/Mobile aur Password check karein.');
        return;
      }

      if (res.adminToken && res.user.email?.trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL) {
        saveAdminToken(res.adminToken);
      } else {
        clearAdminToken();
      }

      onLoginSuccess(res.user, res.adminToken);
      setLoginPassword('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanName = signupName.trim();
    const cleanEmail = signupEmail.trim();
    const cleanPhone = signupPhone.trim();
    const cleanPass = signupPassword.trim();

    if (!cleanName) {
      setErrorMessage('Kirpya apna poora naam enter karein.');
      return;
    }
    if (!cleanEmail && !cleanPhone) {
      setErrorMessage('Kirpya Email ID ya 10-digit Mobile Number me se kam se kam ek enter karein.');
      return;
    }
    if (cleanPass.length < 4) {
      setErrorMessage('Kirpya kam se kam 4 characters ka Password banayein.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.signupWithPassword({
        name: cleanName,
        email: cleanEmail,
        phone: cleanPhone,
        password: cleanPass,
        city: signupCity,
        state: signupState,
      });

      if (!res.success || !res.user) {
        setErrorMessage(res.error || 'Account create nahi ho paya. Kirpya dubara koshish karein.');
        return;
      }

      if (res.adminToken && res.user.email?.trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL) {
        saveAdminToken(res.adminToken);
      } else {
        clearAdminToken();
      }

      onLoginSuccess(res.user, res.adminToken);
      setSignupPassword('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative my-auto animate-in zoom-in-95 border border-slate-200">
          {/* Top Brand Header */}
          <div className="bg-[#002f34] text-white px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight select-none">
                <span className="text-white">S</span>
                <span className="text-[#23e5db]">O</span>
                <span className="text-white">L</span>
                <span className="text-[#ffce32]">D</span>
                <span className="text-[#23e5db]">X</span>
              </span>
              <span className="text-[11px] font-bold text-slate-300 ml-1.5 uppercase tracking-wider">
                {tab === 'login' ? 'Account Login' : 'Create Account'}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Switcher */}
          <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-extrabold">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMessage('');
              }}
              className={`flex-1 py-3 text-center transition-colors cursor-pointer ${
                tab === 'login'
                  ? 'bg-white text-[#002f34] border-b-2 border-[#002f34]'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('signup');
                setErrorMessage('');
              }}
              className={`flex-1 py-3 text-center transition-colors cursor-pointer ${
                tab === 'signup'
                  ? 'bg-white text-[#002f34] border-b-2 border-[#002f34]'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Create New Account
            </button>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700 font-medium leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {tab === 'login' ? (
            /* ==========================================
               DIRECT EMAIL / PHONE + PASSWORD LOGIN
               ========================================== */
            <form onSubmit={handleLoginSubmit} className="p-5 sm:p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Email ID ya Mobile Number *
                </label>
                <div className="relative">
                  {isTypingPhone ? (
                    <Phone className="w-4 h-4 absolute left-3.5 top-3 text-teal-700" />
                  ) : (
                    <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  )}
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={e => {
                      setLoginIdentifier(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="Email ID ya 10-digit Mobile Number"
                    autoComplete="username"
                    className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm border-2 border-slate-300 rounded-xl focus:outline-none focus:border-[#002f34] font-medium text-slate-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={e => {
                      setLoginPassword(e.target.value);
                      setErrorMessage('');
                    }}
                    placeholder="Apna password enter karein"
                    autoComplete="current-password"
                    className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm border-2 border-slate-300 rounded-xl focus:outline-none focus:border-[#002f34] font-medium text-slate-900"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(prev => !prev)}
                    className="absolute right-3 top-2.5 p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                    aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#002f34] hover:bg-[#00474e] text-white font-extrabold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4 text-[#23e5db]" />
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-500 text-center pt-1">
                Apna Email ID ya 10-digit Phone Number aur Password daal kar seedha login karein.
              </p>
            </form>
          ) : (
            /* ==========================================
               CREATE NEW ACCOUNT (EMAIL / PHONE + PASSWORD)
               ========================================== */
            <form onSubmit={handleSignupSubmit} className="p-5 sm:p-6 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={signupName}
                    onChange={e => setSignupName(e.target.value)}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#002f34]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Email ID {signupPhone.trim() ? '(Optional)' : '*'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={e => setSignupEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#002f34]"
                    required={!signupPhone.trim()}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Mobile Number {signupEmail.trim() ? '(Optional)' : '*'}
                </label>
                <div className="flex items-center border border-slate-300 focus-within:border-[#002f34] rounded-xl overflow-hidden bg-white">
                  <span className="px-2.5 py-2 bg-slate-100 text-xs font-bold text-[#002f34] border-r border-slate-200">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={signupPhone}
                    onChange={e => setSignupPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile number"
                    className="flex-1 px-3 py-2 text-xs font-semibold outline-none"
                    required={!signupEmail.trim()}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Create Password *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    value={signupPassword}
                    onChange={e => setSignupPassword(e.target.value)}
                    placeholder="Min. 4 characters password"
                    autoComplete="new-password"
                    className="w-full pl-9 pr-9 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-[#002f34]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(prev => !prev)}
                    className="absolute right-2.5 top-2 p-0.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                    aria-label={showSignupPassword ? 'Hide password' : 'Show password'}
                  >
                    {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Your City & State (All India) *
                </label>
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl flex items-center justify-between text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-4 h-4 text-teal-700 shrink-0" />
                    <span className="font-bold text-slate-900 truncate">
                      {signupCity}, {signupState}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-teal-700 shrink-0">Change</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#002f34] hover:bg-[#00474e] text-white font-extrabold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 text-[#23e5db]" />
                    <span>Create Account & Login</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* All-India City Picker for Registration */}
      <LocationPickerModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        selectedCity={signupCity}
        selectedState={signupState}
        allowAllIndia={false}
        onSelectLocation={loc => {
          setSignupCity(loc.city);
          setSignupState(loc.state || 'India');
        }}
      />
    </>
  );
};
