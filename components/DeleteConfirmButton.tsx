"use client";

import { useState } from "react";

export default function DeleteConfirmButton({ label }: { label: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  
  if (showConfirm) {
    return (
      <span className="delete-confirm">
        <span className="delete-confirm-text">ER DU SIKKER?</span>
        <button type="submit" className="studio-button-quiet delete-yes">JA</button>
        <button type="button" className="studio-button-quiet delete-no" onClick={() => setShowConfirm(false)}>NEJ</button>
      </span>
    );
  }
  
  return (
    <button type="button" className="studio-button-quiet delete-trigger" onClick={() => setShowConfirm(true)}>
      {label}
    </button>
  );
}
