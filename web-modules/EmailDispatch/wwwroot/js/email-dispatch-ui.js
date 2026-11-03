"use strict";
// Shared controls for all standalone task views. Transport stays in generated ObjectAsync clients.
window.EmailDispatchUi = (() => {
 const setKeyboard = enabled => document.documentElement.dataset.keyboard = String(enabled);
 setKeyboard(false);
 document.addEventListener("keydown", event => { if (!event.altKey && !event.ctrlKey && !event.metaKey) setKeyboard(true); }, true);
 document.addEventListener("pointerdown", () => setKeyboard(false), true);
 const $ = id => _$(id);
 const text = (tag, value, className = "") => { const element = document.createElement(tag); element.textContent = value ?? ""; element.className = className; return element; };
 const escape = value => { const element = text("span", value); return element.innerHTML.replaceAll('"', "&quot;"); };
 const link = (label, href, className = "") => { const element = text("a", label, className); element.href = href; return element; };
 // Row navigation extends the existing link target without stealing inner controls or text selection.
 document.addEventListener("click", event => {
  if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  const row = event.target.closest("tr[data-row-href]");
  if (!row || event.target.closest("a,button,input,select,textarea,label,[contenteditable]")) return;
  if (window.getSelection()?.toString()) return;
  location.hash = row.dataset.rowHref;
 });
 const notify = (message, kind = "Success") => { UserMessages._CurrentMessageCount = 0; UserMessages.DisplayNow(message, kind, false); };
 // A message raised while a dialog is open is shown inside that dialog: showModal() makes #status inert and the backdrop covers it.
 const hideMessage = element => { element.hidden = true; element.textContent = ""; };
 const clearNotice = () => { UserMessages._CurrentMessageCount = 0; document.querySelectorAll("#status,.ed-dialog-message").forEach(hideMessage); };
 UserMessages.OnFulfillMessage = message => { const target = document.querySelector("dialog[open] .ed-dialog-message") ?? $("status"); target.hidden = false; target.className = (target.id === "status" ? "ed-message " : "ed-message ed-dialog-message ") + message.Class; target.textContent = message.Message; };
 // Busy and failure states use the shared owners (UI-STD-01 Rule 8): ControlUtil's spinner on the command, cleared in finally,
 // and Page.HandleUnexpectedError, which shows the server's plain message (for example "The decision changed. Reload before
 // acting."). Inputs are never cleared on failure. The action receives its control so a dialog can return focus to it.
 async function run(control, action) {
  // $() returns the foundation's SafeElement Proxy. It is never === document.activeElement and never instanceof
  // HTMLButtonElement, so the focus check and the spinner check both use the real element. Before this, commands
  // passed through submit() and click() were disabled but never showed their spinner.
  const element = control?.__isSafeElement === true ? control.element : control;
  const spinner = element instanceof HTMLButtonElement;
  // Disabling the focused command drops focus to <body>, so a refused command (for example a Send the server rejects)
  // left keyboard users nowhere. Focus goes back only if it is still lost and the command is still on screen; a dialog
  // that closed on success hides its button (no client rects), so the dialog's own return to its trigger still wins.
  const focused = element != null && document.activeElement === element;
  if (spinner) ControlUtil.ToggleSpinnerOn(element); else if (element) element.disabled = true;
  try { return await action(control); }
  catch (error) { console.error("Email Dispatch operation failed", error); Page.HandleUnexpectedError(error); return undefined; }
  finally {
   if (spinner) ControlUtil.ToggleSpinnerOff(element); else if (element) element.disabled = false;
   const lost = document.activeElement === null || document.activeElement === document.body;
   if (focused && lost && element.isConnected && element.getClientRects().length > 0) element.focus();
  }
 }
 // The generated ObjectAsync wrapper sets an error handler on FooObject, while
 // its generated _invoke reads Foo's handler. Supply the already-supported
 // per-callback handler so rejected saves settle promptly without changing core
 // or hand-maintaining transport. ObjectUtil still owns Promise/error lifetime.
 function request(client, method, values) {
  const invoke = function(parameters, callback) {
   callback.onErrorReceived = invoke.onErrorReceived;
   return client[method + "Object"](parameters, callback);
  };
  return ObjectUtil.Promisify(client, invoke, [values]);
 }
 // icon is a Font Awesome 5 Free class from the UI-STD-01 Rule 3 list (for example fa-check for Confirm).
 function button(label, action, primary = false, icon = "") { const element = text("button", label, "btn " + (primary ? "btn-primary" : "btn-outline-secondary")); element.type = "button"; if (icon) { const glyph = text("i", "", "fas " + icon); glyph.setAttribute("aria-hidden", "true"); element.prepend(glyph); } element.addEventListener("click", () => run(element, action)); return element; }
 // One owner for every dialog (UI-STD-01 Rules 1 and 7). MasterPage's ModalControl needs MasterPage, jQuery and Bootstrap's
 // JavaScript, which the standalone foundation deliberately excludes, so the native <dialog> is used. showModal() makes the
 // page inert and Escape closes it; Tab is kept inside explicitly. Focus moves to the dialog's [autofocus] field, or its first
 // footer command (Cancel), and returns to the command that opened it.
 function dialog(id) {
  const element = $(id); let trigger = null;
  element.addEventListener("click", event => { if (event.target.closest("[data-dialog-close]")) element.close(); });
  element.addEventListener("close", () => { const back = trigger; trigger = null; if (back?.isConnected) back.focus(); });
  element.addEventListener("keydown", event => {
   if (event.key !== "Tab") return;
   const items = [...element.querySelectorAll("button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),a[href]")].filter(item => item.offsetParent !== null);
   if (!items.length) return;
   const first = items[0], last = items.at(-1);
   if (event.shiftKey && document.activeElement === first) { last.focus(); event.preventDefault(); }
   else if (!event.shiftKey && document.activeElement === last) { first.focus(); event.preventDefault(); }
  });
 return {
   open(from) { trigger = from ?? document.activeElement; const message = element.querySelector(".ed-dialog-message"); if (message) hideMessage(message); element.showModal(); (element.querySelector("[autofocus]") ?? element.querySelector(".ed-dialog-footer button"))?.focus(); },
   close() { if (element.open) element.close(); }
  };
 }
 const stateNames = {
  ProjectionFailed:["Email could not be read","danger"], Spam:["Spam · not dispatched","neutral"],
  NotReviewed:["Not yet reviewed","neutral"], ReviewedLocally:["Reviewed locally","neutral"], Pending:["Waiting for the dispatch agent","info"], Suggested:["Ready to send","warning"], AutomaticReady:["Processor ready to send","warning"], NeedsDestination:["Not sent — choose a destination","warning"], AgentEvaluationRequired:["Not decided yet","warning"], PreparationFailed:["Not decided yet","warning"], Prepared:["Suggestions ready","info"], NeedsReview:["Needs routing review","warning"], PreviouslyHandled:["Already handled · held","neutral"], DeliveryUnknown:["Delivery uncertain · held","danger"], Accepted:["Accepted by destination","success"], Rejected:["Rejected by destination","danger"], Unclassified:["Not decided yet","warning"], Disabled:["Not decided yet","warning"], Superseded:["Replaced by a newer decision","neutral"], NoAction:["No action needed","neutral"], Notice:["Notice only","neutral"], WakeRecorded:["Wake recorded","info"], Conflict:["Conflicting rules · held","danger"], Error:["The dispatch agent could not decide","danger"], Failed:["Review needs retry","danger"], Archived:["Archived","neutral"], Dismissed:["Dismissed locally","neutral"]
 };
  const state = (value,destination) => {
   const result=stateNames[value] ?? ["Needs inspection", "warning"];
   if(destination&&["Suggested","AutomaticReady"].includes(value)) return [result[0]+" to "+destination,result[1]];
   if(destination&&value==="Accepted") return ["Accepted by "+destination,result[1]];
   return result;
  };
  const status = (value,destination) => { const [name, kind] = state(value,destination); return text("span", name, "ed-status ed-status-" + kind); };
 // Local time with relative age (UI-STD-01 Principle 4). DateUtil owns the UTC-to-local conversion.
 function age(local) { const minutes = Math.round((Date.now() - local.getTime()) / 60000); if (minutes < 1) return "just now"; if (minutes < 60) return minutes + " min ago"; const hours = Math.round(minutes / 60); if (hours < 24) return hours + (hours === 1 ? " hour ago" : " hours ago"); const days = Math.round(hours / 24); return days + (days === 1 ? " day ago" : " days ago"); }
 const date = value => { const local = DateUtil.UTCToLocal(value); return DateUtil.ToShortDateTime(local) + " · " + age(local); };
 function facts(values) { const list = document.createElement("dl"); list.className = "ed-facts"; for (const [label,value] of values) if (value !== null && value !== undefined && value !== "") list.append(text("dt", label),text("dd", value)); return list; }
 // JsonWsGrid3 owns search/request ordering/row rendering. Its exact-total span pager is not
 // applicable to the existing HasMore DTO; this single shared adapter uses honest ranges
 // and native keyboard buttons, without fabricating counts or downloading all records.
 class PagedGrid extends JsonWsGrid3 {
  constructor(content, pager, search, load, render, empty) { super(); this.ContentControlID=content; this.PagingControlID=pager; this.SearchControlID=search; this.SkipSize=25; this.load=load; this.render=render; this.empty=empty; this.request=0; this.page={Items:[],HasMore:false}; this.OnBeforeRefresh=()=>{$(content).setAttribute("aria-busy","true");}; this.OnDataReceived=page=>{this.page=page;return page.Items.length?render(page.Items):`<div class="ed-empty">${empty}</div>`;}; this.OnComplete=()=>$(content).setAttribute("aria-busy","false"); }
  MakeDataRequest(callback) { const request=++this.request; this.m_iConcurrentCalls++; this.load({Search:this.search,SkipRows:this.skip,NumRows:this.SkipSize}).then(page=>callback(page,request)).catch(error=>{if(request!==this.request)return;this.m_iConcurrentCalls--;$(this.ContentControlID).setAttribute("aria-busy","false");$(this.ContentControlID).replaceChildren(text("p","Could not load this list.","ed-empty"),button("Try again",()=>this.Refresh(true))); notify("Could not load this list. Try again.","Error"); console.error(error);}); }
  RefreshCount() { this.BindCount(); }
  BindCount() { const pager=$(this.PagingControlID); pager.replaceChildren(); pager.hidden=this.skip===0&&!this.page.HasMore; const count=this.page.Items.length; pager.append(text("span",count?`${this.skip+1}–${this.skip+count}`:"No results","ed-page-range")); const previous=button("Previous",()=>{this.skip=Math.max(0,this.skip-this.SkipSize);this.Refresh(true);}); previous.disabled=this.skip===0; const next=button("Next",()=>{this.skip+=this.SkipSize;this.Refresh(true);}); next.disabled=!this.page.HasMore; pager.append(previous,next); }
  reset() { this.skip=0; this.Refresh(true); }
 }
 return {$,text,escape,link,notify,clearNotice,run,request,button,dialog,state,status,date,facts,PagedGrid};
})();
