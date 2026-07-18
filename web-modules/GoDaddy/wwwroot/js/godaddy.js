const API_BASE = "/api/buffaly.godaddy/go-daddy-service";
let selectedDomain = null;
let allDomains = [];
let sortColumn = 'expires';
let sortDirection = 'asc';
let dnsEditMode = false;
let editingDnsRecord = null;

async function apiCall(endpoint, body, retries) {
	retries = retries || 0;
	const opts = { method: "POST", headers: { "Content-Type": "application/json" } };
	if (body) opts.body = JSON.stringify(body);
	let resp;
	try {
		resp = await fetch(API_BASE + endpoint, opts);
	} catch (e) {
		if (retries < 1) { await new Promise(r => setTimeout(r, 500)); return apiCall(endpoint, body, retries + 1); }
		throw new Error("Network error: " + e.message);
	}
	if ((resp.status === 502 || resp.status === 503) && retries < 2) {
		await new Promise(r => setTimeout(r, 800 * (retries + 1)));
		return apiCall(endpoint, body, retries + 1);
	}
	const text = await resp.text();
	let data;
	try { data = text ? JSON.parse(text) : {}; }
	catch { throw new Error("API returned non-JSON response (HTTP " + resp.status + "): " + text.substring(0, 200)); }
	if (!resp.ok) {
		const msg = data.message || (typeof data.error === "string" ? data.error : "") || "API error: " + resp.status;
		throw new Error(msg);
	}
	return data;
}

async function checkStatus() {
	const pill = document.getElementById("statusPill");
	pill.className = "buffaly-status-pill";
	pill.textContent = "Checking…";
	try {
		const status = await apiCall("/get-account-status");
		if (status.connected) {
			pill.className = "buffaly-status-pill success";
			pill.textContent = "Connected (" + status.domainCount + " domains)";
		} else {
			pill.className = "buffaly-status-pill warning";
			pill.textContent = status.error ? "Error" : "Not configured";
			if (status.error) showError(status.error);
		}
		return status;
	} catch (e) {
		pill.className = "buffaly-status-pill danger";
		pill.textContent = "Error";
		showError(e.message);
		return { connected: false };
	}
}

function showError(msg) {
	const el = document.getElementById("errorNotice");
	el.textContent = msg;
	el.style.display = "block";
}
function clearError() { document.getElementById("errorNotice").style.display = "none"; }

function escapeHtml(str) {
	if (!str) return "";
	const div = document.createElement("div");
	div.textContent = str;
	return div.innerHTML;
}

function formatDate(str) {
	if (!str) return "—";
	try { return new Date(str).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }); }
	catch { return str; }
}

function getExpirationClass(expiresStr) {
	if (!expiresStr) return "";
	const expires = new Date(expiresStr);
	const days = Math.floor((expires - new Date()) / (1000 * 60 * 60 * 24));
	if (days < 7) return "godaddy-exp-red";
	if (days < 30) return "godaddy-exp-yellow";
	return "godaddy-exp-green";
}

function getDaysUntilExpiry(expiresStr) {
	if (!expiresStr) return null;
	const expires = new Date(expiresStr);
	return Math.floor((expires - new Date()) / (1000 * 60 * 60 * 24));
}

async function loadDomains() {
	clearError();
	document.getElementById("loadingMsg").style.display = "block";
	document.getElementById("emptyMsg").style.display = "none";
	document.getElementById("domainPanel").style.display = "none";
	document.getElementById("detailPanel").style.display = "none";
	try {
		const status = await checkStatus();
		if (!status.connected) { document.getElementById("loadingMsg").style.display = "none"; return; }
		const domains = await apiCall("/list-domains");
		allDomains = domains || [];
		document.getElementById("loadingMsg").style.display = "none";
		if (allDomains.length === 0) { document.getElementById("emptyMsg").style.display = "block"; return; }
		document.getElementById("domainPanel").style.display = "block";
		renderDomainTable();
	} catch (e) { document.getElementById("loadingMsg").style.display = "none"; showError(e.message); }
}

