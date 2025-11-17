// Global type declarations for the project

// Allow importing CSS files
declare module '*.css' {
  const content: Record<string, string>;
  export default content;
}

// Allow importing CSS modules
declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

// Allow importing images
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.svg';
declare module '*.webp';
