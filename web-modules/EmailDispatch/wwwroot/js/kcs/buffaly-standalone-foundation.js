/**
 * Standalone Buffaly foundation loader.
 * Keeps static HTML pages on one shared MoreMoo baseline without requiring MasterPage or Razor.
 */
(function () {
	if (window.__BuffalyStandaloneFoundationRequested === true) {
		return;
	}
	window.__BuffalyStandaloneFoundationRequested = true;

	var version = "2";
	var tags = [
		'<script src="/js/kcs/global.js"><\/script>',
		'<script src="/js/kcs/LocalStorage2.js"><\/script>',
		'<script src="/js/kcs/moremoo4.js?v=' + version + '"><\/script>',
		'<script src="/js/kcs/validators.js?v=' + version + '"><\/script>',
		'<script src="/js/kcs/form_validation.js?v=' + version + '"><\/script>',
		'<script src="/js/kcs/UserMessages.js?v=' + version + '"><\/script>',
		'<script src="/js/kcs/JsonMethod.js?v=' + version + '"><\/script>',
		'<script src="/js/kcs/DateUtil.js?v=' + version + '"><\/script>',
		'<script src="/js/kcs/stl.js?v=' + version + '"><\/script>',
		'<script>',
		'window.BuffalyStandaloneFoundation = window.BuffalyStandaloneFoundation || { Version: "' + version + '" };',
		'Globals.ReturnExceptions = true;',
		'if (!window.UserMessages || !(window.UserMessages instanceof UserMessagesClass)) {',
		'	window.UserMessages = new UserMessagesClass();',
		'}',
		'window.UserMessages.OnFulfillMessage = UserMessages_ConsoleFulfill;',
		'window.UserMessages.DisplayAll();',
		'if (window.Page && !window.__BuffalyStandaloneFoundationUnloadBound) {',
		'	window.__BuffalyStandaloneFoundationUnloadBound = true;',
		'	Page.AddOnUnload(function () {',
		'		if (window.UserMessages && typeof window.UserMessages.Save === "function") {',
		'			window.UserMessages.Save();',
		'		}',
		'	});',
		'}',
		'<\/script>'
	];

	document.write(tags.join(""));
})();
