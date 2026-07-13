import argparse, json, os, re, time
def clean(s):
    s=re.sub(r"\x1b\[[0-9;?]*[A-Za-z]", "", s or "")
    s=re.sub(r"\x1b\][^\x07]*\x07", "", s)
    s=re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", s)
    return s
def main():
    ap=argparse.ArgumentParser(); ap.add_argument("--exe", required=True); ap.add_argument("--timeout", type=int, default=45); args=ap.parse_args()
    try:
        from winpty import PtyProcess
    except Exception as e:
        print(json.dumps({"ok":False,"error":f"pywinpty missing: {e}"})); return 2
    if not os.path.isfile(args.exe):
        print(json.dumps({"ok":False,"error":f"agy not found: {args.exe}"})); return 2
    proc=PtyProcess.spawn([args.exe], dimensions=(40,120), cwd=os.path.expanduser("~"))
    buf=""; start=time.time(); sent=False
    while time.time()-start < args.timeout and proc.isalive():
        try: chunk=proc.read(4096)
        except Exception: time.sleep(0.05); chunk=""
        if chunk:
            if isinstance(chunk, bytes): chunk=chunk.decode("utf-8","replace")
            buf += chunk
        c=clean(buf)
        if "Select login method" in c or "not signed in" in c.lower():
            print(json.dumps({"ok":True,"status":"not_signed_in","sentLogout":False,"screenTail":c[-1500:]}))
            try: proc.terminate(force=True)
            except Exception: pass
            return 0
        if (not sent) and ("Welcome" in c or len(c)>80):
            time.sleep(0.8); proc.write("/logout\r"); sent=True; time.sleep(2)
            try:
                more=proc.read(8192)
                if isinstance(more, bytes): more=more.decode("utf-8","replace")
                buf += more or ""
            except Exception: pass
            break
        time.sleep(0.05)
    print(json.dumps({"ok":True,"status":"logout_sent" if sent else "timeout","sentLogout":sent,"screenTail":clean(buf)[-1500:]}, ensure_ascii=False))
    try:
        if proc.isalive(): proc.terminate(force=True)
    except Exception: pass
    return 0
if __name__=="__main__": raise SystemExit(main())
