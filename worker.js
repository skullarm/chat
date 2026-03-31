var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker.js - Enhanced with Cloudflare Workers AI (No API Key Required)
var worker_default = {
  async fetch(request, env2) {
    let client, server;
    try {
      [client, server] = Object.values(new WebSocketPair());
      server.accept();
    } catch (e) {
      return new Response("WebSocket error", { status: 500 });
    }
    const enc = new TextEncoder();
    let _wsClosed = false;
    function safeSend(payload) {
      if (_wsClosed) return false;
      try {
        server.send(payload);
        return true;
      } catch (e) {
        _wsClosed = true;
        try {
          server.close();
        } catch (e2) {}
        return false;
      }
    }
    __name(safeSend, "safeSend");
    let pingInterval = setInterval(() => {
      try {
        server.send(jsonMsg("ping", "", "", "", ""));
      } catch {}
    }, 3e4);
    server.addEventListener("close", () => {
      clearInterval(pingInterval);
    });
    server.addEventListener("message", async (m) => {
      let contentType = "text/plain";
      let controller = null;
      let fetchTimeout = null;
      const redirectTimeouts = [];
      try {
        const msgData = JSON.parse(m.data);
        let {
          u,
          a,
          q,
          au,
          si,
          method,
          body,
          os = 0,
          oe = null,
          admin = false
        } = msgData;
        const requestID2 = typeof q === "undefined" || q === null ? "" : q;
        const qbytes = enc.encode(requestID2);
        const fetchMethod = method ? method.toUpperCase() : "GET";
        
        // AI Chat Handler - Uses Cloudflare Workers AI (No API Key!)
        if (u === "ai_chat") {
          await handleAIChat(env2, server, msgData, safeSend, requestID2);
          return;
        }
        
        if (u === "getcodeclient") {
          safeSend(jsonMsg("info", "text/html", "<!-- client demo code here -->", "", ""));
          return;
        }
        
        if (u === "getcode" && admin) {
          let srcText = "";
          try {
            const gitHubUrl = "https://raw.githubusercontent.com/skullarm/turbo-fiesta/main/worker.js";
            const srcResp = await fetch(gitHubUrl);
            if (srcResp.ok) {
              srcText = await srcResp.text();
            } else {
              throw new Error("GitHub fetch failed");
            }
          } catch (e) {
            try {
              const fallbackResp = await fetch(import.meta.url);
              if (fallbackResp.ok) {
                srcText = await fallbackResp.text();
              } else {
                srcText = "Source unavailable in this environment.";
              }
            } catch (e2) {
              srcText = "Source unavailable in this environment.";
            }
          }
          try {
            const esc = srcText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
            const html = "<!doctype html><meta charset='utf-8'><title>worker.js</title><style>body{background:#222;color:#eee;font-family:monospace;margin:0;}pre{background:#111;padding:1em;overflow:auto;margin:0;}</style><h2 style='padding:0.5em 1em;background:#333;'>Server Code</h2><pre>" + esc + "</pre>";
            safeSend(jsonMsg("info", "text/html", html, "", ""));
          } catch (e) {
            safeSend(jsonMsg("er", "", "Failed to fetch source: " + (e && e.message ? e.message : String(e)), "", ""));
          }
          return;
        }
        
        if (typeof u === "string" && u.startsWith("CMD_KV_PUT?")) {
          if (!admin) {
            safeSend(jsonMsg("er", "", "Unauthorized: CMD_KV is admin-only", requestID2, ""));
            return;
          }
          try {
            const params = new URLSearchParams(u.slice("CMD_KV_PUT?".length));
            const k = params.get("key");
            const v = params.get("val");
            if (!k || v === null) {
              safeSend(jsonMsg("er", "", "CMD_KV requires key and val", requestID2, ""));
              return;
            }
            await env2.STORE.put(k, v);
            safeSend(jsonMsg("info", "text/plain", `Key ${k} written`, requestID2, ""));
          } catch (e) {
            console.error("CMD_KV error:", e);
            safeSend(jsonMsg("er", "", "Failed to write to STORE", requestID2, ""));
          }
          return;
        } else if (typeof u === "string" && u.startsWith("CMD_KV_GET?")) {
          try {
            const params = new URLSearchParams(u.slice("CMD_KV_GET?".length));
            const k = params.get("key");
            if (!k) {
              safeSend(jsonMsg("er", "", "CMD_KV_GET requires key", requestID2, ""));
              return;
            }
            const v = await env2.STORE.get(k);
            safeSend(jsonMsg("info", "text/plain", v, requestID2, ""));
          } catch (e) {
            console.error("CMD_KV_GET error:", e);
            safeSend(jsonMsg("er", "", "Failed to read from STORE", requestID2, ""));
          }
          return;
        }
        
        const acceptHeader = "text/html, text/plain, application/json, image/jpeg, image/png, video/mp4, audio/mp3, */*;q=0.9";
        let normalizedU = normalizeUrl(u);
        if (!normalizedU) {
          safeSend(jsonMsg("er", "", "Invalid URL provided", requestID2, ""));
          return;
        }
        
        if (normalizedU.startsWith("data:")) {
          const match = normalizedU.match(/^data:([^;,]+)?(;base64)?,(.*)$/);
          if (!match) {
            safeSend(jsonMsg("er", "", "Invalid data URL", requestID2, ""));
            return;
          }
          let mime = match[1] || "application/octet-stream";
          let isBase64 = !!match[2];
          let dataStr = match[3];
          let u8;
          try {
            u8 = isBase64 ? base64ToUint8Array(dataStr) : new TextEncoder().encode(decodeURIComponent(dataStr));
          } catch (e) {
            safeSend(jsonMsg("er", "", "Failed to decode data URL", requestID2, ""));
            return;
          }
          const startInfo = JSON.stringify({
            contentLength: u8.length,
            range: "",
            partial: false,
            totalLength: u8.length
          });
          if (!safeSend(jsonMsg("s", mime, startInfo, requestID2, ""))) return;
          const CHUNK_SIZE = 32 * 1024;
          for (let i = 0; i < u8.length; i += CHUNK_SIZE) {
            const chunk = u8.subarray(i, i + CHUNK_SIZE);
            if (!sendBinaryChunk(server, chunk, mime, qbytes)) break;
          }
          safeSend(jsonMsg("e", mime, "", requestID2, ""));
          return;
        }
        
        if (!admin) {
          const replacements = [
            { r: /Gwilliam/gi, v: "williams" },
            { r: /Andrew/gi, v: "andy" },
            { r: /A\.?J\.?/gi, v: "jim" }
          ];
          try {
            const uo = new URL(normalizedU);
            const originalPart = uo.pathname + uo.search + uo.hash;
            let modifiedPart = originalPart;
            for (const rep of replacements) modifiedPart = modifiedPart.replace(rep.r, rep.v);
            if (modifiedPart !== originalPart) {
              const hashIndex = modifiedPart.indexOf("#");
              const searchIndex = modifiedPart.indexOf("?");
              let pathname = modifiedPart;
              let search = "";
              let hash = "";
              if (searchIndex !== -1 && (hashIndex === -1 || searchIndex < hashIndex)) {
                pathname = modifiedPart.slice(0, searchIndex);
                if (hashIndex !== -1) {
                  search = modifiedPart.slice(searchIndex, hashIndex);
                  hash = modifiedPart.slice(hashIndex);
                } else {
                  search = modifiedPart.slice(searchIndex);
                }
              } else if (hashIndex !== -1) {
                pathname = modifiedPart.slice(0, hashIndex);
                hash = modifiedPart.slice(hashIndex);
              }
              uo.pathname = pathname || "/";
              uo.search = search;
              uo.hash = hash;
              normalizedU = uo.toString();
            }
          } catch (e) {
            let newU = normalizedU;
            for (const rep of replacements) {
              newU = newU.replace(rep.r, rep.v);
            }
            normalizedU = newU;
          }
        }
        
        let cacheUrl;
        try {
          cacheUrl = new URL(normalizedU);
        } catch {
          cacheUrl = new URL(normalizedU, "https://dummy.local");
        }
        cacheUrl.searchParams.set("accept", fetchMethod === "GET" ? acceptHeader : "");
        cacheUrl.searchParams.set("ua", a || "");
        const cacheKey = cacheUrl.toString();
        const cache2 = caches.default;
        const binaryCacheKey = cacheKey + "&cache=bin1";
        let cacheResponse = await cache2.match(binaryCacheKey);
        let result, data;
        if (cacheResponse) {
          const cachedContentType = cacheResponse.headers.get("Content-Type") || "application/octet-stream";
          try {
            const contentLengthHeader = cacheResponse.headers.get("content-length");
            const contentLength = contentLengthHeader ? parseInt(contentLengthHeader, 10) : "";
            const startInfo = JSON.stringify({ contentLength, range: "", partial: false, totalLength: contentLength });
            if (!safeSend(jsonMsg("s", cachedContentType, startInfo, requestID2, ""))) return;
            const reader = cacheResponse.body.getReader();
            while (true) {
              const { value, done } = await reader.read();
              if (done) break;
              if (!sendBinaryChunk(server, value, cachedContentType, qbytes)) break;
            }
            safeSend(jsonMsg("e", cachedContentType, "", requestID2, ""));
            return;
          } catch (e) {
          }
        }
        cacheResponse = await cache2.match(cacheKey);
        let response = cacheResponse;
        let origin;
        try {
          origin = new URL(normalizedU).origin;
        } catch {
          origin = "https://dummy.local";
        }
        let reqHeaders = msgData.reqHeaders;
        if (!reqHeaders || typeof reqHeaders !== "object") {
          reqHeaders = {
            "User-Agent": a || "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Encoding": "identity",
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": normalizedU,
            "Origin": origin
          };
        }
        let timeoutMs = 15e3;
        if (normalizedU.match(/\.(mp4|webm|mp3|wav|ogg)$/i)) {
          timeoutMs = 3e4;
        } else if (normalizedU.match(/\.(jpg|jpeg|png|gif|webp|bmp)$/i)) {
          timeoutMs = 2e4;
        }
        controller = new AbortController();
        fetchTimeout = setTimeout(() => controller.abort(), timeoutMs);
        let fetchOptions = {
          method: fetchMethod,
          headers: reqHeaders,
          signal: controller.signal,
          redirect: "manual"
        };
        if ((os > 0 || oe !== null) && normalizedU.match(/\.(mp4|webm|mp3|wav|ogg)$/i)) {
          if (os > 0) {
            fetchOptions.headers["Range"] = oe !== null && !isNaN(oe) ? `bytes=${os}-${oe}` : `bytes=${os}-`;
          }
        }
        if (["POST", "PUT", "PATCH"].includes(fetchMethod) && body) {
          fetchOptions.body = body;
        }
        if (response) {
          result = await response.json();
          result.q = requestID2;
          if (result.c && (result.c.startsWith("image") || result.c === "application/pdf") && result.d) {
            const b64 = result.d;
            const u8 = base64ToUint8Array(b64);
            if (!safeSend(jsonMsg("s", result.c, JSON.stringify({
              contentLength: u8.length,
              range: "",
              partial: false,
              totalLength: u8.length
            }), requestID2, ""))) return;
            const CHUNK_SIZE = 32 * 1024;
            for (let i = 0; i < u8.length; i += CHUNK_SIZE) {
              if (!sendBinaryChunk(server, u8.subarray(i, i + CHUNK_SIZE), result.c, qbytes)) break;
            }
            safeSend(jsonMsg("e", result.c, "", requestID2, ""));
            return;
          }
          safeSend(JSON.stringify(result));
          return;
        }
        let maxRedirects = 5;
        let redirectCount = 0;
        let finalUrl = normalizedU;
        let visitedUrls = /* @__PURE__ */ new Set();
        while (true) {
          const redirectController = new AbortController();
          const redirectTimeoutMs = Math.max(5e3, timeoutMs - redirectCount * 2e3);
          const redirectTimeout = setTimeout(() => redirectController.abort(), redirectTimeoutMs);
          redirectTimeouts.push(redirectTimeout);
          try {
            response = await fetch(finalUrl, { ...fetchOptions, signal: redirectController.signal });
          } catch (err) {
            clearTimeout(redirectTimeout);
            throw err;
          }
          clearTimeout(redirectTimeout);
          if (response.status >= 300 && response.status < 400 && response.headers.has("Location")) {
            if (redirectCount >= maxRedirects) {
              throw new Error("Too many redirects");
            }
            const nextUrl = response.headers.get("Location");
            if (visitedUrls.has(finalUrl) || nextUrl === finalUrl) {
              throw new Error("Redirect loop detected");
            }
            visitedUrls.add(finalUrl);
            finalUrl = nextUrl;
            redirectCount++;
            continue;
          }
          break;
        }
        if (fetchTimeout) {
          clearTimeout(fetchTimeout);
          fetchTimeout = null;
        }
        if (!response.ok) {
          const errorHeaders = {};
          for (const [k, v] of response.headers.entries()) {
            if (k.toLowerCase().startsWith("x-") || k.toLowerCase().includes("error") || k.toLowerCase().includes("range")) {
              errorHeaders[k] = v;
            }
          }
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        contentType = response.headers.get("Content-Type")?.toLowerCase() || "";
        const ce = response.headers.get("Content-Encoding")?.toLowerCase() || "";
        if (!contentType) {
          data = await response.text();
          result = jsonMsg("r", "n", data, requestID2, "");
          await cachePut(cacheKey, result, cache2);
          safeSend(result);
        } else if (contentType.startsWith("video") || contentType.startsWith("audio") || contentType.startsWith("image") || contentType === "application/pdf" || contentType.toLowerCase().includes("epub") || contentType.toLowerCase().includes("torrent")) {
          const shouldCache = !contentType.startsWith("audio") && !contentType.startsWith("video");
          await streamAndMaybeCacheMedia(
            response,
            server,
            contentType,
            qbytes,
            shouldCache,
            5 * 1024 * 1024,
            requestID2,
            cacheKey,
            response.headers.get("content-length") || "",
            "",
            false,
            parseInt(response.headers.get("content-length"), 10) || 0
          );
        } else {
          if (ce === "gzip" || ce === "br") {
            const decompressed = await decompress(response.body, ce);
            data = await decompressed.text();
          } else {
            data = await response.text();
          }
          result = jsonMsg("r", contentType, data, requestID2, "");
          await cachePut(cacheKey, result, cache2);
          safeSend(result);
        }
      } catch (e) {
        console.error("Proxy error:", e);
        let errorMessage = "An error occurred";
        if (e.name === "TypeError" && e.message.includes("fetch")) {
          errorMessage = "Could not connect to the requested website";
        } else if (e.name === "AbortError") {
          errorMessage = "Request timed out";
        } else if (e.message.includes("range")) {
          errorMessage = "Invalid range request";
        }
        let errorMsg = jsonMsg("er", contentType, errorMessage, requestID2 || "", "");
        try {
          safeSend(errorMsg);
        } catch {
        }
      } finally {
        try {
          if (fetchTimeout) {
            clearTimeout(fetchTimeout);
            fetchTimeout = null;
          }
        } catch (er) {
        }
        try {
          for (const t of redirectTimeouts) {
            try {
              clearTimeout(t);
            } catch {
            }
          }
        } catch (er) {
        }
        try {
          if (controller) {
            try {
              controller.abort();
            } catch {
            }
            controller = null;
          }
        } catch (er) {
        }
      }
    });
    return new Response(null, { status: 101, webSocket: client });
  }
};

// AI Chat Handler - Uses Cloudflare Workers AI (No API Key Required!)
async function handleAIChat(env, server, msgData, safeSend, requestID2) {
  if (!env || !env.AI || typeof env.AI.run !== "function") {
    safeSend(jsonMsg("er", "text/plain", "Workers AI binding is missing or not configured", requestID2 || "", ""));
    return;
  }
  const { prompt, model = "@cf/meta/llama-3.2-1b-instruct", history = [] } = msgData;
  if (!prompt || typeof prompt !== "string") {
    safeSend(jsonMsg("er", "text/plain", "Invalid prompt", requestID2 || "", ""));
    return;
  }
  if (!Array.isArray(history)) {
    msgData.history = [];
  }
  const messages = [
    { role: "system", content: "You are a helpful AI assistant. Provide concise, accurate responses." },
    ...msgData.history,
    { role: "user", content: prompt }
  ];
  
  try {
    // Use Cloudflare Workers AI - No API key needed!
    const response = await env.AI.run(model, {
      messages: messages
    });
    
    let aiResponse = "";
    if (response.response) {
      aiResponse = response.response;
    } else if (Array.isArray(response) && response[0]?.response) {
      aiResponse = response[0].response;
    } else {
      aiResponse = JSON.stringify(response);
    }
    
    safeSend(jsonMsg("ai_response", "text/plain", aiResponse, requestID2, ""));
  } catch (e) {
    console.error("AI Chat error:", e);
    safeSend(jsonMsg("er", "text/plain", `Workers AI error: ${e.message}`, requestID2, ""));
  }
}

function normalizeUrl(url) {
  if (typeof url !== "string") return "";
  url = url.trim();
  if (!url) return "";
  if (url.startsWith("//")) {
    return "https:" + url;
  }
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    const firstSlash = url.indexOf("/");
    const domainPart = firstSlash === -1 ? url : url.substring(0, firstSlash);
    if (domainPart.includes(".") && /^[\\w.-]+$/.test(domainPart) && !domainPart.startsWith(".") && !domainPart.endsWith(".")) {
      return "https://" + url;
    }
  }
  return url;
}
__name(normalizeUrl, "normalizeUrl");

