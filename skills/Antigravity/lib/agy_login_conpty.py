import argparse, json, os, re, time, threading, queue
from winpty import PtyProcess

def clean(s):
    s = re.sub(r"\x1b\[[0-9;?]*[A-Za-z]", "", s or "")
    s = re.sub(r"\x1b\][^\x07]*\x07", "", s)
    s = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", s)
    return s

def extract_urls(text):
    urls=[]
    for m in re.findall(r"https://accounts\.google\.com/o/oauth2/auth\?[^\s\x07\"'<>|]+", text or ""):
        m=m.rstrip(").,]}>'\"\x07")
        if m not in urls: urls.append(m)
    return urls

def best_url(urls):
    return sorted(urls, key=len, reverse=True)[0] if urls else ""

def write_status(path, obj):
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(obj, f, ensure_ascii=False, indent=2)
    os.replace(tmp, path)

def read_code(args):
    code = (args.auth_code or "").strip()
    if code:
        return code
    if args.code_file and os.path.isfile(args.code_file):
        try:
            return open(args.code_file, encoding="utf-8").read().strip()
        except Exception:
            return ""
    return ""

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--exe", required=True)
    ap.add_argument("--timeout", type=int, default=600)
    ap.add_argument("--auth-code", default="")
    ap.add_argument("--code-file", default=r"C:\Users\Administrator\AppData\Local\Temp\agy_auth_code.txt")
    ap.add_argument("--status-file", default=r"C:\Users\Administrator\AppData\Local\Temp\agy_login_status.json")
    ap.add_argument("--url-file", default=r"C:\Users\Administrator\AppData\Local\Temp\agy_oauth_url.txt")
    ap.add_argument("--live-file", default=r"C:\Users\Administrator\AppData\Local\Temp\agy_login_live2.txt")
    args=ap.parse_args()

    for p in [args.status_file, args.url_file, args.live_file]:
        os.makedirs(os.path.dirname(p), exist_ok=True)
    # clear stale code so we don't paste old codes into a new PKCE session
    # (caller writes fresh code after URL is ready)
    open(args.live_file, "w", encoding="utf-8").write("boot\n")

    def log(msg):
        with open(args.live_file, "a", encoding="utf-8", errors="replace") as f:
            f.write(msg + "\n"); f.flush()

    proc = PtyProcess.spawn([args.exe], dimensions=(40, 140), cwd=os.path.expanduser("~"))
    q = queue.Queue()
    stop = threading.Event()

    def reader():
        while not stop.is_set() and proc.isalive():
            try:
                chunk = proc.read(4096)
            except Exception as e:
                q.put(("err", str(e))); time.sleep(0.1); continue
            if chunk:
                if isinstance(chunk, bytes):
                    chunk = chunk.decode("utf-8", "replace")
                q.put(("data", chunk))
            else:
                time.sleep(0.05)

    threading.Thread(target=reader, daemon=True).start()

    buf=""; urls=[]; code_sent=False; start=time.time()
    status={"ok":True,"phase":"started","oauthUrl":"","authenticated":False,"codeSent":False,"alive":True}
    write_status(args.status_file, status)
    log("spawned")

    def pump(seconds=0.5):
        nonlocal buf, urls
        end=time.time()+seconds
        while time.time()<end:
            try:
                kind, payload = q.get(timeout=0.1)
            except queue.Empty:
                continue
            if kind=="data":
                buf += payload
                for u in extract_urls(payload):
                    if u not in urls:
                        urls.append(u); log("URL "+u)
                c=clean(payload)
                if c.strip():
                    log("CHUNK "+c.replace("\n"," | ")[:500])
            else:
                log("ERR "+payload)

    # menu
    while time.time()-start < min(25,args.timeout) and proc.isalive():
        pump(0.4)
        c=clean(buf)
        if "Select login method" in c or "Google OAuth" in c:
            status["phase"]="menu"; write_status(args.status_file,status); log("MENU"); break

    if proc.isalive():
        proc.write("\r"); log("SENT_ENTER")
        status["phase"]="selected_google_oauth"; write_status(args.status_file,status)
        while time.time()-start < min(60,args.timeout) and proc.isalive():
            pump(0.4)
            url=best_url(urls)
            if url:
                status["oauthUrl"]=url; status["phase"]="oauth_url_ready"
                with open(args.url_file,"w",encoding="utf-8") as f: f.write(url)
                write_status(args.status_file,status); log("URL_READY"); break
            if "authorization code" in clean(buf).lower():
                status["phase"]="awaiting_code"; write_status(args.status_file,status); log("AWAITING_CODE"); break

    # main wait: poll code file continuously after URL/menu stage
    deadline=start+args.timeout
    while time.time()<deadline and proc.isalive() and not status["authenticated"]:
        pump(0.5)
        c=clean(buf).lower()
        url=best_url(urls)
        if url and url != status.get("oauthUrl"):
            status["oauthUrl"]=url
            with open(args.url_file,"w",encoding="utf-8") as f: f.write(url)
        if "authorization code" in c or "paste the authorization code" in c:
            if status["phase"] not in ("code_submitted","authenticated","code_rejected"):
                status["phase"]="awaiting_code"

        # ALWAYS poll for code once we have a URL / awaiting code
        if (not code_sent) and status.get("oauthUrl"):
            code = read_code(args)
            if code:
                # focus code field: send a few enters/tabs then code
                log("SEND_CODE len="+str(len(code)))
                try:
                    proc.write("\r")
                    time.sleep(0.2)
                    proc.write(code)
                    time.sleep(0.1)
                    proc.write("\r")
                except Exception as e:
                    log("SEND_ERR "+str(e))
                code_sent=True
                status["codeSent"]=True
                status["phase"]="code_submitted"
                write_status(args.status_file,status)

        if code_sent:
            if ("invalid" in c or "expired" in c or "denied" in c) and ("code" in c or "auth" in c or "login" in c):
                status["phase"]="code_rejected"
            # success: leave not-signed-in screen
            if "not signed in" not in c and "select login method" not in c:
                if any(k in c for k in ["signed in", "workspace", "model", "agent", "/help", "ready", "conversation"]):
                    status["authenticated"]=True
                    status["phase"]="authenticated"

        status["alive"]=proc.isalive()
        status["elapsed"]=time.time()-start
        status["screenTail"]=clean(buf)[-1500:]
        write_status(args.status_file,status)
        if status["phase"] in ("authenticated","code_rejected"):
            break

    # if still not authed after code, wait a bit more for token save
    if code_sent and not status["authenticated"]:
        extra_end=time.time()+20
        while time.time()<extra_end and proc.isalive() and not status["authenticated"]:
            pump(0.5)
            c=clean(buf).lower()
            if "not signed in" not in c and "select login method" not in c:
                status["authenticated"]=True; status["phase"]="authenticated"; break
            if "invalid" in c or "expired" in c:
                status["phase"]="code_rejected"; break
            status["screenTail"]=clean(buf)[-1500:]
            status["elapsed"]=time.time()-start
            write_status(args.status_file,status)

    status["oauthUrl"]=best_url(urls) or status.get("oauthUrl","")
    status["alive"]=proc.isalive()
    status["screenTail"]=clean(buf)[-2000:]
    write_status(args.status_file,status)
    print(json.dumps(status, ensure_ascii=False))
    log("FINAL "+status["phase"])
    stop.set()
    try:
        if proc.isalive():
            if status.get("authenticated"):
                time.sleep(3)
            proc.terminate(force=True)
    except Exception:
        pass
    return 0

if __name__=="__main__":
    raise SystemExit(main())
