declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    AUTH_PASSWORD_PEPPER: string;
    ASSETS: Fetcher;
    BUCKET?: R2Bucket;
  }
}
