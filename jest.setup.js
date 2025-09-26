// Mock __DEV__ global for Jest, which is present in the React Native environment
global.__DEV__ = true;

// Silence console.error for react-test-renderer deprecation warning
const originalError = console.error;
console.error = (...args) => {
  if (/react-test-renderer is deprecated/.test(args[0])) {
    return;
  }
  originalError.call(console, ...args);
};