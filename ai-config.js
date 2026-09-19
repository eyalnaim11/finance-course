// ai-config.js : the AI helper's Cloudflare Worker URL (js/ai-helper.js).
// No secrets live here or anywhere else in this repo — the Gemini key stays
// inside the Worker's own encrypted secret storage (see worker/README.md).
//
// Empty string = the helper never calls the network: it always falls back to
// local course-passage search, so the feature still works with nothing set
// up here.
//
// After deploying the Worker (step-by-step in worker/README.md), paste its
// URL below, e.g. 'https://finance-course-ai.<your-subdomain>.workers.dev'.
export const aiConfig = {
  workerUrl: '',
};
