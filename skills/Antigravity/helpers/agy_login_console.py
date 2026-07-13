import argparse
import os
import re
import sys
import time
import threading
import queue
import webbrowser

# Always use a stable absolute path so Buffaly live-tool-input and this wrapper agree.
DEFAULT_CODE_FILE = r"C:\Users\Administrator\AppData\Local\Temp\agy_auth_code.txt"
DEFAULT_URL_FILE = r"C:\Users\Administrator\AppData\Local\Temp\agy_oauth_url.txt"
DEFAULT_STATUS_FILE = r"C:\Users\Administrator\AppData\Local\Temp\agy_login_status.txt"
DEFAULT_EXE = r"C:\Users\Administrator\AppData\Local\agy\bin\agy.exe"

def clean(s: str) -> str:
    s = re.sub(r"\x1b\[[0-9;?]*[A-Za-z]", "", s or "")
    s = re.sub(r"\x1b\][^\x07]*\x07", "", s)
    s = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", s)
    return s

def extract_urls(text: str):
    urls = []
    for m in re.findall(r"https://accounts\.google\.com/o/oauth2/auth\?[^\s\x07\"'<>|]+", text or ""):
        m = m.rstrip(").,]}>'\"\x07")
        if m not in urls:
            urls.append(m)
    return urls

def best_url(urls):
    return sorted(urls, key=len, reverse=True)[0] if urls else ""

def banner(title: str):
    line = "=" * 72
    print()
    print(line, flush=True)
    print(title, flush=True)
    print(line, flush=True)

def read_code_file(path: str) -> str:
    try:
        if path and os.path.isfile(path):
            return open(path, encoding="utf-8").read().strip()
    except Exception:
        return ""
    return ""

def write_file(path: str, content: str):
    """Write content to a file, flushing immediately. Used for inter-process
    signaling so the Buffaly action can poll for the URL and status without
    relying on stdout redirection buffering."""
    try:
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
            f.flush()
            os.fsync(f.fileno())
    except Exception as e:
        print(f"[helper] Could not write {path}: {e}", flush=True)

def make_clean_env():
    """Return a copy of os.environ with SSH-related vars removed to prevent
    agy from detecting a fake SSH session and using file-based token storage
    instead of the OS keyring."""
    env = dict(os.environ)
    for key in list(env.keys()):
        kl = key.lower()
        if kl.startswith("ssh") or kl in ("term", "tmux", "screen", "sty"):
            del env[key]
    # Set a reasonable TERM for the TUI
    env["TERM"] = "xterm-256color"
    return env

