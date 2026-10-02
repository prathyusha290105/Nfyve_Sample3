import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Info, X, ChevronRight, CheckCircle2, Copy } from 'lucide-react';

export const FirebaseSetupNotice: React.FC = () => {
  const { isFirebaseConnected, firebaseStatus } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isFirebaseConnected || dismissed) {
    return null;
  }

  const envSnippet = `# Firebase Web Configuration
VITE_FIREBASE_API_KEY="YOUR_API_KEY"
VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"`;

  const handleCopy = () => {
    navigator.clipboard.writeText(envSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="bg-[#FAF9F5] border-b border-[#E7E5DC] text-[#252923] text-xs">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
          <p className="truncate text-[11px] text-[#585B53]">
            <strong className="text-[#214D3B]">Firebase Live Integration Ready:</strong> Running in Seamless Dual-Store Mode. Set <code className="bg-[#F0EEE5] px-1 py-0.5 rounded text-[#214D3B]">VITE_FIREBASE_*</code> to connect your live Cloud Firestore.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-[11px] font-semibold text-[#2E6B50] hover:underline flex items-center gap-0.5"
          >
            <span>{isOpen ? 'Hide Config' : 'View Setup'}</span>
            <ChevronRight className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 text-[#777A70] hover:text-[#252923]"
            title="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="bg-white border-t border-[#E7E5DC] p-4 text-xs space-y-3">
          <div className="max-w-7xl mx-auto space-y-2">
            <p className="text-[#585B53] leading-relaxed">
              NFYVE – The Change uses the Firebase JavaScript SDK for client authentication and Cloud Firestore database operations. Add your project configuration values to <code className="bg-[#F0EEE5] px-1 py-0.5 rounded">.env</code>:
            </p>

            <div className="relative">
              <pre className="p-3 bg-[#FAF9F5] border border-[#DDD9CE] rounded-lg font-mono text-[11px] text-[#252923] overflow-x-auto">
                {envSnippet}
              </pre>
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 px-2.5 py-1 bg-white border border-[#DDD9CE] hover:bg-[#F0EEE5] rounded text-[10px] font-semibold flex items-center gap-1 shadow-xs"
              >
                {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-[#214D3B]" />}
                <span>{copied ? 'Copied' : 'Copy Template'}</span>
              </button>
            </div>

            <p className="text-[10px] text-[#777A70]">
              Demo accounts (<code className="text-[#214D3B]">admin@nfyve.com</code>, <code className="text-[#214D3B]">dr.ananya@nfyve.com</code>, <code className="text-[#214D3B]">priya.sharma@example.com</code>) are pre-seeded and fully operational.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
