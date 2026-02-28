declare module '../../config.json' {
  type Config = {
    channels: string[];
    height: number;
    modes: string[];
    token: string;
    width: number;
    x: number;
    y: number;
  };

  const value: { config: Config };
  export default value;
}
