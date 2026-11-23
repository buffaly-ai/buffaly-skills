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
 function button(label, action, primary = false, icon = "", busy = true) { const element = text("button", label, "btn " + (primary ? "btn-primary" : "btn-outline-secondary")); element.type = "button"; if (icon) { const glyph = text("i", "", "fas " + icon); glyph.setAttribute("aria-hidden", "true"); element.prepend(glyph); } element.addEventListener("click", () => busy ? run(element, action) : action(element)); return element; }
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
  // One sandbox sizing/identity owner for Review and Conversations.
   function bindEmailFrame(frame, plain) {
    let token=null, ready=false, textOnly=false;
    // Local representation choice is synchronous; a spinner would restore the old button label after display().
    const toggle=button("Show captured text",()=>{textOnly=!textOnly;display();},false,"fa-file-alt",false);
    toggle.hidden=true;
    function display(){
     const formatted=ready&&!textOnly;
     frame.classList.toggle("ed-email-frame-pending",!formatted);
     plain.hidden=formatted;
     toggle.hidden=!ready;toggle.lastChild.textContent=formatted?"Show captured text":"Show formatted email";
    }
    window.addEventListener("message",event=>{
     const data=event.data;
     if(event.source!==frame.contentWindow||event.origin!=="null"||!token||data?.kind!=="email-body-size"||data.token!==token||!Number.isFinite(data.height)||data.height<=16)return;
     const height=Math.max(120,Math.min(2400,Math.ceil(data.height)+2))+"px";
     if(frame.style.height!==height)frame.style.height=height;
     ready=true;display();
    });
    return {
     mount(commands){commands.append(toggle);},
     reset(){token=null;ready=false;textOnly=false;frame.hidden=true;frame.removeAttribute("srcdoc");display();},
     show(body){if(!body?.HtmlDocument)return;token=body.ResizeToken;ready=false;textOnly=false;display();frame.style.height="600px";frame.srcdoc=body.HtmlDocument;frame.hidden=false;}
    };
   }
  const stateNames = {
   GuidedDispatchReady:["Dispatch requested — sending","info"],
   Dispatched:["Dispatched","success"], NotDispatched:["Not dispatched","warning"], DispatchReady:["Ready to dispatch","warning"], DispatchUncertain:["Dispatch uncertain · check delivery","danger"], DispatchRejected:["Dispatch rejected","danger"], DispatchNeedsReview:["Needs dispatch review","warning"], DispatchPriorEvidence:["Prior email found · held","neutral"], DispatchReviewed:["Reviewed · not dispatched","neutral"], DispatchNoAction:["No dispatch needed","neutral"],
   Replied:["You replied","success"], AwaitingReply:["No reply yet","neutral"], Draft:["Draft reply","warning"],
   ProjectionFailed:["Email could not be read","danger"], Spam:["Spam · not dispatched","neutral"], Trash:["In Trash","neutral"],
  NotReviewed:["Not yet reviewed","neutral"], ReviewedLocally:["Reviewed locally","neutral"], Pending:["Review pending","info"], Suggested:["Ready to send","warning"], AutomaticReady:["Processor ready to send","warning"], NeedsDestination:["Not sent - choose a destination","warning"], AgentEvaluationRequired:["Not analyzed","warning"], PreparationFailed:["Not decided yet","warning"], Prepared:["Suggestions ready","info"], NeedsReview:["Needs routing review","warning"], PreviouslyHandled:["Prior email found · held","neutral"], DeliveryUnknown:["Delivery uncertain · held","danger"], Accepted:["Accepted by destination","success"], Rejected:["Rejected by destination","danger"], Unclassified:["Not analyzed","warning"], Disabled:["Not analyzed","warning"], Superseded:["Replaced by a newer decision","neutral"], NoAction:["No action needed","neutral"], Notice:["Notice only","neutral"], WakeRecorded:["Wake recorded","info"], Conflict:["Conflicting rules · held","danger"], Error:["The dispatch agent could not decide","danger"], Failed:["Review needs retry","danger"], Archived:["Archived","neutral"], Dismissed:["Dismissed locally","neutral"]
 };
  const state = (value,destination) => {
   const result=stateNames[value] ?? ["Needs inspection", "warning"];
   if(destination&&["Suggested","AutomaticReady"].includes(value)) return [result[0]+" to "+destination,result[1]];
    if(destination&&value==="Accepted") return ["Accepted by "+destination,result[1]];
    if(destination&&value==="Dispatched") return ["Dispatched to "+destination,result[1]];
    if(destination&&value==="DispatchReady") return ["Ready to dispatch to "+destination,result[1]];
   return result;
  };
  const status = (value,destination) => { const [name, kind] = state(value,destination); return text("span", name, "ed-status ed-status-" + kind); };
 // Local time with relative age (UI-STD-01 Principle 4). DateUtil owns the UTC-to-local conversion.
 function age(local) { const minutes = Math.round((Date.now() - local.getTime()) / 60000); if (minutes < 1) return "just now"; if (minutes < 60) return minutes + " min ago"; const hours = Math.round(minutes / 60); if (hours < 24) return hours + (hours === 1 ? " hour ago" : " hours ago"); const days = Math.round(hours / 24); return days + (days === 1 ? " day ago" : " days ago"); }
 const date = value => { const local = DateUtil.UTCToLocal(value); return DateUtil.ToShortDateTime(local) + " · " + age(local); };
  function facts(values) { const list = document.createElement("dl"); list.className = "ed-facts"; for (const [label,value] of values) if (value !== null && value !== undefined && value !== "") list.append(text("dt", label),text("dd", value)); return list; }
  // Shared read-only record details use the standard Inputs table, not a page-specific facts layout.
  function details(values) { const table = text("table", "", "Inputs table table-condensed"); const body = document.createElement("tbody"); for (const [label,value] of values) { const row = document.createElement("tr"); if (body.childElementCount % 2 === 0) row.className = "table-light"; row.append(text("td",label,"InputLabel"),text("td",value)); body.append(row); } table.append(body); return table; }
 // JsonWsGrid3 owns search/request ordering/row rendering. Its exact-total span pager is not
 // applicable to the existing HasMore DTO; this single shared adapter uses honest ranges
 // and native keyboard buttons, without fabricating counts or downloading all records.
 class PagedGrid extends JsonWsGrid3 {
  constructor(content, pager, search, load, render, empty) { super(); this.ContentControlID=content; this.PagingControlID=pager; this.SearchControlID=search; this.SkipSize=25; this.load=load; this.render=render; this.empty=empty; this.request=0; this.page={Items:[],HasMore:false}; this.OnBeforeRefresh=()=>this.busy(true); this.OnDataReceived=page=>{this.page=page;return page.Items.length?render(page.Items):`<div class="ed-empty">${empty}</div>`;}; this.OnComplete=()=>this.busy(false); }
  busy(value) { $(this.ContentControlID).setAttribute("aria-busy",String(value));$(this.ContentControlID).inert=value;$(this.PagingControlID).inert=value; }
   MakeDataRequest(callback) { const request=++this.request,args={Search:this.search,SkipRows:this.skip,NumRows:this.SkipSize,...this.parameters?.()}; this.m_iConcurrentCalls++; this.load(args).then(page=>{if(request!==this.request){this.m_iConcurrentCalls--;return;}this.loadedArgs=args;this.loadedAt=Date.now();this.loadedKey=this.viewKey();callback(page,request);}).catch(error=>{this.m_iConcurrentCalls--;if(request!==this.request)return;this.loadedAt=0;this.busy(false);$(this.ContentControlID).replaceChildren(text("p","Could not load this list.","ed-empty"),button("Try again",()=>this.Refresh(true))); notify("Could not load this list. Try again.","Error"); console.error(error);}); }
  viewKey(){return JSON.stringify([document.getElementById(this.SearchControlID)?.value??"",this.skip,this.extraKey?.()??""]);}
  activate(maxAge=10000){if(!this.loadedAt||document.getElementById(this.ContentControlID).getAttribute("aria-busy")==="true"||this.loadedKey!==this.viewKey()||Date.now()-this.loadedAt>=maxAge)this.Refresh(true);}
  invalidate(){this.loadedAt=0;}
  RefreshCount() { this.BindCount(); }
  BindCount() { const pager=$(this.PagingControlID); pager.replaceChildren(); pager.hidden=this.skip===0&&!this.page.HasMore; const count=this.page.Items.length; pager.append(text("span",count?`${this.skip+1}–${this.skip+count}`:"No results","ed-page-range")); const previous=button("Previous",()=>{this.skip=Math.max(0,this.skip-this.SkipSize);this.Refresh(true);}); previous.disabled=this.skip===0; const next=button("Next",()=>{this.skip+=this.SkipSize;this.Refresh(true);}); next.disabled=!this.page.HasMore; pager.append(previous,next); }
  // Opt-in live search retains bounded server paging and never filters downloaded rows.
  liveSearch(onChange,isActive=()=>true) { const schedule=()=>{this.cancelSearch();if(!isActive())return;onChange();this.busy(true);this.searchTimer=setTimeout(()=>{if(isActive())this.reset();},250);}; $(this.SearchControlID).addEventListener("input",event=>{if(event.isComposing){this.cancelSearch();onChange();this.busy(true);return;}schedule();});$(this.SearchControlID).addEventListener("compositionend",schedule); }
  cancelSearch() { clearTimeout(this.searchTimer);this.searchTimer=0;this.request++; }
  reset() { this.cancelSearch();this.skip=0; this.Refresh(true); }
 }
   // A reader retains one bounded list page and its exact server query, never a client-side mailbox filter.
   class RecordNavigation {
    constructor(host,load,key,href,select){this.host=document.getElementById(host);this.load=load;this.key=key;this.href=href;this.select=select;this.version=0;this.pages=new Map();}
    capture(query,page){this.pages.clear();return {Query:{...query},Keys:page.Items.map(this.key),HasMore:page.HasMore};}
    clear(){this.version++;this.host.replaceChildren();this.host.hidden=true;}
    async adjacent(position,key,direction){
     const index=position.Keys.indexOf(key),local=index+direction;
     if(local>=0&&local<position.Keys.length)return {key:position.Keys[local],position};
     const query={...position.Query,SkipRows:position.Query.SkipRows+direction*position.Query.NumRows};
     if(query.SkipRows<0||(direction>0&&!position.HasMore))return null;
     const cacheKey=JSON.stringify(query);let page=this.pages.get(cacheKey);
     if(!page){page=await this.load(query);this.pages.set(cacheKey,page);if(this.pages.size>3)this.pages.delete(this.pages.keys().next().value);}
     const keys=page.Items.map(this.key),anchor=keys.indexOf(key);
     // A new arrival can move the anchor into the adjacent page; never navigate back to that same email.
     const target=anchor<0?(direction>0?0:keys.length-1):anchor+direction;
     if(target<0||target>=keys.length)return null;
     return {key:keys[target],position:{Query:query,Keys:keys,HasMore:page.HasMore}};
    }
    async show(position,key){
     this.clear();if(!position?.Keys.includes(key))return;
     const version=this.version;this.host.hidden=false;this.host.append(text("span","Loading navigation…","ed-meta"));
     try{
      const targets=await Promise.all([-1,1].map(direction=>this.adjacent(position,key,direction)));
      if(version!==this.version)return;
      this.host.replaceChildren();
      targets.forEach((target,index)=>{if(!target)return;const anchor=link(index?"Next":"Previous",this.href(target.key),"ed-back");anchor.id=index?"email-next":"email-previous";anchor.setAttribute("aria-label",index?"Next email":"Previous email");const icon=text("i","","fas "+(index?"fa-chevron-right":"fa-chevron-left"));icon.setAttribute("aria-hidden","true");index?anchor.append(icon):anchor.prepend(icon);anchor.addEventListener("click",event=>{if(event.button===0&&!event.ctrlKey&&!event.metaKey&&!event.shiftKey&&!event.altKey)this.select(target.position);});this.host.append(anchor);});
      this.host.hidden=!this.host.childElementCount;
     }catch(error){
      if(version!==this.version)return;
      console.error("Could not load adjacent records",error);this.host.replaceChildren(button("Retry navigation",()=>{clearNotice();return this.show(position,key);},false,"fa-sync-alt"));notify("Could not load the next or previous email. Retry navigation.","Error");
     }
    }
   }
   // Gmail's opaque cursors are adapted here, not translated into guessed offsets or downloaded whole-mailbox rows.
  class CursorGrid extends PagedGrid {
   constructor(content,pager,search,load,render,empty) {
    const state={tokens:new Map([[0,""]]),version:0};
    super(content,pager,search,args=>{const version=state.version;return load({Search:args.Search??"",PageToken:state.tokens.get(args.SkipRows),NumRows:args.NumRows}).then(page=>{if(version===state.version){if(page.NextPageToken)state.tokens.set(args.SkipRows+args.NumRows,page.NextPageToken);else state.tokens.delete(args.SkipRows+args.NumRows);}return {Items:page.Items,HasMore:!!page.NextPageToken};});},render,empty);
    this.cursorState=state;
   }
    reset(){this.cursorState.version++;this.cursorState.tokens.clear();this.cursorState.tokens.set(0,"");super.reset();}
    BindCount(){super.BindCount();const count=document.getElementById(this.PagingControlID).querySelector(".ed-page-range");if(count)count.textContent=`${this.page.Items.length} conversations on this page`;}
  }
   // Opt-in page selection, owned beside paging so no view copies checkbox or lifecycle handling.
    class GridSelection {
     constructor(grid,commands,key,label,actionLabel,action,icon=""){
      this.grid=grid;this.key=key;this.label=label;this.selected=new Map();this.running=false;this.loading=true;this.retain=false;
      this.commands=commands;this.actions=[];this.count=text("span","","ed-page-range");commands.append(this.count);this.command=this.addAction(actionLabel,action,icon,true);
     const before=grid.OnBeforeRefresh,complete=grid.OnComplete,busy=grid.busy.bind(grid);
     grid.busy=value=>{busy(value);this.loading=value;this.update();};
     grid.OnBeforeRefresh=()=>{if(!this.retain)this.selected.clear();this.retain=false;before();this.update();};
     grid.OnComplete=()=>{complete();this.render();};
      this.update();
     }
     addAction(label,action,icon="",primary=false){
      if(primary)for(const command of this.actions){command.classList.remove("btn-primary");command.classList.add("btn-outline-secondary");}
      const command=button(label,()=>this.execute(action),primary,icon);this.actions.push(command);this.commands.append(command);this.update();return command;
     }
      clear(){this.selected.clear();document.getElementById(this.grid.ContentControlID).querySelectorAll("input[data-grid-select]").forEach(input=>input.checked=false);this.update();}
     update(){
      this.count.textContent=this.selected.size?`${this.selected.size} selected`:"";
      for(const command of this.actions){command.hidden=!this.selected.size;command.disabled=this.running||this.loading;}
     const host=document.getElementById(this.grid.ContentControlID);
     host.inert=this.running||this.loading;document.getElementById(this.grid.PagingControlID).inert=this.running||this.loading;
     const search=document.getElementById(this.grid.SearchControlID)?.closest("form");if(search)search.inert=this.running;
     host.querySelectorAll("input[data-grid-select]").forEach(input=>{input.disabled=this.running||this.loading;});
     const all=host.querySelector("input[data-grid-select-all]");
     if(all){const count=this.grid.page.Items.filter(item=>this.selected.has(this.key(item))).length;all.checked=count>0&&count===this.grid.page.Items.length;all.indeterminate=count>0&&!all.checked;all.disabled=this.running||this.loading;}
    }
    render(){
     const ids=new Set(this.grid.page.Items.map(item=>this.key(item)));for(const id of this.selected.keys())if(!ids.has(id))this.selected.delete(id);
      const host=document.getElementById(this.grid.ContentControlID),table=host.querySelector("table");if(!table){this.update();return;}
      host.querySelectorAll(".ed-pick-cell[data-selection-cell]").forEach(cell=>cell.remove());
      const checkbox=(name)=>{const input=document.createElement("input");input.type="checkbox";input.setAttribute("aria-label",name);return input;};
      // The native label makes the entire padded target toggle once, without invoking row navigation.
      const target=input=>{const label=text("label","","ed-select-target");label.append(input);return label;};
       const head=document.createElement("th"),all=checkbox("Select all on this page");all.dataset.gridSelectAll="";head.dataset.selectionCell="";head.className="ed-pick-cell";head.append(target(all));table.tHead.rows[0].prepend(head);
     all.addEventListener("change",()=>{for(const item of this.grid.page.Items){const id=this.key(item);if(all.checked)this.selected.set(id,item);else this.selected.delete(id);}host.querySelectorAll("input[data-grid-select]").forEach(input=>input.checked=all.checked);this.update();});
       [...table.tBodies[0].rows].forEach((row,index)=>{const item=this.grid.page.Items[index],id=this.key(item),cell=document.createElement("td"),input=checkbox("Select "+this.label(item));cell.className="ed-pick-cell";cell.dataset.selectionCell="";input.dataset.gridSelect=id;input.checked=this.selected.has(id);input.addEventListener("change",()=>{if(input.checked)this.selected.set(id,item);else this.selected.delete(id);this.update();});cell.append(target(input));row.prepend(cell);});
     this.update();
    }
    async execute(action){if(this.running||this.loading||!this.selected.size)return;this.running=true;this.update();try{await action([...this.selected.values()],this);}finally{this.running=false;this.update();}}
    refresh(){this.retain=true;this.grid.Refresh(true);}
   }
    function archiveSelection(grid,commands,key,active,afterArchive=async()=>{},invalidate=()=>{}){
     return new GridSelection(grid,commands,key,item=>item.Subject||"No subject","Archive selected",async(items,control)=>{
      const failed=[],threads=new Set();let archived=0;
      for(const item of items){try{
       if(!item.ThreadId)throw new Error("Missing conversation identity.");
       if(!threads.has(item.ThreadId)){await request(EmailObservations,"ArchiveConversation",{AccountKey:"work-main",ThreadId:item.ThreadId});threads.add(item.ThreadId);}
       await afterArchive(item);control.selected.delete(key(item));archived++;
      }catch(error){failed.push(item.Subject||"No subject");console.error("Email archive failed",error);}}
      invalidate();grid.invalidate();
      if(active()){notify(failed.length?`${archived} archived. Could not archive: ${failed.join("; ")}. Those emails remain selected. Try Archive selected again.`:`${archived} ${archived===1?"email archived":"emails archived"}.`,failed.length?"Error":"Success");control.refresh();}else control.clear();
     },"fa-archive");
    }
     return {$,text,escape,link,notify,clearNotice,run,request,button,dialog,state,status,date,facts,details,PagedGrid,RecordNavigation,CursorGrid,GridSelection,archiveSelection,bindEmailFrame};
})();