function sortDomains(domains) {
	const getVal = (d, col) => {
		if (col === 'domain') return (d.domain || '').toLowerCase();
		if (col === 'status') return (d.status || '').toLowerCase();
		if (col === 'expires') return d.expiresAt || d.expires || '';
		if (col === 'autoRen') return d.autoRen ? '1' : '0';
		if (col === 'locked') return d.locked ? '1' : '0';
		return '';
	};
	return domains.slice().sort((a, b) => {
		const va = getVal(a, sortColumn);
		const vb = getVal(b, sortColumn);
		if (va === vb) return 0;
		const cmp = va < vb ? -1 : 1;
		return sortDirection === 'asc' ? cmp : -cmp;
	});
}

function toggleSort(col) {
	if (sortColumn === col) {
		sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
	} else {
		sortColumn = col;
		sortDirection = 'asc';
	}
	renderDomainTable();
}

function renderDomainTable() {
	const search = (document.getElementById("domainSearch")?.value || "").toLowerCase();
	const filter = document.getElementById("domainFilter")?.value || "all";
	const tbody = document.getElementById("domainTableBody");
	tbody.innerHTML = "";
	let count = 0;
	const sorted = sortDomains(allDomains);
	sorted.forEach(d => {
		const domainName = d.domain || "";
		const status = d.status || "";
		const days = getDaysUntilExpiry(d.expiresAt || d.expires);
		if (search && !domainName.toLowerCase().includes(search)) return;
		if (filter === "active" && status !== "ACTIVE") return;
		if (filter === "expiring30" && (days === null || days > 30)) return;
		if (filter === "expiring7" && (days === null || days > 7)) return;
		if (filter === "expired" && (days === null || days >= 0)) return;
		const tr = document.createElement("tr");
		tr.className = "godaddy-domain-row";
		tr.onclick = (e) => selectDomain(domainName, e);
		const expClass = getExpirationClass(d.expiresAt || d.expires);
		tr.innerHTML = "<td>" + escapeHtml(domainName) + "</td><td>" + escapeHtml(status) + "</td><td class='" + expClass + "'>" + formatDate(d.expiresAt || d.expires) + "</td><td>" + (d.autoRen ? "✓" : "—") + "</td><td>" + (d.locked ? "🔒" : "—") + "</td>";
		tbody.appendChild(tr);
		count++;
	});
	// Update sort indicators
["domain","status","expires","autoRen","locked"].forEach(col => {
	const el = document.getElementById("sort-" + col);
	if (el) el.textContent = (sortColumn === col ? (sortDirection === "asc" ? " \u2191" : " \u2193") : "");
});
const countEl = document.getElementById("domainCount");
	if (countEl) countEl.textContent = count + " of " + allDomains.length;
}

function showDomainList() {
	document.getElementById("detailPanel").style.display = "none";
	document.getElementById("domainPanel").style.display = "block";
	document.querySelectorAll(".godaddy-domain-row").forEach(r => r.classList.remove("selected"));
}

async function selectDomain(domain, e) {
	selectedDomain = domain;
	document.querySelectorAll(".godaddy-domain-row").forEach(r => r.classList.remove("selected"));
	if (e && e.currentTarget) e.currentTarget.classList.add("selected");
	document.getElementById("domainPanel").style.display = "none";
	document.getElementById("detailPanel").style.display = "block";
	document.getElementById("detailTitle").textContent = domain;
	await loadDnsRecords(domain);
	await loadNameServers(domain);
}async function loadDnsRecords(domain) {
	const tbody = document.getElementById("dnsTableBody");
	tbody.innerHTML = "<tr><td colspan='5'>Loading\u2026</td></tr>";
	try {
		const records = await apiCall("/list-dns-records", { domain });
		tbody.innerHTML = "";
		if (!records || records.length === 0) { tbody.innerHTML = "<tr><td colspan='5'>No DNS records found.</td></tr>"; return; }
		records.forEach(r => {
			const tr = document.createElement("tr");
			tr.innerHTML = "<td>" + escapeHtml(r.type) + "</td><td>" + escapeHtml(r.name) + "</td><td>" + escapeHtml(r.data) + "</td><td>" + r.ttl + "</td><td><div class='godaddy-dns-actions'><button onclick=\"editDns('" + escapeHtml(r.type) + "','" + escapeHtml(r.name) + "','" + escapeHtml(r.data) + "'," + r.ttl + ")\">Edit</button><button class='danger' onclick=\"deleteDns('" + escapeHtml(r.type) + "','" + escapeHtml(r.name) + "')\">Delete</button></div></td>";
			tbody.appendChild(tr);
		});
	} catch (e) { tbody.innerHTML = "<tr><td colspan='5' style='color:var(--buffaly-page-danger);'>" + escapeHtml(e.message) + "</td></tr>"; }
}

