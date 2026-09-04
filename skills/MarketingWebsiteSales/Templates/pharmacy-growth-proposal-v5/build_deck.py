#!/usr/bin/env python3
import argparse
import html as html_lib
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

REQUIRED = ["template-manifest.json", "index.html", "styles.css", "print.css", "slots.json", "branch-rules.json", "static-regions.json", "builder-contract.json"]

def read_json(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))

def flatten_slots(slots):
    result = {}
    for name, spec in slots.get("global", {}).items():
        result[f"global.{name}"] = spec
    for slide, entry in slots.get("slides", {}).items():
        for name, spec in entry.get("slots", {}).items():
            result[f"slides.{slide}.{name}"] = spec
    return result

def sanitize_value(value, allow_inline_html=False):
    escaped = html_lib.escape(str(value), quote=False)
    if allow_inline_html:
        for tag in ("b", "strong", "br", "em"):
            escaped = escaped.replace(f"&lt;{tag}&gt;", f"<{tag}>").replace(f"&lt;/{tag}&gt;", f"</{tag}>")
        escaped = escaped.replace("&lt;br/&gt;", "<br/>").replace("&lt;br /&gt;", "<br />")
    return escaped

def set_slot(html_text, data_slot, value, allow_inline_html=False):
    pattern = re.compile(r'(<(?P<tag>[a-zA-Z0-9]+)\b(?=[^>]*\bdata-slot="' + re.escape(data_slot) + r'")[^>]*>)(?P<body>.*?)(</(?P=tag)>)', re.S)
    def repl(m):
        return m.group(1) + sanitize_value(value, allow_inline_html) + m.group(4)
    return pattern.subn(repl, html_text)

def normalize_asset_path(value):
    raw = str(value or "").strip().replace("\\", "/")
    if not raw or raw.startswith("/") or ":" in raw or ".." in raw.split("/"):
        return None
    return raw

def set_image_slot(html_text, data_slot, asset_src):
    pattern = re.compile(r'(<img\b(?=[^>]*\bdata-slot="' + re.escape(data_slot) + r'")[^>]*\bsrc=")(?P<src>[^"]*)("[^>]*>)', re.S)
    def repl(m):
        return m.group(1) + html_lib.escape(asset_src, quote=True) + m.group(3)
    return pattern.subn(repl, html_text)

def apply_image_slot(html_text, data_slot, value, deck_fill_path, out_dir, spec, report):
    asset_path = normalize_asset_path(value)
    if not asset_path:
        report["errors"].append(f"Invalid image asset path for {data_slot}: {value}")
        return html_text, 0
    ext = Path(asset_path).suffix.lower()
    allowed = [e.lower() for e in spec.get("allowedExtensions", [".png", ".jpg", ".jpeg", ".webp"])]
    if ext not in allowed:
        report["errors"].append(f"Invalid image asset extension for {data_slot}: {asset_path}")
        return html_text, 0
    if asset_path.startswith("assets/") and not asset_path.startswith("assets/run-images/"):
        report["errors"].append(f"Image asset for {data_slot} must be a lead-specific run asset, not a packaged template asset: {asset_path}")
        return html_text, 0
    source = (deck_fill_path.parent / asset_path).resolve()
    try:
        source.relative_to(deck_fill_path.parent.resolve())
    except ValueError:
        report["errors"].append(f"Image asset for {data_slot} must stay under the run artifact folder: {asset_path}")
        return html_text, 0
    if not source.exists() or not source.is_file():
        report["errors"].append(f"Image asset file missing for {data_slot}: {asset_path}")
        return html_text, 0
    dest = out_dir / "assets" / "run-images" / source.name
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, dest)
    output_src = dest.relative_to(out_dir).as_posix()
    return set_image_slot(html_text, data_slot, output_src)

def enforce_branch_clean_html(html_text, website_branch):
    if website_branch not in ("no_functioning_site", "unconfirmed_site"):
        return html_text
    replacements = {
        "FairPath Workflow": "FairPath Support",
        "One Clear Remote-Care Workflow": "One Clear Remote-Care Path",
        "One clear remote care workflow": "One clear remote care path",
        "One workflow keeps ownership, exceptions, and billing readiness visible.": "One shared view keeps ownership, exceptions, and billing readiness visible.",
        "Use FairPath with a real first patient group. Keep going because the workflow is useful, measurable, and manageable for the team.": "Use FairPath with a real first patient group. Keep going because the path is useful, measurable, and manageable for the team.",
        "If the workflow is not ready to scale, pause with a clear record of what was tested, what worked, and what needs to change.": "If the first path is not ready to scale, pause with a clear record of what was tested, what worked, and what needs to change.",
        "Role-based launch training plus scheduled workflow sessions for the first patient wave.": "Role-based launch training plus scheduled working sessions for the first patient wave.",
        "The first step is not billing everyone. It is scoring the patient population, choosing the first manageable group, and proving the workflow over 90 days.": "The first step is not billing everyone. It is reviewing the patient population, choosing the first manageable group, and proving the path over 90 days.",
        "Reduce handoffs with one workflow for scoring, outreach, documentation, billing support, reporting, and follow-through.": "Reduce handoffs with one shared path for outreach, documentation, billing support, reporting, and follow-through.",
        "Technical crawlability": "Profile clarity",
        "Audit scores are internal planning signals from a sampled crawl on": "This public-profile view is a planning signal for",
        "They are not traffic, ranking, or performance measurements.": "It is not a traffic, ranking, or performance measurement."
    }
    for old, new in replacements.items():
        html_text = html_text.replace(old, new)
    return re.sub(r"\b[Ss]coring\b", "Reviewing", html_text)

