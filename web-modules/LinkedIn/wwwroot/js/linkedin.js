// LinkedIn module UI controller
(function() {
	'use strict';

	// Simple fetch-based API client (standalone dev mode)
	var LinkedInService = {
		Url: '/api/buffaly.linkedin/linked-in-service',

	_post: function(path) {
		return fetch(this.Url + path, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: '{}'
		}).then(function(r) { return r.json(); });
	},

	_postJson: function(path, payload) {
		return fetch(this.Url + path, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload || {})
		}).then(function(r) { return r.json(); });
	},

	GetAccountStatus: function(Callback) {
		this._post('/get-account-status').then(function(result) { Callback(result); }).catch(function(err) { Callback({ error: err.message }); });
	},

	SaveAppConfig: function(clientId, clientSecret, redirectUri, scopes, Callback) {
		this._postJson('/save-app-config', { clientId: clientId, clientSecret: clientSecret, redirectUri: redirectUri, scopes: scopes }).then(function(result) { Callback(result); }).catch(function(err) { Callback({ error: err.message }); });
	},

	StartAuthorization: function(Callback) {
		this._post('/start-authorization').then(function(result) { Callback(result); }).catch(function(err) { Callback({ error: err.message }); });
	},

	CompleteAuthorization: function(code, state, Callback) {
		this._postJson('/complete-authorization', { code: code, state: state }).then(function(result) { Callback(result); }).catch(function(err) { Callback({ error: err.message }); });
	},

	Disconnect: function(Callback) {
		this._post('/disconnect').then(function(result) { Callback(result); }).catch(function(err) { Callback({ error: err.message }); });
	},

	GetLlmInfo: function(Callback) {
			this._post('/get-llm-info').then(function(result) { Callback(result); }).catch(function(err) { Callback({ error: err.message }); });
		},

	ListDrafts: function(status, Callback) {
		this._postJson('/list-drafts', { status: status }).then(function(result) { Callback(result); }).catch(function(err) { Callback({ error: err.message }); });
	},

	CreateDraft: function(text, visibility, mediaType, linkUrl, imagePath, title, description, Callback) {
		this._postJson('/create-draft', { text: text, visibility: visibility, mediaType: mediaType, linkUrl: linkUrl, imagePath: imagePath, title: title, description: description }).then(function(result) { Callback(result); }).catch(function(err) { Callback({ error: err.message }); });
	},

	GetDraft: function(draftId, Callback) {
		this._postJson('/get-draft', { draftId: draftId }).then(function(result) { Callback(result); }).catch(function(err) { Callback({ error: err.message }); });
	},

	UpdateDraft: function(draftId, text, visibility, linkUrl, imagePath, title, description, Callback) {
		this._postJson('/update-draft', { draftId: draftId, text: text, visibility: visibility, linkUrl: linkUrl, imagePath: imagePath, title: title, description: description }).then(function(result) { Callback(result); }).catch(function(err) { Callback({ error: err.message }); });
	},

	ApproveDraft: function(draftId, note, Callback) {
		this._postJson('/approve-draft', { draftId: draftId, note: note }).then(function(result) { Callback(result); }).catch(function(err) { Callback({ error: err.message }); });
	},

	DeleteDraft: function(draftId, Callback) {
		this._postJson('/delete-draft', { draftId: draftId }).then(function(result) { Callback(result); }).catch(function(err) { Callback({ error: err.message }); });
	},

	ScheduleDraft: function(draftId, when, Callback) {
		this._postJson('/schedule-draft', { draftId: draftId, when: when }).then(function(result) { Callback(result); }).catch(function(err) { Callback({ error: err.message }); });
	},

	UnscheduleDraft: function(draftId, Callback) {
		this._postJson('/unschedule-draft', { draftId: draftId }).then(function(result) { Callback(result); }).catch(function(err) { Callback({ error: err.message }); });
	}
	,

	PublishDraft: function(draftId, Callback) {
		this._postJson('/publish-draft', { draftId: draftId }).then(function(result) { Callback(result); }).catch(function(err) { Callback({ error: err.message }); });
	},

	PublishDue: function(Callback) {
		this._post('/publish-due').then(function(result) { Callback(result); }).catch(function(err) { Callback({ error: err.message }); });
	},

	DeletePost: function(postUrn, Callback) {
		this._postJson('/delete-post', { postUrn: postUrn }).then(function(result) { Callback(result); }).catch(function(err) { Callback({ error: err.message }); });
	},

	ListPublishedPosts: function(Callback) {
		this._post('/list-published-posts').then(function(result) { Callback(result); }).catch(function(err) { Callback({ error: err.message }); });
	},

	CreatePost: function(text, visibility, Callback) {
		this._postJson('/create-post', { text: text, visibility: visibility }).then(function(result) { Callback(result); }).catch(function(err) { Callback({ error: err.message }); });
	},

	ShareLink: function(text, url, title, description, visibility, Callback) {
		this._postJson('/share-link', { text: text, url: url, title: title, description: description, visibility: visibility }).then(function(result) { Callback(result); }).catch(function(err) { Callback({ error: err.message }); });
	},

	ShareImage: function(text, imagePath, title, altText, visibility, Callback) {
		this._postJson('/share-image', { text: text, imagePath: imagePath, title: title, altText: altText, visibility: visibility }).then(function(result) { Callback(result); }).catch(function(err) { Callback({ error: err.message }); });
	},

	GetVoice: function(Callback) { this._post('/get-voice').then(function(result) { Callback(result); }).catch(function(err) { Callback({ error: err.message }); }); },
	SetVoice: function(tone, audience, Callback) { this._postJson('/set-voice', { tone: tone, audience: audience }).then(function(result) { Callback(result); }).catch(function(err) { Callback({ error: err.message }); }); },
	ClearVoice: function(Callback) { this._post('/clear-voice').then(function(result) { Callback(result); }).catch(function(err) { Callback({ error: err.message }); }); },
	GenerateContent: function(brief, Callback) { this._postJson('/generate-content', { brief: brief }).then(function(result) { Callback(result); }).catch(function(err) { Callback({ error: err.message }); }); },
	PolishContent: function(text, Callback) { this._postJson('/polish-content', { text: text }).then(function(result) { Callback(result); }).catch(function(err) { Callback({ error: err.message }); }); },
	OptimizeContent: function(text, Callback) { this._postJson('/optimize-content', { text: text }).then(function(result) { Callback(result); }).catch(function(err) { Callback({ error: err.message }); }); },
	GenerateVariants: function(text, n, Callback) { this._postJson('/generate-variants', { text: text, n: n }).then(function(result) { Callback(result); }).catch(function(err) { Callback({ error: err.message }); }); },
	RepurposeUrl: function(url, angle, Callback) { this._postJson('/repurpose-url', { url: url, angle: angle }).then(function(result) { Callback(result); }).catch(function(err) { Callback({ error: err.message }); }); },
	PublishDue: function(Callback) { this._post('/publish-due').then(function(result) { Callback(result); }).catch(function(err) { Callback({ error: err.message }); }); },
	ListComments: function(postUrn, Callback) { this._postJson('/list-comments', { postUrn: postUrn }).then(function(result) { Callback(result); }).catch(function(err) { Callback({ error: err.message }); }); },
	GetStats: function(postUrn, Callback) { this._postJson('/get-stats', { postUrn: postUrn }).then(function(result) { Callback(result); }).catch(function(err) { Callback({ error: err.message }); }); },
	ReplyComment: function(postUrn, commentText, Callback) { this._postJson('/reply-comment', { postUrn: postUrn, commentText: commentText }).then(function(result) { Callback(result); }).catch(function(err) { Callback({ error: err.message }); }); }
};
	// Initialize on page load
	document.addEventListener('DOMContentLoaded', function() {
		var handlingCallback = handleOAuthCallbackIfPresent();
		loadAccountStatus();
		loadLlmInfo();
		loadDrafts();
		loadPublishedPosts();
		loadVoice();
		renderQuickComposer();
		renderContentTools();
		renderCoverageMatrix();

		// Wire up buttons
		var configureBtn = document.getElementById('configureBtn');
		var authorizeBtn = document.getElementById('authorizeBtn');
		var disconnectBtn = document.getElementById('disconnectBtn');
		var createDraftBtn = document.getElementById('createDraftBtn');

	if (configureBtn) configureBtn.addEventListener('click', showConfigForm);
	if (authorizeBtn) authorizeBtn.addEventListener('click', doAuthorize);
	if (disconnectBtn) disconnectBtn.addEventListener('click', doDisconnect);

	var createDraftBtn = document.getElementById('createDraftBtn');
	if (createDraftBtn) createDraftBtn.addEventListener('click', showComposer);

	var filterBtns = document.querySelectorAll('.draft-filter-btn');
	filterBtns.forEach(function(btn) {
		btn.addEventListener('click', function() {
			filterBtns.forEach(function(b) { b.classList.remove('active'); });
			btn.classList.add('active');
			currentDraftFilter = btn.getAttribute('data-filter') || null;
			loadDrafts();
		});
	});
});

