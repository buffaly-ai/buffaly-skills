"use strict";
(() => {
 const {$,text,escape,link,notify,run,request,button,status,date,facts,listItem,PagedGrid}=EmailDispatchUi;
 let selectedEmail=null, selectedRule=null, selectedTree=null, routingWork=null, sendingWork=null, pendingSession=null;
 let treeParent="DispatchMemoryRoot", treeSkip=0, recentTree=[];
 const ruleName=rule=>rule.NodeId==="EmailPolicy_DirectClient"?"Direct client correspondence":rule.NodeId==="EmailPolicy_Dmarc"?"DMARC aggregate reports":rule.Name;
 const behavior = rule => {
  if(rule.Outcome==="ExistingProcessor") return rule.Destination||"Process DMARC reports";
  if(rule.Outcome==="AgentSuggestion") return "Prepare suggestions";
  if(rule.Outcome==="Notice") return rule.Children.length?"OpenAI task routing":"Record notice";
  return "Review routing";
 };
 function show(name) { document.querySelectorAll(".ed-view").forEach(view=>view.hidden=view.id!=="view-"+name); const nav = ["email","send","inbox","evidence"].includes(name)?"inbox":["rule","source","rule-new"].includes(name)?"rules":["tree","session"].includes(name)?"routing":name; document.querySelectorAll(".ed-nav a").forEach(a=>a.toggleAttribute("aria-current",a.hash==="#"+nav)); document.querySelectorAll('.ed-nav a[aria-current]').forEach(a=>a.setAttribute("aria-current","page")); window.scrollTo(0,0); const heading=$("view-"+name).querySelector("h1"); heading?.focus({preventScroll:true,focusVisible:false}); }
 const inboxGrid=new PagedGrid("inbox","inbox-pager","search", args=>request(EmailObservations,"GetInbox",{AccountKey:"work-main",State:$("state").value,...args}), items=>`<table class="ed-grid Grid"><thead><tr><th class="ed-sender-cell">From</th><th>Email</th><th class="ed-time-cell">Received</th><th class="ed-state-cell">Status</th></tr></thead><tbody>${items.map(item=>{const [name,kind]=EmailDispatchUi.state(item.ReviewState);return `<tr><td class="ed-sender-cell"><span class="ed-cell-secondary" title="${escape(item.Sender)}">${escape(item.Sender)}</span></td><td><a href="#email/${encodeURIComponent(item.ObservationKey)}" title="${escape(item.Subject)}">${escape(item.Subject||"No subject")}</a><span class="ed-cell-secondary ed-mobile-meta">${escape(item.Sender)} · ${escape(date(item.ReceivedUtc))}</span></td><td class="ed-time-cell">${escape(date(item.ReceivedUtc))}</td><td class="ed-state-cell"><span class="ed-status ed-status-${kind}">${escape(name)}</span></td></tr>`;}).join("")}</tbody></table>`,"No emails match. Change the search or filter.");
 const rulesGrid=new PagedGrid("program","rule-pager","rule-search",args=>request(EmailObservations,"GetRulePage",args),items=>`<table class="ed-grid ed-grid-rules Grid"><thead><tr><th class="ed-rule-name">Rule</th><th>What happens</th><th class="ed-rule-state">Status</th></tr></thead><tbody>${items.map(rule=>`<tr><td><a href="#rule/${encodeURIComponent(rule.NodeId)}" title="${escape(ruleName(rule))}">${escape(ruleName(rule))}</a></td><td class="ed-rule-behavior">${escape(behavior(rule))}</td><td><span class="ed-status ed-status-${rule.Enabled?"success":"neutral"}">${escape(rule.Status)}</span></td></tr>`).join("")}</tbody></table>`,`No rules match. <a href="#rule-new">New rule</a>`);
 async function accounts() {
  const values=await request(EmailSyncAccounts,"GetAccounts",{}); $("accounts").replaceChildren();
  for(const account of values) { const section=document.createElement("section"); section.append(text("h2",account.Email),facts([["Connection",account.Available?"Connected":"Unavailable — reauthorization required"],["Synchronization",account.Phase==="Current"?"Up to date":account.Phase],["Captured emails",account.EnumeratedCount],["Mailbox","Work account only"]])); $("accounts").append(section); $("sync-status").textContent=account.Available?(account.Phase==="Current"?"Gmail up to date":"Gmail synchronizing"):"Gmail unavailable"; $("sync-status").className="ed-status ed-status-"+(account.Available?"success":"warning"); $("synchronize").disabled=!account.Available; }
  $("sync-evidence").textContent=JSON.stringify(values,null,2);
 }
 async function openEmail(key) {
  selectedEmail=await request(EmailObservations,"GetEmail",{ObservationKey:key}); show("email");
  $("subject").textContent=selectedEmail.Email.Subject||"No subject"; $("sender").textContent=selectedEmail.Email.Sender; $("received").textContent=date(selectedEmail.Email.ReceivedUtc); $("body").textContent=selectedEmail.Frame.BodyText||"No readable message body."; $("test-result").textContent=""; works(); $("subject").focus({preventScroll:true,focusVisible:false});
 }
 async function refreshEmail() { await openEmail(selectedEmail.Email.ObservationKey); }
  function works() {
   $("works").replaceChildren();$("proposals").replaceChildren();
   if(!selectedEmail.Works.length) { $("works").append(status("Unclassified")); return; }
   for(const work of selectedEmail.Works) {
    const section=document.createElement("section");section.className="ed-work-commands";section.setAttribute("aria-label",EmailDispatchUi.state(work.State)[0]+(work.Destination?" · "+work.Destination:""));section.append(status(work.LocalDisposition||work.State));
    if(work.Destination) section.append(text("span",work.Destination,"ed-work-destination"));
    if(work.ProposedWork) {const proposal=document.createElement("section");proposal.className="ed-proposal";proposal.append(text("h2",work.Destination?"Proposed work · "+work.Destination:"Proposed work"),text("div",work.ProposedWork,"ed-instruction"));$("proposals").append(proposal);}
   const actions=document.createElement("div");actions.className="ed-actions";
   if(["AgentEvaluationRequired","PreparationFailed"].includes(work.State)) actions.append(button("Prepare suggestions",async()=>{notify("Preparing suggestions…");await request(EmailWorks,"PrepareSuggestion",{WorkKey:work.WorkKey});await refreshEmail();notify("Suggestions saved for review.");},true));
   if(["NeedsReview","Suggested"].includes(work.State)) actions.append(button(work.Destination?"Change destination":"Choose destination",async()=>{routingWork=work;treeParent="DispatchMemoryRoot";treeSkip=0;$("tree-search").value="";location.hash="#routing";},!work.Destination));
   if(["Suggested","AutomaticReady"].includes(work.State)&&work.Destination) actions.append(button("Review delivery",()=>{sendingWork=work;location.hash="#send";},true));
    if(work.LocalDisposition) actions.append(button("Restore locally",async()=>setDisposition(work,null)));
   else { actions.append(button("Archive locally",async()=>setDisposition(work,"Archived")),button("Dismiss locally",async()=>setDisposition(work,"Dismissed"))); }
   section.append(actions);$("works").append(section);
  }
 }
 async function setDisposition(work,disposition) {await request(EmailWorks,"SetDisposition",{WorkKey:work.WorkKey,Disposition:disposition});await refreshEmail();notify("Local disposition saved.");}
 async function openRule(id,sourceMode) {
  if(sourceMode) { selectedRule=await request(EmailObservations,"GetPolicyNode",{NodeId:id});show("source");$("source").value=selectedRule.Source;$("source-back").href=id==="EmailPolicyRoot"?"#rules":"#rule/"+id;$("source-title").textContent=id==="EmailPolicyRoot"?"Edit rule order":"Advanced rule source";return; }
  selectedRule=await request(EmailObservations,"GetRuleEditor",{NodeId:id});show("rule");$("editor-title").textContent=selectedRule.Name;$("rule-name").value=selectedRule.Name;$("rule-enabled").value=String(selectedRule.Enabled);$("rule-matches").value=selectedRule.Matches;$("advanced-source").href="#source/"+id;$("rule-test-form").hidden=true;
  const rules=await request(EmailObservations,"GetProgram",{});const rule=rules.find(value=>value.NodeId===id);$("rule-behavior").textContent=rule?"Then: "+behavior(rule):"";
 }
 async function treeNodes() {
  $("tree-results").replaceChildren(text("p","Loading routing…","ed-empty"));
  const nodes=await request(EmailObservations,"FindTreeNodes",{Search:$("tree-search").value,ParentNodeId:treeParent,SkipRows:treeSkip,NumRows:25});$("tree-results").replaceChildren();
  for(const node of nodes) $("tree-results").append(listItem(node.Name,node.WorkSession?"Owner: "+node.WorkSession:"No owning session — delivery held","#tree/"+encodeURIComponent(node.NodeId)));
  if(!nodes.length)$("tree-results").append(text("p","No routing nodes match. Change your search or go up one level.","ed-empty"));
  $("tree-more").hidden=nodes.length<25;$("tree-previous").hidden=treeSkip===0;
  $("tree-back").hidden=!treeParent||treeParent==="DispatchMemoryRoot";
 }
 async function openTree(id) {
  selectedTree=await request(EmailObservations,"GetTreeNode",{NodeId:id});show("tree");$("tree-title").textContent=selectedTree.Name;$("tree-name").value=selectedTree.Name;$("tree-context").value=selectedTree.Context;$("tree-destination").textContent=selectedTree.WorkSession?"Owning session: "+selectedTree.WorkSession:"No owning session — delivery is held.";$("route-selection").hidden=!routingWork;$("use-destination").disabled=!selectedTree.WorkSession;
  $("tree-context-form").hidden=!!routingWork;$("tree-path").replaceChildren();
  for(const pathId of selectedTree.Path){const node=await request(EmailObservations,"GetTreeNode",{NodeId:pathId});$("tree-path").append(link(node.Name,"#tree/"+pathId));}
  recentTree=[selectedTree,...recentTree.filter(node=>node.NodeId!==id)].slice(0,5);$("tree-recent").replaceChildren(text("span","Recent:","ed-meta"));for(const node of recentTree)$("tree-recent").append(link(node.Name,"#tree/"+node.NodeId));
  $("tree-title").focus({preventScroll:true,focusVisible:false});
 }
 async function evidence() {
  await accounts(); const summary=await request(EmailWorks,"GetReviewSummary",{});$("outcomes").replaceChildren();
  const list=document.createElement("dl");list.className="ed-facts";for(const outcome of summary.Outcomes)list.append(text("dt",EmailDispatchUi.state(outcome.Outcome)[0]),text("dd",outcome.Count));$("outcomes").append(list);
  $("receipt-results").replaceChildren();$("evidence-empty").hidden=!!selectedEmail;
   if(selectedEmail){$("receipt-results").append(text("h3",selectedEmail.Email.Subject)); for(const work of selectedEmail.Works){const region=document.createElement("section");region.className="ed-region";region.append(status(work.State),facts([["Reason",work.Reason],["Work identity",work.WorkKey],["Message identity",work.MessageKey],["Destination",work.Destination],["Local disposition",work.LocalDisposition||"None"],["Policy revision",work.PolicyRevision],["Proposal revision",work.ProposalRevision]]));if(work.Instruction)region.append(text("pre",work.Instruction,"ed-evidence"));if(work.Delivery)region.append(text("pre",JSON.stringify(work.Delivery,null,2),"ed-evidence"));else region.append(text("p","No delivery receipt.","ed-meta"));$("receipt-results").append(region);}}
 }
 async function route() {
  const [name,id]=location.hash.slice(1).split("/");
  if(name==="email"&&id) await openEmail(decodeURIComponent(id));
  else if(name==="rules"){show("rules");rulesGrid.Refresh(true);}
  else if(name==="rule"&&id)await openRule(decodeURIComponent(id),false);
  else if(name==="source"&&id)await openRule(decodeURIComponent(id),true);
  else if(name==="rule-new"){show("rule-new");$("new-rule-name").value="";}
  else if(name==="routing"){show("routing");await treeNodes();}
  else if(name==="tree"&&id)await openTree(decodeURIComponent(id));
  else if(name==="session"&&selectedTree){show("session");$("session-back").href="#tree/"+selectedTree.NodeId;$("session-current").textContent=selectedTree.Name+" · "+(selectedTree.WorkSession||"No owning session");$("session-confirm").hidden=true;$("assign-session").textContent="Assign session";$("destination-results").replaceChildren();$("destination-clear").hidden=!selectedTree.WorkSession;}
  else if(name==="evidence"){show("evidence");await evidence();}
  else if(name==="accounts"){show("accounts");await accounts();}
   else if(name==="send"&&sendingWork){show("send");$("send-facts").replaceChildren(facts([["Email",selectedEmail.Email.Subject],["Destination",sendingWork.Destination]]));$("send-instruction").textContent=sendingWork.ProposedWork||"Run the matched processor for this email.";$("send-back").href="#email/"+selectedEmail.Email.ObservationKey;}
  else {show("inbox");inboxGrid.Refresh(true);await accounts();}
 }
 function submit(id,control,action){$(id).addEventListener("submit",event=>{event.preventDefault();run($(control),action);});}
 function click(id,action){$(id).addEventListener("click",()=>run($(id),action));}
 click("new-rule",()=>{location.hash="#rule-new";});
 submit("search-form","search-form",()=>inboxGrid.reset());$("state").addEventListener("change",()=>inboxGrid.reset());submit("rule-search-form","rule-search-form",()=>rulesGrid.reset());
 submit("rule-form","save-rule",async()=>{selectedRule=await request(EmailObservations,"SaveRuleEditor",{NodeId:selectedRule.NodeId,ExpectedRevision:selectedRule.Revision,Name:$("rule-name").value,Enabled:$("rule-enabled").value==="true",Matches:$("rule-matches").value});$("rule-name").value=selectedRule.Name;$("rule-matches").value=selectedRule.Matches;$("editor-title").textContent=selectedRule.Name;notify("Rule saved and read back.");});
 click("cancel-rule",()=>{location.hash="#rules";});
 submit("source-form","save",async()=>{selectedRule=await request(EmailObservations,"SavePolicyNode",{NodeId:selectedRule.NodeId,ExpectedRevision:selectedRule.Revision,Source:$("source").value});$("source").value=selectedRule.Source;notify("Saved and read back the authoritative source.");});
 click("cancel",()=>{location.hash=selectedRule.NodeId==="EmailPolicyRoot"?"#rules":"#rule/"+selectedRule.NodeId;});
 submit("add-rule-form","add-rule",async()=>{const root=await request(EmailObservations,"GetPolicyRoot",{});const result=await request(EmailObservations,"AddPolicyChild",{ParentId:root.NodeId,ExpectedRevision:root.Revision,ChildId:"EmailPolicy_User_"+crypto.randomUUID().replaceAll("-",""),EntityName:$("new-rule-name").value});notify("Disabled draft created.");location.hash="#rule/"+result.NodeId;});
 async function testPolicy(key,target){const result=await request(EmailObservations,"TestPolicy",{ObservationKey:key});const labels={ProcessorSelected:"Existing processor matched",AgentEvaluationRequired:"Suggestions required",Notice:"Notice only",Disabled:"Rule is off",Unclassified:"No saved rule matched",NeedsReview:"Needs review",Conflict:"Conflicting rules",Error:"Rule check failed"};$(target).textContent=`${labels[result.Status]||"Rule check completed"}. No work was executed.`;}
 click("test",()=>testPolicy(selectedEmail.Email.ObservationKey,"test-result"));click("rule-test",()=>{$("rule-test-form").hidden=false;$("rule-email-search").focus();});
 submit("rule-test-form","rule-test",async()=>{const page=await request(EmailObservations,"GetInbox",{AccountKey:"work-main",State:"",Search:$("rule-email-search").value,SkipRows:0,NumRows:10});$("rule-email-results").replaceChildren();for(const email of page.Items)$("rule-email-results").append(button(email.Subject,()=>testPolicy(email.ObservationKey,"rule-test-result")));if(!page.Items.length)$("rule-email-results").append(text("p","No matching email.","ed-empty"));});
 submit("tree-search-form","tree-search-form",async()=>{treeParent="";treeSkip=0;await treeNodes();});click("tree-previous",async()=>{treeSkip=Math.max(0,treeSkip-25);await treeNodes();});click("tree-more",async()=>{treeSkip+=25;await treeNodes();});click("tree-back",async()=>{treeParent=selectedTree?.Path.at(-2)||"DispatchMemoryRoot";treeSkip=0;$("tree-search").value="";await treeNodes();});
 submit("tree-context-form","tree-save",async()=>{selectedTree=await request(EmailObservations,"SaveTreeContext",{NodeId:selectedTree.NodeId,ExpectedRevision:selectedTree.Revision,Name:$("tree-name").value,Context:$("tree-context").value});await openTree(selectedTree.NodeId);notify("Context saved and read back.");});
 click("tree-cancel",()=>{location.hash="#routing";});$("browse-children").addEventListener("click",()=>{treeParent=selectedTree.NodeId;treeSkip=0;$("tree-search").value="";});
 click("cancel-routing",()=>{routingWork=null;location.hash="#email/"+selectedEmail.Email.ObservationKey;});click("use-destination",async()=>{await request(EmailWorks,"SelectRoutingNode",{WorkKey:routingWork.WorkKey,ExpectedProposalRevision:routingWork.ProposalRevision,NodeId:selectedTree.NodeId});routingWork=null;await refreshEmail();location.hash="#email/"+selectedEmail.Email.ObservationKey;notify("Destination selected. No work was sent.");});
 submit("destination-search-form","destination-search-form",async()=>{const rows=await request(EmailObservations,"FindDestinations",{Search:$("destination-search").value,SkipRows:0,NumRows:25});$("destination-results").replaceChildren();for(const destination of rows)$("destination-results").append(button(destination.Name,()=>{pendingSession=destination;$("session-confirm-title").textContent=destination.Name;$("session-confirm-purpose").textContent=destination.Purpose||"Assign this session as the node's work owner.";$("session-confirm").hidden=false;$("assign-session").focus();}));if(!rows.length)$("destination-results").append(text("p","No sessions match.","ed-empty"));});
 click("cancel-session",()=>{$("session-confirm").hidden=true;});click("assign-session",async()=>{selectedTree=await request(EmailObservations,"SetWorkSession",{NodeId:selectedTree.NodeId,ExpectedRevision:selectedTree.Revision,SessionKey:pendingSession.SessionKey});notify("Owning session saved.");location.hash="#tree/"+selectedTree.NodeId;});
 click("destination-clear",()=>{pendingSession={SessionKey:"",Name:"Remove owning session"};$("session-confirm-title").textContent="Remove owning session?";$("session-confirm-purpose").textContent="Work for this node will remain held until an owner is assigned.";$("session-confirm").hidden=false;$("assign-session").textContent="Remove session";});
 click("synchronize",async()=>{notify("Synchronizing Gmail. No dispatch work will run.");await request(EmailSyncAccounts,"Synchronize",{AccountKey:"work-main"});await accounts();notify("Gmail synchronization saved.");});click("process",async()=>{await request(EmailWorks,"ProcessCaptured",{AccountKey:"work-main"});await evidence();notify("Saved deterministic classifications. No work was delivered.");});
 click("send-cancel",()=>{location.hash="#email/"+selectedEmail.Email.ObservationKey;sendingWork=null;});click("send-confirm",async()=>{await request(EmailWorks,"SendApproved",{WorkKey:sendingWork.WorkKey,ExpectedPolicyRevision:sendingWork.PolicyRevision,ExpectedProposalRevision:sendingWork.ProposalRevision});sendingWork=null;location.hash="#email/"+selectedEmail.Email.ObservationKey;notify("Delivery acceptance saved.");});
 window.addEventListener("hashchange",()=>run(null,route));run(null,route);
})();
