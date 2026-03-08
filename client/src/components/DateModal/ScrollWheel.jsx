import { useState, useRef, useEffect, useCallback } from 'react';

function ScrollWheel({ items, selected, onSelect, itemHeight = 40 }) {
  const containerHeight = 200;
  const [renderOffset, setRenderOffset] = useState(0);

  const offsetY = useRef(0);
  const velocity = useRef(0);
  const isDragging = useRef(false);
  const lastPointerY = useRef(0);
  const lastPointerTime = useRef(0);
  const animFrameId = useRef(null);
  const containerRef = useRef(null);
  const isSnapping = useRef(false);

  const itemCount = items.length;

  const getItemValue = (item) => (typeof item === 'object' ? item.value : item);
  const getItemLabel = (item) => (typeof item === 'object' ? item.label : String(item));

  const selectedIndex = items.findIndex((item) => getItemValue(item) === selected);

  // Initialize position
  useEffect(() => {
    const idx = items.findIndex((item) => getItemValue(item) === selected);
    if (idx >= 0) {
      offsetY.current = -idx * itemHeight;
      setRenderOffset(offsetY.current);
    }
  }, [selected, items, itemHeight]);

  const cancelAnimation = useCallback(() => {
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }
    isSnapping.current = false;
  }, []);

  const snapToNearest = useCallback(() => {
    isSnapping.current = true;
    const targetIndex = Math.max(0, Math.min(itemCount - 1, Math.round(-offsetY.current / itemHeight)));
    const targetOffset = -targetIndex * itemHeight;

    const step = () => {
      const distance = targetOffset - offsetY.current;
      if (Math.abs(distance) < 0.5) {
        offsetY.current = targetOffset;
        setRenderOffset(offsetY.current);
        isSnapping.current = false;
        const item = items[targetIndex];
        if (item !== undefined) {
          onSelect(getItemValue(item));
        }
        return;
      }
      offsetY.current += distance * 0.12;
      setRenderOffset(offsetY.current);
      animFrameId.current = requestAnimationFrame(step);
    };

    animFrameId.current = requestAnimationFrame(step);
  }, [itemCount, itemHeight, items, onSelect]);

  const runMomentum = useCallback(() => {
    const maxOffset = 0;
    const minOffset = -(itemCount - 1) * itemHeight;

    const step = () => {
      // Rubber-band at boundaries
      if (offsetY.current > maxOffset) {
        const excess = offsetY.current - maxOffset;
        offsetY.current = maxOffset + excess * 0.3;
        velocity.current *= 0.8;
      } else if (offsetY.current < minOffset) {
        const excess = minOffset - offsetY.current;
        offsetY.current = minOffset - excess * 0.3;
        velocity.current *= 0.8;
      }

      velocity.current *= 0.95;
      offsetY.current += velocity.current * 16;
      setRenderOffset(offsetY.current);

      if (Math.abs(velocity.current) < 0.05) {
        snapToNearest();
        return;
      }

      animFrameId.current = requestAnimationFrame(step);
    };

    animFrameId.current = requestAnimationFrame(step);
  }, [itemCount, itemHeight, snapToNearest]);

  const handlePointerDown = useCallback((e) => {
    cancelAnimation();
    isDragging.current = true;
    lastPointerY.current = e.clientY;
    lastPointerTime.current = Date.now();
    velocity.current = 0;
    containerRef.current?.setPointerCapture(e.pointerId);
  }, [cancelAnimation]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging.current) return;
    const deltaY = e.clientY - lastPointerY.current;
    const now = Date.now();
    const dt = now - lastPointerTime.current;

    if (dt > 0) {
      const instantVelocity = deltaY / dt;
      velocity.current = 0.7 * instantVelocity + 0.3 * velocity.current;
    }

    offsetY.current += deltaY;
    setRenderOffset(offsetY.current);

    lastPointerY.current = e.clientY;
    lastPointerTime.current = now;
  }, []);

  const handlePointerUp = useCallback((e) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    containerRef.current?.releasePointerCapture(e.pointerId);

    if (Math.abs(velocity.current) > 0.05) {
      runMomentum();
    } else {
      snapToNearest();
    }
  }, [runMomentum, snapToNearest]);

  const handlePointerCancel = useCallback((e) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    containerRef.current?.releasePointerCapture(e.pointerId);
    snapToNearest();
  }, [snapToNearest]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="touch-none select-none overflow-hidden relative"
      style={{ height: containerHeight }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <div
        style={{
          transform: `translateY(${renderOffset + containerHeight / 2 - itemHeight / 2}px)`,
        }}
      >
        {items.map((item, index) => {
          const distFromSelected = Math.abs(index - selectedIndex);
          let opacity = 0.15;
          if (distFromSelected === 0) opacity = 1;
          else if (distFromSelected === 1) opacity = 0.5;
          else if (distFromSelected === 2) opacity = 0.3;

          const isActive = distFromSelected === 0;

          return (
            <div
              key={getItemValue(item)}
              className="flex items-center justify-center"
              style={{
                height: itemHeight,
                opacity,
                fontWeight: isActive ? 600 : 400,
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                color: isActive ? 'var(--color-primary, #0B1431)' : undefined,
                transition: isDragging.current ? 'none' : 'opacity 0.15s, transform 0.15s',
                fontSize: '15px',
              }}
            >
              {getItemLabel(item)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ScrollWheel;