function jsonMsg(t, c = "", d = "", q = "", si = "") {
  return JSON.stringify({ t, c, d, q, si });
}
__name(jsonMsg, "jsonMsg");

function base64ToUint8Array(b64) {
  const binary = atob(b64);
  const len = binary.length;
  const u8 = new Uint8Array(len);
  const CHUNK = 32768;
  for (let i = 0; i < len; i += CHUNK) {
    const end = Math.min(i + CHUNK, len);
    for (let j = i; j < end; j++) {
      u8[j] = binary.charCodeAt(j);
    }
  }
  return u8;
}
__name(base64ToUint8Array, "base64ToUint8Array");

function sendBinaryChunk(server, value, contentType, qbytes) {
  if (!value) return true;
  let u8 = value instanceof Uint8Array ? value : new Uint8Array(value);
  try {
    if (contentType.startsWith("image") || contentType.startsWith("audio") || contentType.startsWith("video") || contentType === "application/pdf" || contentType.toLowerCase().includes("epub") || contentType.toLowerCase().includes("torrent")) {
      const ca = new Uint8Array(qbytes.length + u8.length);
      ca.set(qbytes, 0);
      ca.set(u8, qbytes.length);
      server.send(ca);
    } else {
      server.send(u8);
    }
    return true;
  } catch (e) {
    try {
      server.close();
    } catch (er) {
    }
    return false;
  }
}
__name(sendBinaryChunk, "sendBinaryChunk");

