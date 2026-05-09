import { Octokit } from "octokit";

const owner = process.env.GITHUB_OWNER || "Urazhanova";
const repo = process.env.GITHUB_REPO || "AI-M";
const token = process.env.GITHUB_TOKEN;

// Octokit используем ТОЛЬКО для записи (createOrUpdateFileContents)
export const octokit = new Octokit({ auth: token });

const GITHUB_API = "https://api.github.com";

const headers: HeadersInit = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  ...(token ? { Authorization: `Bearer ${token}` } : {}),
};

/**
 * Fetch a single file's content from the GitHub repository.
 * Uses native fetch with cache: 'no-store' so Next.js never caches this.
 */
export async function getFileContent(path: string): Promise<string | null> {
  try {
    const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`;
    const res = await fetch(url, {
      headers,
      cache: "no-store", // Next.js не кэширует этот запрос
    });

    if (!res.ok) return null;

    const data = await res.json();

    if (Array.isArray(data) || data.type !== "file") return null;

    const content = Buffer.from(data.content, "base64").toString("utf-8");
    return content;
  } catch (error) {
    console.error(`Error fetching file ${path}:`, error);
    return null;
  }
}

/**
 * Fetch the contents (list of files/folders) of a directory.
 * Uses native fetch with cache: 'no-store'.
 */
export async function getDirectoryContent(path: string) {
  try {
    const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`;
    const res = await fetch(url, {
      headers,
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();

    if (!Array.isArray(data)) return null;

    return data;
  } catch (error) {
    console.error(`Error fetching directory ${path}:`, error);
    return null;
  }
}
