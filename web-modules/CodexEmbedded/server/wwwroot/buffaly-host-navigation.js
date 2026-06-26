(function () {
	"use strict";
	function addStylesheet(href) {
		if (document.querySelector('link[href="' + href + '"]'))
			return;
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = href;
		document.head.appendChild(link);
	}
	function addScript(src) {
		if (document.querySelector('script[src="' + src + '"]'))
			return;
		const script = document.createElement("script");
		script.src = src;
		document.body.appendChild(script);
	}
	function insertNavigation() {
		if (document.querySelector(".buffaly-app-strip"))
			return;
		document.body.classList.add("buffaly-page");
		const strip = document.createElement("div");
		strip.className = "buffaly-app-strip codex-host-navigation";
		strip.setAttribute("role", "banner");
		strip.innerHTML = '<a class="buffaly-app-strip-brand" href="/buffaly-agent.html"><img src="/images/bf_logo_fav_Large.png" alt=""><span>Buffaly</span></a><div class="buffaly-app-strip-center"><buffaly-navigation-launcher label="Navigation" variant="strip" current-href="/web-modules/CodexEmbedded/server/"></buffaly-navigation-launcher></div><div class="buffaly-app-strip-page">Codex Embedded</div>';
		document.body.insertBefore(strip, document.body.firstChild);
	}
	addStylesheet("/custom_css/buffaly-page.css?v=20260526.1");
	addStylesheet("/custom_css/buffaly-navigation.css?v=20260530.4");
	if (document.readyState === "loading")
		document.addEventListener("DOMContentLoaded", insertNavigation);
	else
		insertNavigation();
	addScript("/js/navigation/buffaly-navigation-data.js?v=20260528.2");
	addScript("/js/navigation/buffaly-navigation-launcher.js?v=20260530.3");
}());


