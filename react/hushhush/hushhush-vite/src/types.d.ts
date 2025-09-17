declare module "*.json" {
  const value: {
    [key: string]: {
      domains: string[];
      sourceidentifiers: string[];
    };
  };
  export default value;
}