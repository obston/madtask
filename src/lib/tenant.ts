const DEFAULT_API_KEY = "pub_amazing_101";

export function getApiKey(req: Request): string {
  const url = new URL(req.url);
  return (
    url.searchParams.get("apiKey") ||
    (req.headers.get("x-api-key") ?? "").trim() ||
    DEFAULT_API_KEY
  );
}

export function sessionFromKey(apiKey: string): string {
  return `${apiKey}_chat`;
}