/// <reference types="node" />
// Run: pnpm --filter @motionvideo/web test
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import launchVideos from "../src/data/launch-videos.json" with { type: "json" };
import type {
  LaunchFilm,
  LaunchScene,
  LaunchRecipes,
} from "../src/lib/launch-videos.ts";
import launchRecipes from "../src/server/data/launch-recipes.json" with { type: "json" };
import {
  MAX_BODY_BYTES,
  composeBody,
  filmPromptBody,
  parseBody,
  parseSearchParams,
  searchBody,
} from "../src/server/launch-requests.ts";
import type { LaunchSearch } from "../src/server/launch-requests.ts";

// SAFETY: both JSON files are checked by scripts/check-launch-videos.mjs;
// JSON imports widen the enums to string.
const FILMS = launchVideos.films as LaunchFilm[];
// SAFETY: as above.
const SCENES = launchVideos.scenes as LaunchScene[];
// SAFETY: as above.
const RECIPES = launchRecipes as LaunchRecipes;

const search = (params: string): LaunchSearch => {
  const parsed = parseSearchParams(new URLSearchParams(params));
  assert.ok(parsed.ok, JSON.stringify(parsed));
  return parsed.value;
};

const refused = (params: string) => {
  const parsed = parseSearchParams(new URLSearchParams(params));
  assert.equal(parsed.ok, false, params);
  if (!parsed.ok) {
    assert.equal(parsed.error.error, "invalid_request");
  }
};

/** A request body as a client would send it, valid or not. */
type BodyValue =
  | string
  | number
  | boolean
  | null
  | readonly BodyValue[]
  | { readonly [key: string]: BodyValue };

// SAFETY: TextEncoder always allocates a plain ArrayBuffer, never a SharedArrayBuffer.
const bytes = (value: BodyValue) =>
  new TextEncoder().encode(JSON.stringify(value)).buffer as ArrayBuffer;

describe("launch search", () => {
  it("returns no recipe text in either view", () => {
    // Long recipe strings (actions, descriptions, substitutions) must never
    // appear in a search response.
    const secrets = RECIPES.scenes
      .flatMap((recipe) => [
        ...recipe.events.map((event) => event.action),
        ...recipe.layers.map((layer) => layer.description),
        ...recipe.substitutions,
        recipe.entry.description,
        recipe.exit.description,
      ])
      .filter((text) => text.length > 40);
    assert.ok(secrets.length > 0);
    for (const view of ["films", "scenes"]) {
      const body = JSON.stringify(
        searchBody(FILMS, SCENES, search(`view=${view}&limit=30`))
      );
      for (const secret of secrets) {
        assert.ok(
          !body.includes(secret),
          `${view} leaks "${secret.slice(0, 40)}…"`
        );
      }
      for (const key of [
        "events",
        "layers",
        "substitutions",
        "sourceValue",
        "brandSource",
        "inputs",
      ]) {
        assert.ok(!body.includes(`"${key}"`), `${view} has "${key}"`);
      }
    }
  });

  it("pages through every scene once with the cursor", () => {
    const seen: string[] = [];
    let cursor: string | null = "";
    while (cursor !== null) {
      const body = searchBody(
        FILMS,
        SCENES,
        search(`limit=5&cursor=${cursor}`)
      );
      if (body.view !== "scenes") {
        assert.fail("the default view is scenes");
      }
      seen.push(...body.items.map((item) => item.id));
      cursor = body.nextCursor;
    }
    assert.equal(seen.length, SCENES.length);
    assert.equal(new Set(seen).size, SCENES.length);
  });

  it("maps comma lists and the single aspect onto the query", () => {
    const { query, limit } = search(
      "view=films&roles=hook,cta&aspect=16:9&query=&limit=3"
    );
    assert.equal(query.view, "films");
    assert.deepEqual(query.roles, ["hook", "cta"]);
    assert.deepEqual(query.aspects, ["16:9"]);
    assert.equal(query.q, undefined);
    assert.equal(limit, 3);
  });

  it("refuses bad parameters with invalid_request", () => {
    refused("q=type");
    refused("roles=hook,nope");
    refused("view=all");
    refused("limit=31");
    refused("limit=0");
    refused("cursor=-1");
    refused("minSeconds=abc");
    refused("aspect=21:9");
    refused("view=films&view=scenes");
  });
});

describe("launch request bodies", () => {
  // SAFETY: the published catalog lists at least one film (checked by check-launch-videos).
  const film = FILMS[0] as LaunchFilm;
  const valid = { filmSlug: film.slug, mode: "exact", renderer: "remotion" };

  it("accepts a valid body", () => {
    assert.ok(parseBody(filmPromptBody, bytes(valid)).ok);
  });

  it("refuses unknown keys, wrong types and oversize bodies", () => {
    for (const body of [
      { ...valid, extra: 1 },
      { ...valid, mode: "recreate" },
      { ...valid, fps: { num: 30, den: 1, x: 1 } },
      { ...valid, inputs: { product_name: 5 } },
      {
        ...valid,
        inputs: Object.fromEntries(
          Array.from({ length: 33 }, (_, i) => [`k${i}`, "v"])
        ),
      },
    ]) {
      const parsed = parseBody(filmPromptBody, bytes(body));
      assert.equal(parsed.ok, false, JSON.stringify(body).slice(0, 80));
    }
    const big = { ...valid, inputs: { tagline: "x".repeat(MAX_BODY_BYTES) } };
    const parsed = parseBody(filmPromptBody, bytes(big));
    assert.equal(parsed.ok, false);
    // SAFETY: TextEncoder always allocates a plain ArrayBuffer.
    assert.equal(
      parseBody(
        filmPromptBody,
        new TextEncoder().encode("{").buffer as ArrayBuffer
      ).ok,
      false
    );
  });

  it("caps a storyboard at 16 scenes and joins at 32", () => {
    const ids = SCENES.map((scene) => scene.id);
    const base = { mode: "adapt", renderer: "hyperframes" };
    assert.ok(
      parseBody(composeBody, bytes({ ...base, sceneIds: ids.slice(0, 2) })).ok
    );
    assert.equal(
      parseBody(composeBody, bytes({ ...base, sceneIds: [] })).ok,
      false
    );
    assert.equal(
      parseBody(
        composeBody,
        bytes({ ...base, sceneIds: Array.from({ length: 17 }, () => ids[0]) })
      ).ok,
      false
    );
    assert.equal(
      parseBody(
        composeBody,
        bytes({
          ...base,
          sceneIds: ids.slice(0, 2),
          joins: Array.from({ length: 33 }, () => ({ after: 0, kind: "cut" })),
        })
      ).ok,
      false
    );
  });
});
