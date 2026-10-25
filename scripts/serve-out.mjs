// Zero-dependency static server for previewing ./out exactly as a static host would serve it.
// Usage: npm run build && npm run preview  (PORT env var optional, default 4173)
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve("out");
const port = Number(process.env.PORT) || 4173;

const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

if (!fs.existsSync(root)) {
  console.error("No ./out directory. Run `npm run build` first.");
  process.exit(1);
}

function resolveFile(urlPath) {
  const clean = path.normalize(decodeURIComponent(urlPath.split("?")[0])).replace(/^(\.\.[/\\])+/, "");
  const candidate = path.join(root, clean);
  if (!candidate.startsWith(root)) return null;
  for (const file of [candidate, path.join(candidate, "index.html"), `${candidate}.html`]) {
    if (fs.existsSync(file) && fs.statSync(file).isFile()) return file;
  }
  return null;
}

http
  .createServer((req, res) => {
    const urlPath = req.url ?? "/";
    // Mirror trailingSlash: true — directories without a slash redirect like most static hosts.
    if (!path.extname(urlPath.split("?")[0]) && !urlPath.split("?")[0].endsWith("/")) {
      const dir = path.join(root, urlPath.split("?")[0]);
      if (fs.existsSync(path.join(dir, "index.html"))) {
        res.writeHead(301, { Location: `${urlPath.split("?")[0]}/` });
        return res.end();
      }
    }
    const file = resolveFile(urlPath);
    if (!file) {
      res.writeHead(404, { "Content-Type": types[".html"] });
      return fs.createReadStream(path.join(root, "404.html")).on("error", () => res.end("Not found")).pipe(res);
    }
    res.writeHead(200, { "Content-Type": types[path.extname(file)] ?? "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, () => console.log(`Serving ./out at http://localhost:${port}`));
