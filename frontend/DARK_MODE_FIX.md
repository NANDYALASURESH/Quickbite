# Dark Mode Quick Fix Guide

## Issue
The dark/white theme toggle button wasn't working - clicking it didn't change the theme.

## Root Causes
1. **Tailwind v4 Configuration**: The project uses Tailwind CSS v4 which has a different configuration approach
2. **CSS Variables Format**: Variables needed to be in RGB format for Tailwind's `rgb()` function
3. **Missing @theme directive**: Tailwind v4 requires `@theme` directive for dark mode support

## Fixes Applied

### 1. Updated `index.css`
```css
/* Added Tailwind v4 dark mode configuration */
@theme {
  --color-scheme: light dark;
}

/* Changed CSS variables to RGB format */
:root {
  --bg-primary: 255 255 255;  /* was #ffffff */
  --text-primary: 17 24 39;   /* was #111827 */
  /* ... */
}

.dark {
  --bg-primary: 17 24 39;     /* was #111827 */
  --text-primary: 249 250 251; /* was #f9fafb */
  /* ... */
  color-scheme: dark;
  background-color: rgb(var(--bg-primary));
  color: rgb(var(--text-primary));
}
```

### 2. Updated `index.html`
```html
<!-- Added id for easier targeting -->
<html lang="en" id="app-root">
```

### 3. ThemeContext Already Correct
The `ThemeContext.jsx` was already correctly toggling the `dark` class on `document.documentElement`.

## How to Use Dark Mode in Components

### Using Tailwind's dark: variant
```jsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Content
</div>
```

### Using CSS Variables
```jsx
<div style={{ backgroundColor: 'rgb(var(--bg-primary))' }}>
  Content
</div>
```

## Testing
1. Click the Sun/Moon icon in the navbar
2. The theme should toggle between light and dark
3. The preference is saved in localStorage
4. Refresh the page - theme should persist

## Common Tailwind Dark Mode Classes
- `dark:bg-gray-800` - Dark background
- `dark:text-white` - Dark text color
- `dark:border-gray-700` - Dark borders
- `dark:hover:bg-gray-700` - Dark hover states

## Note
The lint warning about `@theme` is expected and can be ignored - it's a valid Tailwind v4 directive that CSS linters don't recognize yet.
