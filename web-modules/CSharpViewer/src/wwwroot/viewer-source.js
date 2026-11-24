/* Repository adapter for the shared SourceViewer tokenizer and annotation controller.
   It presents immutable source; no editor or file-write API is introduced. */
(function (root) {
  'use strict';
  function render(file, code) {
    const cm = root.CodeMirror;
    if (!cm || !cm.modes['source-csharp'] || !root.BuffalySourceAnnotations)
      throw new Error('Source presentation assets are unavailable. Reload the viewer.');
    const csharp = /\.cs$/i.test(file.path), mode = csharp ? cm.getMode({}, 'source-csharp') : null;
    const state = mode ? cm.startState(mode) : null, fragment = document.createDocumentFragment();
    file.content.split('\n').forEach((line, index) => {
      const row = document.createElement('span'); row.className = 'source-line'; row.dataset.line = String(index + 1);
      if (!mode) row.textContent = line;
      else {
        const stream = new cm.StringStream(line, 4);
        if (!line && mode.blankLine) mode.blankLine(state);
        while (!stream.eol()) {
          stream.start = stream.pos;
          const style = mode.token(stream, state);
          if (stream.pos <= stream.start) throw new Error('Source tokenizer did not advance.');
          const text = document.createTextNode(stream.current());
          if (!style) row.append(text);
          else { const token = document.createElement('span'); token.className = style.split(/\s+/).map(name => 'cm-' + name).join(' '); token.append(text); row.append(token); }
        }
      }
      fragment.append(row);
    });
    code.replaceChildren(fragment);
  }
  function mount({ file, sessionKey, code, host, toolbar, notesHost }) {
    let disposed = false, notify = () => {}, current = null, markerId = 0;
    const lines = [...code.querySelectorAll('.source-line')], markers = new Set();
    const source = file.content.split('\n');
    function point(node, offset) {
      const element = node.nodeType === 1 ? node : node.parentElement;
      const row = element && element.closest('.source-line');
      if (!row || !code.contains(row)) return null;
      const range = document.createRange(); range.selectNodeContents(row); range.setEnd(node, offset);
      return { line: Number(row.dataset.line) - 1, ch: range.toString().length };
    }
    function selectionChanged() {
      const selection = root.getSelection(); current = null;
      if (!disposed && selection && selection.rangeCount && !selection.isCollapsed) {
        const range = selection.getRangeAt(0), from = point(range.startContainer, range.startOffset), to = point(range.endContainer, range.endOffset);
        if (from && to) current = { from, to };
      }
      notify();
    }
    function getRange(from, to) {
      if (from.line === to.line) return (source[from.line] || '').slice(from.ch, to.ch);
      return [(source[from.line] || '').slice(from.ch), ...source.slice(from.line + 1, to.line), (source[to.line] || '').slice(0, to.ch)].join('\n');
    }
    function boundary(position) {
      const row = lines[position.line]; if (!row) return null;
      const walker = document.createTreeWalker(row, NodeFilter.SHOW_TEXT); let remaining = position.ch, node;
      while ((node = walker.nextNode())) { if (remaining <= node.length) return [node, remaining]; remaining -= node.length; }
      return remaining === 0 ? [row, row.childNodes.length] : null;
    }
    const editor = {
      getSelection: () => current ? getRange(current.from, current.to) : '',
      getCursor: name => current && current[name], getRange, lineCount: () => lines.length,
      on(name, action) { if (name !== 'cursorActivity') throw new Error('Unsupported annotation editor event.'); notify = action; },
      markText(from, to) {
        const name = 'repository-note-' + (++markerId), start = boundary(from), end = boundary(to);
        // The shared controller has already checked source equality. Highlight only exact DOM ranges.
        if (!disposed && start && end && root.CSS && root.CSS.highlights && root.Highlight) {
          const range = document.createRange(); range.setStart(...start); range.setEnd(...end);
          root.CSS.highlights.set(name, new root.Highlight(range)); markers.add(name);
          // All annotation ranges share one application-owned highlight rule.
          const ranges = [...markers].flatMap(key => [...root.CSS.highlights.get(key)]);
          root.CSS.highlights.set('repository-notes', new root.Highlight(...ranges));
        }
        return { clear() { if (!disposed && root.CSS && root.CSS.highlights) { root.CSS.highlights.delete(name); markers.delete(name); const ranges = [...markers].flatMap(key => [...root.CSS.highlights.get(key)]); root.CSS.highlights.set('repository-notes', new root.Highlight(...ranges)); } } };
      },
      addLineWidget(line, node) { if (!disposed) notesHost.append(node); return { clear() { node.remove(); } }; }
    };
    document.addEventListener('selectionchange', selectionChanged);
    const controller = root.BuffalySourceAnnotations.mount({ editor, file, sessionKey, host, toolbar });
    toolbar.hidden = false;
    return { dispose() {
      disposed = true; controller.setActive(false); document.removeEventListener('selectionchange', selectionChanged);
      if (root.CSS && root.CSS.highlights) { for (const name of markers) root.CSS.highlights.delete(name); root.CSS.highlights.delete('repository-notes'); }
      markers.clear(); host.remove(); toolbar.remove(); notesHost.remove();
    } };
  }
  root.CSharpViewerSource = Object.freeze({ render, mount });
})(window);