function editDns(type, name, data, ttl) {
	dnsEditMode = true;
	editingDnsRecord = { type, name };
	document.getElementById("dnsModalTitle").textContent = "Edit DNS Record";
	document.getElementById("dnsTypeSelect").value = type;
	document.getElementById("dnsNameInput").value = name;
	document.getElementById("dnsDataInput").value = data;
	document.getElementById("dnsTtlInput").value = ttl;
	document.getElementById("dnsModal").style.display = "flex";
}

async function deleteDns(type, name) {
	if (!confirm("Delete " + type + " record '" + name + "' from " + selectedDomain + "?")) return;
	try { await apiCall("/delete-dns-record", { domain: selectedDomain, type, name, confirm: true }); await loadDnsRecords(selectedDomain); }
	catch (e) { showError(e.message); }
}

async function loadNameServers(domain) {
	const list = document.getElementById("nsList");
	list.innerHTML = "<li>Loading\u2026</li>";
	try {
		const ns = await apiCall("/list-name-servers", { domain });
		list.innerHTML = "";
		if (!ns || ns.length === 0) { list.innerHTML = "<li>No name servers configured.</li>"; return; }
		ns.forEach(n => { const li = document.createElement("li"); li.textContent = n; list.appendChild(li); });
	} catch (e) { list.innerHTML = "<li style='color:var(--buffaly-page-danger);'>" + escapeHtml(e.message) + "</li>"; }
}

async function checkTransferStatus() {
	if (!selectedDomain) return;
	const el = document.getElementById("transferStatus");
	el.innerHTML = "Checking\u2026";
	try {
		const result = await apiCall("/check-transfer-status", { domain: selectedDomain });
		el.innerHTML = "<p>Status: <strong>" + escapeHtml(result.status || "Unknown") + "</strong></p>" +
			(result.transferId ? "<p>Transfer ID: " + escapeHtml(result.transferId) + "</p>" : "") +
			(result.createdAt ? "<p>Created: " + formatDate(result.createdAt) + "</p>" : "") +
			(result.updatedAt ? "<p>Updated: " + formatDate(result.updatedAt) + "</p>" : "") +
			(result.message ? "<p>" + escapeHtml(result.message) + "</p>" : "");
	} catch (e) { el.innerHTML = "<p style='color:var(--buffaly-page-danger);'>" + escapeHtml(e.message) + "</p>"; }
}

document.getElementById("settingsBtn").onclick = () => { document.getElementById("settingsModal").style.display = "flex"; };
document.getElementById("settingsCancelBtn").onclick = () => { document.getElementById("settingsModal").style.display = "none"; };
document.getElementById("settingsSaveBtn").onclick = async () => {
	const token = document.getElementById("tokenInput").value.trim();
	const shopperId = document.getElementById("shopperIdInput").value.trim();
	const customerId = document.getElementById("customerIdInput").value.trim();
	if (!token) { alert("Personal Access Token is required."); return; }
	try {
		await apiCall("/save-token", { token, shopperId: shopperId || null, customerId: customerId || null });
		document.getElementById("settingsModal").style.display = "none";
		await loadDomains();
	} catch (e) { showError(e.message); }
};

