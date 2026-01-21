# 🎨 Semantic Color Token System

> **Version:** 1.0  
> **Last Updated:** 2025-12-06  
> **Status:** Active

---

## 📖 Overview

The Open Data Sharing Platform uses a **semantic color token system** built on CSS variables and Tailwind CSS. This approach provides:

- ✅ **Consistent theming** across the application
- ✅ **Automatic light/dark mode** support
- ✅ **Easy theme customization** (5 theme variants included)
- ✅ **Maintainable codebase** - change colors in one place
- ✅ **Type-safe** integration with Tailwind utilities

---

## 🎯 Token Categories

### 1. Primary Colors
Brand colors that identify your application and primary actions.

| Token | Usage | Examples |
|-------|-------|----------|
| `primary` | Primary buttons, links, active states | Call-to-action buttons, selected items |
| `primary-hover` | Hover state for primary elements | Button hover effects |
| `primary-active` | Active/pressed state | Button click states |

**Example:**
```tsx
<button className="bg-primary hover:bg-primary-hover active:bg-primary-active text-white">
  Save
</button>
```

---

### 2. Surface Colors
Background colors for various UI surfaces and elevations.

| Token | Usage | Examples |
|-------|-------|----------|
| `surface` | Main background | Page background, main content area |
| `surface-elevated` | Elevated surfaces | Modals, dropdowns, popovers |
| `surface-elevated-hover` | Hover state for elevated surfaces | Menu item hover |
| `surface-card` | Card backgrounds | Data cards, panels |

**Example:**
```tsx
<div className="bg-surface min-h-screen">
  <div className="bg-surface-card p-6 rounded-lg">
    {/* Card content */}
  </div>
</div>
```

---

### 3. Border Colors
Consistent border colors that adapt to light/dark modes.

| Token | Usage | Examples |
|-------|-------|----------|
| `surface-border` | Standard borders | Dividers, card borders, input borders |
| `surface-border-subtle` | Subtle borders | Table cell borders, light separators |

**Example:**
```tsx
<div className="border border-surface-border rounded-lg">
  <div className="border-b border-surface-border-subtle pb-4">Header</div>
  <div className="pt-4">Content</div>
</div>
```

---

### 4. Text Colors
Hierarchical text colors for different levels of emphasis.

| Token | Usage | Examples |
|-------|-------|----------|
| `text-primary` | Primary text, headings | H1, H2, body text |
| `text-secondary` | Secondary text, labels | Form labels, captions |
| `text-tertiary` | Disabled text, placeholders | Placeholder text, muted info |

**Example:**
```tsx
<div>
  <h2 className="text-text-primary font-bold">Title</h2>
  <p className="text-text-secondary">Description</p>
  <span className="text-text-tertiary">Last updated 2 hours ago</span>
</div>
```

---

### 5. Status Colors
Semantic colors for feedback and state indication.

#### Success
| Token | Usage |
|-------|-------|
| `success` | Success text/icons |
| `success-bg` | Success background |
| `success-border` | Success border |

#### Error
| Token | Usage |
|-------|-------|
| `error` | Error text/icons |
| `error-bg` | Error background |
| `error-border` | Error border |

#### Warning
| Token | Usage |
|-------|-------|
| `warning` | Warning text/icons |
| `warning-bg` | Warning background |
| `warning-border` | Warning border |

#### Info
| Token | Usage |
|-------|-------|
| `info` | Info text/icons |
| `info-bg` | Info background |
| `info-border` | Info border |

**Example:**
```tsx
// Success message
<div className="border border-success-border bg-success-bg rounded p-4">
  <span className="text-success">✓ Data saved successfully</span>
</div>

// Error message
<div className="border border-error-border bg-error-bg rounded p-4">
  <span className="text-error">✗ Failed to save data</span>
</div>

// Warning message
<div className="border border-warning-border bg-warning-bg rounded p-4">
  <span className="text-warning">⚠ This action cannot be undone</span>
</div>

// Info message
<div className="border border-info-border bg-info-bg rounded p-4">
  <span className="text-info">ℹ Account requires verification</span>
</div>
```

---

### 6. Muted/Disabled States
Colors for inactive or disabled UI elements.

| Token | Usage | Examples |
|-------|-------|----------|
| `muted` | Muted text | Disabled labels, inactive states |
| `muted-bg` | Muted backgrounds | Disabled button backgrounds |
| `disabled` | Disabled elements | Disabled form inputs |

