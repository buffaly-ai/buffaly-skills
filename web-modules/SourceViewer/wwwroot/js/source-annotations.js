(function (root) {
	"use strict";
	function mount(options) {
		const { editor, file, sessionKey, host, toolbar } = options;
		const storage = root.localStorage;
		const key = "buffaly:source-notes:" + JSON.stringify([sessionKey, file.path]);
		const batchKey = key + ":submission";
		let notes = [], selection = null, editingId = null, busy = false, active = true, hasSubmission = false, draftsReady = false;
		let markers = [], widgets = [], selectionFrame = 0, saving = false, editRevision = 0;
		toolbar.innerHTML = '<span id="source-note-summary" role="status"></span><div class="source-viewer__actions"><button id="source-note-send" type="button" hidden><i class="fas fa-paper-plane" aria-hidden="true"></i>Send annotations</button></div>';
		host.innerHTML = '<dialog class="source-viewer__note-dialog" aria-labelledby="source-note-title"><form><h2 id="source-note-title">Add source note</h2><p id="source-note-range"></p><pre id="source-note-snippet"></pre><label for="source-note-text">Note to the agent</label><textarea id="source-note-text" required rows="5"></textarea><p id="source-note-error" role="alert"></p><div class="source-viewer__actions"><button id="source-note-remove" type="button" hidden><i class="fas fa-times" aria-hidden="true"></i>Remove</button><button id="source-note-cancel" type="button"><i class="fas fa-times" aria-hidden="true"></i>Cancel</button><button id="source-note-save" type="submit" class="source-viewer__primary"><i class="fas fa-check" aria-hidden="true"></i>Save note</button></div></form></dialog>';
		host.insertAdjacentHTML('beforeend', '<button id="source-note-add" class="source-viewer__annotation-selection source-viewer__primary" type="button" hidden><i class="fas fa-plus" aria-hidden="true"></i>Annotate</button>');
		const find = id => host.querySelector('#' + id) || toolbar.querySelector('#' + id);
		const summary = find('source-note-summary'), add = find('source-note-add'), send = find('source-note-send');
		const dialog = host.querySelector('dialog'), text = find('source-note-text'), error = find('source-note-error');
		// Use the host's shared Scribe, including retained-audio recovery and authoritative finalization.
		find('source-note-remove').insertAdjacentHTML('beforebegin', '<button id="source-note-scribe" type="button" data-scribe-target="source-note-text"><span class="fas fa-microphone" aria-hidden="true"></span><span class="visually-hidden">Start Recording</span></button>');
		const scribe = root.ScribeAutoInit.getController(find('source-note-scribe'));
		// CodeMirror's painted multi-line rectangles include blank horizontal scroll space.
		// Adapt source character endpoints to visible text fragments before shared placement.
		function selectionRects() {
			const from = editor.getCursor('from'), to = editor.getCursor('to'), viewport = editor.getViewport();
			const bounds = editor.getWrapperElement().getBoundingClientRect(), rects = [];
			for (let line = Math.max(from.line, viewport.from); line <= Math.min(to.line, viewport.to - 1); line++) {
				const start = editor.charCoords({ line, ch: line === from.line ? from.ch : 0 }, 'window');
				const end = editor.charCoords({ line, ch: line === to.line ? to.ch : editor.getLine(line).length }, 'window');
				const left = Math.max(start.left, bounds.left), right = Math.min(end.left, bounds.right);
				const top = Math.max(start.top, bounds.top), bottom = Math.min(end.bottom, bounds.bottom);
				rects.push({ left, right, top, bottom, width: right - left, height: bottom - top });
			}
			return rects;
		}
		function positionSelection() {
			selectionFrame = 0;
			add.hidden = true;
			if (!draftsReady || !active || !selection || dialog.open) return;
			root.BuffalyAnnotationSelection.position(add, selectionRects());
		}
		function scheduleSelection() {
			if (!selectionFrame) selectionFrame = root.requestAnimationFrame(positionSelection);
		}
		function lineLabel(note) { return note.StartLine === note.EndLine ? "Line " + note.StartLine : "Lines " + note.StartLine + "–" + note.EndLine; }
		function update(message) {
			add.hidden = true;
			scheduleSelection();
			send.hidden = !draftsReady || (!notes.length && !hasSubmission) || !sessionKey;
			add.disabled = !draftsReady;
			send.disabled = !draftsReady || busy;
			find('source-note-save').disabled = !draftsReady || saving;
			find('source-note-remove').disabled = !draftsReady || saving;
			// One primary command per region: annotate a selection until there is a batch to send.
			add.classList.add('source-viewer__primary');
			send.classList.toggle('source-viewer__primary', !send.hidden);
			summary.textContent = !draftsReady ? "Could not load saved notes. Reload before adding notes." : busy ? "Sending annotations…" : message || (notes.length ? notes.length + " note" + (notes.length === 1 ? "" : "s") + (sessionKey ? " ready to send." : ". Open this file from a session to send notes.") : sessionKey ? "Select source text to annotate." : "Open this file from a session to send notes.");
		}
		function render() {
			markers.forEach(marker => marker.clear()); widgets.forEach(widget => widget.clear()); markers = []; widgets = [];
			for (const note of notes) {
				// Only mark an exact still-matching range; an old draft never silently attaches to different code.
				const matches = editor.getRange(note.From, note.To) === note.SelectedText;
				if (matches) markers.push(editor.markText(note.From, note.To, { className: "source-viewer__noted", title: note.Note }));
				const node = document.createElement('div'); node.className = "source-viewer__inline-note";
				const label = document.createElement('strong'); label.textContent = lineLabel(note) + (matches ? "" : " · Source changed; original selection retained");
				const content = document.createElement('p'); content.textContent = note.Note;
				const edit = document.createElement('button'); edit.type = "button"; edit.innerHTML = '<i class="fas fa-cogs" aria-hidden="true"></i>Edit note';
				edit.addEventListener('click', () => open(note)); node.append(label, content, edit);
				widgets.push(editor.addLineWidget(Math.min(note.EndLine - 1, editor.lineCount() - 1), node, { coverGutter: false, noHScroll: true }));
			}
			update();
		}
		// Never replace drafts that were not successfully read and validated, even if storage recovers later.
		function persist(next) { if (!draftsReady) throw new Error("Saved notes have not loaded."); storage.setItem(key, JSON.stringify(next)); notes = next; render(); }
		function selected() {
			const value = editor.getSelection();
			if (!value) return null;
			const from = editor.getCursor('from'), to = editor.getCursor('to');
			return { FilePath: file.path, StartLine: from.line + 1, EndLine: to.line + (to.ch === 0 && to.line > from.line ? 0 : 1), From: { line: from.line, ch: from.ch }, To: { line: to.line, ch: to.ch }, SelectedText: value, Note: "" };
		}
		function open(note) {
			if (!draftsReady || !active || dialog.open) return;
			editRevision++; add.hidden = true;
			selection = note; editingId = note.Id || null;
			find('source-note-title').textContent = editingId ? "Edit source note" : "Add source note";
			find('source-note-range').textContent = file.name + " · " + lineLabel(note);
			find('source-note-snippet').textContent = note.SelectedText;
			text.value = note.Note; error.textContent = ""; find('source-note-remove').hidden = !editingId;
			// Let Save stop/finalize dictation before testing whether the note is empty.
			text.required = false;
			dialog.showModal(); text.focus();
		}
		function closeEditor() {
			editRevision++; saving = false; scribe.cancel(); dialog.close(); update();
		}
		function instruction(payload) {
			const lines = ["Source viewer annotations received from Buffaly.", "", "Path: " + payload.ResolvedPath, "Viewer URL: " + payload.ViewerUrl, ""];
			payload.Annotations.forEach((note, index) => {
				lines.push("Annotation " + (index + 1) + " — " + lineLabel(note), "Note: " + note.Note, "Selected source:", note.SelectedText, "");
			});
			lines.push("Process these source annotations in the context of the current task. Structured annotations are in UserState.SourceViewerAnnotations.");
			return lines.join('\n');
		}
		async function submit() {
			if (!draftsReady || busy || !sessionKey || (!notes.length && !hasSubmission)) return;
			let resultMessage;
			busy = true; update("Sending annotations…");
			try {
				let input = JSON.parse(storage.getItem(batchKey) || "null");
				if (!input) {
					const payload = { Path: file.path, ResolvedPath: file.path, AgentSessionKey: sessionKey, ViewerUrl: root.location.href, SentUtc: new Date().toISOString(), Annotations: JSON.parse(JSON.stringify(notes)) };
					input = { Instruction: instruction(payload), PromptContext: "CodingContext", MessageKey: "source-annotations:" + root.crypto.randomUUID(), UserState: { SourceViewerAnnotations: payload }, Images: [], Files: [] };
					// Persist the exact input before admission. An uncertain retry must reuse this key and revision.
					storage.setItem(batchKey, JSON.stringify(input));
					hasSubmission = true;
				}
				const payload = input.UserState && input.UserState.SourceViewerAnnotations;
				if (!input.MessageKey || !payload || payload.AgentSessionKey !== sessionKey || payload.ResolvedPath !== file.path || !Array.isArray(payload.Annotations)) throw new Error("Invalid saved submission.");
				const response = await root.fetch('/api/buffaly.agent.host/buffaly-agent-service/queue-input', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sessionKey, input }) });
				if (!response.ok) throw new Error("Queue request failed.");
				const receipt = await response.json();
				if (receipt.Accepted !== true || receipt.MessageKey !== input.MessageKey) throw new Error("Admission not confirmed.");
				persist(notes.filter(note => !payload.Annotations.some(sent => sent.Id === note.Id && JSON.stringify(sent) === JSON.stringify(note))));
				storage.removeItem(batchKey);
				hasSubmission = false;
				resultMessage = "Annotations queued to the calling session.";
			} catch (failure) {
				resultMessage = "Send not confirmed. Notes retained; retry to confirm the same submission.";
			} finally { busy = false; update(resultMessage); }
		}
		add.addEventListener('pointerdown', event => event.preventDefault());
		add.addEventListener('mousedown', event => event.preventDefault());
		add.addEventListener('click', () => { if (selection) open(selection); });
		send.addEventListener('click', submit);
		find('source-note-cancel').addEventListener('click', closeEditor);
		dialog.addEventListener('cancel', event => { event.preventDefault(); closeEditor(); });
		dialog.querySelector('form').addEventListener('submit', async event => {
			event.preventDefault();
			if (!draftsReady) { error.textContent = "Reload to recover saved notes before making changes."; return; }
			if (!dialog.open || saving) return;
			const revision = editRevision;
			saving = true; error.textContent = ""; update();
			try {
				await scribe.stopAndWaitForIdle();
				if (revision !== editRevision || !dialog.open) return;
				if (!selection || !text.value.trim()) { error.textContent = "Enter a note."; return; }
				const note = Object.assign({}, selection, { Id: editingId || root.crypto.randomUUID(), Note: text.value.trim() });
				persist(notes.filter(item => item.Id !== editingId).concat(note)); closeEditor();
			} catch (failure) {
				if (revision === editRevision) error.textContent = "Could not save the draft. Your note and recording are still here. Retry dictation or save again.";
			} finally { if (revision === editRevision) { saving = false; update(); } }
		});
		find('source-note-remove').addEventListener('click', () => {
			if (saving) return;
			try { persist(notes.filter(note => note.Id !== editingId)); closeEditor(); }
			catch (failure) { error.textContent = "Could not remove the draft. Try again."; }
		});
		editor.on('cursorActivity', () => { if (!dialog.open) { selection = selected(); update(); } });
		editor.on('scroll', scheduleSelection);
		root.addEventListener('scroll', scheduleSelection, true);
		root.addEventListener('resize', scheduleSelection);
		if (root.visualViewport) {
			root.visualViewport.addEventListener('scroll', scheduleSelection);
			root.visualViewport.addEventListener('resize', scheduleSelection);
		}
		try {
			hasSubmission = !!storage.getItem(batchKey);
			const saved = JSON.parse(storage.getItem(key) || "[]");
			if (!Array.isArray(saved) || saved.some(note => !note.Id || !note.From || !note.To || !Number.isInteger(note.StartLine) || !Number.isInteger(note.EndLine) || typeof note.SelectedText !== 'string' || typeof note.Note !== 'string' || note.FilePath !== file.path)) throw new Error('Invalid drafts.');
			notes = saved; selection = selected(); render();
			const changed = notes.some(note => editor.getRange(note.From, note.To) !== note.SelectedText);
			draftsReady = true;
			update(changed ? "Source changed. Saved notes retain their original selections; review them before sending." : "");
		} catch (failure) { draftsReady = false; update(); }
		return { setActive(value) { active = value; toolbar.hidden = !value; if (!value && dialog.open) closeEditor(); update(); } };
	}
	root.BuffalySourceAnnotations = Object.freeze({ mount });
})(window);
