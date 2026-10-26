// Error messages are only built outside of production, so that bundlers can strip them, while the checks
// themselves always run: `throw new ValidationError(hasProcess && process.env.NODE_ENV !== 'production' ? ... : undefined)`
// Bundlers replace `process.env.NODE_ENV` in production builds. `hasProcess` keeps the checks from throwing
// where `process` isn't defined, and is a separate constant so that (unlike an inline `typeof process`)
// it doesn't remain at every check once the messages are stripped.
export const hasProcess = typeof process !== 'undefined';
