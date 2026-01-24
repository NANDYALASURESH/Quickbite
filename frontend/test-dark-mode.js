// Simple test to verify dark mode is working
// Run this in browser console after clicking the theme toggle:
// document.documentElement.classList.contains('dark')
// Should return true when dark mode is active

console.log('Dark mode test - Current theme:',
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
);
