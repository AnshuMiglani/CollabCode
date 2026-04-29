import { useCallback } from "react";

export default function ResizableDivider({ onResize, direction = "horizontal" }) {
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();

    let prevPos = direction === "horizontal" ? e.clientX : e.clientY;

    const onMouseMove = (moveEvent) => {
      const currentPos = direction === "horizontal"
        ? moveEvent.clientX
        : moveEvent.clientY;

      const delta = currentPos - prevPos;
      prevPos = currentPos; // 🔥 KEY FIX

      onResize(delta);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  }, [onResize, direction]);

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`
        shrink-0 bg-[#333] hover:bg-[#61dafb] transition-colors z-10
        ${direction === "horizontal"
          ? "w-1 cursor-col-resize"
          : "h-1 cursor-row-resize"}
      `}
    />
  );
}