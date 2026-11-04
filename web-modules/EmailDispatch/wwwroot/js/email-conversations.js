"use strict";
// An additive, read-only task view. Search and thread membership are server/provider owned.
(() => {
 const {$,text,escape,request,date,status,PagedGrid,CursorGrid,run}=EmailDispatchUi;
 let threadId="", bodyToken=null, version=0;
 const conversationGrid=new CursorGrid("conversations","conversation-pager","conversation-search",args=>request(EmailObservations,"GetConversations",{AccountKey:"work-main",...args}),items=>`<table class="ed-grid Grid"><thead><tr><th class="ed-sender-cell">From</th><th>Conversation</th><th class="ed-time-cell">Latest incoming</th><th class="ed-state-cell">Reply</th></tr></thead><tbody>${items.map(item=>{const [name,kind]=EmailDispatchUi.state(item.ReplyState);return `<tr data-row-href="#thread/${encodeURIComponent(item.ThreadId)}"><td class="ed-sender-cell">${escape(item.Sender)}</td><td><a href="#thread/${encodeURIComponent(item.ThreadId)}">${escape(item.Subject||"No subject")}</a><span class="ed-cell-secondary">${item.MessageCount} messages</span><span class="ed-cell-secondary ed-mobile-meta">${escape(item.Sender)} · ${escape(date(item.ReceivedUtc))}</span></td><td class="ed-time-cell">${escape(date(item.ReceivedUtc))}</td><td class="ed-state-cell"><span class="ed-status ed-status-${kind}">${escape(name)}</span></td></tr>`;}).join("")}</tbody></table>`,"No conversations match. Change the search.");
 const messagesGrid=new PagedGrid("thread-messages","thread-pager","conversation-search",async args=>{
  const id=threadId;
  const page=await request(EmailObservations,"GetConversation",{AccountKey:"work-main",ThreadId:id,SkipRows:args.SkipRows,NumRows:args.NumRows});
  if(threadId===id){$("thread-subject").textContent=page.Conversation.Subject||"No subject";$("thread-status").replaceChildren(status(page.Conversation.ReplyState));}
  return page;
 },items=>`<table class="ed-grid Grid"><thead><tr><th>Message</th><th class="ed-time-cell">When</th></tr></thead><tbody>${items.map(item=>`<tr data-row-href="#message/${encodeURIComponent(threadId)}/${encodeURIComponent(item.MessageId)}"><td><a href="#message/${encodeURIComponent(threadId)}/${encodeURIComponent(item.MessageId)}">${escape(item.Direction==="Sent"?"You sent this":item.Direction==="Draft"?"Your draft":item.Sender)}</a><span class="ed-cell-secondary">${escape(item.Subject||"No subject")}</span><span class="ed-cell-secondary ed-mobile-meta">${escape(date(item.ReceivedUtc))}</span></td><td class="ed-time-cell">${escape(date(item.ReceivedUtc))}</td></tr>`).join("")}</tbody></table>`,"No messages on this page. Return to conversations.");
 function show(name){document.querySelectorAll(".ed-view").forEach(view=>view.hidden=view.id!=="view-"+name);window.scrollTo(0,0);$("view-"+name).querySelector("h1")?.focus({preventScroll:true,focusVisible:false});}
 EmailDispatchUi.bindEmailFrame($("message-html"),()=>bodyToken);
 async function openMessage(id,messageId,current){
  show("message");$("back-thread").href="#thread/"+encodeURIComponent(id);$("message-subject").textContent="Message";$("message-facts").replaceChildren();
  $("message-loading").textContent="Loading email…";$("message-html").hidden=true;$("message-html").removeAttribute("srcdoc");$("message-text").textContent="";$("message-text").hidden=false;
  const result=await request(EmailObservations,"GetConversationBody",{AccountKey:"work-main",ThreadId:id,MessageId:messageId});
  if(current!==version)return;
  const metadata=result.Message;$("message-subject").textContent=metadata.Subject||"No subject";$("message-facts").append(EmailDispatchUi.details([["From",metadata.Sender],["To",metadata.To],["When",date(metadata.ReceivedUtc)],["Message",metadata.Direction==="Sent"?"Sent":metadata.Direction==="Draft"?"Draft":"Received"]]));
  $("message-loading").textContent="";$("message-text").textContent=result.Text||"This message has no readable text.";
  if(result.Body.HtmlDocument!==null){bodyToken=result.Body.ResizeToken;$("message-html").style.height="600px";$("message-html").srcdoc=result.Body.HtmlDocument;$("message-html").hidden=false;$("message-text").hidden=true;}
 }
 async function route(){
  const current=++version;bodyToken=null;EmailDispatchUi.clearNotice();conversationGrid.cancelSearch();messagesGrid.cancelSearch();
  const [name,id,messageId]=location.hash.slice(1).split("/");
  if(name==="thread"&&id){threadId=decodeURIComponent(id);show("conversation");$("thread-subject").textContent="Conversation";$("thread-status").replaceChildren();messagesGrid.reset();}
  else if(name==="message"&&id&&messageId)await openMessage(decodeURIComponent(id),decodeURIComponent(messageId),current);
  else{show("conversations");conversationGrid.Refresh(true);}
 }
 $("conversation-search-form").addEventListener("submit",event=>{event.preventDefault();conversationGrid.reset();});
 window.addEventListener("hashchange",()=>run(null,route));run(null,route);
})();
