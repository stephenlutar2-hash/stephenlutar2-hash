import { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function DemoBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(localStorage.getItem("szl_demo_mode") === "true");
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-amber-600 to-yellow-500 text-black text-center py-2 px-4 text-sm font-semibold flex items-center justify-center gap-3">
      <span>Demo Mode — Sign up for full access</span>
      <button
        onClick={() => {
          localStorage.removeItem("szl_demo_mode");
          localStorage.removeItem("szl_token");
          localStorage.removeItem("szl_user");
          setVisible(false);
          window.location.href = import.meta.env.BASE_URL + "login";
        }}
        className="ml-2 px-3 py-0.5 rounded bg-black/20 hover:bg-black/30 text-xs font-bold transition"
      >
        Exit Demo
      </button>
      <button onClick={() => setVisible(false)} className="absolute right-3 hover:opacity-70">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
