const BASE = "https://www.omdbapi.com/";

function mustKey() {
  const key = process.env.OMDB_API_KEY;
  if (!key) {
    throw new Error("Missing OMDB_API_KEY (check .env / .env.local and restart server)");
  }
  return key;
}

async function safeFetchJson(url: string) {
  let res: Response;

  try {
    res = await fetch(url, { cache: "no-store" });
  } catch (e: any) {
    throw new Error(`Network error while calling OMDb: ${e?.message || e}`);
  }

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

  // OMDb errors come in JSON with Response:"False"
  if (data?.Response === "False") {
    throw new Error(`OMDb error: ${data?.Error || "Unknown error"}`);
  }

  return data;
}

export async function omdbSearch(title: string) {
  const key = mustKey();
  const url = `${BASE}?s=${encodeURIComponent(title)}&apikey=${encodeURIComponent(key)}`;
  return safeFetchJson(url);
}

export async function omdbById(imdbID: string) {
  const key = mustKey();
  const url = `${BASE}?i=${encodeURIComponent(imdbID)}&apikey=${encodeURIComponent(key)}`;
  return safeFetchJson(url);
}
