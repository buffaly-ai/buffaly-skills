// Read-only, viewport-triggered filename enrichment in a collapsed-by-default disclosure.
(function () {
  "use strict";
  const selector = "a.code-reviews-semantic-ref-git-commit";
  const completed = new Map(), pending = new Map(), owners = new WeakMap();
  const queue = [];
  let active = 0;
  function pump() {
    while (active < 2 && queue.length) {
      const job = queue.shift(); active++;
      job().finally(() => { active--; pump(); });
    }
  }
  function read(identity, offset) {
    const key = JSON.stringify([identity.endpoint, identity.repository, identity.sha, offset]);
    if (completed.has(key)) return Promise.resolve(completed.get(key));
    if (pending.has(key)) return pending.get(key);
    if (pending.size === 128) return Promise.resolve({ Error: "File list is busy. Try again." });
    const promise = new Promise(resolve => {
      queue.push(async () => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000);
        let result;
        try {
          const url = new URL(identity.endpoint);
          url.search = new URLSearchParams({ repositoryPath: identity.repository, commitSha: identity.sha, offset: String(offset) }).toString();
          const response = await fetch(url, { credentials: "same-origin", cache: "no-store", headers: { Accept: "application/json" }, signal: controller.signal });
          if (!response.ok) throw new Error("Commit file request failed with HTTP " + response.status);
          result = await response.json();
          if (!validPage(result, identity, offset)) throw new Error("Invalid commit-file response.");
        } catch (error) {
          console.warn("Commit-file metadata unavailable", error);
          result = { Error: "Could not load files. Try again." };
        } finally { clearTimeout(timeout); }
        pending.delete(key); completed.set(key, result);
        while (completed.size > 128) completed.delete(completed.keys().next().value);
        resolve(result);
      });
    });
    pending.set(key, promise); pump();
    return promise;
  }
  function contained(path) {
    return typeof path === "string" && path.length > 0 && !/[\\:\u0000-\u001f\u007f]/.test(path) && !path.split("/").some(part => part === "" || part === "." || part === "..");
  }
  function validPage(page, identity, offset) {
    return page && typeof page.RepositoryPath === "string" && /^(?:[A-Za-z]:[\\/]|\\\\)/.test(page.RepositoryPath)
      && typeof page.CommitSha === "string" && page.CommitSha.toLowerCase() === identity.sha
      && typeof page.ParentSha === "string" && /^(?:[0-9a-f]{40})?$/.test(page.ParentSha)
      && page.Offset === offset && Number.isInteger(page.TotalFiles) && page.TotalFiles >= offset && page.TotalFiles <= 10000
      && Array.isArray(page.Files) && page.Files.length === Math.min(8, page.TotalFiles - offset)
      && page.Files.every(file => contained(file.Path) && (file.OriginalPath === "" || contained(file.OriginalPath)) && /^[ACDMRTUXB][0-9]*$/.test(file.StatusCode) && typeof file.IsCode === "boolean");
  }
  function identityFor(anchor) {
    const url = new URL(anchor.href, location.href);
    const repository = url.searchParams.get("path"), sha = url.searchParams.get("sha");
    if (url.origin !== location.origin || !url.pathname.endsWith("/diff.html") || url.searchParams.get("mode") !== "commit"
        || !repository || !/^(?:[A-Za-z]:[\\/]|\\\\)/.test(repository) || !/^[0-9a-fA-F]{40}$/.test(sha || "")) return null;
    return { repository, sha: sha.toLowerCase(), endpoint: new URL("api/commit-files", url).href };
  }
  function command(label, icon, action) {
    const button = document.createElement("button");
    button.type = "button"; button.className = "btn btn-light";
    const glyph = document.createElement("i"); glyph.className = "fas " + icon; glyph.setAttribute("aria-hidden", "true");
    button.append(glyph, document.createTextNode(" " + label)); button.addEventListener("click", action);
    return button;
  }
  function start() {
    const timeline = document.getElementById("opsV2Messages");
    if (!timeline) return;
    if (typeof IntersectionObserver !== "function") { console.warn("Commit files require IntersectionObserver."); return; }
    const states = new WeakMap();
    let disclosureId = 0;
    async function show(state, offset, retry) {
      const serial = ++state.serial;
      state.content.textContent = "Loading files…";
      if (retry) completed.delete(JSON.stringify([state.identity.endpoint, state.identity.repository, state.identity.sha, offset]));
      const result = await read(state.identity, offset);
      if (!state.holder.isConnected || serial !== state.serial) return;
      state.content.replaceChildren();
      state.count.textContent = result.Error ? "Unavailable" : String(result.TotalFiles);
      const commands = document.createElement("span"); commands.className = "d-flex gap-2 align-items-center mb-2";
      state.content.append(commands);
      if (result.Error) {
        commands.append(command("Retry", "fa-redo", () => show(state, offset, true)));
        const message = document.createElement("span"); message.className = "d-block"; message.textContent = result.Error; state.content.append(message); return;
      }
      if (result.TotalFiles === 0) { state.content.textContent = "No files changed."; return; }
      const range = document.createElement("span"); range.className = "text-muted";
      range.textContent = (offset + 1) + "–" + (offset + result.Files.length) + " of " + result.TotalFiles;
      commands.append(range);
      if (offset > 0) commands.append(command("Previous", "fa-arrow-left", () => show(state, offset - 8, false)));
      if (offset + result.Files.length < result.TotalFiles) commands.append(command("Next", "fa-arrow-right", () => show(state, offset + 8, false)));
      const basenames = result.Files.map(file => file.Path.split("/").pop());
      for (const file of result.Files) {
        const row = document.createElement("span"); row.className = "d-flex align-items-center gap-2 py-1";
        const icon = document.createElement("i"); icon.className = "fas " + (file.IsCode ? "fa-file-code" : "fa-file-alt") + " text-muted";
        icon.setAttribute("aria-hidden", "true");
        const nameHost = document.createElement("span"); row.append(icon, nameHost);
        const name = file.Path.split("/").pop();
        const label = basenames.filter(value => value === name).length > 1 ? file.Path.split("/").slice(-2).join("/") : name;
        // The shared registry owns supported file types, including non-code text files.
        if (file.StatusCode[0] !== "D" && window.BuffalyFilePresentationProviders) {
          try {
            const launch = window.BuffalyFilePresentationProviders.resolve({ Path: result.RepositoryPath.replace(/[\\/]$/, "") + "/" + file.Path });
            const link = document.createElement("a"); link.href = launch.Url; link.textContent = label; link.title = "Open current source: " + file.Path; link.target = "_blank"; link.rel = "noopener noreferrer"; nameHost.append(link);
          } catch (error) { console.warn("Commit-file viewer unavailable", error); nameHost.textContent = label; }
        } else { nameHost.textContent = label; }
        if (file.StatusCode[0] === "D") nameHost.append(document.createTextNode(" — deleted"));
        if (file.OriginalPath) nameHost.append(document.createTextNode(" — from " + file.OriginalPath.split("/").pop()));
        state.content.append(row);
      }
    }
    const visibility = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) {
        visibility.unobserve(entry.target);
        const state = states.get(entry.target); if (state && entry.target.isConnected) show(state, 0, false);
      }
    }, { rootMargin: "200px" });
    function enhance(anchor) {
      if (states.get(anchor)?.holder.isConnected) return;
      const identity = identityFor(anchor); if (!identity) return;
      const owner = anchor.closest("[data-turn-key]") || anchor.parentElement;
      let seen = owners.get(owner); if (!seen) { seen = new Map(); owners.set(owner, seen); }
      const key = JSON.stringify([identity.endpoint, identity.repository, identity.sha]);
      if (seen.get(key)?.isConnected) return;
      const holder = document.createElement("span"); holder.className = "d-block mt-2";
      const content = document.createElement("span"); content.className = "d-block mt-2 ps-3 border-start";
      content.id = "code-reviews-commit-files-" + (++disclosureId); content.hidden = true; content.setAttribute("aria-live", "polite");
      const count = document.createElement("span"); count.className = "badge rounded-pill bg-light text-secondary border"; count.textContent = "…";
      const toggle = command("Changed files", "fa-chevron-right", () => {
        content.hidden = !content.hidden;
        toggle.setAttribute("aria-expanded", String(!content.hidden));
        toggle.querySelector("i").className = "fas " + (content.hidden ? "fa-chevron-right" : "fa-chevron-down");
      });
      toggle.classList.add("d-inline-flex", "align-items-center", "gap-2");
      toggle.setAttribute("aria-expanded", "false"); toggle.setAttribute("aria-controls", content.id); toggle.append(count);
      holder.append(toggle, content);
      (anchor.closest("p,li,td,th") || anchor.parentElement).append(holder);
      const state = { holder, content, count, identity, serial: 0 }; states.set(anchor, state); seen.set(key, holder); visibility.observe(anchor);
    }
    function scan(node) {
      if (!(node instanceof Element)) return;
      if (node.matches(selector)) enhance(node);
      node.querySelectorAll(selector).forEach(enhance);
    }
    scan(timeline);
    const mutations = new MutationObserver(records => {
      for (const record of records) {
        for (const node of record.removedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.matches(selector)) visibility.unobserve(node);
          node.querySelectorAll(selector).forEach(anchor => visibility.unobserve(anchor));
        }
        for (const node of record.addedNodes) scan(node);
      }
    });
    mutations.observe(timeline, { childList: true, subtree: true });
    // BFCache keeps this same observer/realm; do not disconnect on a persisted pagehide.
    window.addEventListener("pagehide", event => { if (!event.persisted) { visibility.disconnect(); mutations.disconnect(); } });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true }); else start();
}());
