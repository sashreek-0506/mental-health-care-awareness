import { ARTICLES, CRISIS_RESOURCES } from "../data/resources.js";

// GET /api/resources
export function getResources(req, res) {
  res.json({ articles: ARTICLES, crisisResources: CRISIS_RESOURCES });
}