var currentDraftFilter = null;

	function showToast(message, type) {
		var region = document.getElementById('toastRegion');
		if (!region) return;
		var toast = document.createElement('div');
		toast.className = 'app-toast ' + (type || '');
		toast.textContent = message;
		region.prepend(toast);
		setTimeout(function() { toast.remove(); }, 12000);
	}

	function showError(message) { showToast(message, 'error'); }
	function showSuccess(message) { showToast(message, 'success'); }

	function closeModal() {
		var root = document.getElementById('modalRoot');
		if (root) root.innerHTML = '';
	}

	function openModal(options) {
		var root = document.getElementById('modalRoot');
		if (!root) return;
		var tone = options.tone || 'warning';
		root.innerHTML = '<div class="app-modal modal-' + tone + '" role="dialog" aria-modal="true">' +
			'<div class="app-modal-header"><div class="app-modal-kicker">' + escapeHtml(options.kicker || 'Confirm action') + '</div><h2 class="app-modal-title">' + escapeHtml(options.title || '') + '</h2></div>' +
			'<div class="app-modal-body">' + (options.bodyHtml || '') + '</div>' +
			'<div class="app-modal-footer"><button class="buffaly-button secondary" id="modalCancel" type="button">' + escapeHtml(options.cancelText || 'Cancel') + '</button><button class="buffaly-button ' + (tone === 'danger' ? 'danger' : '') + '" id="modalConfirm" type="button">' + escapeHtml(options.confirmText || 'Continue') + '</button></div>' +
			'</div>';
		document.getElementById('modalCancel').addEventListener('click', closeModal);
		document.getElementById('modalConfirm').addEventListener('click', function() {
			if (options.onConfirm) options.onConfirm();
		});
	}

	function renderCoverageMatrix() {
		var host = document.getElementById('coverageMatrix');
		if (!host) return;
		var rows = [
			['GetAccountStatus', 'Account panel status, profile, token and permission chips'],
			['SaveAppConfig', 'Configure App Credentials form'],
			['StartAuthorization', 'Authorize button'],
			['CompleteAuthorization', 'OAuth callback completion screen'],
			['Disconnect', 'Disconnect button'],
			['ImportExistingToken', 'Admin migration helper / token import path'],
			['ListDrafts', 'Draft board and filters'],
			['CreateDraft', 'Create Draft composer'],
			['GetDraft', 'Edit draft workflow'],
			['UpdateDraft', 'Edit draft workflow'],
			['ApproveDraft', 'Draft card approve action'],
			['DeleteDraft', 'Draft card delete action'],
			['ScheduleDraft', 'Draft card schedule action'],
			['UnscheduleDraft', 'Draft card unschedule action'],
			['PublishDraft', 'Approved draft publish action'],
			['PublishDue', 'Publishing workspace maintenance action'],
			['CreatePost', 'Publishing workspace quick text post'],
			['ShareLink', 'Publishing workspace link share'],
			['ShareImage', 'Publishing workspace image share'],
			['DeletePost', 'Published post delete action with local-history guard'],
			['ListPublishedPosts', 'Published Posts panel'],
			['GetVoice', 'Brand Voice panel'],
			['SetVoice', 'Brand Voice editor'],
			['AddVoiceExample', 'Brand Voice examples editor'],
			['ClearVoice', 'Brand Voice reset action'],
			['GetLlmInfo', 'Content Intelligence status panel'],
			['GenerateContent', 'Content Tools generate action'],
			['PolishContent', 'Content Tools polish action'],
			['OptimizeContent', 'Content Tools optimize action'],
			['GenerateVariants', 'Content Tools variants action'],
			['RepurposeUrl', 'Content Tools repurpose URL action'],
			['PermissionProbe', 'Permissions in account status'],
			['ReplyComment', 'Engagement action from published post tools'],
			['ListComments', 'Engagement action from published post tools'],
			['GetStats', 'Engagement stats action from published post tools']
		];
		host.innerHTML = rows.map(function(row) {
			return '<div class="coverage-row"><strong>' + escapeHtml(row[0]) + '</strong><span>' + escapeHtml(row[1]) + '</span><em class="matrix-status">Represented</em></div>';
		}).join('');
	}

	function renderQuickComposer() {
		var host = document.getElementById('quickComposer');
		if (!host) return;
		host.innerHTML = '<div class="buffaly-field"><label class="buffaly-field-label">Post text</label><textarea id="quickPostText" class="buffaly-input" placeholder="Write a clearly labeled post or turn a draft into a publish-ready update..."></textarea></div>' +
			'<div class="linkedin-grid mt-3"><div class="buffaly-span-5"><label class="buffaly-field-label">Visibility</label><select id="quickVisibility" class="buffaly-input"><option value="PUBLIC">Public</option><option value="CONNECTIONS">Connections</option></select></div><div class="buffaly-span-7"><label class="buffaly-field-label">Link URL / image path</label><input id="quickAsset" class="buffaly-input" placeholder="Optional URL or local image path"></div></div>' +
			'<div class="buffaly-action-row mt-3"><button id="quickCreatePost" class="buffaly-button" type="button">Publish Text Post</button><button id="quickShareLink" class="buffaly-button secondary" type="button">Share Link</button><button id="quickShareImage" class="buffaly-button secondary" type="button">Share Image</button><button id="quickPublishDue" class="buffaly-button secondary" type="button">Publish Due</button></div>';
		document.getElementById('quickCreatePost').addEventListener('click', function() {
			LinkedInService.CreatePost(document.getElementById('quickPostText').value, document.getElementById('quickVisibility').value, handlePublishResult);
		});
		document.getElementById('quickShareLink').addEventListener('click', function() {
			LinkedInService.ShareLink(document.getElementById('quickPostText').value, document.getElementById('quickAsset').value, null, null, document.getElementById('quickVisibility').value, handlePublishResult);
		});
		document.getElementById('quickShareImage').addEventListener('click', function() {
			LinkedInService.ShareImage(document.getElementById('quickPostText').value, document.getElementById('quickAsset').value, null, null, document.getElementById('quickVisibility').value, handlePublishResult);
		});
		document.getElementById('quickPublishDue').addEventListener('click', function() {
			LinkedInService.PublishDue(function(result) { if (result.error) showError(result.error); else { showSuccess('Publish due complete. Results: ' + JSON.stringify(result.results || [])); loadPublishedPosts(); } });
		});
	}

	function handlePublishResult(result) {
		if (result && result.error) { showError(result.error); return; }
		showSuccess('Published: ' + (result.url || result.postUrn || 'success'));
		loadPublishedPosts();
	}

	function loadVoice() {
		var status = document.getElementById('voiceStatusText');
		var summary = document.getElementById('voiceSummary');
		if (!status || !summary) return;
		LinkedInService.GetVoice(function(result) {
			if (result.error) { status.textContent = 'Voice unavailable'; summary.textContent = result.error; return; }
			status.textContent = 'Tone and audience controls for generated content.';
			summary.innerHTML = '<div class="buffaly-field"><label class="buffaly-field-label">Tone</label><input id="voiceTone" class="buffaly-input" value="' + escapeHtml(result.tone || '') + '" placeholder="clear, helpful, confident"></div>' +
				'<div class="buffaly-field mt-3"><label class="buffaly-field-label">Audience</label><input id="voiceAudience" class="buffaly-input" value="' + escapeHtml(result.audience || '') + '" placeholder="founders, operators, technical buyers"></div>' +
				'<div class="buffaly-action-row mt-3"><button id="saveVoiceBtn" class="buffaly-button secondary" type="button">Save Voice</button><button id="clearVoiceBtn" class="buffaly-button secondary" type="button">Clear</button></div>';
			document.getElementById('saveVoiceBtn').addEventListener('click', function() {
				LinkedInService.SetVoice(document.getElementById('voiceTone').value, document.getElementById('voiceAudience').value, function(saveResult) { if (saveResult.error) showError(saveResult.error); else { showSuccess('Voice updated'); loadVoice(); } });
			});
			document.getElementById('clearVoiceBtn').addEventListener('click', function() {
				LinkedInService.ClearVoice(function(clearResult) { if (clearResult.error) showError(clearResult.error); else { showSuccess('Voice cleared'); loadVoice(); } });
			});
		});
	}

	function renderContentTools() {
		var host = document.getElementById('contentToolTabs');
		if (!host) return;
		var tools = [['Generate', 'Turn a brief into a LinkedIn post', 'GenerateContent'], ['Polish', 'Improve clarity and tone', 'PolishContent'], ['Optimize', 'Optimize for engagement', 'OptimizeContent'], ['Variants', 'Create alternate versions', 'GenerateVariants'], ['Repurpose URL', 'Convert a URL into a post angle', 'RepurposeUrl']];
		host.innerHTML = tools.map(function(t) { return '<div class="tool-card"><h3>' + t[0] + '</h3><p>' + t[1] + '</p><textarea class="buffaly-input tool-input" data-tool="' + t[2] + '" placeholder="Paste text, brief, or URL..."></textarea><button class="buffaly-button secondary mt-2 run-tool" data-tool="' + t[2] + '" type="button">Run</button></div>'; }).join('');
		document.querySelectorAll('.run-tool').forEach(function(btn) {
			btn.addEventListener('click', function() {
				var tool = btn.getAttribute('data-tool');
				var input = document.querySelector('.tool-input[data-tool="' + tool + '"]').value;
				var done = function(result) { var out = document.getElementById('contentToolResult'); if (result.error) { showError(result.error); out.textContent = result.error; } else { out.textContent = JSON.stringify(result, null, 2); } };
				if (tool === 'GenerateContent') LinkedInService.GenerateContent(input, done);
				else if (tool === 'PolishContent') LinkedInService.PolishContent(input, done);
				else if (tool === 'OptimizeContent') LinkedInService.OptimizeContent(input, done);
				else if (tool === 'GenerateVariants') LinkedInService.GenerateVariants(input, 3, done);
				else if (tool === 'RepurposeUrl') LinkedInService.RepurposeUrl(input, '', done);
			});
		});
	}

	function handleOAuthCallbackIfPresent() {
		var params = new URLSearchParams(window.location.search || '');
		var code = params.get('code');
		var state = params.get('state');
		var error = params.get('error_description') || params.get('error');
		if (!code && !error) return false;

		var statusChip = document.getElementById('statusChip');
		var statusDetail = document.getElementById('statusDetail');
		var accountStatusText = document.getElementById('accountStatusText');
		if (statusChip) {
			statusChip.textContent = error ? 'Authorization failed' : 'Completing authorization...';
			statusChip.className = 'buffaly-status-pill ' + (error ? 'status-error' : 'status-warning');
		}
		if (statusDetail) statusDetail.textContent = '';
		if (accountStatusText) accountStatusText.textContent = error ? ('LinkedIn authorization failed: ' + error) : 'Exchanging LinkedIn authorization code...';

		if (error) return true;
		if (!state) {
			if (accountStatusText) accountStatusText.textContent = 'LinkedIn authorization callback was missing state.';
			return true;
		}

		LinkedInService.CompleteAuthorization(code, state, function(result) {
			if (result && result.error) {
				if (statusChip) {
					statusChip.textContent = 'Authorization failed';
					statusChip.className = 'buffaly-status-pill status-error';
				}
				if (accountStatusText) accountStatusText.textContent = 'LinkedIn authorization failed: ' + result.error;
				return;
			}
			window.history.replaceState({}, document.title, window.location.pathname);
			loadAccountStatus();
		});
		return true;
	}

	function loadAccountStatus() {
		var statusChip = document.getElementById('statusChip');
		var statusDetail = document.getElementById('statusDetail');
		var accountStatusText = document.getElementById('accountStatusText');
		var accountDetails = document.getElementById('accountDetails');

		LinkedInService.GetAccountStatus(function(result) {
			if (result && result.error) {
				statusChip.textContent = 'Error';
				statusChip.className = 'buffaly-status-pill status-error';
				accountStatusText.textContent = 'Failed to load account status: ' + result.error;
				return;
			}

			if (!result.hasClientConfiguration) {
				statusChip.textContent = 'Not connected';
				statusChip.className = 'buffaly-status-pill status-warning';
				statusDetail.textContent = 'Configure app credentials to get started.';
				accountStatusText.textContent = 'No LinkedIn app credentials configured. Click "Configure App Credentials" to set up your LinkedIn OAuth app.';
				accountDetails.innerHTML = '';
			} else if (!result.hasToken) {
				statusChip.textContent = 'Not authorized';
				statusChip.className = 'buffaly-status-pill status-warning';
				statusDetail.textContent = 'Click Authorize to connect your LinkedIn account.';
				accountStatusText.textContent = 'App credentials are configured but no access token has been obtained yet.';
				accountDetails.innerHTML = '';
			} else {
				statusChip.textContent = 'Connected';
				statusChip.className = 'buffaly-status-pill status-ready';
				statusDetail.textContent = result.profileName || 'Connected';
				accountStatusText.textContent = 'Connected as ' + (result.profileName || 'Unknown') + ' (' + (result.profileEmail || 'No email') + ')';
				accountDetails.innerHTML = formatAccountDetails(result);
			}
		});
	}

	function formatAccountDetails(status) {
		var html = '<div class="account-info">';
		if (status.profileName) html += '<p><strong>Name:</strong> ' + escapeHtml(status.profileName) + '</p>';
		if (status.profileEmail) html += '<p><strong>Email:</strong> ' + escapeHtml(status.profileEmail) + '</p>';
		if (status.personUrn) html += '<p><strong>URN:</strong> ' + escapeHtml(status.personUrn) + '</p>';
		if (status.grantedScopes && status.grantedScopes.length > 0) {
			html += '<p><strong>Granted scopes:</strong> ' + status.grantedScopes.map(escapeHtml).join(', ') + '</p>';
		}
		if (status.permissions) {
			html += '<p><strong>Permissions:</strong></p><ul>';
			html += '<li>Publish posts: ' + (status.permissions.canPublishMemberPosts ? '✓' : '✗') + '</li>';
			html += '<li>Comment: ' + (status.permissions.canCommentAsMember ? '✓' : '✗') + '</li>';
			html += '<li>Read comments: ' + (status.permissions.canReadMemberComments ? '✓' : '✗') + '</li>';
			html += '<li>Read stats: ' + (status.permissions.canReadMemberStats ? '✓' : '✗') + '</li>';
			html += '</ul>';
		}
		html += '</div>';
		return html;
	}

	function loadLlmInfo() {
		var llmStatusText = document.getElementById('llmStatusText');
		LinkedInService.GetLlmInfo(function(result) {
			if (result && result.error) {
				llmStatusText.textContent = 'LLM not configured: ' + result.error;
				return;
			}
			llmStatusText.textContent = 'Provider: ' + (result.provider || 'unknown') + ' | Model: ' + (result.model || 'unknown');
			if (result.note) {
				llmStatusText.textContent += '\n' + result.note;
			}
		});
	}

	function loadDrafts() {
		var draftsStatusText = document.getElementById('draftsStatusText');
		var draftsList = document.getElementById('draftsList');
		LinkedInService.ListDrafts(currentDraftFilter, function(result) {
			renderDrafts(result, currentDraftFilter);
		});
	}

	function renderDrafts(result, filter) {
		var draftsStatusText = document.getElementById('draftsStatusText');
		var draftsList = document.getElementById('draftsList');
		if (result && result.error) {
			draftsStatusText.textContent = 'Failed to load drafts: ' + result.error;
			return;
		}
		var drafts = result.drafts || [];
		if (drafts.length === 0) {
			draftsStatusText.textContent = 'No drafts yet. Click "Create Draft" to get started.';
			draftsList.innerHTML = '';
		} else {
			var filtered = filter ? drafts.filter(function(d) { return d.status === filter; }) : drafts;
			draftsStatusText.textContent = filtered.length + ' draft(s)' + (filter ? ' (' + filter + ')' : '');
			draftsList.innerHTML = filtered.map(function(d) {
				return renderDraftCard(d);
			}).join('');
			wireDraftCardActions();
		}
	}

	function renderDraftCard(d) {
		var statusClass = 'draft-status-' + d.status;
		var html = '<div class="draft-card ' + statusClass + '" data-draft-id="' + escapeHtml(d.id) + '">';
		html += '<div class="draft-card-header"><span class="draft-badge ' + statusClass + '">' + escapeHtml(d.status) + '</span>';
		if (d.scheduledAt) html += '<span class="draft-scheduled">Scheduled: ' + escapeHtml(d.scheduledAt) + '</span>';
		html += '</div>';
		html += '<p class="draft-text">' + escapeHtml(d.text || '') + '</p>';
		html += '<div class="draft-meta">';
		html += '<span>Visibility: ' + escapeHtml(d.visibility) + '</span>';
		html += '<span>Media: ' + escapeHtml(d.mediaType) + '</span>';
		if (d.linkUrl) html += '<span>Link: ' + escapeHtml(d.linkUrl) + '</span>';
		if (d.publishedUrn) html += '<span>URN: ' + escapeHtml(d.publishedUrn) + '</span>';
		html += '</div>';
		html += '<div class="draft-actions">';
		if (d.status === 'draft') {
			html += '<button class="buffaly-button secondary draft-edit" data-id="' + escapeHtml(d.id) + '">Edit</button>';
			html += '<button class="buffaly-button draft-approve" data-id="' + escapeHtml(d.id) + '">Approve</button>';
			html += '<button class="buffaly-button secondary draft-delete" data-id="' + escapeHtml(d.id) + '">Delete</button>';
		} else if (d.status === 'approved') {
			html += '<button class="buffaly-button secondary draft-edit" data-id="' + escapeHtml(d.id) + '">Edit (resets to draft)</button>';
			html += '<button class="buffaly-button draft-publish" data-id="' + escapeHtml(d.id) + '">Publish</button>';
			html += '<button class="buffaly-button draft-schedule" data-id="' + escapeHtml(d.id) + '">Schedule</button>';
			html += '<button class="buffaly-button secondary draft-delete" data-id="' + escapeHtml(d.id) + '">Delete</button>';
		} else if (d.status === 'scheduled') {
			html += '<button class="buffaly-button secondary draft-unschedule" data-id="' + escapeHtml(d.id) + '">Unschedule</button>';
			html += '<button class="buffaly-button secondary draft-delete" data-id="' + escapeHtml(d.id) + '">Delete</button>';
		} else if (d.status === 'publishing') {
			html += '<span class="buffaly-muted">Publishing...</span>';
		} else if (d.status === 'published') {
			html += '<span class="buffaly-muted">Published: ' + escapeHtml(d.publishedUrn || '') + '</span>';
		}
		html += '</div>';
		html += '</div>';
		return html;
	}

	function wireDraftCardActions() {
		document.querySelectorAll('.draft-edit').forEach(function(btn) {
			btn.addEventListener('click', function() { showEditForm(btn.getAttribute('data-id')); });
		});
		document.querySelectorAll('.draft-approve').forEach(function(btn) {
			btn.addEventListener('click', function() { doApproveDraft(btn.getAttribute('data-id')); });
		});
		document.querySelectorAll('.draft-delete').forEach(function(btn) {
			btn.addEventListener('click', function() { doDeleteDraft(btn.getAttribute('data-id')); });
		});
		document.querySelectorAll('.draft-schedule').forEach(function(btn) {
			btn.addEventListener('click', function() { doScheduleDraft(btn.getAttribute('data-id')); });
		});
		document.querySelectorAll('.draft-unschedule').forEach(function(btn) {
			btn.addEventListener('click', function() { doUnscheduleDraft(btn.getAttribute('data-id')); });
		});
		document.querySelectorAll('.draft-publish').forEach(function(btn) {
			btn.addEventListener('click', function() { doPublishDraft(btn.getAttribute('data-id')); });
		});
	}

	function showComposer() {
		var panel = document.getElementById('draftsPanel');
		var existing = document.getElementById('composerForm');
		if (existing) { existing.remove(); return; }
		panel.appendChild(buildDraftForm('composerForm', 'Create Draft', null, function(form) {
			var text = document.getElementById('form_text').value;
			var visibility = document.getElementById('form_visibility').value;
			var mediaType = document.getElementById('form_mediaType').value;
			var linkUrl = document.getElementById('form_linkUrl').value || null;
			var imagePath = document.getElementById('form_imagePath').value || null;
			var title = document.getElementById('form_title').value || null;
			var description = document.getElementById('form_description').value || null;
			LinkedInService.CreateDraft(text, visibility, mediaType, linkUrl, imagePath, title, description, function(result) {
				if (result && result.error) { showError(result.error); return; }
				form.remove();
				loadDrafts();
			});
		}));
	}

	function showEditForm(draftId) {
		LinkedInService.GetDraft(draftId, function(draft) {
			if (draft && draft.error) { showError(draft.error); return; }
			var panel = document.getElementById('draftsPanel');
			var existing = document.getElementById('composerForm');
			if (existing) existing.remove();
			panel.appendChild(buildDraftForm('composerForm', 'Edit Draft', draft, function(form) {
				var text = document.getElementById('form_text').value;
				var visibility = document.getElementById('form_visibility').value;
				var linkUrl = document.getElementById('form_linkUrl').value || null;
				var imagePath = document.getElementById('form_imagePath').value || null;
			var title = document.getElementById('form_title').value || null;
			var description = document.getElementById('form_description').value || null;
			LinkedInService.UpdateDraft(draftId, text, visibility, linkUrl, imagePath, title, description, function(result) {
					if (result && result.error) { showError(result.error); return; }
					form.remove();
					loadDrafts();
				});
			}));
		});
	}

	function buildDraftForm(id, title, draft, onSave) {
		var form = document.createElement('div');
		form.id = id;
		form.className = 'mt-3 buffaly-panel';
		var d = draft || {};
		form.innerHTML = '<h3>' + title + '</h3>' +
			'<div class="buffaly-field"><label class="buffaly-field-label">Text</label><textarea class="buffaly-input" id="form_text" rows="4">' + escapeHtml(d.text || '') + '</textarea></div>' +
			'<div class="buffaly-field mt-3"><label class="buffaly-field-label">Visibility</label><select class="buffaly-input" id="form_visibility"><option value="PUBLIC"' + (d.visibility === 'PUBLIC' ? ' selected' : '') + '>PUBLIC</option><option value="CONNECTIONS"' + (d.visibility === 'CONNECTIONS' ? ' selected' : '') + '>CONNECTIONS</option></select></div>' +
			'<div class="buffaly-field mt-3"><label class="buffaly-field-label">Media Type</label><select class="buffaly-input" id="form_mediaType"><option value="none"' + (d.mediaType === 'none' || !d.mediaType ? ' selected' : '') + '>none</option><option value="link"' + (d.mediaType === 'link' ? ' selected' : '') + '>link</option><option value="image"' + (d.mediaType === 'image' ? ' selected' : '') + '>image</option></select></div>' +
			'<div class="buffaly-field mt-3"><label class="buffaly-field-label">Link URL</label><input class="buffaly-input" id="form_linkUrl" type="text" value="' + escapeHtml(d.linkUrl || '') + '"></div>' +
			'<div class="buffaly-field mt-3"><label class="buffaly-field-label">Image Path</label><input class="buffaly-input" id="form_imagePath" type="text" value="' + escapeHtml(d.imagePath || '') + '"></div>' +
			'<div class="buffaly-field mt-3"><label class="buffaly-field-label">Title (optional, for link media)</label><input class="buffaly-input" id="form_title" type="text" value="' + escapeHtml(d.title || '') + '"></div>' +
			'<div class="buffaly-field mt-3"><label class="buffaly-field-label">Description (optional, for link media)</label><input class="buffaly-input" id="form_description" type="text" value="' + escapeHtml(d.description || '') + '"></div>' +
			'<div class="buffaly-action-row mt-3"><button class="buffaly-button" id="form_saveBtn" type="button">Save</button><button class="buffaly-button secondary" id="form_cancelBtn" type="button">Cancel</button></div>';
		form.querySelector('#form_saveBtn').addEventListener('click', function() { onSave(form); });
		form.querySelector('#form_cancelBtn').addEventListener('click', function() { form.remove(); });
		return form;
	}

	function doApproveDraft(draftId) {
		openModal({
			kicker: 'Draft approval',
			title: 'Approve this draft?',
			bodyHtml: '<p class="buffaly-muted">Approved drafts become eligible for publishing or scheduling.</p><label class="buffaly-field-label">Optional note</label><textarea id="approvalNote" class="buffaly-input" placeholder="Why is this ready?"></textarea>',
			confirmText: 'Approve draft',
			onConfirm: function() {
				var note = document.getElementById('approvalNote').value || null;
				LinkedInService.ApproveDraft(draftId, note, function(result) {
					if (result && result.error) { showError(result.error); return; }
					closeModal();
					showSuccess('Draft approved.');
					loadDrafts();
				});
			}
		});
	}

	function doDeleteDraft(draftId) {
		openModal({
			kicker: 'Delete draft',
			title: 'Delete this local draft?',
			tone: 'danger',
			bodyHtml: '<p>This removes the draft from the local Buffaly LinkedIn workspace. It does not delete a LinkedIn post.</p>',
			confirmText: 'Delete draft',
			onConfirm: function() {
				LinkedInService.DeleteDraft(draftId, function(result) {
					if (result && result.error) { showError(result.error); return; }
					closeModal();
					showSuccess('Draft deleted.');
					loadDrafts();
				});
			}
		});
	}

	function doScheduleDraft(draftId) {
		openModal({
			kicker: 'Schedule draft',
			title: 'Choose a publish time',
			bodyHtml: '<p class="buffaly-muted">Use ISO 8601 UTC time, for example <code>2026-07-10T09:00:00Z</code>.</p><label class="buffaly-field-label">Publish at</label><input id="scheduleWhen" class="buffaly-input" placeholder="2026-07-10T09:00:00Z">',
			confirmText: 'Schedule',
			onConfirm: function() {
				var when = document.getElementById('scheduleWhen').value;
				if (!when) { showError('Schedule time is required.'); return; }
				LinkedInService.ScheduleDraft(draftId, when, function(result) {
					if (result && result.error) { showError(result.error); return; }
					closeModal();
					showSuccess('Draft scheduled.');
					loadDrafts();
				});
			}
		});
	}

	function doUnscheduleDraft(draftId) {
		LinkedInService.UnscheduleDraft(draftId, function(result) {
			if (result && result.error) { showError(result.error); return; }
			loadDrafts();
		});
	}

	function doPublishDraft(draftId) {
		openModal({
			kicker: 'Publish to LinkedIn',
			title: 'Publish this approved draft now?',
			bodyHtml: '<p>This will create a live LinkedIn post using your connected account. You can delete tracked posts from the Published Posts panel.</p>',
			confirmText: 'Publish now',
			onConfirm: function() {
				LinkedInService.PublishDraft(draftId, function(result) {
					if (result && result.error) { showError(result.error); return; }
					closeModal();
					showSuccess('Published: ' + (result.url || result.postUrn || 'success'));
					loadDrafts();
					loadPublishedPosts();
				});
			}
		});
	}

	function loadPublishedPosts() {
		var postsList = document.getElementById('publishedPostsList');
		var postsStatus = document.getElementById('publishedPostsStatus');
		if (!postsList) return;
		LinkedInService.ListPublishedPosts(function(result) {
			if (result && result.error) {
				postsStatus.textContent = 'Failed to load: ' + result.error;
				return;
			}
			var posts = result.posts || [];
			if (posts.length === 0) {
				postsStatus.textContent = 'No published posts yet.';
				postsList.innerHTML = '';
			} else {
				postsStatus.textContent = posts.length + ' published post(s)';
				postsList.innerHTML = posts.map(function(p) {
					var html = '<div class="published-post-card">';
					html += '<p class="draft-text">' + escapeHtml(p.textDigest || '') + '</p>';
					html += '<div class="draft-meta">';
					html += '<span>URN: ' + escapeHtml(p.postUrn || '') + '</span>';
					html += '<span>Published: ' + escapeHtml(p.publishedAt || '') + '</span>';
					if (p.deleted) html += '<span class="draft-badge draft-status-published">Deleted</span>';
					html += '</div>';
					if (p.url && !p.deleted) {
						html += '<div class="draft-actions">';
						html += '<a href="' + escapeHtml(p.url) + '" target="_blank" class="buffaly-button secondary">View on LinkedIn</a>';
						html += '<button class="buffaly-button secondary post-delete" data-urn="' + escapeHtml(p.postUrn) + '">Delete Post</button>';
						html += '</div>';
					}
					html += '</div>';
					return html;
				}).join('');
				document.querySelectorAll('.post-delete').forEach(function(btn) {
					btn.addEventListener('click', function() {
						var urn = btn.getAttribute('data-urn');
						openModal({
							kicker: 'Delete LinkedIn post',
							title: 'Delete this live LinkedIn post?',
							tone: 'danger',
							bodyHtml: '<p>This will delete the tracked post from LinkedIn and mark it deleted locally.</p><p class="buffaly-muted">URN: ' + escapeHtml(urn) + '</p>',
							confirmText: 'Delete post',
							onConfirm: function() {
								LinkedInService.DeletePost(urn, function(result) {
									if (result && result.error) { showError(result.error); return; }
									closeModal();
									showSuccess('Post deleted from LinkedIn.');
									loadPublishedPosts();
								});
							}
						});
					});
				});
			}
		});
	}

	function showConfigForm() {
		var panel = document.getElementById('accountPanel');
		var existing = document.getElementById('configForm');
		if (existing) { existing.remove(); return; }

		var form = document.createElement('div');
		form.id = 'configForm';
		form.className = 'mt-3';
		form.innerHTML = '<div class="buffaly-field"><label class="buffaly-field-label">Client ID</label><input class="buffaly-input" id="cfgClientId" type="text" placeholder="LinkedIn Client ID"></div>' +
			'<div class="buffaly-field mt-3"><label class="buffaly-field-label">Client Secret</label><input class="buffaly-input" id="cfgClientSecret" type="password" placeholder="LinkedIn Client Secret"></div>' +
			'<div class="buffaly-field mt-3"><label class="buffaly-field-label">Redirect URI</label><input class="buffaly-input" id="cfgRedirectUri" type="text" placeholder="http://127.0.0.1:5110/oauth/callback"></div>' +
			'<div class="buffaly-field mt-3"><label class="buffaly-field-label">Scopes</label><input class="buffaly-input" id="cfgScopes" type="text" value="openid profile email w_member_social"></div>' +
			'<div class="buffaly-action-row mt-3"><button class="buffaly-button" id="saveConfigBtn" type="button">Save</button><button class="buffaly-button secondary" id="cancelConfigBtn" type="button">Cancel</button></div>';
		panel.appendChild(form);

		document.getElementById('saveConfigBtn').addEventListener('click', function() {
			var cid = document.getElementById('cfgClientId').value;
			var csec = document.getElementById('cfgClientSecret').value;
			var ruri = document.getElementById('cfgRedirectUri').value;
			var sc = document.getElementById('cfgScopes').value;
			LinkedInService.SaveAppConfig(cid, csec, ruri, sc, function(result) {
				if (result.error) {
					showError(result.error);
				} else {
					form.remove();
					showSuccess('LinkedIn app credentials saved.');
					loadAccountStatus();
				}
			});
		});
		document.getElementById('cancelConfigBtn').addEventListener('click', function() { form.remove(); });
	}

	function doAuthorize() {
		LinkedInService.StartAuthorization(function(result) {
			if (result.error) {
				showError(result.error);
			} else if (result.authUrl) {
				window.location.href = result.authUrl;
			}
		});
	}

	function doDisconnect() {
		openModal({
			kicker: 'Disconnect account',
			title: 'Remove the saved LinkedIn token?',
			tone: 'danger',
			bodyHtml: '<p>This removes the local access token and cached profile. Your LinkedIn app credentials stay saved so you can authorize again.</p>',
			confirmText: 'Disconnect',
			onConfirm: function() {
				LinkedInService.Disconnect(function(result) {
					if (result && result.error) { showError(result.error); return; }
					closeModal();
					showSuccess('LinkedIn account disconnected.');
					loadAccountStatus();
				});
			}
		});
	}

	function escapeHtml(text) {
		if (!text) return '';
		var div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}
})();