def main():
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
        sys.stderr.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

    try:
        sys.stdout.reconfigure(line_buffering=True)
    except Exception:
        pass

    ap = argparse.ArgumentParser(description="Antigravity login console wrapper")
    ap.add_argument("--exe", default=DEFAULT_EXE)
    ap.add_argument("--timeout", type=int, default=300)
    ap.add_argument("--no-browser", action="store_true")
    ap.add_argument("--code-file", default=DEFAULT_CODE_FILE)
    ap.add_argument("--url-file", default=DEFAULT_URL_FILE)
    ap.add_argument("--status-file", default=DEFAULT_STATUS_FILE)
    args = ap.parse_args()

    if not os.path.isfile(args.exe):
        print("ERROR: agy not found at: " + args.exe, flush=True)
        return 2

    try:
        from winpty import PtyProcess
    except Exception as e:
        print("ERROR: pywinpty is required for interactive agy login.", flush=True)
        print(str(e), flush=True)
        return 2

    # Clear stale files so we do not accept a previous attempt's data.
    for f in (args.code_file, args.url_file, args.status_file):
        try:
            if os.path.isfile(f):
                os.remove(f)
        except Exception:
            pass

    banner("ANTIGRAVITY LOGIN")
    print("Starting official agy interactive login...", flush=True)
    print("This wrapper extracts the Google OAuth URL, opens it,", flush=True)
    print("then feeds your authorization code back into agy.", flush=True)
    print("Code file: " + args.code_file, flush=True)
    print("URL file: " + args.url_file, flush=True)
    print(flush=True)

    # Spawn agy with a clean environment (no SSH vars, proper TERM)
    clean_env = make_clean_env()
    proc = PtyProcess.spawn([args.exe], dimensions=(40, 140), cwd=os.path.expanduser("~"), env=clean_env)
    q = queue.Queue()
    stop = threading.Event()

    def reader():
        while not stop.is_set() and proc.isalive():
            try:
                chunk = proc.read(4096)
            except Exception as e:
                q.put(("err", str(e)))
                time.sleep(0.1)
                continue
            if chunk:
                if isinstance(chunk, bytes):
                    chunk = chunk.decode("utf-8", "replace")
                q.put(("data", chunk))
            else:
                time.sleep(0.05)

    threading.Thread(target=reader, daemon=True).start()

    buf = ""
    urls = []
    start = time.time()
    code_sent = False
    authenticated = False

    def pump(seconds=0.4):
        nonlocal buf, urls
        end = time.time() + seconds
        while time.time() < end:
            try:
                kind, payload = q.get(timeout=0.1)
            except queue.Empty:
                continue
            if kind == "data":
                buf += payload
                for u in extract_urls(payload):
                    if u not in urls:
                        urls.append(u)
            else:
                print("[helper] " + payload, flush=True)

    print("Waiting for login menu...", flush=True)
    while time.time() - start < min(25, args.timeout) and proc.isalive():
        pump(0.4)
        c = clean(buf)
        if "Select login method" in c or "Google OAuth" in c:
            print("Login menu detected. Selecting Google OAuth...", flush=True)
            break
        if "signed in" in c.lower() and "not signed in" not in c.lower():
            banner("ALREADY SIGNED IN")
            print("agy appears to already be authenticated.", flush=True)
            write_file(args.status_file, "ALREADY_SIGNED_IN")
            try:
                if proc.isalive():
                    proc.terminate(force=True)
            except Exception:
                pass
            return 0

    if not proc.isalive():
        print("ERROR: agy exited before login menu.", flush=True)
        print(clean(buf)[-1500:], flush=True)
        write_file(args.status_file, "ERROR_AGY_EXITED_EARLY")
        return 1

    # Select Google OAuth (option 1) - just press Enter since it's the default
    proc.write("\r")

    print("Waiting for OAuth URL...", flush=True)
    url = ""
    while time.time() - start < min(60, args.timeout) and proc.isalive():
        pump(0.4)
        url = best_url(urls)
        if url:
            break

    if not url:
        print("ERROR: could not extract Google OAuth URL from agy.", flush=True)
        print("Last screen:", flush=True)
        print(clean(buf)[-2000:], flush=True)
        write_file(args.status_file, "ERROR_NO_URL")
        try:
            if proc.isalive():
                proc.terminate(force=True)
        except Exception:
            pass
        return 1

    # Write URL to file immediately so the Buffaly action can pick it up
    # without relying on stdout redirection buffering.
    write_file(args.url_file, url)
    write_file(args.status_file, "URL_READY")

    banner("GOOGLE OAUTH URL")
    print(url, flush=True)
    banner("NEXT STEP")
    print("1) Open the URL above (browser may open automatically)", flush=True)
    print("2) Complete Google sign-in", flush=True)
    print("3) Copy the authorization code (starts with 4/)", flush=True)
    print("4) Paste it into the Buffaly live tool input box", flush=True)
    print(flush=True)

    if not args.no_browser:
        opened = False
        try:
            opened = webbrowser.open(url, new=1)
        except Exception as e:
            print("Browser open via webbrowser failed: " + str(e), flush=True)
        if not opened:
            try:
                os.startfile(url)  # type: ignore[attr-defined]
                opened = True
            except Exception as e:
                print("Browser open via os.startfile failed: " + str(e), flush=True)
        print("Browser launch requested." if opened else "Could not auto-open browser; use the URL above.", flush=True)
        print(flush=True)

    # Wait for the "authorization code" / "paste" prompt to appear in the TUI
    # before we start waiting for the code file. This ensures the TUI is in
    # the right state to receive the code.
    print("Waiting for agy to show the authorization code input field...", flush=True)
    prompt_seen = False
    prompt_deadline = time.time() + min(30, args.timeout)
    while time.time() < prompt_deadline and proc.isalive():
        pump(0.4)
        c = clean(buf).lower()
        if "authorization code" in c or "paste the authorization" in c or "paste the code" in c:
            prompt_seen = True
            print("Authorization code input field detected in agy TUI.", flush=True)
            break

    if not prompt_seen:
        # Not fatal - the prompt might use different wording. Continue anyway.
        print("Note: did not detect explicit code-paste prompt, continuing anyway.", flush=True)
        print("Last screen tail:", flush=True)
        print(clean(buf)[-800:], flush=True)

    write_file(args.status_file, "WAITING_FOR_CODE")
    print("Waiting for authorization code file...", flush=True)
    print("Expected file: " + args.code_file, flush=True)

    code = ""
    prompt_deadline = start + args.timeout
    while time.time() < prompt_deadline and not code and proc.isalive():
        code = read_code_file(args.code_file)
        if code:
            print("(received code from helper file, len=" + str(len(code)) + ")", flush=True)
            break
        pump(0.5)
        time.sleep(0.2)

    if not code:
        print("ERROR: no authorization code received before timeout.", flush=True)
        write_file(args.status_file, "ERROR_NO_CODE_TIMEOUT")
        try:
            if proc.isalive():
                proc.terminate(force=True)
        except Exception:
            pass
        return 1

    if code.startswith("http"):
        print("That looks like a URL, not an authorization code.", flush=True)
        print("Please paste the code that starts with 4/", flush=True)
        write_file(args.status_file, "ERROR_CODE_IS_URL")
        return 1

    print("Submitting authorization code to agy...", flush=True)
    print("Code preview: " + code[:20] + "..." + code[-10:], flush=True)
    write_file(args.status_file, "SUBMITTING_CODE")
    try:
        # Do NOT send an initial \r - that would submit an empty input and
        # potentially navigate away from the code input field.
        # Send the code directly, then Enter to submit.
        proc.write(code)
        time.sleep(0.2)
        proc.write("\r")
        code_sent = True
        print("Code sent to agy TUI (code + Enter).", flush=True)
    except Exception as e:
        print("ERROR: failed to send code to agy: " + str(e), flush=True)
        write_file(args.status_file, "ERROR_SEND_FAILED")
        return 1

    # Wait for agy to process the code and show a result.
    # Check for success indicators, failure indicators, and TUI state changes.
    result_deadline = time.time() + min(90, max(30, args.timeout // 2))
    rejected = False
    last_screen = ""
    while time.time() < result_deadline and proc.isalive():
        pump(0.5)
        c = clean(buf)
        last_screen = c
        cl = c.lower()

        # Check for rejection
        if "invalid" in cl and ("code" in cl or "auth" in cl or "token" in cl):
            rejected = True
            break
        if "expired" in cl and ("code" in cl or "auth" in cl or "token" in cl):
            rejected = True
            break
        if "denied" in cl or "access denied" in cl:
            rejected = True
            break
        if "error" in cl and ("code" in cl or "auth" in cl or "oauth" in cl):
            rejected = True
            break

        # Check for success - agy leaves the login screen and enters the main TUI
        if any(k in cl for k in ["welcome to the antigravity cli", "workspace", "model", "agent", "ready", "conversation", "chat", "enter your", "type your", "slash command"]):
            # Make sure we're not still on the login screen
            if "not signed in" not in cl and "select login method" not in cl and "authorization code" not in cl:
                authenticated = True
                break

        # Also check if the TUI shows a success message
        if "signed in" in cl and "not signed in" not in cl:
            authenticated = True
            break

        # Check if agy exited (might mean it's done processing)
        if not proc.isalive():
            break

    # Give agy a moment to settle
    if authenticated:
        time.sleep(2)
        pump(1.0)

    # Log the final TUI state for debugging
    print(flush=True)
    print("--- TUI state after code submission ---", flush=True)
    final_screen = clean(buf)[-2000:]
    print(final_screen, flush=True)
    print("--- end TUI state ---", flush=True)

    try:
        if proc.isalive():
            proc.terminate(force=True)
    except Exception:
        pass
    stop.set()

    # cleanup code file
    try:
        if os.path.isfile(args.code_file):
            os.remove(args.code_file)
    except Exception:
        pass

    if rejected:
        banner("LOGIN FAILED")
        print("agy rejected the authorization code (invalid/expired/denied).", flush=True)
        print("Run login again and paste a fresh code from the matching OAuth URL.", flush=True)
        print(flush=True)
        print("Last TUI screen:", flush=True)
        print(last_screen[-1500:], flush=True)
        write_file(args.status_file, "LOGIN_FAILED_REJECTED")
        return 1

    if authenticated:
        banner("LOGIN SUBMITTED - AUTHENTICATED")
        print("agy accepted the authorization code and left the login screen.", flush=True)
        print("Next: run ToGetAntigravityAuthStatus / agy models to confirm.", flush=True)
        write_file(args.status_file, "LOGIN_AUTHENTICATED")
        return 0

    if code_sent:
        banner("LOGIN SUBMITTED - STATUS UNCLEAR")
        print("Authorization code was submitted to agy.", flush=True)
        print("Could not confirm authentication state from TUI output.", flush=True)
        print("Run ToGetAntigravityAuthStatus to check.", flush=True)
        write_file(args.status_file, "LOGIN_STATUS_UNCLEAR")
        return 0

    banner("LOGIN INCOMPLETE")
    print("Could not confirm authentication state.", flush=True)
    print(clean(buf)[-1500:], flush=True)
    write_file(args.status_file, "LOGIN_INCOMPLETE")
    return 1

if __name__ == "__main__":
    raise SystemExit(main())