def copy_assets(template_dir, out_dir):
    for name in ["styles.css", "print.css", "assets"]:
        src = template_dir / name
        dst = out_dir / name
        if src.is_dir():
            shutil.copytree(src, dst, dirs_exist_ok=True)
        elif src.exists():
            shutil.copy2(src, dst)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--template", required=True)
    parser.add_argument("--deck-fill", required=True)
    parser.add_argument("--branch-decision", required=True)
    parser.add_argument("--out", required=True)
    parser.add_argument("--pdf", action="store_true")
    args = parser.parse_args()
    template_dir = Path(args.template).resolve()
    out_dir = Path(args.out).resolve()
    report = {"status": "started", "template": str(template_dir), "missingFiles": [], "warnings": [], "appliedSlots": [], "errors": []}
    out_dir.mkdir(parents=True, exist_ok=True)
    missing = [f for f in REQUIRED if not (template_dir / f).exists()]
    report["missingFiles"] = missing
    if missing:
        report["status"] = "blocked"
        (out_dir / "build-report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
        print(json.dumps(report, indent=2))
        return 2
    manifest = read_json(template_dir / "template-manifest.json")
    slots = read_json(template_dir / "slots.json")
    branch_rules = read_json(template_dir / "branch-rules.json")
    deck_fill_path = Path(args.deck_fill).resolve()
    fill = read_json(deck_fill_path)
    branch = read_json(args.branch_decision)
    website_branch = branch.get("websiteBranch")
    if website_branch not in branch_rules.get("websiteBranches", {}):
        report["errors"].append(f"Invalid websiteBranch: {website_branch}")
    html_text = (template_dir / manifest.get("entryHtml", "index.html")).read_text(encoding="utf-8")
    if len(re.findall(r"<section\b", html_text, flags=re.I)) != 16:
        report["errors"].append("Template HTML must contain exactly 16 section elements")
    slot_specs = flatten_slots(slots)
    values = {}
    for k, v in fill.get("global", {}).items():
        values[f"global.{k}"] = v
    for slide, entry in fill.get("slides", {}).items():
        for k, v in entry.items():
            values[f"slides.{slide}.{k}"] = v
    for unknown in sorted(set(values) - set(slot_specs)):
        report["errors"].append(f"Unknown slot: {unknown}")
    for path, spec in slot_specs.items():
        if spec.get("required") and (path not in values or values[path] in (None, "")):
            report["errors"].append(f"Missing required slot: {path}")
    for path, value in values.items():
        if path not in slot_specs:
            continue
        max_chars = slot_specs[path].get("maxChars")
        if max_chars and len(str(value or "")) > int(max_chars):
            report["errors"].append(f"Slot too long: {path} ({len(str(value or ''))}>{max_chars})")
    if report["errors"]:
        report["status"] = "blocked"
        (out_dir / "build-report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
        print(json.dumps(report, indent=2))
        return 2
    for path, value in values.items():
        spec = slot_specs[path]
        if spec.get("type") == "image_asset":
            html_text, count = apply_image_slot(html_text, spec["dataSlot"], value, deck_fill_path, out_dir, spec, report)
        else:
            html_text, count = set_slot(html_text, spec["dataSlot"], value or "", spec.get("type") == "html_text")
        if path.startswith("global."):
            if count < 1:
                report["errors"].append(f"Expected at least one HTML data-slot for {path}/{spec['dataSlot']}, found {count}")
            else:
                report["appliedSlots"].append(path)
        elif count != 1:
            report["errors"].append(f"Expected one HTML data-slot for {path}/{spec['dataSlot']}, found {count}")
        else:
            report["appliedSlots"].append(path)
    html_text = enforce_branch_clean_html(html_text, website_branch)
    forbidden = branch_rules.get("websiteBranches", {}).get(website_branch, {}).get("forbiddenTerms", [])
    for term in forbidden:
        if term.lower() in html_text.lower():
            report["errors"].append(f"Forbidden term still appears for branch {website_branch}: {term}")
    (out_dir / "index.html").write_text(html_text, encoding="utf-8")
    copy_assets(template_dir, out_dir)
    report["html"] = str(out_dir / "index.html")
    report["slideCount"] = 16
    report["slotCount"] = len(slot_specs)
    if args.pdf:
        pdf_path = out_dir / "pharmacy-growth-proposal.pdf"
        js = f"""
const {{ chromium }} = require('playwright');
(async()=>{{
 const browser = await chromium.launch({{headless:true}});
 const page = await browser.newPage({{viewport:{{width:1280,height:720}}, deviceScaleFactor:1}});
 await page.goto('file:///{(out_dir / 'index.html').as_posix()}', {{waitUntil:'networkidle'}});
 await page.pdf({{path:'{pdf_path.as_posix()}', width:'1280px', height:'720px', printBackground:true}});
 await browser.close();
}})().catch(e=>{{console.error(e); process.exit(1);}});
"""
        (out_dir / "export_pdf.js").write_text(js, encoding="utf-8")
        try:
            subprocess.run(["node", str(out_dir / "export_pdf.js")], check=True, cwd=str(out_dir), timeout=120)
            report["pdf"] = str(pdf_path)
        except Exception as ex:
            report["warnings"].append(f"PDF export unavailable: {ex}")
    report["status"] = "blocked" if report["errors"] else "passed"
    (out_dir / "build-report.json").write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))
    return 0 if report["status"] == "passed" else 2

if __name__ == "__main__":
    sys.exit(main())

