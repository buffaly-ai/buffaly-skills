"use strict";
// Email review: shows what a rule or the dispatch agent decided for each email and gives Matt three ways to act on it.
// Confirm sends the decision, Add a note returns the email to the dispatch agent, and Pick a session sends it to a session
// he chooses. Every call goes through the generated JsonWs clients; the server owns every guard and state change.
(() => {
 const {$,text,escape,link,notify,run,request,button,status,date,facts,PagedGrid,dialog}=EmailDispatchUi;
 let selectedEmail=null, selectedRule=null, ruleSession="", actingWork=null, pickMode="send", picked=null, pollTimer=0, inboxTimer=0, syncBusy=false, syncAvailable=false;
 // Mirrors EmailDispatchActions.OpenStates and Confirm's state check, so a command is shown only where the server accepts it.
 const openStates=["Pending","Suggested","AutomaticReady","NeedsDestination","Notice","NoAction","Unclassified","Conflict","NeedsReview","Error","PreviouslyHandled","Prepared","AgentEvaluationRequired","PreparationFailed","Disabled"];
 const isOpen=work=>!work.MessageKey&&!work.LocalDisposition&&openStates.includes(work.State);
 const isConfirmable=work=>isOpen(work)&&["Suggested","AutomaticReady"].includes(work.State)&&!!work.Destination;
 const deciders={Rule:"A rule",Agent:"The dispatch agent",Operator:"You"};
 const learning={Pending:"Waiting to learn from this decision",Learned:"Learned from this decision",Uncertain:"Not learned · the agent was unsure",Failed:"Learning failed"};
 const behaviors={Route:rule=>"Send to "+(rule.WorkSession||"its session"),Processor:()=>"Run its processor",Agent:()=>"Ask the dispatch agent",Notice:()=>"Record as a notice",Disabled:()=>"Off · the dispatch agent decides"};
 const behavior=rule=>(behaviors[rule.Outcome]??behaviors.Agent)(rule);
 const testLabels={RouteSelected:"A rule sends it to a session",ProcessorSelected:"A processor rule matched",AgentEvaluationRequired:"The dispatch agent decides",Notice:"Notice only",Disabled:"The matching rule is off, so the dispatch agent decides",Unclassified:"No rule matched, so the dispatch agent decides",NeedsReview:"Needs review",Conflict:"Two rules matched",Error:"The rule check failed"};
 const confirmDialog=dialog("confirm-dialog"), noteDialog=dialog("note-dialog"), pickDialog=dialog("pick-dialog"), clearDialog=dialog("clear-dialog");
 function show(name) { document.querySelectorAll(".ed-view").forEach(view=>view.hidden=view.id!=="view-"+name); const nav=["email","inbox","evidence"].includes(name)?"inbox":name==="rule"?"rules":name; document.querySelectorAll(".ed-nav a").forEach(a=>a.toggleAttribute("aria-current",a.hash==="#"+nav)); document.querySelectorAll('.ed-nav a[aria-current]').forEach(a=>a.setAttribute("aria-current","page")); window.scrollTo(0,0); const heading=$("view-"+name).querySelector("h1"); heading?.focus({preventScroll:true,focusVisible:false}); }
 const inboxGrid=new PagedGrid("inbox","inbox-pager","search", args=>request(EmailObservations,"GetInbox",{AccountKey:"work-main",State:$("state").value,...args}), items=>`<table class="ed-grid Grid"><thead><tr><th class="ed-sender-cell">From</th><th>Email</th><th class="ed-time-cell">Received</th><th class="ed-state-cell">Status</th></tr></thead><tbody>${items.map(item=>{const [name,kind]=EmailDispatchUi.state(item.ReviewState);return `<tr data-row-href="#email/${encodeURIComponent(item.ObservationKey)}"><td class="ed-sender-cell"><span class="ed-cell-secondary" title="${escape(item.Sender)}">${escape(item.Sender)}</span></td><td><a href="#email/${encodeURIComponent(item.ObservationKey)}" title="${escape(item.Subject)}">${escape(item.Subject||"No subject")}</a><span class="ed-cell-secondary ed-mobile-meta">${escape(item.Sender)} · ${escape(date(item.ReceivedUtc))}</span></td><td class="ed-time-cell">${escape(date(item.ReceivedUtc))}</td><td class="ed-state-cell"><span class="ed-status ed-status-${kind}">${escape(name)}</span></td></tr>`;}).join("")}</tbody></table>`,"No emails match. Change the search or filter.");
 // Rule nodes come from the published rule snapshot, so the list never waits on the dispatch agent's session.
 const rulesGrid=new PagedGrid("program","rule-pager","rule-search",args=>request(EmailObservations,"GetRuleNodes",{...args,Search:args.Search??""}),items=>`<table class="ed-grid ed-grid-rules Grid"><thead><tr><th class="ed-rule-name">Rule</th><th>What happens</th><th class="ed-rule-state">Status</th></tr></thead><tbody>${items.map(rule=>`<tr><td><a href="#rule/${encodeURIComponent(rule.PrototypeName)}" title="${escape(rule.EntityName)}">${escape(rule.EntityName)}</a></td><td class="ed-rule-behavior">${escape(behavior(rule))}</td><td><span class="ed-status ed-status-${rule.Outcome==="Disabled"?"neutral":"success"}">${rule.Outcome==="Disabled"?"Off":"Active"}</span></td></tr>`).join("")}</tbody></table>`,"No rules match. To add one, open an email and choose Make this a rule.");
 // Pick a session: Buffaly's recent sessions, server-searched and paged; archived sessions and the dispatch agent are excluded by the server.
 const pickGrid=new PagedGrid("pick-grid","pick-pager","pick-search",args=>request(EmailObservations,"GetRecentSessions",{...args,Search:args.Search??""}),items=>`<table class="ed-grid Grid"><thead><tr><th class="ed-pick-cell"><span class="visually-hidden">Select</span></th><th>Session</th><th class="ed-time-cell">Last active</th></tr></thead><tbody>${items.map((session,index)=>`<tr><td class="ed-pick-cell"><input type="radio" name="pick-session" id="pick-${index}" value="${escape(session.SessionKey)}" data-name="${escape(session.Name)}"${picked?.SessionKey===session.SessionKey?" checked":""}></td><td><label for="pick-${index}" class="ed-pick-label">${escape(session.Name)}</label><span class="ed-cell-secondary">${escape(session.Purpose)}</span></td><td class="ed-time-cell">${escape(date(session.LastUpdated))}</td></tr>`).join("")}</tbody></table>`,"No sessions match. Change the search.");
 pickGrid.SkipSize=10;
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
 async function openEmail(key) {
  await load(key); show("email");
  $("subject").textContent=selectedEmail.Email.Subject||"No subject"; $("sender").textContent=selectedEmail.Email.Sender; $("received").textContent=date(selectedEmail.Email.ReceivedUtc); $("body").textContent=selectedEmail.Frame?selectedEmail.Frame.BodyText||"This message has no readable text.":"This email could not be read. View evidence for details."; $("test").hidden=!selectedEmail.Frame||selectedEmail.Email.ReviewState==="Spam"; $("test-result").textContent="";
  works(); schedule(); $("subject").focus({preventScroll:true,focusVisible:false});
 }
 async function reload(focus) { await load(selectedEmail.Email.ObservationKey); works(); schedule(); if(focus) $("works").querySelector(".ed-decision")?.focus({preventScroll:true}); }
 // The feed worker decides noted email, and learns after a send, in the background. While either is pending the open email
 // is re-read every 10 seconds (one bounded GetEmail read), never while a dialog is open, so no Refresh command is needed.
 function schedule() {
  clearTimeout(pollTimer);
  if(!selectedEmail.Works.some(work=>work.State==="Pending"||work.LearningState==="Pending")) return;
  const key=selectedEmail.Email.ObservationKey;
  pollTimer=setTimeout(()=>run(null,async()=>{ if(location.hash!=="#email/"+encodeURIComponent(key)) return; if(document.querySelector("dialog[open]")) { schedule(); return; } await reload(false); }),10000);
 }
 function works() {
  $("works").replaceChildren(); $("proposals").replaceChildren();
  // Only current decisions. A decision the requeue replaced (Superseded) is history: the evidence view shows it with what
  // it held, never as a second "Send to" beside the new decision (UI-STD-01 Principle 13).
  const current=selectedEmail.Works.filter(work=>work.State!=="Superseded");
  if(!selectedEmail.Frame||selectedEmail.Email.ReviewState==="Spam"||!current.length) { $("works").append(status(selectedEmail.Email.ReviewState)); return; }
  for(const work of current) {
   $("works").append(decision(work));
   // What Confirm sends, after the message, so the decision block stays short.
   if(isConfirmable(work)&&work.Instruction) { const proposal=document.createElement("section"); proposal.className="ed-proposal"; proposal.append(text("h2","What "+work.Destination+" receives"),text("div",work.Instruction,"ed-instruction")); $("proposals").append(proposal); }
  }
 }
 // One work as Matt sees it: the status, where it goes, who decided and why, his notes, learning, and only the commands that apply.
 function decision(work) {
  const state=work.LocalDisposition||work.State, section=document.createElement("section");
  section.className="ed-decision"; section.tabIndex=-1; section.setAttribute("aria-label",EmailDispatchUi.state(state)[0]);
  const head=document.createElement("div"); head.className="ed-decision-head"; head.append(status(state));
  if(work.Destination) head.append(text("span",(work.MessageKey?"Sent to ":"Send to ")+work.Destination,"ed-work-destination"));
  section.append(head,facts([["Decided by",deciders[work.Source]],["Why",work.Source==="Agent"?work.Decision?.Rationale:null],["Learning",learning[work.LearningState]]]));
  if(work.Notes.length) { const list=document.createElement("ul"); list.className="ed-notes"; for(const note of work.Notes) list.append(text("li",note.Text+" · "+date(note.Utc))); section.append(text("p","Your notes","ed-notes-label"),list); }
  const actions=document.createElement("div"); actions.className="ed-actions";
  if(isConfirmable(work)) actions.append(button("Confirm",control=>openConfirm(work,control),true,"fa-check"));
  if(isOpen(work)) actions.append(button("Add a note",control=>openNote(work,control)),button("Pick a session",control=>openPick("send",work,control)));
  if(["Failed","Uncertain"].includes(work.LearningState)) actions.append(button("Retry learning",async()=>{await request(EmailWorks,"RetryLearning",{WorkKey:work.WorkKey});await reload(true);notify("Learning runs again on the next pass.");}));
  if(actions.childElementCount) section.append(actions);
  const secondary=document.createElement("div"); secondary.className="ed-secondary-actions";
  const node=work.LearnedDecision?.TerminalPrototypeName||work.Decision?.TerminalPrototypeName;
  if(work.Source==="Rule"&&work.RuleNode) secondary.append(link("Open rule","#rule/"+encodeURIComponent(work.RuleNode)));
  else if(node) secondary.append(link("Make this a rule","#rule/"+encodeURIComponent(node)));
  if(work.LocalDisposition) secondary.append(button("Restore locally",()=>setDisposition(work,null)));
  else secondary.append(button("Archive locally",()=>setDisposition(work,"Archived")),button("Dismiss locally",()=>setDisposition(work,"Dismissed")));
  section.append(secondary);
  return section;
 }
 async function setDisposition(work,disposition) {await request(EmailWorks,"SetDisposition",{WorkKey:work.WorkKey,Disposition:disposition});await reload(true);notify("Local disposition saved.");}
 function openConfirm(work,control) { actingWork=work; $("confirm-subject").textContent=selectedEmail.Email.Subject||"No subject"; $("confirm-sentence").textContent="Sends this email to "+work.Destination+"."; confirmDialog.open(control); }
 function openNote(work,control) { if(actingWork?.WorkKey!==work.WorkKey) $("note-text").value=""; actingWork=work; $("note-subject").textContent=selectedEmail.Email.Subject||"No subject"; noteDialog.open(control); }
 function openPick(mode,work,control) { pickMode=mode; actingWork=work; picked=null; $("pick-title").textContent=mode==="send"?"Pick a session":"Choose the rule's session"; $("pick-subject").textContent=mode==="send"?(selectedEmail.Email.Subject||"No subject"):selectedRule.EntityName; $("pick-note-field").hidden=mode!=="send"; $("pick-note").value=""; $("pick-search").value=""; $("pick-confirm").lastChild.textContent=mode==="send"?"Send":"Use this session"; pickSelection(); pickDialog.open(control); pickGrid.reset(); }
 function pickSelection() { $("pick-count").textContent=picked?"Selected: "+picked.Name:"No session selected"; $("pick-confirm").disabled=!picked; }
 // Reports the work's new state, so a send the destination did not accept is never described as sent.
 async function finishSend(control,key) { control.close(); await reload(true); const work=selectedEmail.Works.find(value=>value.WorkKey===key); notify(EmailDispatchUi.state(work?.State)[0]+".",work?.State==="Accepted"?"Success":"Warning"); }
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
   region.append(status(work.State),facts([["Reason",work.Reason],["Work identity",work.WorkKey],["Message identity",work.MessageKey],["Destination",work.Destination],["Local disposition",work.LocalDisposition||"None"],["Decision revision",work.DecisionRevision],["Decided by",work.Source],["Rule node",work.RuleNode],["Rule path",work.RulePath?.join(" › ")],["Learning",work.LearningState],["Learning detail",work.LearningDetail],
    // What the legacy requeue replaced (EmailLegacyRequeue): the row's earlier state, processor, destination and reason.
    ["Requeued",work.Requeue&&date(work.Requeue.AtUtc)],["Before the requeue",work.Requeue&&EmailDispatchUi.state(work.Requeue.State)[0]],["Processor before the requeue",work.Requeue?.ProcessorKey],["Destination before the requeue",work.Requeue?.Destination],["Reason before the requeue",work.Requeue?.Reason]]));
   if(work.Requeue?.Instruction) region.append(text("p","Instruction before the requeue","ed-meta"),text("pre",work.Requeue.Instruction,"ed-evidence"));
   if(work.Decision||work.LearnedDecision) region.append(text("pre",JSON.stringify({Decision:work.Decision,LearnedDecision:work.LearnedDecision},null,2),"ed-evidence"));
   if(work.Replay?.length) region.append(text("pre",JSON.stringify(work.Replay,null,2),"ed-evidence"));
   if(work.Instruction) region.append(text("pre",work.Instruction,"ed-evidence"));
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
 async function route() {
  EmailDispatchUi.clearNotice(); clearTimeout(pollTimer); clearTimeout(inboxTimer);
  for(const open of document.querySelectorAll("dialog[open]")) open.close();
  const [name,id]=location.hash.slice(1).split("/");
  if(name==="email"&&id) await openEmail(decodeURIComponent(id));
  else if(name==="rules"){show("rules");rulesGrid.Refresh(true);}
  else if(name==="rule"&&id) await openRule(decodeURIComponent(id));
  else if(name==="evidence"){show("evidence");await evidence();}
  else if(name==="accounts"){show("accounts");await accounts();}
  else {show("inbox");inboxGrid.Refresh(true);scheduleInbox();await accounts();}
 }
 function submit(id,control,action){$(id).addEventListener("submit",event=>{event.preventDefault();run($(control),action);});}
 function click(id,action){$(id).addEventListener("click",()=>run($(id),action));}
 submit("search-form","search-form",()=>inboxGrid.reset());$("state").addEventListener("change",()=>inboxGrid.reset());submit("rule-search-form","rule-search-form",()=>rulesGrid.reset());
 submit("confirm-form","confirm-send",async()=>{await request(EmailWorks,"ConfirmDispatch",{WorkKey:actingWork.WorkKey,ExpectedDecisionRevision:actingWork.DecisionRevision});await finishSend(confirmDialog,actingWork.WorkKey);});
 submit("note-form","note-save",async()=>{await request(EmailWorks,"AddDispatchNote",{WorkKey:actingWork.WorkKey,ExpectedDecisionRevision:actingWork.DecisionRevision,Note:$("note-text").value});$("note-text").value="";noteDialog.close();await reload(true);notify("Note saved. Waiting for the dispatch agent.");});
 $("pick-grid").addEventListener("change",event=>{const input=event.target.closest("input[name=pick-session]");if(!input)return;picked={SessionKey:input.value,Name:input.dataset.name};pickSelection();});
 submit("pick-search-form","pick-search-form",()=>{picked=null;pickSelection();pickGrid.reset();});
 click("pick-confirm",async()=>{
  if(pickMode==="rule"){ruleSession=picked.SessionKey;sessionField();pickDialog.close();return;}
  await request(EmailWorks,"PickSession",{WorkKey:actingWork.WorkKey,ExpectedDecisionRevision:actingWork.DecisionRevision,SessionKey:picked.SessionKey,Note:$("pick-note").value});
  await finishSend(pickDialog,actingWork.WorkKey);
 });
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
