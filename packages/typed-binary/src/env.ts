// Checks that only catch mistakes in how the library is used (invalid schemas, or values that don't match
// their schema when writing or measuring) are skipped in production, so that bundlers can strip them:
// `if (hasProcess && process.env.NODE_ENV !== 'production' && ...)`
// Bundlers replace `process.env.NODE_ENV` in production builds. `hasProcess` keeps the checks from throwing
// where `process` isn't defined, and is a separate constant so that (unlike an inline `typeof process`)
// it doesn't remain at every check once they are stripped. Checks of data being read always run.
export const hasProcess = typeof process !== 'undefined';
