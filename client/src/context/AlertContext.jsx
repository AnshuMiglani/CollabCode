import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  X,
  Sparkles,
  ShieldAlert,
  ArrowRight
} from "lucide-react";

const AlertContext = createContext(null);

// Global event bus so non-React helpers (like socket hooks) can trigger alerts
let globalAlertDispatcher = null;

export function triggerGlobalToast(type, message, options = {}) {
  if (globalAlertDispatcher?.toast) {
    globalAlertDispatcher.toast[type]?.(message, options);
  }
}

export function triggerGlobalAlert(options) {
  if (globalAlertDispatcher?.showAlert) {
    return globalAlertDispatcher.showAlert(options);
  }
  return Promise.resolve(true);
}

export function triggerGlobalConfirm(options) {
  if (globalAlertDispatcher?.showConfirm) {
    return globalAlertDispatcher.showConfirm(options);
  }
  return Promise.resolve(true);
}

export function AlertProvider({ children }) {
  // Toasts list: Array<{ id, type, title, message, duration }>
  const [toasts, setToasts] = useState([]);

  // Modal dialog state: { isOpen, title, message, type, confirmText, cancelText, resolve, isConfirm }
  const [modal, setModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
    confirmText: "Okay",
    cancelText: "Cancel",
    resolve: null,
    isConfirm: false,
  });

  // ── Toast System ──
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type, message, options = {}) => {
    const id = "toast-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6);
    const newToast = {
      id,
      type, // 'success' | 'error' | 'warning' | 'info'
      title: options.title || (type === "success" ? "Success" : type === "error" ? "Error" : type === "warning" ? "Notice" : "Information"),
      message,
      duration: options.duration ?? 4000,
    };

    setToasts((prev) => [newToast, ...prev].slice(0, 5)); // Keep max 5 visible

    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
    return id;
  }, [removeToast]);

  const toast = useRef({
    success: (msg, opts) => addToast("success", msg, opts),
    error: (msg, opts) => addToast("error", msg, opts),
    warning: (msg, opts) => addToast("warning", msg, opts),
    info: (msg, opts) => addToast("info", msg, opts),
  }).current;

  // Keep ref up to date
  useEffect(() => {
    toast.success = (msg, opts) => addToast("success", msg, opts);
    toast.error = (msg, opts) => addToast("error", msg, opts);
    toast.warning = (msg, opts) => addToast("warning", msg, opts);
    toast.info = (msg, opts) => addToast("info", msg, opts);
  }, [addToast]);

  // ── Modal Alert System ──
  const showAlert = useCallback(({ title = "Alert", message, type = "info", confirmText = "Understood" }) => {
    return new Promise((resolve) => {
      setModal({
        isOpen: true,
        title,
        message,
        type,
        confirmText,
        cancelText: "",
        resolve,
        isConfirm: false,
      });
    });
  }, []);

  // ── Modal Confirm System ──
  const showConfirm = useCallback(({
    title = "Confirm Action",
    message,
    type = "warning",
    confirmText = "Confirm",
    cancelText = "Cancel"
  }) => {
    return new Promise((resolve) => {
      setModal({
        isOpen: true,
        title,
        message,
        type,
        confirmText,
        cancelText,
        resolve,
        isConfirm: true,
      });
    });
  }, []);

  const handleModalConfirm = () => {
    if (modal.resolve) modal.resolve(true);
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleModalCancel = () => {
    if (modal.resolve) modal.resolve(false);
    setModal((prev) => ({ ...prev, isOpen: false }));
  };

  // Keyboard shortcut listener for Modal
  useEffect(() => {
    if (!modal.isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleModalCancel();
      } else if (e.key === "Enter") {
        e.preventDefault();
        handleModalConfirm();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modal.isOpen, modal.resolve]);

  // Register global dispatcher
  useEffect(() => {
    globalAlertDispatcher = {
      toast,
      showAlert,
      showConfirm,
    };
    return () => {
      globalAlertDispatcher = null;
    };
  }, [showAlert, showConfirm]);

  return (
    <AlertContext.Provider value={{ toast, showAlert, showConfirm }}>
      {children}

      {/* ── 1. Floating Toast Stack Container ── */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none select-none">
        {toasts.map((t) => {
          const isSuccess = t.type === "success";
          const isError = t.type === "error";
          const isWarning = t.type === "warning";

          return (
            <div
              key={t.id}
              className={`pointer-events-auto transform transition-all duration-300 animate-in fade-in slide-in-from-top-3 flex items-start gap-3 p-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl ${
                isSuccess
                  ? "bg-[#0d1c16]/95 border-emerald-500/30 text-emerald-100 shadow-emerald-950/40"
                  : isError
                  ? "bg-[#200e14]/95 border-rose-500/30 text-rose-100 shadow-rose-950/40"
                  : isWarning
                  ? "bg-[#1f170a]/95 border-amber-500/30 text-amber-100 shadow-amber-950/40"
                  : "bg-[#0c1322]/95 border-sky-500/30 text-sky-100 shadow-sky-950/40"
              }`}
            >
              {/* Type Icon Badge */}
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${
                  isSuccess
                    ? "bg-emerald-500/20 text-emerald-400"
                    : isError
                    ? "bg-rose-500/20 text-rose-400"
                    : isWarning
                    ? "bg-amber-500/20 text-amber-400"
                    : "bg-sky-500/20 text-sky-400"
                }`}
              >
                {isSuccess && <CheckCircle2 className="w-4 h-4" />}
                {isError && <XCircle className="w-4 h-4" />}
                {isWarning && <AlertTriangle className="w-4 h-4" />}
                {!isSuccess && !isError && !isWarning && <Sparkles className="w-4 h-4" />}
              </div>

              {/* Toast Text Content */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="font-semibold text-xs text-white tracking-wide">{t.title}</div>
                <div className="text-[11px] text-slate-300 mt-0.5 leading-snug break-words">
                  {t.message}
                </div>
              </div>

              {/* Dismiss Button */}
              <button
                onClick={() => removeToast(t.id)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* ── 2. Decorative Modal Alert & Confirm Dialog ── */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className={`relative w-full max-w-md rounded-3xl p-6 sm:p-7 border backdrop-blur-2xl shadow-2xl animate-in zoom-in-95 duration-200 ${
              modal.type === "danger"
                ? "bg-[#140c10]/95 border-rose-500/30 shadow-rose-950/60"
                : modal.type === "warning"
                ? "bg-[#181308]/95 border-amber-500/30 shadow-amber-950/60"
                : modal.type === "success"
                ? "bg-[#091712]/95 border-emerald-500/30 shadow-emerald-950/60"
                : "bg-[#0b1120]/95 border-sky-500/30 shadow-sky-950/60"
            }`}
          >
            {/* Header Icon + Glow Badge */}
            <div className="flex items-center gap-3.5 mb-4">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg ${
                  modal.type === "danger"
                    ? "bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-rose-500/20"
                    : modal.type === "warning"
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-amber-500/20"
                    : modal.type === "success"
                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-emerald-500/20"
                    : "bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-sky-500/20"
                }`}
              >
                {modal.type === "danger" ? (
                  <ShieldAlert className="w-6 h-6" />
                ) : modal.type === "warning" ? (
                  <AlertTriangle className="w-6 h-6" />
                ) : modal.type === "success" ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Info className="w-6 h-6" />
                )}
              </div>

              <div>
                <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  {modal.title}
                </h3>
                <p className="text-[11px] text-slate-400 font-mono">System Notification</p>
              </div>
            </div>

            {/* Message Body */}
            <p className="text-sm text-slate-300 leading-relaxed mb-6 font-sans">
              {modal.message}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/8">
              {modal.isConfirm && (
                <button
                  type="button"
                  onClick={handleModalCancel}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 hover:text-white transition-all cursor-pointer"
                >
                  {modal.cancelText}
                </button>
              )}

              <button
                type="button"
                autoFocus
                onClick={handleModalConfirm}
                className={`px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg active:scale-95 flex items-center gap-1.5 ${
                  modal.type === "danger"
                    ? "bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white shadow-rose-500/25"
                    : modal.type === "warning"
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 shadow-amber-500/25"
                    : modal.type === "success"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-emerald-500/25"
                    : "bg-gradient-to-r from-sky-400 via-indigo-400 to-teal-300 hover:from-sky-300 hover:to-teal-200 text-slate-950 shadow-sky-500/25"
                }`}
              >
                <span>{modal.confirmText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within an AlertProvider");
  }
  return context;
}

