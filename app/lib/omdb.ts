export async function omdbSearch(title: string) {
  const key = process.env.OMDB_API_KEY;

  if (!key) {
    throw new Error("Missing OMDB_API_KEY (check .env / .env.local and restart server)");
  }

  const url = `https://www.omdbapi.com/?s=${encodeURIComponent(title)}&apikey=${encodeURIComponent(key)}`;

  let res: Response;
  try {
    res = await fetch(url, { cache: "no-store" });
  } catch (e: any) {
    // This happens if DNS/network is blocked
    throw new Error(`Network error while calling OMDb: ${e?.message || e}`);
  }

  // OMDb usually returns 200 even for errors, but keep this anyway:
  const text = await res.text().catch(() => "");

  if (!res.ok) {
    throw new Error(`OMDb HTTP ${res.status} ${res.statusText}: ${text.slice(0, 200)}`);
  }

  if (!text) {
    throw new Error("OMDb returned an empty response body");
  }

  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`OMDb returned non-JSON: ${text.slice(0, 200)}`);
  }

  // ✅ This is where OMDb tells “Invalid API key”, “Too many results”, etc.
  if (data?.Response === "False") {
    throw new Error(`OMDb error: ${data?.Error || "Unknown error"}`);
  }

  return data;
}
