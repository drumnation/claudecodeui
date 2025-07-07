export function loadEnvironment() {
  // In browser, environment variables are typically injected at build time
  return process.env;
}