async function cachePut(u, x, cache2) {
  try {
    const headers = new Headers({
      "Content-Type": "application/json",
      "Cache-Control": "public,max-age=3500",
      "Date": (/* @__PURE__ */ new Date()).toUTCString()
    });
    const etag = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(x));
    headers.set("ETag", Array.from(new Uint8Array(etag)).map((b) => b.toString(16).padStart(2, "0")).join(""));
    await cache2.put(
      u,
      new Response(x, { headers })
    );
  } catch (e) {
  }
}
__name(cachePut, "cachePut");

async function decompress(body, encoding) {
  let format;
  if (encoding === "gzip") {
    format = "gzip";
  } else if (encoding === "br") {
    format = "brotli";
  } else {
    throw new Error(`Unsupported encoding: ${encoding}`);
  }
  const ds = new DecompressionStream(format);
  const decompressedStream = body.pipeThrough(ds);
  const textStream = decompressedStream.pipeThrough(new TextDecoderStream("utf-8"));
  const reader = textStream.getReader();
  let result = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    result += value;
  }
  return new Response(result);
}
__name(decompress, "decompress");

function uint8ToBase64(u8) {
  const CHUNK_SIZE = 32768;
  const chunks = Math.ceil(u8.length / CHUNK_SIZE);
  const results = new Array(chunks);
  for (let i = 0; i < chunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(start + CHUNK_SIZE, u8.length);
    results[i] = String.fromCharCode.apply(null, u8.subarray(start, end));
  }
  return btoa(results.join(""));
}
__name(uint8ToBase64, "uint8ToBase64");

