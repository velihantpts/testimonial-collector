/**
 * Patches the generated Prisma client to work in bundled environments (Vercel serverless).
 *
 * Prisma 7's `prisma-client` generator uses `import.meta.url` which breaks
 * when bundled by Turbopack/Webpack for Vercel deployment.
 * This script wraps the problematic line in a try-catch.
 */
const fs = require("fs");
const path = require("path");

const clientPath = path.join(__dirname, "..", "src", "generated", "prisma", "client.ts");

if (!fs.existsSync(clientPath)) {
  console.log("Prisma client not found, skipping patch.");
  process.exit(0);
}

let content = fs.readFileSync(clientPath, "utf8");

const target = "globalThis['__dirname'] = path.dirname(fileURLToPath(import.meta.url))";

if (content.includes("// PATCHED")) {
  console.log("Prisma client already patched, skipping.");
  process.exit(0);
}

if (content.includes(target)) {
  content = content.replace(
    target,
    `// PATCHED: wrap in try-catch for bundled environments (Vercel)
try { globalThis['__dirname'] = path.dirname(fileURLToPath(import.meta.url)) } catch { globalThis['__dirname'] = globalThis['__dirname'] || process.cwd() }`
  );
  fs.writeFileSync(clientPath, content, "utf8");
  console.log("Prisma client patched successfully.");
} else {
  console.log("Target line not found in Prisma client, skipping patch.");
}
