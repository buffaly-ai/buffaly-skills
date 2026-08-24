(function(mod) {
	if (typeof exports == "object" && typeof module == "object") {
		mod(require("./plugins/codemirror/lib/codemirror"));
	}
	else if (typeof define == "function" && define.amd) {
		define(["./plugins/codemirror/lib/codemirror"], mod);
	}
	else {
		mod(CodeMirror);
	}
})(function(CodeMirror) {
	"use strict";

	function startsWithWord(stream, word) {
		return stream.match(new RegExp("^" + word + "(?![\\w$])"), false);
	}

	CodeMirror.defineMode("protoscript-enhanced", function(config) {
		var csharp = CodeMirror.getMode(config, "text/x-csharp");
		var keywordPattern = /^(include|prototype|reference|import|function|init|using|namespace|partial|extern|return|if|else|for|foreach|while|switch|case|default|break|continue|throw|try|catch|finally)(?![\w$])/;
		var prototypeRefPattern = /^[A-Za-z_][\w]*#[A-Za-z_][\w]*/;
		var annotationPattern = /^@[A-Za-z_][\w\.]*/;
		var semanticBracketPattern = /^\[(SemanticEntity|SemanticProgram\.[A-Za-z_][\w]*)/;

		return {
			startState: function() {
				return { inner: CodeMirror.startState(csharp) };
			},
			copyState: function(state) {
				var copiedInner = CodeMirror.copyState ? CodeMirror.copyState(csharp, state.inner) : state.inner;
				return { inner: copiedInner };
			},
			token: function(stream, state) {
				if (stream.eatSpace()) {
					return null;
				}

				if (stream.match(annotationPattern)) {
					return "attribute";
				}

				if (stream.match(semanticBracketPattern)) {
					stream.skipTo("]") || stream.skipToEnd();
					if (stream.peek() === "]") {
						stream.next();
					}
					return "attribute";
				}

				if (stream.match(keywordPattern)) {
					return "keyword";
				}

				if (stream.match(prototypeRefPattern)) {
					return "builtin";
				}

				if (startsWithWord(stream, "true") || startsWithWord(stream, "false") || startsWithWord(stream, "null")) {
					stream.match(/^(true|false|null)(?![\w$])/);
					return "atom";
				}

				return csharp.token(stream, state.inner);
			},
			indent: function(state, textAfter) {
				if (typeof csharp.indent === "function") {
					return csharp.indent(state.inner, textAfter);
				}
				return CodeMirror.Pass;
			},
			electricChars: csharp.electricChars,
			blockCommentStart: csharp.blockCommentStart,
			blockCommentEnd: csharp.blockCommentEnd,
			lineComment: csharp.lineComment,
			fold: csharp.fold
		};
	});

	CodeMirror.defineMIME("text/x-protoscript", "protoscript-enhanced");
});
