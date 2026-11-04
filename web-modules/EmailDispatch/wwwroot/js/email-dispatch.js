"use strict";
// Email review: shows what a rule or the dispatch agent decided for each email and gives Matt three ways to act on it.
// Confirm sends the decision, Add a note returns the email to the dispatch agent, and Pick a session sends it to a session
// he chooses. Every call goes through the generated JsonWs clients; the server owns every guard and state change.
(() => {
 const {$,text,escape,link,notify,run,request,button,status,date,facts,PagedGrid,dialog}=EmailDispatchUi;
  let selectedEmail=null, selectedRule=null, ruleSession="", actingWork=null, confirmMethod="ConfirmDispatch", pickMode="send", picked=null, pollTimer=0, inboxTimer=0, syncBusy=false, syncAvailable=false, bodyRequest=0, bodyToken=null;
 // Mirrors EmailDispatchActions.OpenStates and Confirm's state check, so a command is shown only where the server accepts it.
 const openStates=["Pending","Suggested","AutomaticReady","NeedsDestination","Notice","NoAction","Unclassified","Conflict","NeedsReview","Error","PreviouslyHandled","Prepared","AgentEvaluationRequired","PreparationFailed","Disabled"];
  const submissions=new Set(), failedInstructions=new Map();
  let emailHash=null,conversationThread=null;
  const isCurrentEmail=key=>location.hash===emailHash&&selectedEmail?.Email.ObservationKey===key;
 const isOpen=work=>!submissions.has(work.WorkKey)&&!work.MessageKey&&!work.LocalDisposition&&openStates.includes(work.State);
 const isConfirmable=work=>isOpen(work)&&["Suggested","AutomaticReady"].includes(work.State)&&!!work.Destination;
 const deciders={Rule:"A rule",Agent:"The dispatch agent",Operator:"You"};
 const learning={Pending:"Waiting to learn from this decision",Learned:"Learned from this decision",Uncertain:"Not learned · the agent was unsure",Failed:"Learning failed"};
 const behaviors={Route:rule=>"Send to "+(rule.WorkSession||"its session"),Processor:()=>"Run its processor",Agent:()=>"Ask the dispatch agent",Notice:()=>"Record as a notice",Disabled:()=>"Off · the dispatch agent decides"};
 const behavior=rule=>(behaviors[rule.Outcome]??behaviors.Agent)(rule);
 const testLabels={RouteSelected:"A rule sends it to a session",ProcessorSelected:"A processor rule matched",AgentEvaluationRequired:"The dispatch agent decides",Notice:"Notice only",Disabled:"The matching rule is off, so the dispatch agent decides",Unclassified:"No rule matched, so the dispatch agent decides",NeedsReview:"Needs review",Conflict:"Two rules matched",Error:"The rule check failed"};
 const confirmDialog=dialog("confirm-dialog"), noteDialog=dialog("note-dialog"), pickDialog=dialog("pick-dialog"), clearDialog=dialog("clear-dialog");
  function show(name) { document.querySelectorAll(".ed-view").forEach(view=>view.hidden=view.id!=="view-"+name); const view=document.getElementById("view-"+name);if(view.closest("#conversation-reader"))$("view-conversation").hidden=false; const nav=["conversation","conversations","message"].includes(name)||(name==="email"&&conversationThread)?"conversations":["email","inbox","evidence"].includes(name)?"inbox":name==="rule"?"rules":name; document.querySelectorAll(".ed-nav a").forEach(a=>a.toggleAttribute("aria-current",a.hash==="#"+nav)); document.querySelectorAll('.ed-nav a[aria-current]').forEach(a=>a.setAttribute("aria-current","page")); window.scrollTo(0,0); const heading=$("view-"+name).querySelector("h1"); heading?.focus({preventScroll:true,focusVisible:false}); }
 const inboxGrid=new PagedGrid("inbox","inbox-pager","search", args=>request(EmailObservations,"GetInbox",{AccountKey:"work-main",State:$("state").value,...args}), items=>`<table class="ed-grid Grid"><thead><tr><th class="ed-sender-cell">From</th><th>Email</th><th class="ed-time-cell">Received</th><th class="ed-state-cell">Status</th></tr></thead><tbody>${items.map(item=>{const [name,kind]=EmailDispatchUi.state(item.ReviewState);return `<tr data-row-href="#email/${encodeURIComponent(item.ObservationKey)}"><td class="ed-sender-cell"><span class="ed-cell-secondary" title="${escape(item.Sender)}">${escape(item.Sender)}</span></td><td><a href="#email/${encodeURIComponent(item.ObservationKey)}" title="${escape(item.Subject)}">${escape(item.Subject||"No subject")}</a><span class="ed-cell-secondary ed-mobile-meta">${escape(item.Sender)} · ${escape(date(item.ReceivedUtc))}</span></td><td class="ed-time-cell">${escape(date(item.ReceivedUtc))}</td><td class="ed-state-cell"><span class="ed-status ed-status-${kind}">${escape(name)}</span></td></tr>`;}).join("")}</tbody></table>`,"No emails match. Change the search or filter.");
 // Rule nodes come from the published rule snapshot, so the list never waits on the dispatch agent's session.
 const rulesGrid=new PagedGrid("program","rule-pager","rule-search",args=>request(EmailObservations,"GetRuleNodes",{...args,Search:args.Search??""}),items=>`<table class="ed-grid ed-grid-rules Grid"><thead><tr><th class="ed-rule-name">Rule</th><th>What happens</th><th class="ed-rule-state">Status</th></tr></thead><tbody>${items.map(rule=>`<tr><td><a href="#rule/${encodeURIComponent(rule.PrototypeName)}" title="${escape(rule.EntityName)}">${escape(rule.EntityName)}</a></td><td class="ed-rule-behavior">${escape(behavior(rule))}</td><td><span class="ed-status ed-status-${rule.Outcome==="Disabled"?"neutral":"success"}">${rule.Outcome==="Disabled"?"Off":"Active"}</span></td></tr>`).join("")}</tbody></table>`,"No rules match. To add one, open an email and choose Make this a rule.");
 // Pick a session: Buffaly's recent sessions, server-searched and paged; archived sessions and the dispatch agent are excluded by the server.
 const pickGrid=new PagedGrid("pick-grid","pick-pager","pick-search",args=>request(EmailObservations,"GetRecentSessions",{...args,Search:args.Search??""}),items=>`<table class="ed-grid Grid"><thead><tr><th class="ed-pick-cell"><span class="visually-hidden">Select</span></th><th>Session</th><th class="ed-time-cell">Last active</th></tr></thead><tbody>${items.map((session,index)=>`<tr><td class="ed-pick-cell"><input type="radio" name="pick-session" id="pick-${index}" value="${escape(session.SessionKey)}" data-name="${escape(session.Name)}"${picked?.SessionKey===session.SessionKey?" checked":""}></td><td><label for="pick-${index}" class="ed-pick-label">${escape(session.Name)}</label><span class="ed-cell-secondary">${escape(session.Purpose)}</span></td><td class="ed-time-cell">${escape(date(session.LastUpdated))}</td></tr>`).join("")}</tbody></table>`,"No sessions match. Change the search.");
 pickGrid.SkipSize=10;
 pickGrid.liveSearch(()=>{picked=null;pickSelection();},()=>$("pick-dialog").open);
 $("pick-dialog").addEventListener("close",()=>pickGrid.cancelSearch());
 async function accounts() {
  const values=await request(EmailSyncAccounts,"GetAccounts",{}); $("accounts").replaceChildren();
  syncAvailable=values.some(account=>account.Available); syncControls();
  for(const account of values) { const section=document.createElement("section"); section.append(text("h2",account.Email),facts([["Connection",account.Available?"Connected":"Unavailable — reauthorization required"],["Synchronization",account.Phase==="Current"?"Up to date":account.Phase],["Captured emails",account.EnumeratedCount],["Mailbox","Work account only"]])); $("accounts").append(section); $("sync-status").textContent=account.Available?(account.Phase==="Current"?"Gmail up to date":"Gmail synchronizing"):"Gmail unavailable"; $("sync-status").className="ed-status ed-status-"+(account.Available?"success":"warning"); $("synchronize").disabled=!account.Available; }
  $("sync-evidence").textContent=JSON.stringify(values,null,2);
  syncControls();
 }
 function syncControls() { for(const id of ["check-now","synchronize"]) $(id).disabled=syncBusy||!syncAvailable; }
 async function checkGmail() {
  if(syncBusy||!syncAvailable) return;
  syncBusy=true; syncControls();
  try {
   notify("Checking Gmail…");
   await request(EmailSyncAccounts,"Synchronize",{AccountKey:"work-main"});
   await accounts();
   inboxGrid.Refresh(true);
   notify("Gmail checked.");
  } finally { syncBusy=false; syncControls(); }
 }
 async function load(key) { selectedEmail=await request(EmailObservations,"GetEmail",{ObservationKey:key}); }
  async function openEmail(key,thread=null,conversationVersion=null) {
   const expectedHash=location.hash;
    $("subject").textContent="Loading email…";$("works").replaceChildren();
   const bodyVersion=++bodyRequest; bodyToken=null; $("body-html").hidden=true; $("body-html").removeAttribute("srcdoc"); $("body").hidden=false; $("body-loading").hidden=true;
   const updated=await request(EmailObservations,"GetEmail",{ObservationKey:key});
   if(location.hash!==expectedHash||bodyVersion!==bodyRequest||(conversationVersion!==null&&!EmailConversations.isCurrent(conversationVersion)))return;
   selectedEmail=updated;emailHash=expectedHash;conversationThread=thread;
   $("email-back").href=thread?"#thread/"+encodeURIComponent(thread):"#inbox";$("email-back").textContent=thread?"Back to conversation":"← Inbox";$("email-back").setAttribute("aria-label",thread?"Back to conversation":"Back to inbox");show("email");
  $("subject").textContent=selectedEmail.Email.Subject||"No subject"; $("sender").textContent=selectedEmail.Email.Sender; $("received").textContent=date(selectedEmail.Email.ReceivedUtc); $("body").textContent=selectedEmail.Frame?selectedEmail.Frame.BodyText||"This message has no readable text.":"This email could not be read. View evidence for details."; $("test").hidden=!selectedEmail.Frame||selectedEmail.Email.ReviewState==="Spam"; $("test-result").textContent="";
  works(); schedule(); $("subject").focus({preventScroll:true,focusVisible:false});
  if(selectedEmail.Frame) void formattedBody(key,bodyVersion);
 }
 // Presentation is fetched once per open, not by the decision poll. A late response cannot replace another email.
 async function formattedBody(key,version) {
  const loading=$("body-loading"); loading.textContent="Loading formatted email…"; loading.hidden=false;
  try {
   const body=await request(EmailObservations,"GetFormattedBody",{ObservationKey:key});
    if(version!==bodyRequest||!isCurrentEmail(key)) return;
   if(body.HtmlDocument!==null) { bodyToken=body.ResizeToken; $("body-html").style.height="600px"; $("body-html").srcdoc=body.HtmlDocument; $("body-html").hidden=false; $("body").hidden=true; }
   loading.hidden=true;
  } catch(error) {
    if(version!==bodyRequest||!isCurrentEmail(key)) return;
   loading.textContent="Formatted email could not be loaded. Showing the captured text.";
  }
 }
 // Bound auto-expansion: retained vh/percentage CSS can otherwise grow with every parent resize.
 // Larger mail scrolls inside the frame; saturation ends the feedback without discarding content.
 // The opaque-origin frame can report its size only, never commands or arbitrary DOM mutations.
  EmailDispatchUi.bindEmailFrame($("body-html"),()=>bodyToken);
  async function reload(focus) { const key=selectedEmail.Email.ObservationKey,hash=emailHash; const updated=await request(EmailObservations,"GetEmail",{ObservationKey:key}); if(emailHash!==hash||!isCurrentEmail(key))return; selectedEmail=updated;works(); schedule(); if(focus) $("works").querySelector(".ed-decision")?.focus({preventScroll:true}); }
  // The feed worker and other tabs can change an open decision. While it is actionable or learning is pending the email
 // is re-read every 10 seconds (one bounded GetEmail read), never while a dialog is open, so no Refresh command is needed.
 function schedule() {
  clearTimeout(pollTimer);
   if(!selectedEmail.Works.some(work=>isOpen(work)||work.LearningState==="Pending")) return;
  const key=selectedEmail.Email.ObservationKey;
   pollTimer=setTimeout(()=>run(null,async()=>{ if(!isCurrentEmail(key)) return; if(document.querySelector("dialog[open]")) { schedule(); return; } await reload(false); }),10000);
 }
 function works() {
    $("works").replaceChildren();
  // Only current decisions. A decision the requeue replaced (Superseded) is history: the evidence view shows it with what
  // it held, never as a second "Send to" beside the new decision (UI-STD-01 Principle 13).
   const current=selectedEmail.Works.filter(work=>work.State!=="Superseded");
   if(!selectedEmail.Frame||selectedEmail.Email.ReviewState==="Spam"||!current.length) $("works").append(status(selectedEmail.Email.ReviewState));
   else for(const work of current) $("works").append(decision(work));
  // The exact text a destination receives quotes the whole email twice inside the dispatch envelope, so it is not printed
  // under the message. Each decision links to it in the evidence view instead (UI-STD-01 Principle 4).
   const evidenceHash="#evidence/"+encodeURIComponent(selectedEmail.Email.ObservationKey);
   const evidence=button("View evidence",()=>{location.hash=evidenceHash;},false,"fa-search");evidence.id="email-evidence";
   let commands=$("works").querySelector(".ed-decision:last-child .ed-actions");
   if(!commands){commands=document.createElement("div");commands.className="ed-actions";($("works").lastElementChild?.classList.contains("ed-decision")?$("works").lastElementChild:$("works")).append(commands);}
   commands.append(evidence);
 }
 // Show the saved session and human decision rationale before the email; technical evidence stays separate.
 function decision(work) {
  const state=work.LocalDisposition||work.State, section=document.createElement("section");
   section.className="ed-decision"; section.tabIndex=-1; section.setAttribute("aria-label",EmailDispatchUi.state(state,work.Destination)[0]);
    const head=document.createElement("div"); head.className="ed-decision-head"; head.append(submissions.has(work.WorkKey)?text("span","Submitting instructions…","ed-status ed-status-info"):status(state,work.Destination));
    section.append(head);
    const reason=work.Source==="Agent"?work.Decision?.Rationale:work.Reason;
    section.append(EmailDispatchUi.details([["Identified session",work.Destination||"No session selected"],["Decision reason",reason||"No decision reason recorded"]]));
    if(submissions.has(work.WorkKey)) return section;
  const actions=document.createElement("div"); actions.className="ed-actions";
    if(isConfirmable(work)) actions.append(button("Send to "+work.Destination,control=>openConfirm(work,control),true,"fa-check"));
    if(work.CanSendAgain) actions.append(button("Send again to "+work.Destination,control=>openConfirm(work,control,true),true,"fa-check"));
   const processed=!work.LocalDisposition&&["Accepted","NoAction","Notice","WakeRecorded","PreviouslyHandled"].includes(work.State);
   if(isOpen(work)) {
    const canPick=work.State!=="Pending";
    if(canPick) actions.append(button("Choose destination and send",control=>openPick("send",work,control),!isConfirmable(work)&&!work.CanSendAgain&&work.State!=="Error"));
    actions.append(button("Ask the agent to reconsider",control=>openNote(work,control),work.State==="Error"));
   }
   if(work.LocalDisposition) actions.append(button("Restore to review",()=>setDisposition(work,null),true,"fa-undo"));
    else actions.append(button("Archive",()=>setDisposition(work,"Archived"),processed&&!actions.querySelector(".btn-primary"),"fa-archive"));
   if(actions.childElementCount) section.append(actions);
  return section;
 }
  async function setDisposition(work,disposition) {
   await request(EmailWorks,"SetDisposition",{WorkKey:work.WorkKey,Disposition:disposition});
    if(disposition) { if(conversationThread){location.hash="#thread/"+encodeURIComponent(conversationThread);return;} if($("state").value!=="NeedsAttention") { $("state").value="NeedsAttention"; inboxGrid.skip=0; } location.hash="#inbox"; }
   else { await reload(true); notify("Restored to review."); }
  }
  function openConfirm(work,control,repeat=false) { actingWork=work; confirmMethod=repeat?"SendAgain":"ConfirmDispatch"; $("confirm-title").textContent=repeat?"Send again":"Confirm dispatch"; $("confirm-send").lastChild.textContent=repeat?"Send again":"Send"; $("confirm-subject").textContent=selectedEmail.Email.Subject||"No subject"; $("confirm-sentence").textContent=(repeat?"Sends another copy of this email to ":"Sends this email to ")+work.Destination+"."; $("confirm-note").value=failedInstructions.get(confirmMethod+":"+work.WorkKey)?.Note??""; confirmDialog.open(control); }
  function openNote(work,control) { actingWork=work; $("note-text").value=failedInstructions.get("AddDispatchNote:"+work.WorkKey)?.Note??""; $("note-subject").textContent=selectedEmail.Email.Subject||"No subject"; noteDialog.open(control); }
  function openPick(mode,work,control) { const failed=mode==="send"?failedInstructions.get("PickSession:"+work.WorkKey):null; pickMode=mode; actingWork=work; picked=failed?.Selection??null; $("pick-title").textContent=mode==="send"?"Choose destination and send":"Choose the rule's session"; $("pick-subject").textContent=mode==="send"?(selectedEmail.Email.Subject||"No subject"):selectedRule.EntityName; $("pick-note-field").hidden=mode!=="send"; $("pick-note").value=failed?.Note??""; $("pick-search").value=""; $("pick-confirm").lastChild.textContent=mode==="send"?"Send to selected session":"Use this session"; pickSelection(); pickDialog.open(control); pickGrid.reset(); }
 function pickSelection() { $("pick-count").textContent=picked?"Selected: "+picked.Name:"No session selected"; $("pick-confirm").disabled=!picked; }
 // Reports the work's new state, so a send the destination did not accept is never described as sent.
  async function submitInstructions(control,method,values,restore) {
   const work=actingWork, key=selectedEmail.Email.ObservationKey, selection=method==="PickSession"?picked:null;
   if(submissions.has(work.WorkKey)) return;
   // Capture the exact command before closing: another email/dialog may become active while it runs.
   submissions.add(work.WorkKey); control.close(); works();
   notify("Submitting instructions…","Info");
   try {
     const result=await request(EmailWorks,method,values);
     if(result.Status==="PreviouslyHandled"&&values.Note)failedInstructions.set("SendAgain:"+work.WorkKey,{Note:values.Note});
    failedInstructions.delete(method+":"+work.WorkKey);
    submissions.delete(work.WorkKey);
    // Never let a late command completion reload, focus or overwrite a different email/view.
     if(isCurrentEmail(key)&&!document.querySelector("dialog[open]")) await run(null,async()=>{
      const updated=await request(EmailObservations,"GetEmail",{ObservationKey:key});
      if(isCurrentEmail(key)&&!document.querySelector("dialog[open]")) { selectedEmail=updated; works(); schedule(); }
    });
    if(method==="AddDispatchNote") notify("Instructions saved. Waiting for the dispatch agent.");
    else notify(result.Status==="PreviouslyHandled"?"Prior email evidence found. Review the updated decision before sending again.":EmailDispatchUi.state(result.Status)[0]+".",result.Accepted===true?"Success":"Warning");
   } catch(error) {
    submissions.delete(work.WorkKey);
    failedInstructions.set(method+":"+work.WorkKey,{...values,Selection:selection});
     if(isCurrentEmail(key)&&!document.querySelector("dialog[open]")) {
      // A refused command may have changed durable state. Read it before restoring any command.
      const updated=await request(EmailObservations,"GetEmail",{ObservationKey:key});
      if(isCurrentEmail(key)&&!document.querySelector("dialog[open]")) {
       selectedEmail=updated;works();schedule();
       const current=updated.Works.find(item=>item.WorkKey===work.WorkKey);
       // A lost confirmation response may leave only explicit repeat available; keep its proposed note reachable.
       if(method==="ConfirmDispatch"&&current?.CanSendAgain&&values.Note)failedInstructions.set("SendAgain:"+work.WorkKey,{Note:values.Note});
       if(current?.DecisionRevision===work.DecisionRevision){restore(current);failedInstructions.delete(method+":"+work.WorkKey);}
     }
    }
    // The shared error owner reports the failure; retained fields allow correction, never automatic retry.
    throw error;
   }
  }
 // Listed rules come from the published snapshot (GetRuleNodes), which never waits on the agent session. Only a node that is
 // not yet a rule ("Make this a rule") is read from the tree (GetRuleNode), which fails fast while a classification pass runs.
 async function openRule(name) {
  const page=await request(EmailObservations,"GetRuleNodes",{Search:name,SkipRows:0,NumRows:25});
  selectedRule=page.Items.find(rule=>rule.PrototypeName===name)??await request(EmailObservations,"GetRuleNode",{PrototypeName:name});
  show("rule"); renderRule();
 }
 function renderRule() {
  $("editor-title").textContent=selectedRule.IsRule?selectedRule.EntityName:"Make "+selectedRule.EntityName+" a rule";
  $("rule-context").textContent=selectedRule.ContextSummary; $("rule-matches").value=selectedRule.Rule;
  // Processors are registered owners: the editor keeps a node's existing processor but cannot invent one (ValidateBinding).
  const processor=$("rule-outcome").querySelector("option[value=Processor]"); processor.hidden=processor.disabled=!selectedRule.Processor;
  $("rule-outcome").value=selectedRule.IsRule?selectedRule.Outcome:(selectedRule.WorkSession?"Route":"Agent");
  ruleSession=selectedRule.WorkSession; sessionField();
  $("rule-danger").hidden=!selectedRule.IsRule; $("rule-test-form").hidden=true; $("rule-test-result").textContent="";
 }
 function sessionField() { $("rule-session-field").hidden=$("rule-outcome").value!=="Route"; $("rule-session").textContent=ruleSession||"No session chosen"; }
 async function testRules(key,target) { const result=await request(EmailObservations,"TestRules",{ObservationKey:key}); $(target).textContent=`${testLabels[result.Status]||"Rule check completed"}${result.Status==="RouteSelected"&&result.WorkSession?" ("+result.WorkSession+")":""}. Nothing was sent.`; }
 async function evidence() {
  await accounts(); const summary=await request(EmailWorks,"GetReviewSummary",{}); $("outcomes").replaceChildren();
  const list=document.createElement("dl"); list.className="ed-facts"; for(const outcome of summary.Outcomes) list.append(text("dt",EmailDispatchUi.state(outcome.Outcome)[0]),text("dd",outcome.Count)); $("outcomes").append(list);
  $("receipt-results").replaceChildren(); $("evidence-empty").hidden=!!selectedEmail;
  if(!selectedEmail) return;
  // The one place technical identities, revisions, the agent's raw decision and learning steps are shown (UI-STD-01 Principle 4).
  $("receipt-results").append(text("h3",selectedEmail.Email.Subject),facts([["Projection error",selectedEmail.ProjectionError],["Observation identity",selectedEmail.Email.ObservationKey]]));
  for(const work of selectedEmail.Works) {
   const region=document.createElement("section"); region.className="ed-region";
   region.append(facts([["Decided by",deciders[work.Source]],["Why",work.Source==="Agent"?work.Decision?.Rationale:null],["Learning",learning[work.LearningState]]]));
   const commands=document.createElement("div"); commands.className="ed-secondary-actions";
   const node=work.LearnedDecision?.TerminalPrototypeName||work.Decision?.TerminalPrototypeName;
   if(work.Source==="Rule"&&work.RuleNode) commands.append(link("Open rule","#rule/"+encodeURIComponent(work.RuleNode)));
   else if(node) commands.append(link("Make this a rule","#rule/"+encodeURIComponent(node)));
   if(["Failed","Uncertain"].includes(work.LearningState)) commands.append(button("Retry learning",async()=>{await request(EmailWorks,"RetryLearning",{WorkKey:work.WorkKey});await load(selectedEmail.Email.ObservationKey);await evidence();notify("Learning runs again on the next pass.");}));
   region.append(commands);
   if(work.Notes.length) { const list=document.createElement("ul"); list.className="ed-notes"; for(const note of work.Notes) list.append(text("li",note.Text+" · "+date(note.Utc))); region.append(text("p","Your instructions","ed-notes-label"),list); }
   region.append(status(work.State),facts([["Reason",work.Reason],["Work identity",work.WorkKey],["Message identity",work.MessageKey],["Destination",work.Destination],["Local disposition",work.LocalDisposition||"None"],["Decision revision",work.DecisionRevision],["Decided by",work.Source],["Rule node",work.RuleNode],["Rule path",work.RulePath?.join(" › ")],["Learning",work.LearningState],["Learning detail",work.LearningDetail],
    // What the legacy requeue replaced (EmailLegacyRequeue): the row's earlier state, processor, destination and reason.
    ["Requeued",work.Requeue&&date(work.Requeue.AtUtc)],["Before the requeue",work.Requeue&&EmailDispatchUi.state(work.Requeue.State)[0]],["Processor before the requeue",work.Requeue?.ProcessorKey],["Destination before the requeue",work.Requeue?.Destination],["Reason before the requeue",work.Requeue?.Reason]]));
   if(work.Requeue?.Instruction) region.append(text("p","Instruction before the requeue","ed-meta"),text("pre",work.Requeue.Instruction,"ed-evidence"));
   if(work.Decision||work.LearnedDecision) region.append(text("pre",JSON.stringify({Decision:work.Decision,LearnedDecision:work.LearnedDecision},null,2),"ed-evidence"));
   if(work.Replay?.length) region.append(text("pre",JSON.stringify(work.Replay,null,2),"ed-evidence"));
   // The exact instruction (what Confirm sends), labelled; the decision's "See exactly" link lands on this label.
   if(work.Instruction) { const label=text("p","What "+(work.Destination||"the destination")+(work.MessageKey?" received":work.State==="Superseded"?" would have received":" receives"),"ed-meta"); label.id="instruction-"+work.WorkKey; label.tabIndex=-1; region.append(label,text("pre",work.Instruction,"ed-evidence")); }
   if(work.Delivery) region.append(text("pre",JSON.stringify(work.Delivery,null,2),"ed-evidence")); else region.append(text("p","No delivery receipt.","ed-meta"));
   $("receipt-results").append(region);
  }
 }
 // Refresh only the current server-paged inbox. Keep its search, filter and page, and never
 // replace a focused row or overlap a pending read. Detail polling remains separate.
 function scheduleInbox() {
  clearTimeout(inboxTimer);
  inboxTimer=setTimeout(async()=>{
   if($("view-inbox").hidden) return;
   if(!document.hidden&&!document.querySelector("dialog[open]")&&!$("inbox").contains(document.activeElement)&&$("inbox").getAttribute("aria-busy")!=="true") {
    inboxGrid.Refresh(true);
    await run(null,accounts);
   }
   if(!$("view-inbox").hidden) scheduleInbox();
  },10000);
 }
 // #evidence/<ObservationKey>/<WorkKey> opens that email's evidence at the exact instruction of that work, also after a
 // reload. Plain #evidence keeps showing the email opened last.
 async function openEvidence(key,workKey) {
  if(key&&selectedEmail?.Email.ObservationKey!==key) await load(key);
  show("evidence"); await evidence();
  const label=workKey&&document.getElementById("instruction-"+workKey);
  if(label) { label.scrollIntoView({block:"start"}); label.focus({preventScroll:true,focusVisible:false}); }
 }
 async function route() {
  EmailDispatchUi.clearNotice(); clearTimeout(pollTimer); clearTimeout(inboxTimer);
   emailHash=null;conversationThread=null;EmailConversations.cancel();++bodyRequest;
  for(const open of document.querySelectorAll("dialog[open]")) open.close();
  const [name,id,part]=location.hash.slice(1).split("/");
   if(["conversations","thread","message"].includes(name)) await EmailConversations.route(show,openEmail);
   else if(name==="email"&&id) await openEmail(decodeURIComponent(id));
  else if(name==="rules"){show("rules");rulesGrid.Refresh(true);}
  else if(name==="rule"&&id) await openRule(decodeURIComponent(id));
  else if(name==="evidence") await openEvidence(id&&decodeURIComponent(id),part&&decodeURIComponent(part));
  else if(name==="accounts"){show("accounts");await accounts();}
  else {show("inbox");inboxGrid.Refresh(true);scheduleInbox();await accounts();}
 }
 function submit(id,control,action,background=false){$(id).addEventListener("submit",event=>{event.preventDefault();run(background?null:$(control),action);});}
 function click(id,action,background=false){$(id).addEventListener("click",()=>run(background?null:$(id),action));}
 submit("search-form","search-form",()=>inboxGrid.reset());$("state").addEventListener("change",()=>inboxGrid.reset());submit("rule-search-form","rule-search-form",()=>rulesGrid.reset());
  submit("confirm-form","confirm-send",()=>{const note=$("confirm-note").value, method=confirmMethod;return submitInstructions(confirmDialog,method,{WorkKey:actingWork.WorkKey,ExpectedDecisionRevision:actingWork.DecisionRevision,Note:note},work=>{openConfirm(work,null,method==="SendAgain");$("confirm-note").value=note;});},true);
  submit("note-form","note-save",()=>{const note=$("note-text").value;return submitInstructions(noteDialog,"AddDispatchNote",{WorkKey:actingWork.WorkKey,ExpectedDecisionRevision:actingWork.DecisionRevision,Note:note},work=>{openNote(work);$("note-text").value=note;});},true);
 $("pick-grid").addEventListener("change",event=>{const input=event.target.closest("input[name=pick-session]");if(!input)return;picked={SessionKey:input.value,Name:input.dataset.name};pickSelection();});
 submit("pick-search-form","pick-search-form",()=>{picked=null;pickSelection();pickGrid.reset();});
 click("pick-confirm",async()=>{
  if(pickMode==="rule"){ruleSession=picked.SessionKey;sessionField();pickDialog.close();return;}
   const session=picked, note=$("pick-note").value;
   await submitInstructions(pickDialog,"PickSession",{WorkKey:actingWork.WorkKey,ExpectedDecisionRevision:actingWork.DecisionRevision,SessionKey:session.SessionKey,Note:note},work=>{openPick("send",work);picked=session;$("pick-note").value=note;pickSelection();});
  },true);
  $("rule-outcome").addEventListener("change",sessionField);
 click("rule-session-pick",control=>openPick("rule",null,control));
 submit("rule-form","save-rule",async()=>{
  const outcome=$("rule-outcome").value;
  // EmailRuleTree.ValidateBinding: only Processor and Disabled nodes name a processor, only Agent names an anchor, and
  // Agent and Notice nodes carry no WorkSession. Everything is validated on the server before the first tree write.
  selectedRule=await request(EmailObservations,"SaveRuleNode",{PrototypeName:selectedRule.PrototypeName,ExpectedRulesRevision:selectedRule.RulesRevision,Rule:$("rule-matches").value,Outcome:outcome,Processor:["Processor","Disabled"].includes(outcome)?selectedRule.Processor:"",WorkSession:["Agent","Notice"].includes(outcome)?"":ruleSession,Anchor:outcome==="Agent"?selectedRule.Anchor:""});
  renderRule(); notify("Rule saved.");
 });
 click("cancel-rule",()=>{location.hash="#rules";});
 click("rule-clear",control=>{$("clear-subject").textContent=selectedRule.EntityName;clearDialog.open(control);});
 submit("clear-form","clear-confirm",async()=>{selectedRule=await request(EmailObservations,"ClearRule",{PrototypeName:selectedRule.PrototypeName,ExpectedRulesRevision:selectedRule.RulesRevision});clearDialog.close();renderRule();notify("This node is no longer a rule. It stays in the dispatch tree.");});
 click("test",()=>testRules(selectedEmail.Email.ObservationKey,"test-result"));click("rule-test",()=>{$("rule-test-form").hidden=false;$("rule-email-search").focus();});
 submit("rule-test-form","rule-test",async()=>{const page=await request(EmailObservations,"GetInbox",{AccountKey:"work-main",State:"",Search:$("rule-email-search").value,SkipRows:0,NumRows:10});$("rule-email-results").replaceChildren();for(const email of page.Items)$("rule-email-results").append(button(email.Subject,()=>testRules(email.ObservationKey,"rule-test-result")));if(!page.Items.length)$("rule-email-results").append(text("p","No matching email.","ed-empty"));});
 click("synchronize",checkGmail); click("check-now",checkGmail);
 window.addEventListener("hashchange",()=>run(null,route));run(null,route);
})();
