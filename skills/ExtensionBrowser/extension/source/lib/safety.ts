// ─── URL Safety Validation ───

const BLOCKED_PROTOCOLS = [
  'chrome://',
  'chrome-extension://',
  'chrome-devtools://',
  'devtools://',
  'edge://',
  'about:',
];

const ALLOWED_FILE_PROTOCOL = false; // set true to allow file://

export function isUrlBlocked(url: string): boolean {
  if (!url) return true;
  const lower = url.toLowerCase();
  for (const proto of BLOCKED_PROTOCOLS) {
    if (lower.startsWith(proto)) return true;
  }
  if (lower.startsWith('file://') && !ALLOWED_FILE_PROTOCOL) return true;
  return false;
}

export function validateUrl(url: string): { ok: boolean; error?: string } {
  if (!url) return { ok: false, error: 'URL is required' };
  if (isUrlBlocked(url)) {
    return { ok: false, error: `Blocked protocol URL: ${url}` };
  }
  try {
    new URL(url);
    return { ok: true };
  } catch {
    return { ok: false, error: `Invalid URL: ${url}` };
  }
}

// ─── Payment Form Detection ───

// Payment-related keywords that indicate a form field may be for credit card / payment input.
// We check for these as substrings in the selector so we catch both exact (name="cc-number")
// and substring (name*="cc") attribute selectors, as well as autocomplete attributes.
const PAYMENT_KEYWORDS = [
  'cc-number',
  'cc-csc',
  'cc-exp',
  'card-number',
  'cardnumber',
  'cardnumber',
  'cvv',
  'cvc',
  'expiry',
  'exp_date',
  'expdate',
  'credit-card',
  'creditcard',
];

export function looksLikePaymentForm(selector: string): boolean {
  const lower = selector.toLowerCase();
  return PAYMENT_KEYWORDS.some((kw) => lower.includes(kw));
}

// ─── Password Field Redaction ───

export function redactPasswordFields(text: string): string {
  return text.replace(/input\[type=['"]?password['"]?\][^\]]*/gi, '[REDACTED]');
}

export function isPasswordField(selector: string): boolean {
  return /type=['"]?password['"]?/i.test(selector) || /input\[type=password\]/i.test(selector);
}
