import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { test } from "node:test";
import { sourceTabIndexes } from "../../scripts/site/browser-all.mjs";

const catalog = JSON.parse(
  await fs.readFile(
    new URL("../../generated/demos/catalog.json", import.meta.url),
    "utf8",
  ),
);
const ids = [
  "autocomplete/fuzzy-matching",
  "autocomplete/virtualized",
  "combobox/virtualized",
  "menu/detached-triggers-full",
  "navigation-menu/nested-inline",
];

for (const id of ids) {
  test(`${id}: source tabs use runtime identity rather than dependency order`, async () => {
    const entry = catalog.entries.find((entry) => entry.id === id);
    const declaration = await fs.readFile(
      new URL(`../../../${entry.module}`, import.meta.url),
      "utf8",
    );
    const section = declaration.slice(declaration.indexOf(`id: '${id}'`));
    const lists = [...section.matchAll(/files:\s*(\[[^\]]*\])/g)].slice(
      0,
      entry.variants.length,
    );
    assert.equal(lists.length, entry.variants.length);
    for (const [index, variant] of entry.variants.entries()) {
      const runtimeFiles = [
        ...lists[index][1].matchAll(/['"]([^'"]+)['"]/g),
      ].map((match) => match[1]);
      const indexes = sourceTabIndexes(variant.files, runtimeFiles);
      assert.deepEqual(
        indexes.map((tab) => runtimeFiles[tab]),
        variant.files.map((file) => file.path),
      );
      if (variant.id === "css-modules") {
        assert.notDeepEqual(
          runtimeFiles,
          variant.files.map((file) => file.path),
        );
        assert.notEqual(indexes[1], 1);
      }
    }
  });
}

test("source mapping rejects omitted, substituted and duplicate files", () => {
  const files = [{ path: "a" }, { path: "b" }];
  for (const runtime of [["a"], ["a", "c"], ["a", "a"], ["a", "b", "c"]])
    assert.throws(
      () => sourceTabIndexes(files, runtime),
      /differ from catalog/,
    );
  assert.throws(
    () => sourceTabIndexes([{ path: "a" }, { path: "a" }], ["a", "b"]),
    /differ from catalog/,
  );
});
