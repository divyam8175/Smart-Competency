declare module 'pdf-parse' {
  export interface LoadParameters {
    data?: Buffer | Uint8Array;
    url?: string | URL;
    verbosity?: number;
    password?: string;
  }

  export interface ParseParameters {
    first?: number;
    last?: number;
    partial?: number[];
  }

  export interface TextResult {
    total: number;
    text: string;
  }

  export class PDFParse {
    constructor(options?: LoadParameters);
    getText(options?: ParseParameters): Promise<TextResult>;
    destroy(): Promise<void>;
    static setWorker(path: string): void;
  }
}
