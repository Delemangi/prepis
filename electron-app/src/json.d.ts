export type Config = {
  channels: string[];
  height: number;
  modes: string[];
  token: string;
  width: number;
  x: number;
  y: number;
};

declare module '*.json' {
  const value: { config: Config };
  export default value;
}
