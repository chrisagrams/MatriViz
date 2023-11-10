declare global {
    interface Window {
      feather: {
        ping: () => Promise<string>;
    readFeather: (path: string) => Promise<{}>;
      }
    }
}

export {};