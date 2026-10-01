import React from 'react';
import { X, Download, FileText, Trash2, ZoomIn, HardDrive } from 'lucide-react';
import { TaskAttachment } from '../types';

interface AttachmentViewerModalProps {
  attachment: TaskAttachment | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
}

export const AttachmentViewerModal: React.FC<AttachmentViewerModalProps> = ({
  attachment,
  onClose,
  onDelete,
}) => {
  if (!attachment) return null;

  const isImage = attachment.type.startsWith('image/') || attachment.dataUrl.startsWith('data:image/');

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = attachment.dataUrl;
    link.download = attachment.name || 'field_attachment';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-100">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2 overflow-hidden pr-2">
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700">
              {isImage ? <ZoomIn className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{attachment.name}</h4>
              <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                <span>{formatSize(attachment.size)}</span>
                <span>•</span>
                <span>{new Date(attachment.uploadedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              title="Download file"
            >
              <Download className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Download</span>
            </button>

            {onDelete && (
              <button
                type="button"
                onClick={() => {
                  onDelete(attachment.id);
                  onClose();
                }}
                className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition"
                title="Delete attachment"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Media Preview Body */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-slate-100">
          {isImage ? (
            <img
              src={attachment.dataUrl}
              alt={attachment.name}
              className="max-h-[65vh] w-auto max-w-full rounded-lg object-contain border border-slate-300 shadow-md bg-white"
            />
          ) : (
            <div className="text-center p-8 bg-white rounded-xl border border-slate-200 max-w-sm shadow-xs">
              <HardDrive className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-xs text-slate-800 font-medium break-all">{attachment.name}</p>
              <p className="text-[11px] text-slate-500 mt-1">{attachment.type || 'Document File'}</p>
              <button
                onClick={handleDownload}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition shadow-xs"
              >
                <Download className="w-4 h-4" />
                Download Attachment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
