# Clip-Path Tab Animation Technique

Source: Design Engineering course (animations.dev)
Applied in: DateModal.jsx tab bar (Date | Relative time | Custom time)

---

## How it works

Instead of animating a background pill sliding under the active tab,
this technique layers two identical tab bars on top of each other:

- **Bottom layer** — default styling (dark text, transparent background)
- **Top layer** — inverted styling (white text, colored background)

The top layer has a `clip-path` that reveals ONLY the region of the active tab.
When the active tab changes, the clip-path animates to the new tab's position.

The result: color appears to "fill" the active tab rather than a background
sliding around. Much more refined and premium feeling.

---

## Core logic

```jsx
useEffect(() => {
  const container = containerRef.current;

  if (activeTab && container) {
    const activeTabElement = activeTabElementRef.current;

    if (activeTabElement) {
      const { offsetLeft, offsetWidth } = activeTabElement;

      const clipLeft = offsetLeft;
      const clipRight = offsetLeft + offsetWidth;

      container.style.clipPath = `inset(0 ${Number(
        100 - (clipRight / container.offsetWidth) * 100,
      ).toFixed()}% 0 ${Number(
        (clipLeft / container.offsetWidth) * 100,
      ).toFixed()}% round 17px)`;
    }
  }
}, [activeTab, activeTabElementRef, containerRef]);
```

---

## Structure

```jsx
<div className="wrapper">
  {/* Bottom layer — default */}
  <ul className="list">
    {TABS.map((tab) => (
      <li key={tab.name}>
        <button
          ref={activeTab === tab.name ? activeTabElementRef : null}
          onClick={() => setActiveTab(tab.name)}
        >
          {tab.icon}
          {tab.name}
        </button>
      </li>
    ))}
  </ul>

  {/* Top layer — colored overlay, clipped to active tab */}
  <div aria-hidden className="clip-path-container" ref={containerRef}>
    <ul className="list list-overlay">
      {TABS.map((tab) => (
        <li key={tab.name}>
          <button tabIndex={-1} onClick={() => setActiveTab(tab.name)}>
            {tab.icon}
            {tab.name}
          </button>
        </li>
      ))}
    </ul>
  </div>
</div>
```

---

## CSS

```css
.clip-path-container {
  position: absolute;
  z-index: 10;
  width: 100%;
  overflow: hidden;
  transition: clip-path 0.25s ease;
  clip-path: inset(0px 75% 0px 0% round 17px);
}

.list-overlay {
  background: #2090ff; /* or your accent color */
}

.button-overlay {
  color: #fff;
}
```

---

## Key details

- `tabIndex={-1}` on the overlay buttons — they're aria-hidden,
  so keyboard users don't tab through them twice
- `round 17px` in inset() matches the pill border-radius
- Transition only on `clip-path`, not the whole container
- The two lists must be pixel-identical in size and position
- `toFixed()` without args rounds to 0 decimal places — keeps the
  clip-path values clean

---

## Where this is used

- `DateModal.jsx` — the three-tab bar at the bottom of the date picker modal
