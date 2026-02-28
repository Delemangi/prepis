# Migration to TypeScript

This document explains the changes made to migrate the project from JavaScript to TypeScript.

## Changes Made

### 1. New Project Structure

Created a new `electron-app/` folder to organize TypeScript code, similar to how `image-processor/` organizes Python code:

```
electron-app/
├── src/              # TypeScript source files
│   ├── main.ts
│   ├── preload.ts
│   ├── renderer.ts
│   ├── electron-pdf-window.d.ts  # Type definitions
│   └── json.d.ts                 # Type definitions
├── dist/             # Compiled JavaScript (git-ignored)
├── tsconfig.json     # TypeScript configuration
└── README.md         # Documentation
```

### 2. Converted Files

- `main.js` → `electron-app/src/main.ts`
- `preload.js` → `electron-app/src/preload.ts`
- `renderer.js` → `electron-app/src/renderer.ts`

### 3. Type Safety Improvements

- Added TypeScript interfaces for better type checking
- Created custom type definitions for third-party modules without types
- Proper typing for Discord.js v14 (using `GatewayIntentBits` instead of deprecated `Intents.FLAGS`)
- Strong typing for Electron APIs and window extensions

### 4. Configuration Changes

**package.json:**

- Changed `main` entry point to `electron-app/dist/main.js`
- Removed `"type": "module"` (using CommonJS for Electron compatibility)
- Added TypeScript build scripts
- Added TypeScript and type definition dependencies

**New Scripts:**

- `npm run build` - Compile TypeScript to JavaScript
- `npm run watch` - Watch mode for development
- `npm start` - Build and run the application

**eslint.config.js:**

- Added TypeScript ESLint support
- Configured to lint TypeScript files in `electron-app/src/`

### 5. Type Definitions

Created custom type definitions for modules without official types:

- `electron-pdf-window.d.ts` - Types for electron-pdf-window
- `json.d.ts` - Types for importing config.json

### 6. Updated References

- `index.html` now references `electron-app/dist/renderer.js`
- Main process preload path updated to point to compiled files

## Benefits

1. **Type Safety**: Catch errors at compile time instead of runtime
2. **Better IDE Support**: Enhanced autocomplete and IntelliSense
3. **Maintainability**: Easier to refactor and understand code structure
4. **Documentation**: Types serve as inline documentation
5. **Modern JavaScript**: Use latest ES features with compilation to compatible targets

## Original Files

The original JavaScript files (`main.js`, `preload.js`, `renderer.js`) have been **deleted** as they are no longer needed. The project now fully uses TypeScript.

## Static Assets Location

`index.html` and `styles.css` now live in `electron-app/public/` so all project-specific files reside under `electron-app/`.

## Development Workflow

1. Edit TypeScript files in `electron-app/src/`
2. Run `npm run build` or `npm run watch` to compile
3. Run `npm start` to launch the application

The compiled JavaScript in `electron-app/dist/` is automatically generated and should not be edited directly.
