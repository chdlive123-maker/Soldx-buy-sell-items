import React from 'react';
import { ShieldAlert, Heart, CheckCircle2, X } from 'lucide-react';

interface AgeVerificationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-[#002f34] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Heart className="w-5 h-5 text-rose-400" />
            <div>
              <h2 className="font-bold text-base tracking-tight">18+ Age Confirmation</h2>
              <p className="text-[11px] text-slate-300">Dating, Matchmaking & Friendship Community</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 text-xs text-slate-700 leading-relaxed">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900 mb-1">
                Ye section sirf Adults (18+ years) ke liye hai.
              </p>
              <p className="text-slate-600">
                Is category me Men Looking for Women, Women Looking for Men, Friendship, Coffee & Travel Partners ke personal ads shamil hain.
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <p className="font-semibold text-slate-900">Community Safety Guidelines:</p>
            <ul className="space-y-1.5 pl-1">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span>Meri umar 18 saal ya usse adhik (18+ Adult) hai.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span>Main respectful conversation aur safe public meetups follow karunga/karungi.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                <span>Kisi bhi illegal, abusive ya paid escort content ki anumati nahi hai.</span>
              </li>
            </ul>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 px-4 border border-slate-300 text-slate-700 hover:bg-slate-50 font-semibold text-xs rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              Exit (Under 18)
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 py-2.5 px-4 bg-[#002f34] hover:bg-[#00474e] text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer whitespace-nowrap"
            >
              I am 18+ — Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
