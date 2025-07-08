import React, { useRef, useCallback, useEffect } from 'react';

interface JoystickProps {
  size?: number;
  handleSize?: number;
  onMove: (vector: { x: number; y: number }) => void;
  onEnd: () => void;
}

const Joystick: React.FC<JoystickProps> = ({
  size = 120,
  handleSize = 50,
  onMove,
  onEnd,
}) => {
    const baseRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<HTMLDivElement>(null);
    const touchId = useRef<number | null>(null);

    const move = useCallback((touch: Touch) => {
        const base = baseRef.current;
        if (!base) return;

        const rect = base.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let x = touch.clientX - centerX;
        let y = touch.clientY - centerY;

        const distance = Math.sqrt(x * x + y * y);
        const radius = size / 2;

        const clampedX = distance === 0 ? 0 : (x / distance) * Math.min(distance, radius);
        const clampedY = distance === 0 ? 0 : (y / distance) * Math.min(distance, radius);

        const handle = handleRef.current;
        if (handle) {
            handle.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
            handle.style.transition = 'none';
        }
        onMove({ x: clampedX / radius, y: clampedY / radius });
    }, [size, onMove]);

    const end = useCallback(() => {
        touchId.current = null;
        const handle = handleRef.current;
        if (handle) {
            handle.style.transform = 'translate(0px, 0px)';
            handle.style.transition = 'transform 0.1s ease-out';
        }
        onEnd();
    }, [onEnd]);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        e.preventDefault();
        const currentTouch = Array.from(e.changedTouches).find(t => t.identifier === touchId.current);
        if (currentTouch) {
            move(currentTouch);
        }
    }, [move]);

    const handleTouchEnd = useCallback((e: TouchEvent) => {
        const endedTouch = Array.from(e.changedTouches).find(t => t.identifier === touchId.current);
        if (endedTouch) {
            end();
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('touchcancel', handleTouchEnd);
        }
    }, [end, handleTouchMove]);

    const handleTouchStart = useCallback((e: TouchEvent) => {
        if (touchId.current === null) {
            const newTouch = e.changedTouches[0];
            touchId.current = newTouch.identifier;
            move(newTouch);

            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleTouchEnd, { passive: false });
            window.addEventListener('touchcancel', handleTouchEnd, { passive: false });
        }
    }, [move, handleTouchMove, handleTouchEnd]);

    useEffect(() => {
        const base = baseRef.current;
        if (base) {
            base.addEventListener('touchstart', handleTouchStart, { passive: true });
        }
        return () => {
            if (base) {
                base.removeEventListener('touchstart', handleTouchStart);
            }
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd]);


  return (
    <div
      ref={baseRef}
      style={{ width: `${size}px`, height: `${size}px` }}
      className="rounded-full bg-black/30 border-2 border-cyan-400/50 backdrop-blur-sm flex justify-center items-center relative"
    >
      <div 
        ref={handleRef}
        style={{ width: `${handleSize}px`, height: `${handleSize}px` }} 
        className="rounded-full bg-cyan-400/80 absolute pointer-events-none"
      />
    </div>
  );
};

export default Joystick;