**Example:**
```tsx
<button disabled className="bg-muted-bg text-disabled cursor-not-allowed">
  Submit
</button>
```

---

### 7. Interactive States
Special tokens for focus and hover effects.

| Token | Usage |
|-------|-------|
| `focus-ring` | Focus ring color (keyboard navigation) |
| `hover-overlay` | Subtle overlay for hover effects |

**Example:**
```tsx
<button className="focus:ring-2 focus:ring-focus-ring relative
                   hover:before:absolute hover:before:inset-0 
                   hover:before:bg-hover-overlay">
  Interactive Button
</button>
```

---

## 🌈 Theme Variants

The application supports 5 theme variants. Only the primary colors change between themes - all other tokens remain consistent.

| Theme | Primary Color | Use Case |
|-------|--------------|----------|
| **Blue** (default) | `#137fec` | Professional, trustworthy |
| **Purple** | `#a855f7` | Creative, innovative |
| **Green** | `#10b981` | Growth, success-oriented |
| **Orange** | `#f97316` | Energetic, bold |
| **Red** | `#dc2626` | Urgent, high-priority |

**Usage:**
```tsx
// Set theme via data attribute on html or body
<html data-theme="purple">
```

---

## 🌓 Light/Dark Mode

All color tokens automatically adapt to the current mode.

**Toggle mode:**
```tsx
// Set mode via data attribute
<html data-mode="light"> // or "dark"
```

---

## ✅ Best Practices

### DO:
- ✅ **Always use semantic tokens** instead of hardcoded colors
- ✅ **Use status colors appropriately** - error for errors, success for success, etc.
- ✅ **Test in both light and dark modes** before committing
- ✅ **Use text hierarchy** - primary for headings, secondary for body, tertiary for muted
- ✅ **Leverage Tailwind utilities** - `bg-primary`, `text-error`, `border-surface-border`

### DON'T:
- ❌ **Never use hardcoded Tailwind colors** - `bg-red-500`, `text-blue-600`, etc.
- ❌ **Don't add `dark:` variants manually** - tokens handle mode switching
- ❌ **Don't use hex colors directly** - `#137fec` → use `bg-primary` instead
- ❌ **Don't create custom colors without adding to the token system**

---

## 🔄 Migration Guide

### From Hardcoded Colors to Semantic Tokens

**Before:**
```tsx
<div className="bg-red-50 border border-red-200 dark:bg-red-900/10 dark:border-red-900/20">
  <p className="text-gray-900 dark:text-gray-100">Title</p>
  <p className="text-gray-600 dark:text-gray-400">Description</p>
  <button className="bg-blue-600 hover:bg-blue-700 text-white">Action</button>
</div>
```

**After:**
```tsx
<div className="bg-error-bg border border-error-border">
  <p className="text-text-primary">Title</p>
  <p className="text-text-secondary">Description</p>
  <button className="bg-primary hover:bg-primary-hover text-white">Action</button>
</div>
```

**Benefits:**
- ✅ Less verbose (no dark: variants needed)
- ✅ Automatically adapts to theme and mode
- ✅ Easier to maintain
- ✅ More semantic and readable

---

## 🛠 Adding New Tokens

If you need a new semantic token:

### 1. Add CSS Variable
In `src/index.css`:

```css
:root {
  /* Your new token */
  --color-your-token: 200 50% 50%;
}

[data-mode="light"] {
  /* Light mode override if needed */
  --color-your-token: 200 50% 60%;
}
```

### 2. Map to Tailwind
In `tailwind.config.js`:

```javascript
colors: {
  'your-token': 'hsl(var(--color-your-token) / <alpha-value>)',
}
```

### 3. Use in Components
```tsx
<div className="bg-your-token">Content</div>
```

---

## 📊 Color Values Reference

### Dark Mode (Default)
```css
/* Primary */
--color-primary: 207 89% 61% → hsl(207, 89%, 61%) → #137fec

/* Surfaces */
--color-surface: 216 33% 10% → #101922 (main bg)
--color-surface-elevated: 216 30% 14%
--color-surface-card: 216 28% 16%

/* Text */
--color-text-primary: 0 0% 100% → white
--color-text-secondary: 215 20% 65%
--color-text-tertiary: 215 15% 50%

/* Status */
--color-success: 142 76% 36% → green
--color-error: 0 84% 60% → red
--color-warning: 38 92% 50% → amber
--color-info: 199 89% 48% → cyan
```

