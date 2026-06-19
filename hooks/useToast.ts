"use client";

import { useState, useCallback } from "react";

export default function useToast() {
  const [toasts, setToasts] = useState<any>([]);

  const show = useCallback((msg: any, type = "info") => {
    const id = Date.now();

    setToasts((p: any) => [...p, { id, msg, type }]);

    setTimeout(() => {
      setToasts((p: any) => p.filter((t: any) => t.id !== id));
    }, 3000);
  }, []);

  return { toasts, show };
}
