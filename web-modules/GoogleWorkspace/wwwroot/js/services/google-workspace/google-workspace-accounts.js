(function(){
	const service = typeof GoogleWorkspaceAdminJsonWsService !== 'undefined' ? GoogleWorkspaceAdminJsonWsService : new GoogleWorkspaceAdminJsonWsServiceService();
	let snapshot = null;
	let authPopup = null;
	let authPollingTimer = 0;
	let authPollingStartedUtc = 0;
	let latestOAuthCorrelationId = '';
	let addingAnotherAccount = false;
	let manualCompletionSuccessMessage = '';
	function byId(id){ return document.getElementById(id); }
	function setValue(id, value){ byId(id).value = value ?? ''; }
	function config(){
		return {
			OAuthClientMode: byId('oauthClientMode') ? byId('oauthClientMode').value.trim() : '',
			ClientId: byId('clientId').value.trim(),
			ClientSecret: byId('clientSecret').value.trim(),
			RedirectUri: resolveConfiguredRedirectUri(),
			ApplicationName: byId('applicationName').value.trim(),
			DefaultScopePreset: byId('scopePreset').value.trim(),
			RequireHttpsRedirectUri: false,
			RequestScheme: window.location.protocol.replace(':',''),
			RequestHost: window.location.host
		};
	}
	function setLast(value){ byId('lastResult').textContent = typeof value === 'string' ? value : JSON.stringify(value, null, 2); }
	function showManualError(message){
		const host = byId('manualError');
		if (!host) return;
		host.textContent = message || '';
		host.classList.toggle('d-none', !message);
	}
	function parse(value){ if (typeof value !== 'string') return value; try { return JSON.parse(value); } catch { return value; } }
	function esc(value){ return String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;'); }
	function extractRequiredQueryValueFromUrl(urlText, key){
		const trimmed = (urlText || '').trim();
		let url = null;
		try {
			url = new URL(trimmed);
		}
		catch {
			if (trimmed.startsWith('?')) url = new URL('https://callback.local/' + trimmed);
			else if (trimmed.includes('code=') || trimmed.includes('state=')) url = new URL('https://callback.local/?' + trimmed.replace(/^\?/, ''));
			else if (trimmed.startsWith('www.') || trimmed.startsWith('accounts.google.') || trimmed.startsWith('oauth2.') || trimmed.startsWith('googleapis.'))
				throw new Error('The pasted text is missing the URL scheme. Paste the full final callback URL, including https://, code=, and state=.');
			else throw new Error('Paste the full final callback URL from the Google popup window. It must include both code= and state=.');
		}
		if (url.hostname.endsWith('google.com') || url.hostname.endsWith('googleapis.com'))
			throw new Error('Paste the final Buffaly callback URL after Google redirects back, not the Google consent URL. The URL should contain both code= and state=.');
		const value = (url.searchParams.get(key) || '').trim();
		if (!value) throw new Error('The pasted callback URL is missing "' + key + '". Copy the full URL after Google redirects back to Buffaly.');
		return value;
	}
	function setStatusChip(text, kind){ const chip = byId('statusChip'); chip.textContent = text; chip.className = 'buffaly-status-pill ' + kind; }
	function setLaunchUrl(url){
		const panel = byId('launchUrlPanel');
		const box = byId('launchUrl');
		const helpPanel = byId('connectHelpPanel');
		if (!panel || !box) return;
		box.value = url || '';
		panel.classList.add('d-none');
		if (helpPanel && url) helpPanel.classList.remove('d-none');
	}
	function hideManualCompletionPanel(){
		const helpPanel = byId('connectHelpPanel');
		const callbackUrl = byId('manualCallbackUrl');
		if (helpPanel) helpPanel.classList.add('d-none');
		if (callbackUrl) callbackUrl.value = '';
		setLaunchUrl('');
		showManualError('');
	}
	function rememberManualCompletionSuccess(result){
		const accountKey = result?.AccountKey || result?.accountKey || byId('accountLabel')?.value || 'Google Workspace account';
		const email = result?.Email || result?.email || '';
		manualCompletionSuccessMessage = email
			? 'Connected ' + email + ' as ' + accountKey + '.'
			: 'Connected Google Workspace account ' + accountKey + '.';
	}
	function setBusy(button, isBusy){
		if (!button) return;
		if (isBusy){
			button.dataset.originalHtml = button.innerHTML || '';
			button.disabled = true;
			button.innerHTML = '<span class="button-icon">&#8230;</span><span class="button-label">Working...</span>';
			return;
		}
		button.disabled = false;
		if (button.dataset.originalHtml)
			button.innerHTML = button.dataset.originalHtml;
	}
	function setButtonLabel(button, iconHtml, label){
		if (!button) return;
		button.innerHTML = '<span class="button-icon">' + iconHtml + '</span><span class="button-label">' + esc(label) + '</span>';
	}
	function resolveAccountKey(){
		const typed = byId('accountLabel').value.trim();
		if (typed) return typed;
		if (addingAnotherAccount) return '';
		if (snapshot?.DefaultAccountKey) return snapshot.DefaultAccountKey;
		return 'primary';
	}
	function renderConsentSummary(items){
		const host = byId('consentSummary');
		host.innerHTML = '';
		(items || []).forEach(item => {
			const li = document.createElement('li');
			li.textContent = item;
			host.appendChild(li);
		});
	}
	function parseArray(value){
		const parsed = parse(value);
		return Array.isArray(parsed) ? parsed : [];
	}
	function normalizeText(value){ return String(value ?? '').trim(); }
	function formatDateTime(value){
		const text = normalizeText(value);
		if (!text) return 'Not refreshed yet';
		const date = new Date(text);
		if (Number.isNaN(date.getTime())) return text;
		return date.toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
	}
	function resolveConfiguredRedirectUri(){
		const configured = byId('redirectUri').value.trim();
		return configured;
	}
	function getCurrentPageUrl(){ return window.location.href; }
	function updateLatestOAuthCorrelation(latest){ latestOAuthCorrelationId = normalizeText(latest?.correlationId || latest?.CorrelationId); }
	async function readLatestOAuthStatus(){
		const res = await fetch('/google-workspace/oauth/latest', { credentials: 'same-origin', cache: 'no-store' });
		if (!res.ok) throw new Error('Failed to read latest OAuth status.');
		return await res.json();
	}
	function stopAuthorizationPolling(){
		if (authPollingTimer) window.clearInterval(authPollingTimer);
		authPollingTimer = 0;
		authPollingStartedUtc = 0;
		if (authPopup && authPopup.closed) authPopup = null;
	}
	async function handleOAuthCompletion(latest){
		stopAuthorizationPolling();
		updateLatestOAuthCorrelation(latest);
		if (latest && latest.error) showPageError(latest.error);
		await refreshAccounts();
	}
	function startAuthorizationPolling(){
		stopAuthorizationPolling();
		authPollingStartedUtc = Date.now();
		authPollingTimer = window.setInterval(async () => {
			try {
				if (authPopup && authPopup.closed) {
					authPopup = null;
				}
				const latest = await readLatestOAuthStatus();
				const correlationId = normalizeText(latest?.correlationId || latest?.CorrelationId);
				const timestampUtc = normalizeText(latest?.timestampUtc || latest?.TimestampUtc);
				if (correlationId && correlationId !== latestOAuthCorrelationId) {
					await handleOAuthCompletion(latest);
					return;
				}
				if (!correlationId && !timestampUtc && !authPopup) stopAuthorizationPolling();
				if (!authPopup && Date.now() - authPollingStartedUtc > 15000) stopAuthorizationPolling();
			}
			catch {}
		}, 1500);
	}
	function showPageError(message){
		const text = (message || '').trim();
		byId('statusDetail').textContent = text;
		if (text) setStatusChip('Connection needs attention', 'status-error');
	}
	function renderOAuthLatest(raw){
		const host = byId('oauthLatestPanel');
		if (!host) return;
		const latest = parse(raw);
		updateLatestOAuthCorrelation(latest);
		if (!latest || typeof latest !== 'object'){
			host.innerHTML = '<div class="muted">No recent OAuth completion details are available yet.</div>';
			return;
		}
		const success = latest.success === true;
		const error = esc(latest.error || '');
		const message = success
			? '<span class="buffaly-status-pill status-ready">Latest OAuth result: success</span>'
			: '<span class="buffaly-status-pill ' + (error ? 'status-error' : 'status-neutral') + '">Latest OAuth result: ' + (error ? 'needs attention' : 'not available') + '</span>';
		const detail = error ? '<div class="text-danger mt-2">' + error + '</div>' : '';
		const body = latest.message ? '<div class="muted mt-2">' + esc(latest.message) + '</div>' : '';
		const updated = latest.completedUtc ? '<div class="account-meta mt-2">Completed: ' + esc(latest.completedUtc) + '</div>' : '';
		const accountKey = latest.accountKey ? '<div class="account-meta mt-1">Account: ' + esc(latest.accountKey) + '</div>' : '';
		const title = '<div class="fw-semibold mb-2">Latest OAuth completion</div>';
		const wrapper = '<div class="account-item">' + title + message + accountKey + updated + body + detail + '</div>';
		host.innerHTML = wrapper;
	}
	function renderAccounts(){
		const host = byId('accountsPanel');
		const countChip = byId('accountCountChip');
		if (!host || !countChip) return;
		const accounts = parseArray(snapshot?.AccountsJson);
		countChip.textContent = accounts.length === 1 ? '1 saved account' : accounts.length + ' saved accounts';
		countChip.className = 'buffaly-status-pill ' + (accounts.length ? 'status-ready' : 'status-neutral');
		if (!accounts.length){
			host.innerHTML = '<div class="muted">No saved Google Workspace accounts yet.</div>';
			return;
		}
			host.innerHTML = accounts.map(account => {
			const accountKey = esc(account.AccountKey || account.accountKey || 'primary');
			const email = esc(account.Email || account.email || '');
			const hasRefreshToken = account.HasRefreshToken === true || account.hasRefreshToken === true;
			const requiresReauthorization = account.RequiresReauthorization === true || account.requiresReauthorization === true;
			const refreshSucceeded = account.LastTokenRefreshSucceeded === true || account.lastTokenRefreshSucceeded === true;
			const refreshFailed = account.LastTokenRefreshSucceeded === false || account.lastTokenRefreshSucceeded === false;
			const refreshError = esc(account.LastTokenRefreshErrorMessage || account.lastTokenRefreshErrorMessage || '');
			const lastRefreshUtc = esc(formatDateTime(account.LastTokenRefreshUtc || account.lastTokenRefreshUtc || ''));
			const updatedUtc = esc(account.UpdatedUtc || account.updatedUtc || '');
			const isDefault = account.IsDefault === true || account.isDefault === true;
			const heading = email || accountKey;
			const statusText = requiresReauthorization || !hasRefreshToken ? 'Reconnect required' : (refreshFailed ? 'Needs attention' : (refreshSucceeded ? 'Token check passed' : 'Saved, not checked'));
			const statusClass = requiresReauthorization || !hasRefreshToken || refreshFailed ? 'text-warning' : (refreshSucceeded ? 'text-success' : 'text-muted');
			const reauthorizationWarning = requiresReauthorization
				? '<div class="text-warning mt-2">This account is missing a refresh token. Reconnect with consent so Buffaly can refresh access automatically.</div>'
				: '';
			const refreshMessage = refreshFailed && refreshError ? '<div class="text-warning mt-2">' + refreshError + '</div>' : '';
			const meta = '<div class="account-meta">Label: ' + accountKey + '</div>' + (isDefault ? '<div class="account-meta">Default connection</div>' : '') + (lastRefreshUtc ? '<div class="account-meta">Last token check: ' + lastRefreshUtc + '</div>' : '') + (updatedUtc ? '<div class="account-meta">Last updated: ' + updatedUtc + '</div>' : '');
			return '<div class="account-item" data-account-key="' + accountKey + '">' +
				'<div class="d-flex flex-wrap justify-content-between align-items-start gap-2">' +
					'<div><h3>' + heading + '</h3><div class="' + statusClass + ' fw-semibold">' + statusText + '</div>' + meta + reauthorizationWarning + refreshMessage + '</div>' +
					'<div class="d-flex flex-wrap gap-2">' +
						'<button class="btn btn-sm btn-outline-secondary" type="button" data-account-action="validate" data-account-key="' + accountKey + '">Check now</button>' +
						'<button class="btn btn-sm btn-outline-warning" type="button" data-account-action="reconnect" data-account-key="' + accountKey + '">Reconnect</button>' +
						'<button class="btn btn-sm btn-outline-danger" type="button" data-account-action="remove" data-account-key="' + accountKey + '">Remove</button>' +
					'</div>' +
				'</div></div>';
		}).join('');
	}
	function renderConnectedAccountsSummary(accounts){
		if (!accounts.length) return '';
		const summaryItems = accounts.map(account => {
			const accountKey = esc(account.AccountKey || account.accountKey || 'primary');
			const email = esc(account.Email || account.email || accountKey);
			const updatedUtc = esc(formatDateTime(account.UpdatedUtc || account.updatedUtc || ''));
			const hasRefreshToken = account.HasRefreshToken === true || account.hasRefreshToken === true;
			const requiresReauthorization = account.RequiresReauthorization === true || account.requiresReauthorization === true;
			const refreshSucceeded = account.LastTokenRefreshSucceeded === true || account.lastTokenRefreshSucceeded === true;
			const refreshFailed = account.LastTokenRefreshSucceeded === false || account.lastTokenRefreshSucceeded === false;
			const refreshError = esc(account.LastTokenRefreshErrorMessage || account.lastTokenRefreshErrorMessage || '');
			const lastRefreshUtc = esc(formatDateTime(account.LastTokenRefreshUtc || account.lastTokenRefreshUtc || ''));
			const oauthMode = esc(account.OAuthClientMode || account.oauthClientMode || '');
			const oauthClient = esc(account.OAuthClientIdDisplay || account.oauthClientIdDisplay || '');
			const isDefault = account.IsDefault === true || account.isDefault === true;
			const needsReconnect = requiresReauthorization || !hasRefreshToken || refreshFailed;
			const statusText = requiresReauthorization || !hasRefreshToken ? 'Reconnect required' : (refreshFailed ? 'Needs attention' : (refreshSucceeded ? 'Token check passed' : 'Saved, check needed'));
			const statusClass = needsReconnect ? 'status-warning' : (refreshSucceeded ? 'status-ready' : 'status-neutral');
			const defaultLabel = isDefault ? '<span class="buffaly-status-pill status-neutral ms-2" style="text-transform: none;">Default</span>' : '';
			const warning = requiresReauthorization || !hasRefreshToken ? '<div class="account-warning small mt-3">Missing refresh token. Reconnect with consent so Buffaly can refresh access automatically.</div>' : (refreshFailed && refreshError ? '<div class="account-warning small mt-3">' + refreshError + '</div>' : '');
			const tokenMeta = lastRefreshUtc ? '<div class="account-meta">Last token check: ' + lastRefreshUtc + '</div>' : '<div class="account-meta">Token check: not checked yet</div>';
			const clientMeta = oauthMode || oauthClient ? '<div class="account-meta">OAuth client: ' + (oauthMode || 'saved mode') + (oauthClient ? ' (' + oauthClient + ')' : '') + '</div>' : '';
			return '<div class="account-item connected-account-card">' +
				'<div class="connected-account-card-header">' +
					'<div class="connected-account-identity">' +
						'<div class="fw-bold text-dark">' + email + defaultLabel + '</div>' +
						'<div class="account-meta">Label: ' + accountKey + '</div>' +
						tokenMeta + clientMeta + (updatedUtc ? '<div class="account-meta">Saved account updated: ' + updatedUtc + '</div>' : '') + warning +
					'</div>' +
				'</div>' +
				'<div class="connected-account-card-footer">' +
					'<span class="buffaly-status-pill ' + statusClass + '" style="text-transform: none;">' + statusText + '</span>' +
					'<div class="account-actions">' +
						'<button class="btn btn-sm btn-outline-secondary" type="button" data-account-action="validate" data-account-key="' + accountKey + '">&#8635; Check</button>' +
						'<button class="btn btn-sm btn-outline-primary" type="button" data-account-action="reconnect" data-account-key="' + accountKey + '">&#128274; Reconnect</button>' +
						'<button class="btn btn-sm btn-outline-danger" type="button" data-account-action="remove" data-account-key="' + accountKey + '">&#128465; Remove</button>' +
					'</div>' +
				'</div>' +
			'</div>';
		}).join('');
		return '<div class="mb-3"><span class="buffaly-status-pill status-ready" style="text-transform: none;">' + accounts.length + ' connected account' + (accounts.length === 1 ? '' : 's') + '</span></div>' +
			'<div class="connected-accounts-summary mb-4">' + summaryItems + '</div>';
	}
	async function startAuthorizationForAccount(accountKey, forceConsent){
		if (!accountKey){
			showPageError('Enter a connection label for the additional Google account first.');
			if (byId('accountLabel')) byId('accountLabel').focus();
			return;
		}
		if (snapshot && !snapshot.HasConfiguration){
			showPageError(snapshot.StatusDetail || 'The selected OAuth mode is not configured for new authorization.');
			return;
		}
		const req = { ...config(), AccountKey: accountKey, ScopePreset: byId('scopePreset').value.trim(), ReturnUrl: getCurrentPageUrl(), ForceConsent: forceConsent === true };
		const res = await service.StartAuthorizationAsync(req);
		setLast(res);
		showManualError('');
		const data = parse(res.RawJson);
		const url = data.redirectUri || data.RedirectUri;
		setLaunchUrl(url || '');
		if (url) {
			authPopup = window.open(url, '_blank', 'noopener');
			startAuthorizationPolling();
		}
	}
	async function runAccountAction(action, accountKey, button){
		const normalizedKey = (accountKey || '').trim();
		if (!normalizedKey) return;
		if (action === 'reconnect'){
			setBusy(button, true);
			try { await startAuthorizationForAccount(normalizedKey, true); }
			finally { setBusy(button, false); }
			return;
		}
		if (action === 'revoke' && !window.confirm('Revoke Google Workspace access for "' + normalizedKey + '"? This will require re-authorization before Buffaly can use the account again.'))
			return;
		if (action === 'remove' && !window.confirm('Remove the saved Google Workspace account "' + normalizedKey + '" from Buffaly? This removes the saved registration from the feature row.'))
			return;
		const req = { ...config(), AccountKey: normalizedKey };
		setBusy(button, true);
		try {
			let res = null;
			if (action === 'validate') res = await service.ValidateAccountAsync(req);
			else if (action === 'revoke') res = await service.RevokeAccountAsync(req);
			else if (action === 'remove') res = await service.RemoveAccountAsync(req);
			else throw new Error('Unsupported account action: ' + action);
			setLast(res);
			const data = parse(res.RawJson);
			if (action === 'validate' && data && data.requiresReauthorization){
				showPageError(data.message || 'This account needs to be re-authorized.');
				await refreshAccounts();
				return;
			}
			await refreshAccounts();
		}
		finally {
			setBusy(button, false);
		}
	}
	function sourceLabel(value){
		if (value === 'Feature') return 'Feature override';
		if (value === 'ModuleDefault') return 'Buffaly module default';
		return 'Missing';
	}
	function yesNo(value){ return value ? 'Yes' : 'No'; }
	function renderEffectiveOAuthSettings(){
		const host = byId('effectiveOAuthSettingsPanel');
		if (!host || !snapshot) return;
		const desktopRows = [
			['Desktop Client ID', snapshot.DesktopClientIdDisplay || 'Missing', sourceLabel(snapshot.DesktopClientIdSource)],
			['Desktop Client Secret', snapshot.DesktopClientSecretSource === 'Missing' ? 'Missing' : 'Saved', sourceLabel(snapshot.DesktopClientSecretSource)],
			['Desktop Redirect URI', snapshot.DesktopRedirectUriDisplay || 'Auto / current /gauth', sourceLabel(snapshot.DesktopRedirectUriSource)]
		];
		const rows = desktopRows.map(row => '<tr><td>' + esc(row[0]) + '</td><td>' + esc(row[1]) + '</td><td>' + esc(row[2]) + '</td></tr>').join('');
		const mode = esc(snapshot.OAuthClientMode || 'BuffalyDesktopDefault');
		const featureMode = esc(snapshot.FeatureOAuthClientMode || '(not set)');
		const defaultMode = esc(snapshot.DefaultOAuthClientMode || 'BuffalyDesktopDefault');
		host.innerHTML = '<div class="settings-grid">' +
			'<div class="account-item"><h3>Effective desktop configuration</h3><table class="settings-table"><thead><tr><th>Setting</th><th>Effective value</th><th>Source</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
			'<div class="account-item"><h3>Configuration summary</h3>' +
			'<div class="account-meta">Selected mode: ' + mode + '</div>' +
			'<div class="account-meta">Feature mode: ' + featureMode + '</div>' +
			'<div class="account-meta">Module default mode: ' + defaultMode + '</div>' +
			'<div class="account-meta">Desktop defaults available: ' + yesNo(snapshot.ModuleDefaultDesktopClientIdAvailable) + '</div>' +
			'<div class="account-meta">Custom web configured: ' + yesNo(snapshot.CustomWebClientConfigured) + '</div>' +
			'</div></div>';
		const chip = byId('oauthSettingsSourceChip');
		if (chip){
			chip.textContent = snapshot.DesktopClientIdSource === 'Feature' ? 'Using feature override' : (snapshot.DesktopClientIdSource === 'ModuleDefault' ? 'Using Buffaly defaults' : 'Missing configuration');
			chip.className = 'buffaly-status-pill ' + (snapshot.DesktopClientIdSource === 'Missing' ? 'status-error' : 'status-ready');
		}
	}
	function renderTroubleshootingHealth(){
		const host = byId('troubleshootingHealthPanel');
		if (!host || !snapshot) return;
		host.innerHTML = '<div>Configuration ready: ' + yesNo(snapshot.HasConfiguration) + '</div>' +
			'<div>Connected account: ' + esc(snapshot.ConnectedAccountEmail || snapshot.ConnectedAccountKey || 'None') + '</div>' +
			'<div>Refresh token saved: ' + yesNo(snapshot.ConnectedAccountHasRefreshToken) + '</div>' +
			'<div>Requires reauthorization: ' + yesNo(snapshot.ConnectedAccountRequiresReauthorization) + '</div>' +
			(snapshot.OAuthError ? '<div class="text-danger mt-2">Latest OAuth error: ' + esc(snapshot.OAuthError) + '</div>' : '');
	}
	function populateOAuthSettingsForm(){
		if (!snapshot) return;
		setValue('settingsDesktopClientId', snapshot.FeatureDesktopClientIdAvailable ? snapshot.DesktopClientIdDisplay : '');
		setValue('settingsDesktopClientSecret', '');
		setValue('settingsDesktopRedirectUri', snapshot.FeatureDesktopRedirectUriAvailable ? snapshot.DesktopRedirectUriDisplay : '');
		setValue('settingsWebClientId', snapshot.FeatureCustomWebClientIdAvailable ? snapshot.CustomWebClientIdDisplay : '');
		setValue('settingsWebClientSecret', '');
		setValue('settingsWebRedirectUri', snapshot.FeatureCustomWebRedirectUriAvailable ? snapshot.CustomWebRedirectUriDisplay : '');
	}
	async function saveOAuthSettings(button, clearFeatureOverrides){
		const req = {
			...config(),
			OAuthClientMode: byId('oauthClientMode').value.trim(),
			DesktopClientId: byId('settingsDesktopClientId').value.trim(),
			DesktopClientSecret: byId('settingsDesktopClientSecret').value.trim(),
			DesktopRedirectUri: byId('settingsDesktopRedirectUri').value.trim(),
			ClientId: byId('settingsWebClientId').value.trim(),
			ClientSecret: byId('settingsWebClientSecret').value.trim(),
			RedirectUri: byId('settingsWebRedirectUri').value.trim(),
			ClearFeatureOverrides: clearFeatureOverrides === true
		};
		setBusy(button, true);
		try {
			const res = await service.SaveOAuthSettingsAsync(req);
			byId('oauthSettingsMessage').textContent = 'OAuth settings saved. Account registrations were preserved.';
			applySnapshot(res);
		}
		finally { setBusy(button, false); }
	}
	async function useDefaultOAuthSettings(button){
		setValue('oauthClientMode', 'BuffalyDesktopDefault');
		setValue('settingsDesktopClientId', '');
		setValue('settingsDesktopClientSecret', '');
		setValue('settingsDesktopRedirectUri', '');
		await saveOAuthSettings(button, true);
	}
	async function clearOAuthOverrides(button){
		setValue('settingsDesktopClientId', '');
		setValue('settingsDesktopClientSecret', '');
		setValue('settingsDesktopRedirectUri', '');
		setValue('settingsWebClientId', '');
		setValue('settingsWebClientSecret', '');
		setValue('settingsWebRedirectUri', '');
		await saveOAuthSettings(button, true);
	}
	function activateTab(targetId){
		document.querySelectorAll('[data-tab-target]').forEach(button => button.classList.toggle('active', button.dataset.tabTarget === targetId));
		document.querySelectorAll('.google-workspace-tab-panel').forEach(panel => panel.classList.toggle('active', panel.id === targetId));
	}	function updateModePanel(){
		const selector = byId('oauthClientMode');
		const mode = selector ? selector.value.trim() : '';
		const panel = byId('customWebClientPanel');
		const desktopSettings = byId('desktopOAuthSettingsSection');
		const customWebSettings = byId('customWebOAuthSettingsSection');
		const useCustomWebClient = mode === 'CustomWebClient';
		if (panel) panel.classList.toggle('hidden-config', mode !== 'CustomWebClient');
		if (desktopSettings) desktopSettings.classList.toggle('hidden-config', useCustomWebClient);
		if (customWebSettings) customWebSettings.classList.toggle('hidden-config', !useCustomWebClient);
	}
	function renderConnectionSummary(){
		const setupTitle = byId('setupPanelTitle');
		const setupIntro = byId('setupPanelIntro');
		const connectForm = byId('connectFormPanel');
		const startAuthorizationButton = byId('startAuthorizationBtn');
		const addAccountButton = byId('addAccountBtn');
		const sidebarCard = byId('sidebarStatusCard');
		const successBanner = manualCompletionSuccessMessage
			? '<div class="alert alert-success mb-3" role="status">' + esc(manualCompletionSuccessMessage) + '</div>'
			: '';
		if (!snapshot){
			if (sidebarCard) sidebarCard.classList.remove('d-none');
			if (setupTitle) setupTitle.textContent = 'Checking Google Workspace';
			if (setupIntro) setupIntro.textContent = 'Buffaly is checking your saved Google Workspace connection.';
			if (connectForm) connectForm.classList.remove('d-none');
			setButtonLabel(startAuthorizationButton, '&#128274;', 'Connect Google Workspace');
			if (addAccountButton) addAccountButton.classList.add('d-none');
			byId('connectionSummary').innerHTML = successBanner + '<p class="mb-0 muted">Connection details are loading.</p>';
			byId('connectedAccountPanel').innerHTML = 'No Google Workspace account connected yet.';
			return;
		}
		if (snapshot.IsConnected){
			if (sidebarCard) sidebarCard.classList.add('d-none');
			const accounts = parseArray(snapshot.AccountsJson);
			const connectedAccountsSummary = renderConnectedAccountsSummary(accounts);
			const reauthorizationWarning = snapshot.ConnectedAccountRequiresReauthorization
				? '<div class="text-warning mt-2">This saved account is missing a refresh token. Use Reconnect with consent below to make the connection durable.</div>'
				: '';
			const configWarning = !snapshot.HasConfiguration ? '<div class="text-warning mt-2">The selected OAuth mode is not configured for new authorization, but this saved account remains available.</div>' : '';
			const statusClass = snapshot.ConnectedAccountRequiresReauthorization ? 'text-warning' : (!snapshot.HasConfiguration ? 'text-warning' : 'text-success');
			const statusText = snapshot.ConnectedAccountRequiresReauthorization ? 'Reconnect required' : (!snapshot.HasConfiguration ? 'Connected, but setup needs attention' : 'Connected and ready');
			if (setupTitle) setupTitle.textContent = 'Google Workspace is connected';
			if (setupIntro) setupIntro.textContent = addingAnotherAccount ? 'Choose a new connection label, then connect the additional Google account.' : 'Buffaly can use this saved Google account for Workspace tasks you request.';
			if (connectForm) connectForm.classList.toggle('d-none', !addingAnotherAccount);
			setButtonLabel(startAuthorizationButton, '&#128274;', addingAnotherAccount ? 'Connect additional account' : (snapshot.ConnectedAccountRequiresReauthorization ? 'Reconnect Google Workspace' : 'Reconnect or switch account'));
			if (addAccountButton) addAccountButton.classList.toggle('d-none', addingAnotherAccount);
			byId('connectionSummary').innerHTML = successBanner + connectedAccountsSummary + '<p class="mb-0 muted small">Your saved Google Workspace connections are ready for Gmail, Drive, Docs, Sheets, Calendar, and Chat tasks.</p>' + reauthorizationWarning + configWarning;
			byId('connectedAccountPanel').innerHTML = '<div class="' + statusClass + ' fw-semibold mb-2">' + statusText + '</div><div class="muted">' + accounts.length + ' saved Google Workspace account' + (accounts.length === 1 ? '' : 's') + '.</div>' + reauthorizationWarning + configWarning;
			return;
		}
		if (!snapshot.HasConfiguration){
			if (sidebarCard) sidebarCard.classList.remove('d-none');
			const detail = snapshot.StatusDetail ? '<div class="text-danger mt-2">' + esc(snapshot.StatusDetail) + '</div>' : '';
			if (setupTitle) setupTitle.textContent = 'Set up Google Workspace';
			if (setupIntro) setupIntro.textContent = 'Finish OAuth settings before connecting a Google account.';
			if (connectForm) connectForm.classList.remove('d-none');
			setButtonLabel(startAuthorizationButton, '&#128274;', 'Connect Google Workspace');
			if (addAccountButton) addAccountButton.classList.add('d-none');
			byId('connectionSummary').innerHTML = successBanner + '<p class="mb-0 muted">Use the OAuth Settings tab to finish configuration before connecting a new account.</p>';
			byId('connectedAccountPanel').innerHTML = '<div class="text-danger fw-semibold">Not configured</div>' + detail;
			return;
		}
		const error = snapshot.OAuthError ? '<div class="text-danger mt-2">'+ esc(snapshot.OAuthError) +'</div>' : '';
		if (sidebarCard) sidebarCard.classList.remove('d-none');
		if (setupTitle) setupTitle.textContent = 'Connect Google Workspace';
		if (setupIntro) setupIntro.textContent = 'Authorize your Google account once so Buffaly can help with Workspace tasks you request.';
		if (connectForm) connectForm.classList.remove('d-none');
		if (startAuthorizationButton) startAuthorizationButton.textContent = 'Connect Google Workspace';
		if (addAccountButton) addAccountButton.classList.add('d-none');
		byId('connectionSummary').innerHTML = successBanner + '<p class="mb-0 muted">Select Connect Google Workspace to authorize your account.</p>';
		byId('connectedAccountPanel').innerHTML = '<div class="text-warning fw-semibold">Not connected</div>' + error;
	}
	function applySnapshot(res){
		snapshot = res;
		setLast(res);
		showManualError('');
		setValue('applicationName', res.ApplicationName || 'OpsAgent Google Workspace');
		if (res.OAuthClientMode && byId('oauthClientMode')) setValue('oauthClientMode', res.OAuthClientMode);
		updateModePanel();
		setValue('scopePreset', res.DefaultScopePreset || 'workspace.full');
		setValue('clientId', '');
		setValue('clientSecret', '');
		setValue('redirectUri', '');
		if (!addingAnotherAccount && !byId('accountLabel').value.trim()) setValue('accountLabel', res.DefaultAccountKey || 'primary');
		renderConsentSummary(res.ConsentSummary || []);
		byId('statusDetail').textContent = '';
		renderConnectionSummary();
		renderAccounts();
		renderOAuthLatest(res.OAuthLatestJson);
		renderEffectiveOAuthSettings();
		renderTroubleshootingHealth();
		populateOAuthSettingsForm();
		const startAuthorizationButton = byId('startAuthorizationBtn');
		if (startAuthorizationButton) startAuthorizationButton.disabled = !res.HasConfiguration;
		if (res.ConnectedAccountRequiresReauthorization) setStatusChip(res.StatusTitle || 'Needs reauthorization', 'status-error');
		else if (!res.HasConfiguration) setStatusChip(res.StatusTitle || 'Not configured', 'status-error');
		else if (res.IsConnected) setStatusChip(res.StatusTitle || 'Connected', 'status-ready');
		else if (res.OAuthError) setStatusChip(res.StatusTitle || 'Needs attention', 'status-error');
		else setStatusChip(res.StatusTitle || 'Ready to connect', 'status-warning');
	}
	async function loadSnapshot(){
		const res = await service.GetAdminSnapshotAsync(config());
		applySnapshot(res);
	}
	async function refreshAccounts(){
		const res = await service.GetAdminSnapshotAsync(config());
		applySnapshot(res);
	}
	async function startAuthorization(){
		await startAuthorizationForAccount(resolveAccountKey(), false);
	}
	function beginAddAccount(){
		addingAnotherAccount = true;
		setValue('accountLabel', '');
		renderConnectionSummary();
		const input = byId('accountLabel');
		if (input) input.focus();
	}
	async function completeAuthorization(){
		const callbackUrl = byId('manualCallbackUrl').value.trim();
		if (!callbackUrl){
			showManualError('Paste the full URL from the Google popup window first.');
			return;
		}
		showManualError('');
		let state = '';
		let code = '';
		try {
			state = extractRequiredQueryValueFromUrl(callbackUrl, 'state');
			code = extractRequiredQueryValueFromUrl(callbackUrl, 'code');
		}
		catch (error) {
			showManualError(error instanceof Error ? error.message : String(error));
			return;
		}
		const req = {
			...config(),
			State: state,
			Code: code,
			CallbackUrl: callbackUrl
		};
		try {
			const res = await service.CompleteAuthorizationAsync(req);
			setLast(res);
			const data = parse(res.RawJson);
			if (data && data.success === false){
				showManualError(data.error || 'Google authorization could not be completed. Click Connect again and paste the newest final callback URL.');
				return;
			}
			rememberManualCompletionSuccess(data?.result || data?.Result || null);
			addingAnotherAccount = false;
			hideManualCompletionPanel();
			await refreshAccounts();
		}
		catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			showManualError(message && message !== 'Unspecified Error' ? message : 'Google authorization could not be completed. Paste the final Buffaly callback URL that contains both code= and state=.');
			setLast({ error: message });
		}
	}
	document.querySelectorAll('[data-tab-target]').forEach(button => button.addEventListener('click', () => activateTab(button.dataset.tabTarget)));
	if (byId('saveOAuthSettingsBtn')) byId('saveOAuthSettingsBtn').addEventListener('click', event => saveOAuthSettings(event.currentTarget).catch(e=>setLast({ error: String(e) })));
	if (byId('useDefaultOAuthSettingsBtn')) byId('useDefaultOAuthSettingsBtn').addEventListener('click', event => useDefaultOAuthSettings(event.currentTarget).catch(e=>setLast({ error: String(e) })));
	if (byId('clearOAuthOverrideBtn')) byId('clearOAuthOverrideBtn').addEventListener('click', event => clearOAuthOverrides(event.currentTarget).catch(e=>setLast({ error: String(e) })));	byId('refreshAccountsBtn').addEventListener('click', ()=> refreshAccounts().catch(e=>setLast({ error: String(e) })));
	byId('startAuthorizationBtn').addEventListener('click', ()=> startAuthorization().catch(e=>setLast({ error: String(e) })));
	if (byId('addAccountBtn')) byId('addAccountBtn').addEventListener('click', beginAddAccount);
	byId('completeAuthorizationBtn').addEventListener('click', ()=> completeAuthorization().catch(e=>setLast({ error: String(e) })));
	if (byId('oauthClientMode')) byId('oauthClientMode').addEventListener('change', ()=> { updateModePanel(); refreshAccounts().catch(e=>setLast({ error: String(e) })); });
	window.addEventListener('message', event => {
		if (event.origin !== window.location.origin) return;
		const data = event.data || {};
		if (data.type !== 'buffaly-google-workspace-oauth-complete') return;
		if (data.error) showPageError(data.error);
		handleOAuthCompletion({ correlationId: latestOAuthCorrelationId, error: data.error || '', success: data.success === true }).catch(e=>setLast({ error: String(e) }));
	});
	function handleAccountActionClick(event){
		const button = event.target.closest('[data-account-action]');
		if (!button) return;
		const action = button.getAttribute('data-account-action') || '';
		const accountKey = button.getAttribute('data-account-key') || '';
		runAccountAction(action, accountKey, button).catch(e=>setLast({ error: String(e), action, accountKey }));
	}
	if (byId('connectionSummary')) byId('connectionSummary').addEventListener('click', handleAccountActionClick);
	if (byId('accountsPanel')) byId('accountsPanel').addEventListener('click', handleAccountActionClick);
	loadSnapshot().catch(e=>setLast({ error: String(e) }));
})();


