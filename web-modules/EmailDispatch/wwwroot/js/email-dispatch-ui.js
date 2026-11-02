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
 const notify = (message, kind = "Success") => { UserMessages._CurrentMessageCount = 0; UserMessages.DisplayNow(message, kind, false); };
 UserMessages.OnFulfillMessage = message => { $("status").hidden = false; $("status").className = "ed-message " + message.Class; $("status").textContent = message.Message; };
 async function run(control, action) { if (control) control.disabled = true; try { return await action(); } catch (error) { console.error("Email Dispatch operation failed", error); notify("Could not complete this action. Your edits are still here. Try again or reload the saved version.", "Error"); return undefined; } finally { if (control) control.disabled = false; } }
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
 function button(label, action, primary = false) { const element = text("button", label, "btn " + (primary ? "btn-primary" : "btn-outline-secondary")); element.type = "button"; element.addEventListener("click", () => run(element, action)); return element; }
 const stateNames = {
  NotReviewed:["Not yet reviewed","neutral"], ReviewedLocally:["Reviewed locally","neutral"], AgentEvaluationRequired:["Needs suggestions","warning"], PreparationFailed:["Suggestion needs retry","danger"], Prepared:["Suggestions ready","info"], NeedsReview:["Needs routing review","warning"], Suggested:["Ready for approval","warning"], PreviouslyHandled:["Already handled · held","neutral"], DeliveryUnknown:["Delivery uncertain · held","danger"], Accepted:["Accepted by destination","success"], Unclassified:["No matching rule","neutral"], AutomaticReady:["Processor ready","info"], NoAction:["No action needed","neutral"], Notice:["Notice only","neutral"], WakeRecorded:["Wake recorded","info"], Conflict:["Conflicting rules · held","danger"], Error:["Review failed","danger"], Failed:["Review needs retry","danger"], Archived:["Archived locally","neutral"], Dismissed:["Dismissed locally","neutral"]
 };
 const state = value => stateNames[value] ?? ["Needs inspection", "warning"];
 const status = value => { const [name, kind] = state(value); return text("span", name, "ed-status ed-status-" + kind); };
 const date = value => DateUtil.ToShortDateTime(DateUtil.UTCToLocal(value));
 function facts(values) { const list = document.createElement("dl"); list.className = "ed-facts"; for (const [label,value] of values) if (value !== null && value !== undefined && value !== "") list.append(text("dt", label),text("dd", value)); return list; }
 function listItem(name, detail, href) { const item = link("", href, "ed-list-item"); item.append(text("strong",name)); if (detail) item.append(text("p", detail)); return item; }
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
 return {$,text,escape,link,notify,run,request,button,state,status,date,facts,listItem,PagedGrid};
})();
