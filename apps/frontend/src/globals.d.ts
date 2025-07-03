/**
 * Global type declarations for asset imports in Vite-based React applications.
 * These declarations allow TypeScript to understand asset imports while maintaining
 * Vite's existing asset processing behavior.
 */

/**
 * SVG assets imported as strings (URLs).
 * Vite processes these through its asset pipeline.
 */
declare module "*.svg" {
  const content: string;
  export default content;
}

/**
 * PNG image assets imported as strings (URLs).
 * Vite processes these through its asset pipeline.
 */
declare module "*.png" {
  const content: string;
  export default content;
}

/**
 * JPG image assets imported as strings (URLs).
 * Vite processes these through its asset pipeline.
 */
declare module "*.jpg" {
  const content: string;
  export default content;
}

/**
 * JPEG image assets imported as strings (URLs).
 * Vite processes these through its asset pipeline.
 */
declare module "*.jpeg" {
  const content: string;
  export default content;
}

/**
 * GIF image assets imported as strings (URLs).
 * Vite processes these through its asset pipeline.
 */
declare module "*.gif" {
  const content: string;
  export default content;
}

/**
 * WebP image assets imported as strings (URLs).
 * Vite processes these through its asset pipeline.
 */
declare module "*.webp" {
  const content: string;
  export default content;
}

/**
 * CSS Module files imported as record of CSS class mappings.
 * Vite processes these through its CSS Modules pipeline.
 */
declare module "*.module.css" {
  const classes: Record<string, string>;
  export default classes;
}
