import React, { useState } from 'react';
import {
  X,
  Download,
  Share2,
  Copy,
  Check,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FolderArchive,
  Github,
} from 'lucide-react';
import { downloadBinaryFile, shareProjectZipOnMobile } from '../utils/api';

interface GitHubZipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubZipModal: React.FC<GitHubZipModalProps> = ({ isOpen, onClose }) => {
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  const directZipUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/soldx-github-update.zip`
      : '/soldx-github-update.zip';

  const handleBlobDownload = async () => {
    setDownloading(true);
    setStatusMessage(null);
    const result = await downloadBinaryFile('/api/download-zip', 'soldx-github-update.zip', {
      requireZipMagic: true,
      mimeType: 'application/zip',
    });
    setDownloading(false);

    if (result.success) {
      const mb = result.sizeBytes ? (result.sizeBytes / (1024 * 1024)).toFixed(1) : '4.0';
      setStatusMessage({
        type: 'success',
        text: `soldx-github-update.zip (${mb} MB) download trigger ho gayi hai! Apne phone/browser ke Downloads folder me check karein. Agar preview box ne download roka ho, toh neeche Option 2 ya Option 3 use karein.`,
      });
    } else {
      setStatusMessage({
        type: 'error',
        text: result.error || 'Download nahi ho paya. Neeche Copy Direct Link use karein.',
      });
    }
  };

  const handleMobileShare = async () => {
    setSharing(true);
    setStatusMessage(null);
    const result = await shareProjectZipOnMobile('soldx-github-update.zip');
    setSharing(false);

    if (result.success) {
      setStatusMessage({
        type: 'success',
        text: 'ZIP file successfully save/share ho gayi!',
      });
    } else if (result.error) {
      setStatusMessage({
        type: 'error',
        text: result.error,
      });
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(directZipUrl);
      setCopied(true);
      setStatusMessage({
        type: 'success',
        text: 'Direct ZIP Link copy ho gaya! Ab ise apne Chrome browser ke naye tab ke address bar me paste karke Go dabayein — seedha ZIP download ho jayegi.',
      });
      window.setTimeout(() => setCopied(false), 3500);
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Link box par long-press karke Copy karein aur Chrome ke naye tab me paste karein.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="bg-[#002f34] text-white px-4 sm:px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#23e5db]/20 border border-[#23e5db]/40 flex items-center justify-center text-[#23e5db]">
              <FolderArchive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold tracking-tight">
                Download SOLDX GitHub Code (.ZIP)
              </h2>
              <p className="text-[11px] text-slate-300">
                Clean GitHub-ready source code (~4.0 MB, bina node_modules ke)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {statusMessage && (
            <div
              className={`p-3 rounded-xl border text-xs font-semibold flex items-start gap-2 leading-relaxed ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Option 1: Instant Blob Download */}
          <div className="bg-teal-50/70 border border-teal-200 rounded-xl p-3.5 space-y-2.5">
            <div className="text-xs font-extrabold text-[#002f34]">
              Option 1: 1-Click Direct ZIP Download
            </div>
            <button
              type="button"
              onClick={handleBlobDownload}
              disabled={downloading}
              className="w-full py-3 px-4 bg-[#002f34] hover:bg-[#00444b] text-white rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer disabled:opacity-60"
            >
              {downloading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#23e5db]" />
                  <span>ZIP Taiyaar Ho Rahi Hai...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-[#23e5db]" />
                  <span>Download soldx-github-update.zip</span>
                </>
              )}
            </button>
          </div>

          {/* Option 2: Phone Save / Share Sheet */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="text-xs font-extrabold text-slate-800">
              Option 2 (Mobile Phone ke liye): Save to Files / Drive / WhatsApp
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Agar preview screen ke andar browser download block ho raha ho, toh is button se seedha phone ke Files, Google Drive ya WhatsApp me ZIP save karein:
            </p>
            <button
              type="button"
              onClick={handleMobileShare}
              disabled={sharing}
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
            >
              {sharing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Opening Save / Share Menu...</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Save / Share ZIP on Phone</span>
                </>
              )}
            </button>
          </div>

          {/* Option 3: Copy Direct URL for Chrome Address Bar (100% Guaranteed) */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-2">
            <div className="text-xs font-extrabold text-amber-950">
              Option 3 (100% Guaranteed): Chrome Naye Tab me Paste Karein
            </div>
            <p className="text-[11px] text-amber-900 leading-relaxed">
              Neeche <strong>Copy Link</strong> dabayein aur usi Chrome browser ke naye tab me paste karke open karein — bina kisi rukawat ke <code>soldx-github-update.zip</code> download ho jayegi:
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={directZipUrl}
                onFocus={e => e.currentTarget.select()}
                className="flex-1 min-w-0 px-2.5 py-2 text-[11px] font-mono bg-white border border-amber-300 rounded-lg text-slate-700 outline-none"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="shrink-0 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-extrabold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* GitHub Upload Steps */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1.5 text-xs text-slate-700">
            <div className="font-extrabold text-[#002f34] flex items-center gap-1.5">
              <Github className="w-4 h-4" />
              <span>GitHub par Update kaise karein:</span>
            </div>
            <div>1. Download hui <code>soldx-github-update.zip</code> ko pehle <strong>Unzip / Extract</strong> karein.</div>
            <div>2. Apne GitHub repository me jayein → <strong>Add file</strong> → <strong>Upload files</strong> chunein.</div>
            <div>3. Extract ki gayi saari files select karein aur neeche <strong>Commit changes</strong> dabayein.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
