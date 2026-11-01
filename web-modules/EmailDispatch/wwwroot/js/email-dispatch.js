"use strict";
(() => {
 const $ = id => document.getElementById(id);
 let selectedRule = null, selectedEmail = null, skip = 0;
 let selectedTree = null, treeParent = "DispatchMemoryRoot", treeSkip = 0, recentTree = [];
 const notify = text => { $("status").textContent = text; };
 async function run(button, action) { if (button) button.disabled = true; try { await action(); } catch (error) { notify("The operation failed. Your input has been kept. " + (error?.Error || error?.message || "Reload the saved data and try again.")); } finally { if (button) button.disabled = false; } }
 function button(label, action, primary = false) { const b = document.createElement("button"); b.type = "button"; b.className = "btn " + (primary ? "btn-primary" : "btn-secondary") + " m-1"; b.textContent = label; b.addEventListener("click", () => run(b, action)); return b; }
 function text(tag, value) { const e = document.createElement(tag); e.textContent = value; return e; }
 async function accounts() {
  const values = await EmailSyncAccounts.GetAccountsObjectAsync({}); $("accounts").replaceChildren();
  for (const a of values) { const section = document.createElement("section"); section.className = "mb-3"; section.append(text("h3", a.Email), text("p", a.Available ? `${a.Phase} · ${a.EnumeratedCount} emails captured across ${a.PageCount} pages` : "Unavailable — this account needs reauthorization."));
   if (a.WindowStartUtc) section.append(text("p", `Window: ${DateUtil ? new Date(a.WindowStartUtc).toLocaleString() : a.WindowStartUtc} — ${new Date(a.WindowEndUtc).toLocaleString()}`));
   if (a.Available) section.append(button("Synchronize Gmail", async () => { notify("Synchronizing this account; no dispatch effects run."); await EmailSyncAccounts.SynchronizeObjectAsync({ AccountKey: a.AccountKey }); await accounts(); await inbox(); notify("Gmail synchronization saved."); }, true)); $("accounts").append(section);
  }
 }
 async function program() {
  const values = await EmailObservations.GetProgramObjectAsync({}); $("program").replaceChildren();
  for (const rule of values) { const line = document.createElement("div"); line.className = "border-bottom py-2"; line.append(text("span", `${rule.Name} · ${rule.Enabled ? rule.Outcome : "Disabled"}${rule.Destination ? " · " + rule.Destination : ""}`), button("Edit", async () => { selectedRule = await EmailObservations.GetPolicyNodeObjectAsync({ NodeId: rule.NodeId }); $("editor-title").textContent = rule.Name; $("source").value = selectedRule.Source; $("editor").hidden = false; $("source").focus(); })); $("program").append(line); }
 }
 async function inbox() {
  const summary = await EmailWorks.GetReviewSummaryObjectAsync({}); $("outcomes").replaceChildren();
  for(const item of summary.Outcomes) $("outcomes").append(text("p", `${item.Outcome.replace(/([a-z])([A-Z])/g,"$1 $2")} — ${item.Count}`));
  const page = await EmailObservations.GetInboxObjectAsync({ AccountKey: "work-main", State: "", Search: $("search").value, SkipRows: skip, NumRows: 25 }); $("inbox").replaceChildren();
  if (!page.Items.length) $("inbox").append(text("p", "No captured emails match. Synchronize Gmail or change your search."));
  for (const item of page.Items) { const line = document.createElement("div"); line.className = "border-bottom py-2"; line.append(text("p", item.Sender), button(item.Subject || "No subject", async () => { selectedEmail = await EmailObservations.GetEmailObjectAsync({ ObservationKey: item.ObservationKey }); $("email").hidden = false; $("subject").textContent = item.Subject; $("sender").textContent = item.Sender; $("body").textContent = selectedEmail.Frame.BodyText; $("test-result").textContent = ""; works(); $("subject").scrollIntoView({ block: "start" }); })); $("inbox").append(line); } $("more").hidden = !page.HasMore;
 }
 async function refreshEmail() { selectedEmail = await EmailObservations.GetEmailObjectAsync({ ObservationKey: selectedEmail.Email.ObservationKey }); works(); }
 function works() {
  $("works").replaceChildren();
  const names = { AgentEvaluationRequired: "Ready to prepare suggestions", PreparationFailed: "Preparation failed", Prepared: "Suggestions prepared", NeedsReview: "Needs routing review", Suggested: "Proposed work — not sent", PreviouslyHandled: "Existing processing evidence — held", DeliveryUnknown: "Delivery uncertain — do not resend", Accepted: "Accepted by destination", Unclassified: "No matching rule", AutomaticReady: "Existing processor ready" };
  for (const w of selectedEmail.Works) {
   const section = document.createElement("section"); section.className="py-3 border-bottom";
   section.append(text("h3", names[w.State] || w.State), text("p", w.Reason || ""));
   if(w.Destination) section.append(text("p", "Destination: " + w.Destination));
    if(w.Instruction) { const instruction = text("pre",w.Instruction); instruction.className = "text-wrap"; section.append(instruction); }
   if(w.Delivery) section.append(text("p", "Delivery: " + w.Delivery.Status + (w.Delivery.Accepted ? " — accepted admission, not completed work." : " — no completion is inferred.")));
   if(["AgentEvaluationRequired","PreparationFailed"].includes(w.State)) section.append(button("Prepare suggestions — no delivery", async()=>{notify("Preparing bounded frames against the shared tree; no work will be sent.");await EmailWorks.PrepareSuggestionObjectAsync({WorkKey:w.WorkKey});await refreshEmail();notify("Suggestions saved for review.");},true));
   if(["NeedsReview","Suggested"].includes(w.State) && selectedTree?.WorkSession) section.append(button("Use selected tree destination",async()=>{await EmailWorks.SelectRoutingNodeObjectAsync({WorkKey:w.WorkKey,ExpectedProposalRevision:w.ProposalRevision,NodeId:selectedTree.NodeId});await refreshEmail();notify("Routing selected. Review the instruction before Send.");}));
   if(["Suggested","AutomaticReady"].includes(w.State) && w.Destination) section.append(button("Approve and send to " + w.Destination,async()=>{await EmailWorks.SendApprovedObjectAsync({WorkKey:w.WorkKey,ExpectedPolicyRevision:w.PolicyRevision,ExpectedProposalRevision:w.ProposalRevision});await refreshEmail();notify("Actual admission receipt saved. Acceptance is not completed work.");},true));
   if (w.LocalDisposition) section.append(text("p", w.LocalDisposition));
   for (const [label, disposition] of [["Dismiss locally", "Dismissed"], ["Archive locally", "Archived"], ["Restore locally", null]]) section.append(button(label, async () => { await EmailWorks.SetDispositionObjectAsync({ WorkKey: w.WorkKey, Disposition: disposition }); await refreshEmail(); notify("Local disposition saved. Gmail and delivery receipts were not changed."); }));
   $("works").append(section);
  }
 }
  $("edit-policy-root").addEventListener("click", () => run($("edit-policy-root"), async () => { selectedRule = await EmailObservations.GetPolicyRootObjectAsync({}); $("editor-title").textContent = "Edit rule hierarchy"; $("source").value = selectedRule.Source; $("editor").hidden = false; $("source").focus(); }));
  $("add-rule-form").addEventListener("submit", e => { e.preventDefault(); run($("add-rule"), async () => { const root = await EmailObservations.GetPolicyRootObjectAsync({}); selectedRule = await EmailObservations.AddPolicyChildObjectAsync({ ParentId: root.NodeId, ExpectedRevision: root.Revision, ChildId: "EmailPolicy_User_" + crypto.randomUUID().replaceAll("-", ""), EntityName: $("new-rule-name").value }); $("editor-title").textContent = $("new-rule-name").value; $("source").value = selectedRule.Source; $("editor").hidden = false; await program(); notify("Disabled rule saved. Edit its condition and outcome before enabling it."); }); });
  $("source-form").addEventListener("submit", e => { e.preventDefault(); run($("save"), async () => { selectedRule = await EmailObservations.SavePolicyNodeObjectAsync({ NodeId: selectedRule.NodeId, ExpectedRevision: selectedRule.Revision, Source: $("source").value }); $("source").value = selectedRule.Source; await program(); notify("Saved and read back the authoritative source."); }); });
 $("cancel").addEventListener("click", () => { $("editor").hidden = true; selectedRule = null; });
 $("search-form").addEventListener("submit", e => { e.preventDefault(); skip = 0; run(null, inbox); });
 $("process").addEventListener("click",()=>run($("process"),async()=>{await EmailWorks.ProcessCapturedObjectAsync({AccountKey:"work-main"});await inbox();notify("Saved deterministic classifications. No delivery ran.");}));
 $("more").addEventListener("click", () => { skip += 25; run($("more"), inbox); });
 $("test").addEventListener("click", () => run($("test"), async () => { const result = await EmailObservations.TestPolicyObjectAsync({ ObservationKey: selectedEmail.Email.ObservationKey }); $("test-result").textContent = `${result.Status} · ${result.Path.join(" → ")}${result.Diagnostic ? " · " + result.Diagnostic : ""}. No work was executed.`; }));
 async function treeNodes() {
  const nodes = await EmailObservations.FindTreeNodesObjectAsync({ Search: $("tree-search").value, ParentNodeId: treeParent, SkipRows: treeSkip, NumRows: 25 });
   $("tree-results").replaceChildren();
   if($("tree-search").value) {
    const rules=await EmailObservations.FindPolicyNodesObjectAsync({Search:$("tree-search").value,SkipRows:treeSkip,NumRows:25});
    for(const rule of rules) $("tree-results").append(button("Rule: "+rule.Name,async()=>{selectedRule=await EmailObservations.GetPolicyNodeObjectAsync({NodeId:rule.NodeId});$("editor-title").textContent=rule.Name;$("source").value=selectedRule.Source;$("editor").hidden=false;$("source").focus();}));
   }
   for (const n of nodes) $("tree-results").append(button(n.Name, () => openTree(n.NodeId)));
   if (!$("tree-results").children.length) $("tree-results").append(text("p", "No matching rules or work nodes. Change your search or go back."));
  $("tree-more").hidden = nodes.length < 25;
 }
 async function openTree(id) {
  selectedTree = await EmailObservations.GetTreeNodeObjectAsync({ NodeId: id }); treeParent = id; treeSkip = 0;
  $("tree-title").textContent = selectedTree.Name; $("tree-name").value = selectedTree.Name; $("tree-context").value = selectedTree.Context;
  $("tree-destination").textContent = selectedTree.WorkSession ? "Work session: " + selectedTree.WorkSession : "Unbound — work is held until a destination is assigned.";
  $("tree-editor").hidden = false; $("tree-path").replaceChildren();
  for (const pathId of selectedTree.Path) { const n = await EmailObservations.GetTreeNodeObjectAsync({ NodeId: pathId }); $("tree-path").append(button(n.Name, () => openTree(pathId))); }
  recentTree = [selectedTree, ...recentTree.filter(n => n.NodeId !== id)].slice(0, 6); $("tree-recent").replaceChildren(text("p", "Recently viewed"));
  for (const n of recentTree) $("tree-recent").append(button(n.Name, () => openTree(n.NodeId)));
  await treeNodes(); $("tree-title").setAttribute("tabindex", "-1"); $("tree-title").focus();
 }
 $("tree-search-form").addEventListener("submit", e => { e.preventDefault(); treeParent = ""; treeSkip = 0; run(null, treeNodes); });
 $("tree-back").addEventListener("click", () => run($("tree-back"), () => openTree(selectedTree?.Path.at(-2) || "DispatchMemoryRoot")));
 $("tree-more").addEventListener("click", () => { treeSkip += 25; run($("tree-more"), treeNodes); });
 $("tree-context-form").addEventListener("submit", e => { e.preventDefault(); run($("tree-save"), async () => { selectedTree = await EmailObservations.SaveTreeContextObjectAsync({ NodeId: selectedTree.NodeId, ExpectedRevision: selectedTree.Revision, Name: $("tree-name").value, Context: $("tree-context").value }); await openTree(selectedTree.NodeId); notify("Context saved and read back from canonical ProtoScript."); }); });
 $("destination-search-form").addEventListener("submit", e => { e.preventDefault(); run(null, async () => { const rows = await EmailObservations.FindDestinationsObjectAsync({ Search: $("destination-search").value, SkipRows: 0, NumRows: 25 }); $("destination-results").replaceChildren(); for (const d of rows) $("destination-results").append(button("Assign " + d.Name, async () => { selectedTree = await EmailObservations.SetWorkSessionObjectAsync({ NodeId: selectedTree.NodeId, ExpectedRevision: selectedTree.Revision, SessionKey: d.SessionKey }); await openTree(selectedTree.NodeId); notify("Work session saved. Other attachments and examples were preserved."); })); }); });
 $("destination-clear").addEventListener("click", () => run($("destination-clear"), async () => { selectedTree = await EmailObservations.SetWorkSessionObjectAsync({ NodeId: selectedTree.NodeId, ExpectedRevision: selectedTree.Revision, SessionKey: "" }); await openTree(selectedTree.NodeId); notify("Work session cleared; other attachments remain."); }));
 run(null, async () => { await accounts(); await program(); await treeNodes(); await inbox(); notify("Loaded saved policy, canonical tree and durable Gmail observations."); });
})();
