# Electron App - TypeScript

This directory contains the TypeScript source code for the Electron application.

## Structure

```
electron-app/
├── src/            # TypeScript source files
│   ├── main.ts     # Main process
│   ├── preload.ts  # Preload script
│   └── renderer.ts # Renderer process
├── public/         # Static assets (HTML/CSS)
│   ├── index.html
│   └── styles.css
├── dist/           # Compiled JavaScript (generated)
└── tsconfig.json   # TypeScript configuration
```

## Development

### Build

```bash
npm run build
```

### Watch mode (auto-compile on changes)

```bash
npm run watch
```

### Run the application

```bash
npm start
```

## Notes

- All TypeScript files are in the `src/` directory
- Compiled JavaScript output goes to `dist/`
- The `dist/` folder is git-ignored
- Type definitions for custom modules are in `src/*.d.ts` files