document.getElementById("refreshBtn").onclick = () => loadDomains();
document.getElementById("transferInBtn").onclick = () => {
	document.getElementById("transferDomainInput").value = "";
	document.getElementById("transferAuthCodeInput").value = "";
	document.getElementById("transferPeriodInput").value = "1";
	document.getElementById("transferAgreedByInput").value = "";
	document.getElementById("transferAgreeCheckbox").checked = false;
	transferAgreementKeys = [];
	const section = document.getElementById("transferAgreementsSection");
	if (section) section.innerHTML = "<p style='font-size:0.82rem;color:var(--buffaly-page-muted);'>Click \"Fetch Agreements\" to load the legal agreements required by GoDaddy for this transfer.</p><button id='fetchAgreementsBtn' class='buffaly-button secondary' style='margin-top:6px;'>Fetch Agreements</button>";
	document.getElementById("fetchAgreementsBtn").onclick = async () => {
		const domain = document.getElementById("transferDomainInput").value.trim();
		if (!domain) { alert("Enter a domain first."); return; }
		const sec = document.getElementById("transferAgreementsSection");
		sec.innerHTML = "<p style='font-size:0.82rem;color:var(--buffaly-page-muted);'>Loading agreements...</p>";
		try {
			const agreements = await apiCall("/get-transfer-agreements", { domain });
			transferAgreementKeys = [];
			let html = "<div style='max-height:200px;overflow-y:auto;border:1px solid var(--buffaly-page-line);border-radius:8px;padding:10px;margin-bottom:10px;'>";
			if (Array.isArray(agreements)) {
				agreements.forEach(a => {
					transferAgreementKeys.push(a.agreementKey || a.key || "");
					html += "<div style='margin-bottom:12px;'><strong>" + escapeHtml(a.title || a.agreementKey || "Agreement") + "</strong><pre style='font-size:0.78rem;white-space:pre-wrap;margin:4px 0;'>" + escapeHtml(a.excerpt || a.text || a.body || "") + "</pre></div>";
				});
			} else {
				html += "<pre style='font-size:0.78rem;white-space:pre-wrap;'>" + escapeHtml(JSON.stringify(agreements, null, 2)) + "</pre>";
			}
			html += "</div>";
			sec.innerHTML = html;
		} catch (e) { sec.innerHTML = "<p style='color:var(--buffaly-page-danger);'>" + escapeHtml(e.message) + "</p>"; }
	};
	document.getElementById("transferModal").style.display = "flex";
};
document.getElementById("backToDomainsBtn").onclick = () => showDomainList();

document.addEventListener("DOMContentLoaded", () => {
	const searchEl = document.getElementById("domainSearch");
	const filterEl = document.getElementById("domainFilter");
	if (searchEl) searchEl.addEventListener("input", renderDomainTable);
	if (filterEl) filterEl.addEventListener("change", renderDomainTable);
});

document.getElementById("addDnsBtn").onclick = () => {
	dnsEditMode = false; editingDnsRecord = null;
	document.getElementById("dnsModalTitle").textContent = "Add DNS Record";
	document.getElementById("dnsTypeSelect").value = "A";
	document.getElementById("dnsNameInput").value = "";
	document.getElementById("dnsDataInput").value = "";
	document.getElementById("dnsTtlInput").value = "3600";
	document.getElementById("dnsModal").style.display = "flex";
};
document.getElementById("dnsCancelBtn").onclick = () => { document.getElementById("dnsModal").style.display = "none"; };
document.getElementById("dnsSaveBtn").onclick = async () => {
	const type = document.getElementById("dnsTypeSelect").value;
	const name = document.getElementById("dnsNameInput").value.trim();
	const data = document.getElementById("dnsDataInput").value.trim();
	const ttl = parseInt(document.getElementById("dnsTtlInput").value) || 3600;
	if (!name || !data) { alert("Name and Data are required."); return; }
	try {
		if (dnsEditMode) { await apiCall("/set-dns-record", { domain: selectedDomain, type, name, data, ttl, confirm: true }); }
		else { await apiCall("/add-dns-record", { domain: selectedDomain, type, name, data, ttl, confirm: true }); }
		document.getElementById("dnsModal").style.display = "none";
		await loadDnsRecords(selectedDomain);
	} catch (e) { showError(e.message); }
};

