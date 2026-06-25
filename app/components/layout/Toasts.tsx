"use client";
interface Toast {
  id: string | number;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

interface ToastsProps {
  toasts: Toast[];
}
export default function Toasts({ toasts }: ToastsProps) {
  console.log("Toasts:", toasts);
  return (
    <div className="toast-wrap">
      {toasts.map((t: any) => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.msg}
        </div>
      ))}
    </div>
  );
}
