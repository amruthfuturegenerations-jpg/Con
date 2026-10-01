import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2, Share2, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ variant?: 'header' | 'compact' | 'card' }> = ({ variant = 'header' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already running in standalone mode, don't show the prompt
  if (isInstalled) {
    return (
      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Installed PWA
      </span>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        type="button"
        title="Install ConstructPro on Android, iOS or Desktop"
        className={
          variant === 'compact'
            ? 'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-sm active:scale-95'
            : 'flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs sm:text-sm font-bold shadow-md hover:shadow-amber-500/20 active:scale-95 transition-all'
        }
      >
        {isInstallable ? <Download className="w-4 h-4 text-slate-950" /> : <Smartphone className="w-4 h-4 text-slate-950" />}
        <span>{isInstallable ? 'Install App' : 'Add to Home Screen'}</span>
      </button>

      {/* Installation Instruction Modal for iOS / unsupported browsers */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl bg-white border border-slate-200 p-6 shadow-2xl text-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center text-slate-950 font-black">
                  CP
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Install ConstructPro PWA</h3>
                  <p className="text-xs text-slate-500">Offline Field & Site Task Manager</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm text-slate-600">
              {isIOS ? (
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 text-amber-700 font-semibold text-xs tracking-wide uppercase">
                    <Smartphone className="w-4 h-4" /> iOS Safari Instructions
                  </div>
                  <ol className="space-y-2.5 text-xs text-slate-700 list-decimal pl-4">
                    <li>
                      Tap the <strong className="text-slate-900 inline-flex items-center gap-1 mx-1"><Share2 className="w-3.5 h-3.5" /> Share</strong> icon in your Safari bottom toolbar.
                    </li>
                    <li>
                      Scroll down and select <strong className="text-slate-900 inline-flex items-center gap-1 mx-1"><PlusSquare className="w-3.5 h-3.5" /> Add to Home Screen</strong>.
                    </li>
                    <li>
                      Confirm by tapping <strong className="text-amber-700 font-bold">Add</strong> at the top right.
                    </li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 text-amber-700 font-semibold text-xs tracking-wide uppercase">
                    <Smartphone className="w-4 h-4" /> Android / Chrome Instructions
                  </div>
                  <ol className="space-y-2.5 text-xs text-slate-700 list-decimal pl-4">
                    <li>
                      Tap the <strong className="text-slate-900">three dots menu (⋮)</strong> at the top right of Chrome.
                    </li>
                    <li>
                      Tap <strong className="text-slate-900">"Install app"</strong> or <strong className="text-slate-900">"Add to Home screen"</strong>.
                    </li>
                    <li>
                      Confirm the installation. The app will launch in full screen with offline support!
                    </li>
                  </ol>
                </div>
              )}

              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs text-amber-900">
                ⚡ <strong className="text-amber-950">Benefits of Installing:</strong> Instant launch from your phone home screen or tablet launcher, works completely offline without mobile cellular coverage, and retains all site photos and task logs.
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold tracking-wide transition"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