document.getElementById("editNsBtn").onclick = async () => {
	try { const ns = await apiCall("/list-name-servers", { domain: selectedDomain }); document.getElementById("nsTextarea").value = (ns || []).join("\n"); } catch { }
	document.getElementById("nsModal").style.display = "flex";
};
document.getElementById("nsCancelBtn").onclick = () => { document.getElementById("nsModal").style.display = "none"; };
document.getElementById("nsSaveBtn").onclick = async () => {
	const text = document.getElementById("nsTextarea").value.trim();
	const nameServers = text.split("\n").map(s => s.trim()).filter(s => s);
	if (nameServers.length === 0) { alert("At least one name server is required."); return; }
	if (!confirm("Replace all name servers for " + selectedDomain + "?")) return;
	try { await apiCall("/set-name-servers", { domain: selectedDomain, nameServers, confirm: true }); document.getElementById("nsModal").style.display = "none"; await loadNameServers(selectedDomain); }
	catch (e) { showError(e.message); }
};

let transferAgreementKeys = [];

document.getElementById("fetchAgreementsBtn").onclick = async () => {
	const domain = document.getElementById("transferDomainInput").value.trim();
	if (!domain) { alert("Enter a domain first."); return; }
	const section = document.getElementById("transferAgreementsSection");
	section.innerHTML = "<p style='font-size:0.82rem;color:var(--buffaly-page-muted);'>Loading agreements...</p>";
	try {
		const agreements = await apiCall("/get-transfer-agreements", { domain });
		transferAgreementKeys = [];
		let html = "<div style='max-height:200px;overflow-y:auto;border:1px solid var(--buffaly-page-line);border-radius:8px;padding:10px;margin-bottom:10px;'>";
		if (Array.isArray(agreements)) {
			agreements.forEach(a => {
				transferAgreementKeys.push(a.agreementKey || a.key || "");
				html += "<div style='margin-bottom:12px;'><strong>" + escapeHtml(a.title || a.agreementKey || "Agreement") + "</strong><pre style='font-size:0.78rem;white-space:pre-wrap;margin:4px 0;'>" + escapeHtml(a.excerpt || a.text || a.body || "") + "</pre></div>";
			});
		} else {
			html += "<pre style='font-size:0.78rem;white-space:pre-wrap;'>" + escapeHtml(JSON.stringify(agreements, null, 2)) + "</pre>";
		}
		html += "</div>";
		section.innerHTML = html;
	} catch (e) { section.innerHTML = "<p style='color:var(--buffaly-page-danger);'>" + escapeHtml(e.message) + "</p>"; }
};

document.getElementById("initiateTransferBtn").onclick = () => {
	document.getElementById("transferDomainInput").value = selectedDomain || "";
	transferAgreementKeys = [];
	document.getElementById("transferAgreedByInput").value = "";
	document.getElementById("transferAgreeCheckbox").checked = false;
	document.getElementById("transferAuthCodeInput").value = "";
	document.getElementById("transferPeriodInput").value = "1";
	document.getElementById("transferModal").style.display = "flex";
};
document.getElementById("transferCancelBtn").onclick = () => { document.getElementById("transferModal").style.display = "none"; };
document.getElementById("transferSaveBtn").onclick = async () => {
	const domain = document.getElementById("transferDomainInput").value.trim();
	const authCode = document.getElementById("transferAuthCodeInput").value.trim();
	const period = parseInt(document.getElementById("transferPeriodInput").value) || 1;
	if (!domain || !authCode) { alert("Domain and Auth Code are required."); return; }
	if (transferAgreementKeys.length === 0) { alert("You must fetch and review the legal agreements first."); return; }
	const agreedBy = document.getElementById("transferAgreedByInput").value.trim();
	if (!agreedBy) { alert("Your name is required for the consent record."); return; }
	if (!document.getElementById("transferAgreeCheckbox").checked) { alert("You must check the agreement box to proceed."); return; }
	if (!confirm("Initiate transfer for " + domain + "? This is a high-risk operation.")) return;
	try {
		const now = new Date().toISOString();
		const result = await apiCall("/initiate-transfer", { domain, authCode, agreedAt: now, agreedBy: agreedBy, agreementKeys: transferAgreementKeys, period, confirm: true });
		document.getElementById("transferModal").style.display = "none";
		document.getElementById("transferStatus").innerHTML = "<p>Transfer initiated. Status: <strong>" + escapeHtml(result.status || "Pending") + "</strong></p>";
	} catch (e) { showError(e.message); }
};
document.getElementById("checkTransferBtn").onclick = () => checkTransferStatus();

loadDomains();