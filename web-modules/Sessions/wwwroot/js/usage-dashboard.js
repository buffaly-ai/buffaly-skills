(function () {
	"use strict";

	var state = {
		Range: "day",
		Provider: "",
		ModelName: "",
		Transport: "",
		SessionID: ""
	};

	var palette = ["#0f766e", "#2563eb", "#9333ea", "#c2410c", "#475569", "#be123c", "#15803d"];

	function initialize() {
		ensureChartLegendStyles();
		document.querySelectorAll("[data-range]").forEach(function (button) {
			button.addEventListener("click", function () {
				state.Range = button.getAttribute("data-range");
				document.querySelectorAll("[data-range]").forEach(function (rangeButton) {
					rangeButton.classList.toggle("active", rangeButton === button);
				});
				loadDashboard();
			});
		});

		document.querySelectorAll("[data-filter]").forEach(function (select) {
			select.addEventListener("change", function () {
				var field = select.getAttribute("data-filter");
				state[field] = select.value;
				loadDashboard();
			});
		});

		loadDashboard();
	}

	async function loadDashboard() {
		setLoading(true);
		try {
			var response = await fetch(buildUrl(), { headers: { "Accept": "application/json" } });
			var payload = await response.json();
			if (!response.ok) {
				renderWarning(payload.Error || "Usage dashboard query failed.");
				return;
			}
			renderDashboard(payload);
		}
		catch (err) {
			Page.HandleUnexpectedError(err);
			renderWarning("Usage dashboard query failed.");
		}
		finally {
			setLoading(false);
		}
	}

	function buildUrl() {
		var params = new URLSearchParams();
		params.set("range", state.Range);
		params.set("provider", state.Provider);
		params.set("modelName", state.ModelName);
		params.set("transport", state.Transport);
		params.set("sessionId", state.SessionID);
		return "/api/sessions/usage-dashboard/query?" + params.toString();
	}

	function renderDashboard(response) {
		renderWarning(response.Warnings && response.Warnings.length > 0 ? response.Warnings.join(" ") : "");
		renderFilters(response.Filters);
		renderSummary(response.Summary);
		renderChart(response.TimeBuckets);
		renderLimit(response.LatestProviderLimit);
		renderProviderRows(response.ProviderModelRows);
		renderSessionRows(response.SessionRows);
		renderDetailRows(response.DetailRows);
	}

	function renderFilters(filters) {
		populateSelect("usage-provider", filters.Providers || [], state.Provider, "All providers", function (value) { return value; });
		populateSelect("usage-model", filters.Models || [], state.ModelName, "All models", function (value) { return value; });
		populateSelect("usage-transport", filters.Transports || [], state.Transport, "All transports", function (value) { return value; });
		populateSelect("usage-session", filters.Sessions || [], state.SessionID, "All sessions", function (row) { return row.SessionName || row.SessionKey; }, function (row) { return String(row.SessionID); });
	}

	function populateSelect(id, rows, selectedValue, emptyText, getText, getValue) {
		var select = document.getElementById(id);
		if (!select) {
			return;
		}
		var valueGetter = getValue || function (value) { return value; };
		select.innerHTML = "";
		select.appendChild(createOption("", emptyText, selectedValue === ""));
		rows.forEach(function (row) {
			var value = valueGetter(row);
			select.appendChild(createOption(value, getText(row), String(selectedValue) === String(value)));
		});
		if (![...select.options].some(function (option) { return option.selected; })) {
			select.value = "";
		}
	}

	function createOption(value, text, selected) {
		var option = document.createElement("option");
		option.value = value;
		option.textContent = text;
		option.selected = selected;
		return option;
	}

	function renderSummary(summary) {
		var cards = [
			["Total tokens", summary.TotalTokens],
			["Input tokens", summary.InputTokens],
			["Output tokens", summary.OutputTokens],
			["Cached tokens", summary.CachedTokens],
			["Reasoning tokens", summary.ReasoningTokens],
			["Requests", summary.Requests],
			["Avg tokens / request", summary.AverageTokensPerRequest]
		];
		var container = document.querySelector("[data-summary-cards]");
		container.innerHTML = cards.map(function (card) {
			return "<div class=\"col-md-6 col-xl-3\"><div class=\"usage-card\"><div class=\"usage-label\">" + escapeHtml(card[0]) + "</div><div class=\"usage-value\">" + formatNumber(card[1]) + "</div></div></div>";
		}).join("");
	}

	function renderChart(rows) {
		var container = document.querySelector("[data-time-chart]");
		var legend = getChartLegend(container);
		if (!rows || rows.length === 0) {
			container.innerHTML = "<div class=\"usage-empty\">No usage rows for this filter.</div>";
			if (legend) {
				legend.innerHTML = "";
			}
			return;
		}

		var providers = [...new Set(rows.map(function (row) { return row.Provider || "(unknown)"; }))];
		var buckets = {};
		rows.forEach(function (row) {
			var key = row.BucketStartUtc;
			if (!buckets[key]) {
				buckets[key] = {};
			}
			buckets[key][row.Provider || "(unknown)"] = row.TotalTokens;
		});
		var maxBucketTotal = Math.max.apply(null, Object.keys(buckets).map(function (bucket) {
			return providers.reduce(function (total, provider) { return total + (buckets[bucket][provider] || 0); }, 0);
		}));

		container.innerHTML = Object.keys(buckets).map(function (bucket) {
			var bucketTotal = providers.reduce(function (total, provider) { return total + (buckets[bucket][provider] || 0); }, 0);
			var stackHeight = maxBucketTotal <= 0 ? 0 : Math.max(3, Math.round(bucketTotal / maxBucketTotal * 160));
			var segments = providers.map(function (provider, index) {
				var value = buckets[bucket][provider] || 0;
				if (value <= 0) {
					return "";
				}
				var height = Math.max(2, Math.round(value / bucketTotal * stackHeight));
				return "<div class=\"usage-chart-segment\" title=\"" + escapeHtml(provider + ": " + formatNumber(value)) + "\" style=\"height:" + height + "px;background:" + palette[index % palette.length] + ";\"></div>";
			}).join("");
			return "<div class=\"usage-chart-column\"><div class=\"usage-chart-stack\">" + segments + "</div><div class=\"usage-chart-label\">" + escapeHtml(formatBucket(bucket)) + "</div></div>";
		}).join("");
		if (legend) {
			legend.innerHTML = providers.map(function (provider, index) {
				return "<span class=\"usage-chart-legend-item\"><span class=\"usage-chart-legend-swatch\" style=\"background:" + palette[index % palette.length] + ";\"></span>" + escapeHtml(provider) + "</span>";
			}).join("");
		}
	}

	function getChartLegend(container) {
		var legend = document.querySelector("[data-chart-legend]");
		if (legend || !container || !container.parentElement) {
			return legend;
		}
		legend = document.createElement("div");
		legend.className = "usage-chart-legend";
		legend.setAttribute("data-chart-legend", "");
		container.parentElement.insertBefore(legend, container.nextSibling);
		return legend;
	}

	function ensureChartLegendStyles() {
		if (document.getElementById("usage-chart-legend-style")) {
			return;
		}
		var style = document.createElement("style");
		style.id = "usage-chart-legend-style";
		style.textContent = ".usage-chart-legend{display:flex;flex-wrap:wrap;gap:.5rem 1rem;margin-top:.75rem}.usage-chart-legend-item{align-items:center;color:#475569;display:inline-flex;font-size:.84rem;gap:.4rem;white-space:nowrap}.usage-chart-legend-swatch{border-radius:999px;display:inline-block;height:.7rem;width:.7rem}";
		document.head.appendChild(style);
	}

	function renderLimit(limit) {
		var panel = document.querySelector("[data-limit-panel]");
		var content = document.querySelector("[data-limit-content]");
		if (!limit) {
			panel.style.display = "none";
			content.innerHTML = "";
			return;
		}
		panel.style.display = "";
		content.innerHTML = [
			["Summary", limit.Summary || "Captured usage-limit snapshot"],
			["Scope", limit.Scope || "(unknown)"],
			["Remaining", limit.Remaining == null ? "not exposed" : formatNumber(limit.Remaining) + "%"],
			["Used", limit.Used == null ? "not exposed" : formatNumber(limit.Used) + "%"],
			["Reset", limit.ResetAtUtc ? formatDate(limit.ResetAtUtc) : "not exposed"],
			["Plan", limit.PlanType || "not exposed"],
			["Credits", limit.CreditBalance == null ? "not exposed" : formatNumber(limit.CreditBalance)],
			["Source", limit.Source || "not exposed"]
		].map(function (item) {
			return "<div class=\"usage-card\"><div class=\"usage-label\">" + escapeHtml(item[0]) + "</div><div class=\"fw-bold mt-2\">" + escapeHtml(item[1]) + "</div></div>";
		}).join("");
	}

	function renderProviderRows(rows) {
		var body = document.querySelector("[data-provider-rows]");
		if (!rows || rows.length === 0) {
			body.innerHTML = emptyRow(7);
			return;
		}
		body.innerHTML = rows.map(function (row) {
			return "<tr><td>" + escapeHtml(row.Provider || "(unknown)") + "</td><td>" + escapeHtml(row.ModelName || "(unknown)") + "</td><td>" + escapeHtml(row.Transport || "(unknown)") + "</td><td class=\"text-end\">" + formatNumber(row.Requests) + "</td><td class=\"text-end fw-bold\">" + formatNumber(row.TotalTokens) + "</td><td class=\"text-end\">" + formatDimension(row.CachedTokens, row.DimensionAvailability.CachedTokensAvailable) + "</td><td class=\"text-end\">" + formatDimension(row.ReasoningTokens, row.DimensionAvailability.ReasoningTokensAvailable) + "</td></tr>";
		}).join("");
	}

	function renderSessionRows(rows) {
		var body = document.querySelector("[data-session-rows]");
		if (!rows || rows.length === 0) {
			body.innerHTML = emptyRow(4);
			return;
		}
		body.innerHTML = rows.map(function (row) {
			return "<tr><td><div class=\"fw-semibold\">" + escapeHtml(row.SessionName || row.SessionKey) + "</div><div class=\"text-muted small\">" + escapeHtml(row.SessionKey) + "</div></td><td>" + escapeHtml(row.Provider || "(unknown)") + "</td><td class=\"text-end\">" + formatNumber(row.Requests) + "</td><td class=\"text-end fw-bold\">" + formatNumber(row.TotalTokens) + "</td></tr>";
		}).join("");
	}

	function renderDetailRows(rows) {
		var body = document.querySelector("[data-detail-rows]");
		if (!rows || rows.length === 0) {
			body.innerHTML = emptyRow(10);
			return;
		}
		body.innerHTML = rows.map(function (row) {
			return "<tr><td>" + escapeHtml(formatDate(row.DateCreatedUtc)) + "</td><td>" + escapeHtml(row.SessionName || row.SessionKey) + "</td><td>" + escapeHtml(row.Provider || "(unknown)") + "</td><td>" + escapeHtml(row.ModelName || "(unknown)") + "</td><td>" + escapeHtml(row.Transport || "(unknown)") + "</td><td class=\"text-end\">" + formatNumber(row.InputTokens) + "</td><td class=\"text-end\">" + formatNumber(row.OutputTokens) + "</td><td class=\"text-end\">" + formatDimension(row.CachedTokens, row.DimensionAvailability.CachedTokensAvailable) + "</td><td class=\"text-end\">" + formatDimension(row.ReasoningTokens, row.DimensionAvailability.ReasoningTokensAvailable) + "</td><td class=\"text-end fw-bold\">" + formatNumber(row.TotalTokens) + "</td></tr>";
		}).join("");
	}

	function emptyRow(colspan) {
		return "<tr><td colspan=\"" + colspan + "\" class=\"usage-empty\">No usage rows for this filter.</td></tr>";
	}

	function formatDimension(value, available) {
		return available ? formatNumber(value) : "not exposed";
	}

	function formatNumber(value) {
		if (value == null) {
			return "0";
		}
		return Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
	}

	function formatDate(value) {
		return new Date(value).toLocaleString();
	}

	function formatBucket(value) {
		var date = new Date(value);
		return state.Range === "hour" || state.Range === "day"
			? date.toLocaleTimeString(undefined, { hour: "numeric" })
			: date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
	}

	function renderWarning(message) {
		var warning = document.querySelector("[data-usage-warning]");
		warning.style.display = message ? "block" : "none";
		warning.textContent = message || "";
	}

	function setLoading(isLoading) {
		var loading = document.querySelector("[data-loading-state]");
		if (loading) {
			loading.textContent = isLoading ? "Loading..." : "";
		}
	}

	function escapeHtml(value) {
		return String(value == null ? "" : value)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", initialize);
	}
	else {
		initialize();
	}
})();
