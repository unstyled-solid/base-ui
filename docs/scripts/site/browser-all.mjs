import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { root } from "./paths.mjs";
import crypto from 'node:crypto';
import { applyPublicSource } from '../../demos/shared/public-source.mjs';

// Catalog traversal order is not the live source toolbar's declaration order.
// Validate coverage independently, then address tabs by their exact file identity.
export function sourceTabIndexes(catalogFiles, runtimeFiles) {
  const paths = catalogFiles.map((file) => file.path);
  if (
    new Set(paths).size !== paths.length ||
    new Set(runtimeFiles).size !== runtimeFiles.length ||
    paths.length !== runtimeFiles.length ||
    paths.some((file) => !runtimeFiles.includes(file))
  )
    throw new Error("Runtime source files differ from catalog source files");
  return paths.map((file) => runtimeFiles.indexOf(file));
}

export async function runBrowserInventory() {
  const origin = process.env.DOCS_TEST_URL ?? "http://127.0.0.1:5173";
  const catalog = JSON.parse(
    await fs.readFile(
      path.join(root, "docs/generated/demos/catalog.json"),
      "utf8",
    ),
  );
  const selectedIds = process.env.DOCS_DEMO_IDS?.split(",");
  const entries = selectedIds
    ? catalog.entries.filter((entry) => selectedIds.includes(entry.id))
    : catalog.entries;
  if (selectedIds?.some((id) => !entries.some((entry) => entry.id === id)))
    throw new Error("DOCS_DEMO_IDS contains an unknown demo");
  const browser = await chromium.launch();
  const failures = [],
    passed = [];
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
    });
    page.setDefaultTimeout(5000);
    await page.goto(origin + "/");
    await page.waitForFunction(
      () => !!document.querySelector("#shell-island button"),
    );
    // Use the exact same runtime and modules as all production page islands. Each
    // variant is mounted alone, interacted with, and disposed before the next one.
    await page.evaluate(() =>
      document
        .querySelectorAll("[data-demo-id]")
        .forEach((host) => host.remove()),
    );
    for (const entry of entries) {
      await page.goto(origin + "/");
      await page.waitForFunction(
        () => !!document.querySelector("#shell-island button"),
      );
      const errors = [];
      const error = (e) => errors.push(String(e));
      const diagnostic = (m) => {
        if (
          ["warning", "error"].includes(m.type()) &&
          !m.text().includes("Failed to load resource")
        )
          errors.push(m.text());
      };
      page.on("pageerror", error);
      page.on("console", diagnostic);
      try {
        const runtimeVariants = await page.evaluate(
          async ({ id, root }) => {
            const { mountDemo } = await import(
              "/@fs" + root + "/docs/demos/shared/runtime.tsx"
            );
            const { loadDemo } = await import(
              "/@fs" + root + "/docs/demos/shared/registry.ts"
            );
            const entry = await loadDemo(id);
            const host = document.createElement("div");
            host.id = "inventory-demo";
            host.style.padding = "40px";
            document.body.prepend(host);
            window.__disposeDemo = mountDemo(host, id);
            return entry.variants.map(({ id, files }) => ({ id, files }));
          },
          { id: entry.id, root },
        );
        const host = page.locator("#inventory-demo");
        await host
          .locator(".DemoVariantSelect")
          .waitFor({ state: "attached", timeout: 10000 });
        for (const variant of entry.variants) {
          const runtimeVariant = runtimeVariants.find(
            (item) => item.id === variant.id,
          );
          if (!runtimeVariant)
            throw new Error(`Missing runtime variant ${variant.id}`);
          const tabIndexes = sourceTabIndexes(
            variant.files,
            runtimeVariant.files,
          );
          if (entry.variants.length > 1) {
            await page.evaluate(() => {
              window.__previousPortals = Array.from(
                document.querySelectorAll("[data-base-ui-portal]"),
              );
            });
            await host.locator(".DemoVariantSelect").selectOption(variant.id);
            await page.waitForFunction(() =>
              window.__previousPortals.every((node) => !node.isConnected),
            );
          }
          await host.locator('[aria-label="Demo preview"]').waitFor();
          if (await host.getByRole("alert").count())
            throw new Error(await host.getByRole("alert").allTextContents());
          const reveal = host.locator(".DemoCodeReveal");
          if (
            (await reveal.isVisible()) &&
            (await reveal.getAttribute("aria-expanded")) === "false"
          )
            await reveal.click();
          const source = host.locator("pre code");
          for (const [index, file] of variant.files.entries()) {
            const filePath = file.path;
            if (variant.files.length > 1)
              await host
                .locator(".DemoFileTabs [role=tab]")
                .nth(tabIndexes[index])
                .click();
            const binary =
              /\.(png|jpe?g|gif|webp|avif|ico|woff2?|ttf|otf|mp4|webm|pdf)$/i.test(
                filePath,
              );
            const original = await fs.readFile(path.join(root, filePath));
            const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
            if (original.length !== file.bytes || digest(original) !== file.sha256)
              throw new Error(`Executing source provenance differs for ${filePath}`);
            if (!binary && !file.publicSource)
              throw new Error(`Missing public source metadata for ${filePath}`);
            const expected = binary
              ? `Binary asset: ${filePath}`
              : applyPublicSource(original.toString('utf8'), file.publicSource.edits);
            if (!binary && (Buffer.byteLength(expected) !== file.publicSource.bytes || digest(expected) !== file.publicSource.sha256))
              throw new Error(`Public source provenance differs for ${filePath}`);
            await page.waitForFunction(
              (expected) =>
                document.querySelector("#inventory-demo pre code")
                  ?.textContent === expected,
              expected,
            );
            if ((await source.textContent()) !== expected)
              throw new Error(
                `Displayed source differs from declared public source ${filePath}`,
              );
            if ((await host.locator(".DemoCopyButton").isDisabled()) !== binary)
              throw new Error(`Incorrect copy availability for ${filePath}`);
          }
          if (await reveal.isVisible()) {
            // Keep one button through expand/collapse, including keyboard focus.
            if ((await reveal.getAttribute("aria-expanded")) === "false")
              await reveal.click();
            await reveal.focus();
            await reveal.press("Enter");
            if (
              !(await reveal.evaluate(
                (node) => node === document.activeElement,
              ))
            )
              throw new Error("Collapse lost reveal focus");
            if (
              !(await host.locator('[aria-label="Demo preview"]').isVisible())
            )
              throw new Error("Collapse hid preview");
          }
          const preview = host.locator('[aria-label="Demo preview"]');
          const button = preview
            .locator("button:visible:not(:disabled)")
            .first();
          if (await button.count()) {
            await button.click();
            await page.keyboard.press("Escape");
          } else {
            const input = preview
              .locator(
                "input:visible:not([type=hidden]):not([readonly]):not([disabled])",
              )
              .first();
            if (
              (await input.count()) &&
              ["text", "search", "email", "url", "tel", "password"].includes(
                (await input.getAttribute("type")) || "text",
              )
            ) {
              await input.fill("demo");
              await page.keyboard.press("Escape");
            }
          }
          if (await host.getByRole("alert").count())
            throw new Error(await host.getByRole("alert").allTextContents());
          passed.push(`${entry.id}/${variant.id}`);
        }
      } catch (e) {
        failures.push({ id: entry.id, error: String(e) });
      }
      try {
        const remaining = await page.evaluate(() => {
          window.__disposeDemo?.();
          document.getElementById("inventory-demo")?.remove();
          return document.querySelectorAll("[data-base-ui-portal]").length;
        });
        if (remaining)
          failures.push({
            id: entry.id,
            error: `Disposal left ${remaining} portal containers`,
          });
      } catch (error) {
        failures.push({
          id: entry.id,
          error: `Disposal failed: ${String(error)}`,
        });
      }
      page.off("pageerror", error);
      page.off("console", diagnostic);
      if (errors.length)
        failures.push({ id: entry.id, diagnostics: [...new Set(errors)] });
    }
    const report = { passed, failures };
    await fs.mkdir(path.join(root, "docs/generated/browser"), {
      recursive: true,
    });
    await fs.writeFile(
      path.resolve(
        root,
        process.env.DOCS_BROWSER_REPORT ??
          "docs/generated/browser/inventory.json",
      ),
      JSON.stringify(report, null, 2),
    );
    const clean = passed.filter(
      (id) => !failures.some((failure) => id.startsWith(failure.id + "/")),
    );
    console.log(
      `${passed.length} preview/source/action sequences completed; ${clean.length} clean variants; ${failures.length} failure records (including diagnostics)`,
    );
    for (const f of failures) console.error(JSON.stringify(f));
  } finally {
    await browser.close();
  }
  if (failures.length) process.exitCode = 1;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
)
  await runBrowserInventory();
