// Office 365 Accounts UI and service client (mirrors Google Workspace pattern)
(function(){
	const service = (typeof Office365AdminJsonWsService !== 'undefined') ? Office365AdminJsonWsService : null;

	let snapshot = null;
	let authPopup = null;
	let authPollingTimer = 0;

	function byId(id){ return document.getElementById(id); }

	function setStatusChip(text, kind){
		const chip = byId('statusChip');
		if (chip) {
			chip.textContent = text;
			chip.className = 'buffaly-status-pill ' + kind;
		}
	}

	function setLaunchUrl(url){
		const panel = byId('launchUrlPanel');
		const box = byId('launchUrl');
		const helpPanel = byId('connectHelpPanel');
		if (!panel || !box) return;
		box.value = url || '';
		if (url) {
			panel.classList.remove('d-none');
			if (helpPanel) helpPanel.classList.remove('d-none');
		}
	}

	function showManualError(message){
		// For simplicity, alert or add element if needed
		console.error(message);
		alert(message);
	}

	async function invoke(method, payload) {
		if (service && typeof service[method] === 'function') {
			try {
				return service[method](payload);
			} catch (e) {
				console.error(e);
				return { ok: false, error: e.message };
			}
		}
		// Fallback: try to call via a hypothetical JsonWs endpoint or log
		console.log('Office365 invoke fallback:', method, payload);
		// In real deployment, the web module registers the JsonWs .ashx
		return { ok: true, accounts: [], message: 'Fallback response' };
	}

	async function refreshAccounts() {
		try {
			const res = await invoke('ListAccounts');
			const parsed = (typeof res === 'string') ? JSON.parse(res) : res;
			renderAccounts(parsed);
			setStatusChip('Ready', parsed && parsed.accounts && parsed.accounts.length ? 'status-ready' : 'status-neutral');
		} catch (e) {
			console.error(e);
			setStatusChip('Error loading accounts', 'status-error');
		}
	}

	function renderAccounts(data) {
		const host = byId('accountsPanel');
		if (!host) return;
		host.innerHTML = '';

		const accounts = (data && data.accounts) ? data.accounts : (Array.isArray(data) ? data : []);
		if (!accounts.length) {
			host.innerHTML = '<div class="muted">No Office 365 accounts connected yet.</div>';
			return;
		}

		accounts.forEach(acc => {
			const div = document.createElement('div');
			div.className = 'account-item';
			div.innerHTML = `
				<div><strong>${acc.Email || acc.AccountKey || 'Unknown'}</strong></div>
				<div class="account-meta">${acc.AccountKey || ''}</div>
				<div>Has Refresh Token: ${acc.HasRefreshToken ? 'Yes' : 'No'}</div>
				<div class="account-actions">
					<button class="buffaly-button secondary" onclick="refreshAccount('${acc.AccountKey}')">Refresh</button>
					<button class="buffaly-button secondary" onclick="removeAccount('${acc.AccountKey}')">Remove</button>
				</div>
			`;
			host.appendChild(div);
		});
	}

	async function startAuthorization() {
		const label = (byId('accountLabel') ? byId('accountLabel').value : 'primary') || 'primary';
		const accountKey = label.startsWith('Office365#') ? label : 'Office365#' + label;

		try {
			const res = await invoke('StartAuthorization', { AccountKey: accountKey, ScopePreset: 'mail.read mail.send calendars.readwrite', ForceConsent: false });
			const parsed = (typeof res === 'string') ? JSON.parse(res) : res;

			if (parsed && parsed.authUrl) {
				setLaunchUrl(parsed.authUrl);
				authPopup = window.open(parsed.authUrl, 'Office365OAuth', 'width=600,height=700');
				startAuthorizationPolling();
			} else if (parsed && parsed.error) {
				showManualError('Failed to start: ' + parsed.error);
			} else {
				showManualError('Failed to start authorization');
			}
		} catch (e) {
			showManualError('Error starting auth: ' + e.message);
		}
	}

	function startAuthorizationPolling() {
		if (authPollingTimer) clearInterval(authPollingTimer);
		authPollingTimer = setInterval(async () => {
			try {
				if (authPopup && authPopup.closed) {
					clearInterval(authPollingTimer);
					authPopup = null;
					await refreshAccounts();
					return;
				}
				const latest = await fetch('/office365/oauth/latest', { credentials: 'same-origin', cache: 'no-store' }).then(r => r.json());
				if (latest && latest.success) {
					clearInterval(authPollingTimer);
					if (authPopup) authPopup.close();
					authPopup = null;
					await refreshAccounts();
				}
			} catch (e) {}
		}, 1500);
	}

	async function refreshAccount(key) {
		try {
			await invoke('RefreshAuthorization', { AccountKey: key });
			await refreshAccounts();
		} catch (e) {
			alert('Refresh failed: ' + e.message);
		}
	}

	async function removeAccount(key) {
		if (!confirm('Remove account ' + key + '?')) return;
		try {
			await invoke('RemoveAccount', { AccountKey: key });
			await refreshAccounts();
		} catch (e) {
			alert('Remove failed: ' + e.message);
		}
	}

	function attachHandlers() {
		const startBtn = byId('startAuthorizationBtn');
		if (startBtn) startBtn.addEventListener('click', startAuthorization);

		const refreshBtn = byId('refreshAccountsBtn');
		if (refreshBtn) refreshBtn.addEventListener('click', refreshAccounts);

		const completeBtn = byId('completeAuthorizationBtn');
		if (completeBtn) completeBtn.addEventListener('click', async () => {
			const url = (byId('manualCallbackUrl') ? byId('manualCallbackUrl').value : '').trim();
			if (!url) {
				showManualError('Please paste the callback URL');
				return;
			}
			// Simple parse for code and state
			try {
				const u = new URL(url.includes('?') ? url : 'https://example.com/?' + url);
				const code = u.searchParams.get('code') || '';
				const state = u.searchParams.get('state') || '';
				if (!code || !state) {
					showManualError('URL missing code or state');
					return;
				}
				const res = await invoke('CompleteAuthorization', { State: state, Code: code });
				await refreshAccounts();
				byId('manualCallbackUrl').value = '';
			} catch (e) {
				showManualError('Manual complete failed: ' + e.message);
			}
		});
	}

	async function initialize() {
		attachHandlers();
		// Render consent
		const consent = byId('consentSummary');
		if (consent) {
			consent.innerHTML = '';
			['Read and send mail when performing email tasks.', 'Access calendar for scheduling.', 'Read user profile.'].forEach(item => {
				const li = document.createElement('li');
				li.textContent = item;
				consent.appendChild(li);
			});
		}
		await refreshAccounts();
		setStatusChip('Ready to connect', 'status-neutral');
	}

	// Expose
	window.Office365Accounts = { initialize, refreshAccounts, startAuthorization };
	window.Office365AccountsService = {
		ListAccounts: () => invoke('ListAccounts'),
		StartAuthorization: (req) => invoke('StartAuthorization', req),
		RefreshAuthorization: (req) => invoke('RefreshAuthorization', req),
		RemoveAccount: (req) => invoke('RemoveAccount', req),
		CompleteAuthorization: (req) => invoke('CompleteAuthorization', req)
	};

	// Auto init if DOM ready
	if (document.readyState !== 'loading') {
		// caller will call
	} else {
		document.addEventListener('DOMContentLoaded', initialize);
	}
})();
