import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";

interface MobileSheetProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  snapPoints?: number[];
}

export function MobileSheet({ open, onClose, children, title, snapPoints = [0.5, 0.9] }: MobileSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(0);
  const [dragY, setDragY] = useState(0);
  const startY = useRef(0);
  const dragging = useRef(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setCurrentSnap(0);
      setDragY(0);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const sheetHeight = typeof window !== "undefined"
    ? window.innerHeight * snapPoints[currentSnap]
    : 400;

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    dragging.current = true;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!dragging.current) return;
    const delta = e.touches[0].clientY - startY.current;
    setDragY(Math.max(0, delta));
  }, []);

  const handleTouchEnd = useCallback(() => {
    dragging.current = false;
    if (dragY > 100) {
      if (currentSnap === 0) {
        onClose();
      } else {
        setCurrentSnap(Math.max(0, currentSnap - 1));
      }
    } else if (dragY < -50 && currentSnap < snapPoints.length - 1) {
      setCurrentSnap(currentSnap + 1);
    }
    setDragY(0);
  }, [dragY, currentSnap, onClose, snapPoints.length]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out safe-bottom"
        style={{
          height: sheetHeight,
          transform: `translateY(${dragY}px)`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-muted-foreground/30" />
        </div>
        {title && (
          <div className="px-6 pb-3 border-b border-border">
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
        )}
        <div className="overflow-y-auto flex-1 px-6 py-4" style={{ maxHeight: sheetHeight - 80 }}>
          {children}
        </div>
      </div>
    </>
  );
}
