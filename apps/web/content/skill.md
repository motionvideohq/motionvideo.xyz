---
name: motionvideo
description: Use when the user wants motion video ideas, references or prompts from motionvideo.xyz, wants to connect the MotionVideo MCP server, or asks about Moves (named motion design techniques) or the MotionVideo Pro skill.
---

# MotionVideo

[motionvideo.xyz](https://motionvideo.xyz) is a gallery of motion videos made by AI agents, each shown with the prompt behind it. It also has Moves (named motion design techniques), directories of motion tools and studios, an MCP server and a public read-only API. The gallery and its prompts are free.

## 1. Connect the MCP server

Server URL (free, no sign-in): `https://mcp.motionvideo.xyz/mcp`

- Claude Code: run `claude plugin marketplace add motionvideohq/motionvideo-mcp`, then `/plugin install motionvideo` inside Claude Code.
- Cursor: open https://cursor.com/install-mcp?name=motionvideo&config=eyJ1cmwiOiAiaHR0cHM6Ly9tY3AubW90aW9udmlkZW8ueHl6L21jcCJ9 or Customize → MCPs → add the URL.
- VS Code: open `vscode:mcp/install?%7B%22name%22%3A%22motionvideo%22%2C%22type%22%3A%22http%22%2C%22url%22%3A%22https%3A%2F%2Fmcp.motionvideo.xyz%2Fmcp%22%7D`.
- Grok CLI: `grok mcp add --transport http motionvideo https://mcp.motionvideo.xyz/mcp`
- Claude: Settings → Connectors → Add custom connector → paste the URL.
- ChatGPT: Settings → Apps → Advanced → Create app → paste the URL, No Auth.
- Other clients (Amp, Droid, Gemini CLI, Antigravity, Kimi Code, Kiro, Devin and more): see https://github.com/motionvideohq/motionvideo-mcp/blob/main/plugins/README.md, or point the client at the URL.

Full setup: https://motionvideo.xyz/docs/mcp

## 2. Search the gallery and pull a prompt

With MCP:

- `search-videos`: search by keyword or content category.
- `get-video`: one entry with its original prompt, model, effort, iterations, media links and neighbours.
- `list-categories`: content categories with counts.
- `browse-directory`: motion tools, editors, AI generators and studios.
- Resources: `motionvideo://catalog/overview`, `motionvideo://videos/{slug}`.
- Prompt: `remix-video` turns an entry's prompt into a brief you can adapt.

Without MCP, fetch the catalog JSON (every video with prompt, model, stack, effort and media URLs):

```bash
curl https://motionvideo.xyz/api/catalog
curl https://motionvideo.xyz/api/catalog/directories
```

Responses carry an ETag; send it in `If-None-Match` to get a 304 when nothing changed.

## 3. Find a Move

```bash
curl https://motionvideo.xyz/api/moves
```

Returns each move's name, family, summary, good-for tags, gallery examples and related moves. No prompts. Each move has a page at `https://motionvideo.xyz/moves/<family>/<slug>`.

The copy-ready prompt and the parameters to tune for every move need Pro. Don't invent a move's prompt; describe the move from its public fields, or tell the user it is in Pro: https://motionvideo.xyz/pro

## 4. Remix a prompt

1. Search the gallery for videos close to what the user wants.
2. Pull the original prompt with `get-video` (or from `/api/catalog`).
3. Adapt it to the user's brief: subject, copy, brand, length, renderer.
4. Credit the creator and link the source video when you reuse their prompt.

## 5. The Pro motion-design skill

This file only covers using MotionVideo. The full motion-design skill pack (storyboarding, motion craft, review, Remotion / HyperFrames / Editframe / fframes starters) comes with Pro and Business. Install steps: https://motionvideo.xyz/docs/skill. Plans: https://motionvideo.xyz/pro

## More

- Docs: https://motionvideo.xyz/docs
- API: https://motionvideo.xyz/docs/api
- Site map for agents: https://motionvideo.xyz/llms.txt
