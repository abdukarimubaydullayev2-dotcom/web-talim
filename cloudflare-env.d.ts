declare namespace Cloudflare {
  interface Env {
    DB: D1Database;
    ADMIN_ACCOUNT_IDS?: string;
    AUTH_PASSWORD_PEPPER: string;
    ASSETS: Fetcher;
    BUCKET?: R2Bucket;
  }
}