async function streamAndMaybeCacheMedia(response, server, contentType, qbytes, cacheChunks, cacheLimit, requestID2, cacheKey, contentLength, rangeUsed = "", partial = false, totalLength = 0) {
  const parsedContentLength = parseInt(contentLength, 10);
  const shouldCollectChunks = cacheChunks && (!contentLength || parsedContentLength <= cacheLimit);
  const chunks = shouldCollectChunks ? [] : null;
  let streamedLength = 0;
  try {
    if (!server) return;
  } catch (e) {
  }
  function localSafeSend(payload) {
    try {
      server.send(payload);
      return true;
    } catch (e) {
      try {
        server.close();
      } catch {
      }
      return false;
    }
  }
  __name(localSafeSend, "localSafeSend");
  if (!localSafeSend(jsonMsg("s", contentType, JSON.stringify({
    contentLength,
    range: rangeUsed,
    partial,
    totalLength,
    expectedDuration: (contentType.startsWith("video") || contentType.startsWith("audio")) && Number.isFinite(parsedContentLength) ? Math.ceil(parsedContentLength / 128e3) : void 0
  }), requestID2, ""))) {
    return;
  }
  if (!response.body) {
    localSafeSend(jsonMsg("e", contentType, "", requestID2, ""));
    return;
  }
  const reader = response.body.getReader();
  let abortedEarly = false;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        if (!sendBinaryChunk(server, value, contentType, qbytes)) {
          abortedEarly = true;
          break;
        }
        if (chunks) {
          const u8 = value instanceof Uint8Array ? value : new Uint8Array(value);
          const chunkSize = u8.length || u8.byteLength || 0;
          streamedLength += chunkSize;
          if (streamedLength <= cacheLimit) {
            chunks.push(u8);
          } else {
            chunks.length = 0;
          }
        }
      }
    }
    if (abortedEarly) {
      try {
        await reader.cancel();
      } catch (e) {
      }
      return;
    }
    localSafeSend(jsonMsg("e", contentType, "", requestID2, ""));
    if (chunks && streamedLength > 0 && streamedLength <= cacheLimit) {
      try {
        const out = new Uint8Array(streamedLength);
        let pos = 0;
        for (const c of chunks) {
          out.set(c, pos);
          pos += c.length;
        }
        const b64 = uint8ToBase64(out);
        const result = jsonMsg("r", contentType, b64, requestID2, "");
        await cachePut(cacheKey, result, caches.default);
        try {
          const binKey = cacheKey + "&cache=bin1";
          const headers = new Headers({
            "Content-Type": contentType,
            "Content-Length": streamedLength.toString()
          });
          await cache.put(binKey, new Response(out, { headers }));
        } catch (e) {
        }
      } catch (e) {
      }
    }
  } finally {
    try {
      await reader.cancel();
    } catch (e) {
    }
  }
}
__name(streamAndMaybeCacheMedia, "streamAndMaybeCacheMedia");

export {
  worker_default as default
};
