"use client";
import { useRef, useEffect, useCallback } from "react";

type Props = {
  onChange: (dataUrl: string) => void;
  label?: string;
};

export default function SignaturePad({ onChange, label }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const getPos = (e: PointerEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange("");
  }, [onChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const onDown = (e: PointerEvent) => {
      drawing.current = true;
      lastPos.current = getPos(e);
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!drawing.current) return;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      lastPos.current = pos;
    };
    const onUp = () => {
      drawing.current = false;
      onChange(canvas.toDataURL());
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointerleave", onUp);
    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerleave", onUp);
    };
  }, [onChange]);

  return (
    <div>
      {label && <p className="text-sm text-gray-500 mb-1">{label}</p>}
      <canvas
        ref={canvasRef}
        width={520}
        height={140}
        className="border border-gray-200 rounded-lg bg-gray-50 w-full touch-none cursor-crosshair"
        style={{ maxWidth: "100%" }}
      />
      <button
        type="button"
        onClick={clear}
        className="mt-1 text-xs text-gray-400 underline"
      >
        נקה חתימה
      </button>
    </div>
  );
}
