"use client";

import { useState, useCallback } from "react";

export default function useToast() {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((msg, type = "info") => {
    const id = Date.now();

    setToasts((p) => [...p, { id, msg, type }]);

    setTimeout(() => {
      setToasts((p) => p.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  return { toasts, show };
}
