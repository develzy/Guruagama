interface R2Bucket {
  get(key: string): Promise<R2ObjectBody | null>;
  put(key: string, value: any, options?: any): Promise<void>;
  list(options?: { prefix?: string; delimiter?: string; cursor?: string; limit?: number }): Promise<R2Objects>;
  delete(key: string): Promise<void>;
}

interface R2Object {
  key: string;
  size: number;
}

interface R2ObjectBody extends R2Object {
  arrayBuffer(): Promise<ArrayBuffer>;
}

interface R2Objects {
  objects: R2Object[];
  delimitedPrefixes: string[];
}

declare namespace NodeJS {
  interface ProcessEnv {
    R2_BUCKET: R2Bucket & string; // Intersection to satisfy both string (local dev) and object (production)
    GEMINI_API_KEY: string;
    R2_ACCOUNT_ID: string;
    R2_ACCESS_KEY_ID: string;
    R2_SECRET_ACCESS_KEY: string;
    R2_BUCKET_NAME: string;
  }
}
