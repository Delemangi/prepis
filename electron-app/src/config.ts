import * as fs from 'node:fs';
import * as path from 'node:path';

export type Config = {
  channels: string[];
  height: number;
  modes: string[];
  token: string;
  width: number;
  x: number;
  y: number;
};

type ConfigFile = {
  config: Config;
};

const configPath = path.resolve(
  import.meta.dirname,
  '..',
  'config.json'
);
// eslint-disable-next-line security/detect-non-literal-fs-filename -- configPath is resolved from a fixed file name within the app directory.
const configFile = JSON.parse(fs.readFileSync(configPath, 'utf8')) as ConfigFile;

export const config: Config = configFile.config;
