import { browser } from "../common/utils.js";

export async function loadJSON(path: string) {
  const url = browser.runtime.getURL(path);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load JSON: ${path}`);
  }
  return await response.json();
}
