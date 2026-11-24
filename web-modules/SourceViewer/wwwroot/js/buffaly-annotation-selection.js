(function (root) {
	"use strict";
	// Shared Markdown/SourceViewer placement: first visible fragment, visual viewport,
	// and below-selection placement on touch/narrow screens. Callers own selection semantics.
	function position(button, rects) {
		button.hidden = true;
		const viewport = root.visualViewport;
		const left = viewport ? viewport.offsetLeft : 0, top = viewport ? viewport.offsetTop : 0;
		const right = left + (viewport ? viewport.width : root.innerWidth);
		const bottom = top + (viewport ? viewport.height : root.innerHeight);
		const rect = Array.from(rects).find(part => part.width > 0 && part.height > 0 && part.bottom > top && part.top < bottom && part.right > left && part.left < right);
		if (!rect) return;
		button.hidden = false;
		const width = button.offsetWidth || 100, height = button.offsetHeight || 32;
		button.style.left = Math.max(left + 12, Math.min(right - width - 12, rect.left + rect.width / 2 - width / 2)) + "px";
		const below = root.matchMedia("(pointer: coarse)").matches || root.innerWidth <= 768;
		button.style.top = Math.max(top + 12, Math.min(bottom - height - 12, below ? rect.bottom + 10 : rect.top - height - 10)) + "px";
	}
	root.BuffalyAnnotationSelection = Object.freeze({ position });
})(window);