### Light Mode
```css
/* Surfaces */
--color-surface: 0 0% 98% → very light gray
--color-surface-elevated: 0 0% 100% → white
--color-surface-card: 0 0% 100% → white

/* Text */
--color-text-primary: 0 0% 9% → near black
--color-text-secondary: 215 16% 47%
--color-text-tertiary: 215 13% 65%
```

---

## 🧪 Testing Checklist

Before deploying changes:

- [ ] Test component in **light mode**
- [ ] Test component in **dark mode**
- [ ] Test with all **5 theme variants** (blue, purple, green, orange, red)
- [ ] Verify **focus states** are visible (keyboard navigation)
- [ ] Check **hover states** work correctly
- [ ] Ensure **contrast ratios** meet WCAG AA standards
- [ ] No hardcoded colors remain (`bg-red-500`, `text-blue-600`, etc.)

---

## 🔗 Related Files

| File | Purpose |
|------|---------|
| [`src/index.css`](../../../frontend/src/index.css) | CSS variable definitions |
| [`tailwind.config.js`](../../../frontend/tailwind.config.js) | Tailwind token mappings |
| [`ThemeSelector.tsx`](../../../frontend/src/components/ThemeSelector.tsx) | Theme switching UI |
| [`ModeToggle.tsx`](../../../frontend/src/components/ModeToggle.tsx) | Light/dark mode toggle |

---

## 📝 Examples Gallery

### Button Variants
```tsx
// Primary action
<button className="bg-primary hover:bg-primary-hover text-white">Primary</button>

// Error action
<button className="bg-error hover:opacity-90 text-white">Delete</button>

// Success action
<button className="bg-success hover:opacity-90 text-white">Confirm</button>

// Muted/disabled
<button className="bg-muted-bg text-disabled cursor-not-allowed" disabled>Disabled</button>
```

### Alert Components
```tsx
// Success alert
<div className="bg-success-bg border border-success-border rounded-lg p-4">
  <div className="flex items-center gap-2 text-success">
    <span className="material-symbols-outlined">check_circle</span>
    <span className="font-medium">Success!</span>
  </div>
  <p className="text-text-secondary mt-1">Your changes have been saved.</p>
</div>

// Error alert  
<div className="bg-error-bg border border-error-border rounded-lg p-4">
  <div className="flex items-center gap-2 text-error">
    <span className="material-symbols-outlined">error</span>
    <span className="font-medium">Error!</span>
  </div>
  <p className="text-text-secondary mt-1">Something went wrong.</p>
</div>

// Warning alert
<div className="bg-warning-bg border border-warning-border rounded-lg p-4">
  <div className="flex items-center gap-2 text-warning">
    <span className="material-symbols-outlined">warning</span>
    <span className="font-medium">Warning!</span>
  </div>
  <p className="text-text-secondary mt-1">This action cannot be undone.</p>
</div>

// Info alert
<div className="bg-info-bg border border-info-border rounded-lg p-4">
  <div className="flex items-center gap-2 text-info">
    <span className="material-symbols-outlined">info</span>
    <span className="font-medium">Info</span>
  </div>
  <p className="text-text-secondary mt-1">Account verification required.</p>
</div>
```

### Form Elements
```tsx
<div className="space-y-2">
  <label className="text-text-secondary text-sm font-medium">Email</label>
  <input 
    type="email"
    className="w-full px-3 py-2 bg-surface-elevated border border-surface-border 
               rounded-lg text-text-primary placeholder:text-text-tertiary
               focus:outline-none focus:ring-2 focus:ring-focus-ring"
    placeholder="you@example.com"
  />
  <p className="text-text-tertiary text-xs">We'll never share your email.</p>
</div>
```

### Cards
```tsx
<div className="bg-surface-card border border-surface-border rounded-lg p-6 
                hover:border-primary transition-colors">
  <h3 className="text-text-primary font-semibold text-lg mb-2">Card Title</h3>
  <p className="text-text-secondary mb-4">Card description goes here.</p>
  <button className="text-primary hover:text-primary-hover font-medium">
    Learn More →
  </button>
</div>
```

---

## 🎓 Learning Resources

- [Tailwind CSS Custom Colors](https://tailwindcss.com/docs/customizing-colors)
- [CSS Custom Properties (Variables)](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [HSL Color Format](https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/hsl)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)

---

**Questions or need help?** Contact the development team or refer to the implementation in existing components like `ErrorFallback.tsx`.
