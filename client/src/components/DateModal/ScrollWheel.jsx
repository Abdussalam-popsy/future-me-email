import { useState, useRef, useEffect, useCallback } from 'react';

const VISIBLE_ITEMS = 5;
const ROTATION_PER_ITEM = 24; // degrees each item spans on the cylinder
const DECELERATION = 0.003; // exponential deceleration rate (px/ms²)
const SPRING_STIFFNESS = 0.12;
const SPRING_DAMPING = 0.72;
const RUBBER_BAND_FACTOR = 0.35;

function ScrollWheel({ items, selected, onSelect, itemHeight = 40 }) {
  const containerHeight = itemHeight * VISIBLE_ITEMS;
  const [renderOffset, setRenderOffset] = useState(0);

  const offsetY = useRef(0);
  const velocity = useRef(0);
  const isDragging = useRef(false);
  const lastPointerY = useRef(0);
  const lastPointerTime = useRef(0);
  const animFrameId = useRef(null);
  const containerRef = useRef(null);
  const springVelocity = useRef(0);
  const lastSnappedIndex = useRef(-1);

  const itemCount = items.length;
  const maxOffset = 0;
  const minOffset = -(itemCount - 1) * itemHeight;

  const getItemValue = (item) => (typeof item === 'object' ? item.value : item);
  const getItemLabel = (item) => (typeof item === 'object' ? item.label : String(item));

  // Initialize position from selected prop
  useEffect(() => {
    const idx = items.findIndex((item) => getItemValue(item) === selected);
    if (idx >= 0) {
      offsetY.current = -idx * itemHeight;
      setRenderOffset(offsetY.current);
      lastSnappedIndex.current = idx;
    }
  }, [selected, items, itemHeight]);

  const cancelAnimation = useCallback(() => {
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }
  }, []);

  const tryHaptic = useCallback(() => {
    if (navigator.vibrate) {
      navigator.vibrate(1);
    }
  }, []);

  const snapToNearest = useCallback(() => {
    const targetIndex = Math.max(0, Math.min(itemCount - 1, Math.round(-offsetY.current / itemHeight)));
    const targetOffset = -targetIndex * itemHeight;
    springVelocity.current = 0;

    const step = () => {
      const displacement = targetOffset - offsetY.current;

      if (Math.abs(displacement) < 0.3 && Math.abs(springVelocity.current) < 0.1) {
        offsetY.current = targetOffset;
        setRenderOffset(targetOffset);

        if (targetIndex !== lastSnappedIndex.current) {
          lastSnappedIndex.current = targetIndex;
          tryHaptic();
        }

        const item = items[targetIndex];
        if (item !== undefined) {
          onSelect(getItemValue(item));
        }
        return;
      }

      // Critically-damped spring: F = -kx - cv
      const springForce = SPRING_STIFFNESS * displacement;
      const dampingForce = -SPRING_DAMPING * springVelocity.current;
      springVelocity.current += springForce + dampingForce;
      offsetY.current += springVelocity.current;

      setRenderOffset(offsetY.current);
      animFrameId.current = requestAnimationFrame(step);
    };

    animFrameId.current = requestAnimationFrame(step);
  }, [itemCount, itemHeight, items, onSelect, tryHaptic]);

  const runMomentum = useCallback(() => {
    let v = velocity.current * 1000; // convert from px/ms to px/s
    const startTime = performance.now();
    const startOffset = offsetY.current;
    const direction = v > 0 ? 1 : -1;
    const v0 = Math.abs(v);

    const step = (now) => {
      const elapsed = (now - startTime) / 1000; // seconds

      // Exponential deceleration: v(t) = v0 * e^(-k*t)
      const k = DECELERATION * 1000;
      const currentV = v0 * Math.exp(-k * elapsed);

      // Integral of v0*e^(-kt) = (v0/k)(1 - e^(-kt))
      const distance = (v0 / k) * (1 - Math.exp(-k * elapsed));
      let newOffset = startOffset + direction * distance;

      // Rubber-band at boundaries
      if (newOffset > maxOffset) {
        const excess = newOffset - maxOffset;
        newOffset = maxOffset + excess * RUBBER_BAND_FACTOR * Math.exp(-excess * 0.01);
      } else if (newOffset < minOffset) {
        const excess = minOffset - newOffset;
        newOffset = minOffset - excess * RUBBER_BAND_FACTOR * Math.exp(-excess * 0.01);
      }

      offsetY.current = newOffset;
      setRenderOffset(newOffset);

      // Check if we crossed a snap boundary for haptic
      const nearestIndex = Math.round(-newOffset / itemHeight);
      if (nearestIndex !== lastSnappedIndex.current && nearestIndex >= 0 && nearestIndex < itemCount) {
        lastSnappedIndex.current = nearestIndex;
        tryHaptic();
      }

      // Stop when velocity is negligible or we've overshot boundaries
      if (currentV < 20 || newOffset > maxOffset + itemHeight || newOffset < minOffset - itemHeight) {
        velocity.current = 0;
        snapToNearest();
        return;
      }

      animFrameId.current = requestAnimationFrame(step);
    };

    animFrameId.current = requestAnimationFrame(step);
  }, [itemCount, itemHeight, maxOffset, minOffset, snapToNearest, tryHaptic]);

  const handlePointerDown = useCallback((e) => {
    cancelAnimation();
    isDragging.current = true;
    lastPointerY.current = e.clientY;
    lastPointerTime.current = performance.now();
    velocity.current = 0;
    springVelocity.current = 0;
    containerRef.current?.setPointerCapture(e.pointerId);
  }, [cancelAnimation]);

  const handlePointerMove = useCallback((e) => {
    if (!isDragging.current) return;

    const deltaY = e.clientY - lastPointerY.current;
    const now = performance.now();
    const dt = now - lastPointerTime.current;

    if (dt > 0) {
      const instantV = deltaY / dt; // px/ms
      velocity.current = 0.6 * instantV + 0.4 * velocity.current;
    }

    let newOffset = offsetY.current + deltaY;

    // Rubber-band resistance while dragging past boundaries
    if (newOffset > maxOffset) {
      const excess = newOffset - maxOffset;
      newOffset = maxOffset + excess * RUBBER_BAND_FACTOR;
    } else if (newOffset < minOffset) {
      const excess = minOffset - newOffset;
      newOffset = minOffset - excess * RUBBER_BAND_FACTOR;
    }

    offsetY.current = newOffset;
    setRenderOffset(newOffset);

    lastPointerY.current = e.clientY;
    lastPointerTime.current = now;
  }, [maxOffset, minOffset]);

  const handlePointerUp = useCallback((e) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    containerRef.current?.releasePointerCapture(e.pointerId);

    // If the last move was too long ago, velocity is stale
    const timeSinceLastMove = performance.now() - lastPointerTime.current;
    if (timeSinceLastMove > 80) {
      velocity.current = 0;
    }

    if (Math.abs(velocity.current) > 0.08) {
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

  // Compute the center index from current scroll offset (continuous, not snapped)
  const centerIndex = -renderOffset / itemHeight;

  return (
    <div
      ref={containerRef}
      className="touch-none select-none overflow-hidden relative cursor-grab active:cursor-grabbing"
      style={{
        height: containerHeight,
        // Gradient mask for smooth edge fading
        maskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 25%, black 75%, transparent 100%)',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      {/* 3D cylinder container */}
      <div
        style={{
          perspective: '800px',
          perspectiveOrigin: '50% 50%',
          height: '100%',
          position: 'relative',
        }}
      >
        {items.map((item, index) => {
          // Distance from visual center (continuous, in item units)
          const distFromCenter = index - centerIndex;

          // Only render items within visible range for performance
          if (Math.abs(distFromCenter) > VISIBLE_ITEMS) return null;

          // 3D cylinder rotation
          const rotateX = distFromCenter * ROTATION_PER_ITEM;

          // Opacity falls off with distance from center
          const absRotation = Math.abs(rotateX);
          const opacity = Math.max(0, 1 - absRotation / (ROTATION_PER_ITEM * 2.5));

          // Scale items at center slightly larger
          const scale = 1 + 0.08 * Math.max(0, 1 - Math.abs(distFromCenter));

          // Font weight: bold near center
          const isNearCenter = Math.abs(distFromCenter) < 0.5;

          // Vertical position on the cylinder surface
          const cylinderRadius = containerHeight / 2;
          const yPos = Math.sin((rotateX * Math.PI) / 180) * cylinderRadius;

          return (
            <div
              key={getItemValue(item)}
              className="flex items-center justify-center absolute left-0 right-0"
              style={{
                height: itemHeight,
                top: '50%',
                marginTop: -itemHeight / 2,
                transform: `translateY(${yPos}px) perspective(800px) rotateX(${-rotateX}deg) scale(${scale})`,
                transformOrigin: 'center center',
                opacity,
                fontWeight: isNearCenter ? 600 : 400,
                color: isNearCenter ? '#0B1431' : '#9198B2',
                fontSize: '16px',
                letterSpacing: '0.02em',
                willChange: 'transform, opacity',
                backfaceVisibility: 'hidden',
                pointerEvents: 'none',
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
