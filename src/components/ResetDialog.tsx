import { useEffect, useRef } from 'react';

interface ResetDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  error?: string;
}

export function ResetDialog({ open, onCancel, onConfirm, error }: ResetDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      previousFocusRef.current = document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
      dialog.showModal();
      cancelRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
      previousFocusRef.current?.focus();
    }
  }, [open]);

  useEffect(() => () => {
    if (dialogRef.current?.open) dialogRef.current.close();
    previousFocusRef.current?.focus();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="reset-dialog"
      aria-labelledby="reset-title"
      aria-describedby="reset-description"
      onKeyDown={(event) => {
        if (event.key !== 'Tab') return;

        if (event.shiftKey && document.activeElement === cancelRef.current) {
          event.preventDefault();
          confirmRef.current?.focus();
        } else if (!event.shiftKey && document.activeElement === confirmRef.current) {
          event.preventDefault();
          cancelRef.current?.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onCancel();
      }}
    >
      <p className="eyebrow">شروع یک مسیر تازه</p>
      <h2 id="reset-title">ماجراجویی را از اول شروع کنیم؟</h2>
      <p id="reset-description">
        پیشرفت ذخیره‌شده پاک می‌شود و به ابتدای مسیر برمی‌گردی. این کار قابل برگشت نیست.
      </p>
      {error && <p className="dialog-error" role="alert">{error}</p>}
      <div className="dialog-actions">
        <button ref={cancelRef} type="button" className="button button-primary" onClick={onCancel}>
          نه، ادامه می‌دهم
        </button>
        <button ref={confirmRef} type="button" className="button button-danger" onClick={onConfirm}>
          بله، از اول شروع کن
        </button>
      </div>
    </dialog>
  );
}
