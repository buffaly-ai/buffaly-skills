(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const base = '/api/web-modules/CSharpViewer/';
  function escapeHtml(value){return value.replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))}
  function highlight(source){let output='',index=0;const token=/(\/\*[\s\S]*?\*\/|\/\/[^\n]*|@?"(?:""|\\.|[^"\\])*"|'(?:\\.|[^'\\])+'|\b\d+(?:\.\d+)?\b|\b(?:abstract|as|async|await|base|bool|break|byte|case|catch|char|checked|class|const|continue|decimal|default|delegate|do|double|else|enum|event|explicit|extern|false|finally|fixed|float|for|foreach|goto|if|implicit|in|int|interface|internal|is|lock|long|namespace|new|null|object|operator|out|override|params|partial|private|protected|public|readonly|record|ref|required|return|sbyte|sealed|short|sizeof|stackalloc|static|string|struct|switch|this|throw|true|try|typeof|uint|ulong|unchecked|unsafe|ushort|using|var|virtual|void|volatile|while|with|yield)\b)/g;for(const match of source.matchAll(token)){output+=escapeHtml(source.slice(index,match.index));const text=match[0];let cls='kw';if(text.startsWith('//')||text.startsWith('/*'))cls='comment';else if(text.startsWith('"')||text.startsWith('@"')||text.startsWith("'"))cls='str';else if(/^\d/.test(text))cls='num';output+=`<span class="${cls}">${escapeHtml(text)}</span>`;index=match.index+text.length}return output+escapeHtml(source.slice(index))}
  const state = { scope:null, generation:0, tree:[], files:[], current:null, tabs:[], history:[], historyIndex:-1,
    searchId:0, fileId:0, treeId:0, browseId:0, mode:'files', results:[], resultIndex:0, folder:'', ready:false,
    matches:[], matchIndex:-1, focus:false, fullscreenOwned:false, positions:{} };
  let timer;
  function status(message,error=false){ $('status').textContent=message; $('status').dataset.error=String(error); }
  async function api(route,parameters={}){
    const response=await fetch(base+route+'?'+new URLSearchParams(parameters),{headers:{Accept:'application/json'}});
    if(!response.ok){ const body=await response.json().catch(()=>null); throw new Error(body?.ErrorMessage||`Request failed (${response.status})`); }
    return response.json();
  }
  function report(error){status(error.message,true);}
  function button(label,action){const node=document.createElement('button');node.type='button';node.textContent=label;node.addEventListener('click',action);return node;}
  function fileParameters(path){return state.scope.sessionKey?{sessionKey:state.scope.sessionKey,path}:{rootId:state.scope.rootId,projectPath:state.scope.projectPath,path};}
  function fileRoute(){return state.scope.sessionKey?'session-file':'project-file';}
  function sameScope(a,b){return JSON.stringify(a)===JSON.stringify(b);}
  function allFiles(nodes){return nodes.flatMap(node=>node.kind==='file'?[node]:allFiles(node.children||[]));}
  function locationRecord(path,line=1){return {path,line};}
  function updateNavigation(){ $('nav-back').disabled=state.historyIndex<=0; $('nav-forward').disabled=state.historyIndex>=state.history.length-1; }
  function remember(path,line){
    const last=state.history[state.historyIndex];
    if(!last||last.path!==path||last.line!==line){state.history.splice(state.historyIndex+1);state.history.push(locationRecord(path,line));state.historyIndex=state.history.length-1;}
    updateNavigation();
  }
  function updateLink(path,line){
    const url=new URL(location.href);url.search='';
    if(state.scope.sessionKey){url.searchParams.set('sessionKey',state.scope.sessionKey);url.searchParams.set('file','artifacts/'+path);}
    else {url.searchParams.set('root',state.scope.rootId);if(state.scope.projectPath)url.searchParams.set('project',state.scope.projectPath);url.searchParams.set('file',path);}
    url.searchParams.set('line',String(line));history.replaceState(null,'',url);
  }
  function jumpTo(line,record=true){
    const target=$('code').querySelector(`[data-line="${line}"]`);if(!target)return;
    $('code').querySelector('.source-line.target')?.classList.remove('target');target.classList.add('target');
    target.scrollIntoView({block:'center'});$('line-input').value=String(line);
    state.positions[state.current.path]=line;if(record)remember(state.current.path,line);updateLink(state.current.path,line);
  }
  function renderNodes(nodes,depth=0){
    const fragment=document.createDocumentFragment();
    for(const node of nodes){
      const row=button('',()=>node.kind==='directory'?toggleFolder(row):openFile(node.path).catch(report));
      row.className='tree-row';row.style.paddingLeft=`${8+depth*14}px`;row.dataset.path=node.path;row.dataset.kind=node.kind;row.setAttribute('role','treeitem');
      const icon=document.createElement('span');icon.className='twisty';icon.textContent=node.kind==='directory'?'▾':'C#';
      const text=document.createElement('span');text.textContent=node.name;row.append(icon,text);fragment.append(row);
      if(node.kind==='directory'){const group=document.createElement('div');group.setAttribute('role','group');group.append(renderNodes(node.children||[],depth+1));row.setAttribute('aria-expanded','true');fragment.append(group);}
    }
    return fragment;
  }
  function toggleFolder(row,expanded){const group=row.nextElementSibling;const open=expanded??group.hidden;group.hidden=!open;row.setAttribute('aria-expanded',String(open));row.querySelector('.twisty').textContent=open?'▾':'▸';}
  function folders(expanded){$('tree').querySelectorAll('[data-kind=directory]').forEach(row=>toggleFolder(row,expanded));}
  function reveal(path){
    $('tree').querySelector('.active')?.classList.remove('active');
    const row=[...$('tree').querySelectorAll('.tree-row')].find(item=>item.dataset.path===path);if(!row)return;
    let parent=row.parentElement;
    while(parent&&parent!==$('tree')){if(parent.getAttribute('role')==='group')toggleFolder(parent.previousElementSibling,true);parent=parent.parentElement;}
    row.classList.add('active');row.scrollIntoView({block:'nearest'});
  }
  function fillSelect(select,items,placeholder){
    select.replaceChildren(new Option(placeholder,''));
    for(const item of items){const option=new Option(`${item.kind}  ${item.displayName}`,String(item.line));select.add(option);}
    select.disabled=items.length===0;
  }
  function selectType(){const symbol=state.current?.symbols.find(item=>String(item.line)===$('type-select').value);fillSelect($('member-select'),symbol?.members||[],'Select a member');if(symbol)jumpTo(symbol.line);}
  function renderTabs(){
    $('tabs').replaceChildren();
    for(const path of state.tabs){const item=document.createElement('div');item.className='file-tab';item.setAttribute('aria-current',String(state.current?.path===path));
      const open=button(path.split('/').pop(),()=>openFile(path).catch(report));open.title=path;
      const close=button('×',()=>closeTab(path));close.setAttribute('aria-label','Close '+path);item.append(open,close);$('tabs').append(item);}
  }
  function clearFile(){
    state.current=null;$('code').replaceChildren();$('lines').textContent='';$('breadcrumb').textContent='Choose a C# file';$('metadata').textContent='READ ONLY';
    $('empty').classList.remove('hidden');$('code-wrap').classList.add('hidden');
    fillSelect($('type-select'),[],'Select a file');fillSelect($('member-select'),[],'Select a type');
    for(const id of ['copy-link','copy-code','line-input','go-line','wrap-code','find-in-file'])$(id).disabled=true;
    $('file-find').classList.add('hidden');state.matches=[];state.matchIndex=-1;
  }
  function closeTab(path){
    state.tabs=state.tabs.filter(item=>item!==path);
    if(state.current?.path===path){state.fileId++;if(state.tabs.length)openFile(state.tabs[state.tabs.length-1]).catch(report);else {clearFile();renderTabs();}}
    else renderTabs();
  }
  async function openFile(path,line=null,record=true){
    line=line??state.positions[path]??1;
    const generation=state.generation,id=++state.fileId;status('Reading file…');
    try{
      const file=await api(fileRoute(),fileParameters(path));if(generation!==state.generation||id!==state.fileId)return;
      state.current=file;if(!state.tabs.includes(path))state.tabs.push(path);
      $('code').replaceChildren();
      file.content.split('\n').forEach((value,index)=>{const span=document.createElement('span');span.className='source-line';span.dataset.line=String(index+1);span.innerHTML=highlight(value)||' ';$('code').append(span);});
      $('lines').textContent=Array.from({length:Math.max(file.lineCount,1)},(_,index)=>index+1).join('\n');
      $('breadcrumb').textContent=file.path;$('metadata').textContent=`READ ONLY · ${file.lineCount} lines · ${file.size.toLocaleString()} bytes`;
      fillSelect($('type-select'),file.symbols||[],'Select a type');fillSelect($('member-select'),[],'Select a type');
      $('empty').classList.add('hidden');$('code-wrap').classList.remove('hidden');
      for(const control of ['copy-link','copy-code','line-input','go-line','wrap-code','find-in-file'])$(control).disabled=false;
      state.matches=[];state.matchIndex=-1;$('file-query').value='';$('match-count').textContent='';
      reveal(path);renderTabs();jumpTo(Math.min(Math.max(line,1),Math.max(file.lineCount,1)),record);status('Loaded '+file.name);
    }catch(error){if(generation===state.generation&&id===state.fileId)report(error);}
  }
  async function navigateHistory(delta){
    const next=state.historyIndex+delta;if(next<0||next>=state.history.length)return;
    state.historyIndex=next;updateNavigation();const item=state.history[next];await openFile(item.path,item.line,false);
  }
  async function openScope(scope,label,initial=null){
    if(sameScope(scope,state.scope)&&state.ready&&!initial){$('project-dialog').close();return;}
    const url=new URL(location.href);url.search='';
    if(scope.sessionKey)url.searchParams.set('sessionKey',scope.sessionKey);
    else {url.searchParams.set('root',scope.rootId);if(scope.projectPath)url.searchParams.set('project',scope.projectPath);}
    history.replaceState(null,'',url);
    state.scope=scope;state.generation++;state.fileId++;state.searchId++;state.treeId++;state.ready=false;
    state.tabs=[];state.history=[];state.historyIndex=-1;state.tree=[];state.files=[];state.positions={};clearFile();renderTabs();updateNavigation();
    $('tree').replaceChildren();$('file-count').textContent='';$('project-name').textContent=label;$('project-dialog').close();
    if($('search-dialog').open)$('search-dialog').close();$('symbol-results').replaceChildren();$('symbol-search').value='';
    for(const id of ['quick-open','find-symbol','collapse-all','expand-all'])$(id).disabled=true;
    $('focus-code').disabled=false;$('full-screen').disabled=!document.documentElement.requestFullscreen;
    const generation=state.generation,treeId=state.treeId;status('Loading project…');
    try{
      const parameters=scope.sessionKey?{sessionKey:scope.sessionKey}:{rootId:scope.rootId,projectPath:scope.projectPath};
      const nodes=await api(scope.sessionKey?'session-tree':'project-tree',parameters);
      if(generation!==state.generation||treeId!==state.treeId)return;
      state.tree=nodes;state.files=allFiles(nodes);state.ready=true;$('tree').append(renderNodes(nodes));$('file-count').textContent=`${state.files.length} files`;
      for(const id of ['quick-open','collapse-all','expand-all'])$(id).disabled=false;$('find-symbol').disabled=!!scope.sessionKey;$('find-symbol').title=scope.sessionKey?'Symbol search is unavailable for session artifacts. Find file and Find text still work.':'';
      status(state.files.length?'Project ready.':'No C# files in this folder. Open another folder.');
      if(initial)await openFile(initial.path,initial.line);
    }catch(error){if(generation===state.generation)report(error);}
  }
  function picker(){
    if(!$('root-select').options.length){status('No approved source locations. Ask an administrator to configure CSHARP_VIEWER_ROOTS.',true);return;}
    $('project-dialog').showModal();state.folder=state.scope?.sessionKey?'':state.scope?.projectPath||'';
    if(state.scope?.rootId)$('root-select').value=state.scope.rootId;browse(state.folder);
  }
  async function browse(path){
    const id=++state.browseId,rootId=$('root-select').value;$('choose-folder').disabled=true;$('folders').replaceChildren();$('folder-status').textContent='Loading folders…';
    try{
      const result=await api('project-folders',{rootId,path});if(id!==state.browseId)return;
      state.folder=result.path;$('folder-path').textContent=result.path||'(source location)';$('folder-up').disabled=!result.path;
      for(const folder of result.folders){const li=document.createElement('li');li.append(button(folder.name+' /',()=>browse(folder.path)));$('folders').append(li);}
      $('project-definitions').textContent=result.definitions.length?'Project definitions: '+result.definitions.join(', '):'No .sln, .slnx or .csproj at this level. You can still open this source folder.';
      $('folder-status').textContent=result.truncated?'Listing limited to 500 folders / 100 project definitions. Choose a narrower approved source location.':result.folders.length?'Choose a subfolder, or open this folder.':'No subfolders.';
      $('choose-folder').disabled=false;
    }catch(error){if(id===state.browseId)$('folder-status').textContent=error.message;}
  }
  function search(mode){
    state.mode=mode;state.searchId++;state.results=[];$('symbol-results').replaceChildren();$('symbol-search').value='';
    $('search-title').textContent=mode==='files'?'Find file':'Find type or member';$('search-label').textContent=mode==='files'?'File name or path':'Type or member name';
    $('search-status').textContent=mode==='files'?'Start typing a file name.':'Enter at least two characters.';$('search-dialog').showModal();$('symbol-search').focus();
  }
  function renderResults(){
    $('symbol-results').replaceChildren();
    for(const [index,result] of state.results.entries()){
      const li=document.createElement('li');const action=button(result.label,()=>openSearchResult(index));action.setAttribute('aria-current',String(index===state.resultIndex));
      const detail=document.createElement('small');detail.textContent=result.path+':'+result.line;action.append(detail);li.append(action);$('symbol-results').append(li);
    }
    $('search-status').textContent=state.results.length?`${state.results.length} matches${state.results.length===100?' (first 100)':''}. Use Up/Down and Enter, or click a result.`:'No matches.';
  }
  async function searchSymbols(){
    const query=$('symbol-search').value.trim(),id=++state.searchId,generation=state.generation;
    state.results=[];$('symbol-results').replaceChildren();
    if(query.length<(state.mode==='files'?1:2)){$('search-status').textContent=state.mode==='files'?'Start typing a file name.':'Enter at least two characters.';return;}
    $('search-status').textContent='Searching…';
    try{
      const results=state.mode==='files'?state.files.filter(file=>file.path.toLowerCase().includes(query.toLowerCase())).slice(0,100).map(file=>({path:file.path,line:1,label:file.name})):
        (await api('project-symbols',{rootId:state.scope.rootId,projectPath:state.scope.projectPath,query})).map(result=>({path:result.filePath,line:result.line,label:`${result.kind} ${result.displayName}`}));
      if(id!==state.searchId||generation!==state.generation)return;state.results=results;state.resultIndex=0;renderResults();
    }catch(error){if(id===state.searchId&&generation===state.generation)$('search-status').textContent=error.message;}
  }
  async function openSearchResult(index){const result=state.results[index];if(!result)return;$('search-dialog').close();state.searchId++;await openFile(result.path,result.line);}
  function setFocus(value){state.focus=value;document.body.classList.toggle('focus-code',value);$('focus-code').setAttribute('aria-pressed',String(value));$('exit-focus').classList.toggle('hidden',!value);if(value)$('code-wrap').focus();else $('focus-code').focus();}
  async function fullscreen(){
    try{
      if(document.fullscreenElement){await document.exitFullscreen();return;}
      if(!document.documentElement.requestFullscreen)throw new Error('Full screen is unavailable in this browser. Focus code is still available.');
      await document.documentElement.requestFullscreen();state.fullscreenOwned=!state.focus;setFocus(true);
    }catch(error){status('Full screen was not granted by the browser. Use Focus code, or enable full-screen access and try again.',true);}
  }
  function findText(direction=1){
    const query=$('file-query').value;if(!state.current||!query)return;
    const lines=state.current.content.split('\n');state.matches=lines.flatMap((text,index)=>text.toLowerCase().includes(query.toLowerCase())?[index+1]:[]);
    $('code').querySelectorAll('.match').forEach(node=>node.classList.remove('match'));
    for(const line of state.matches)$('code').querySelector(`[data-line="${line}"]`).classList.add('match');
    if(!state.matches.length){$('match-count').textContent='No matching lines';state.matchIndex=-1;return;}
    state.matchIndex=(state.matchIndex+direction+state.matches.length)%state.matches.length;jumpTo(state.matches[state.matchIndex]);
    $('match-count').textContent=`${state.matchIndex+1} / ${state.matches.length} matching lines`;
  }
  function showFind(){$('file-find').classList.remove('hidden');$('file-query').focus();}
  $('open-project').onclick=picker;$('empty-open').onclick=picker;
  $('root-select').onchange=()=>browse('');$('folder-up').onclick=()=>browse(state.folder.split('/').slice(0,-1).join('/'));
  $('choose-folder').onclick=()=>{const rootId=$('root-select').value;const name=$('root-select').selectedOptions[0].textContent;openScope({rootId,projectPath:state.folder},name+(state.folder?' / '+state.folder:''));};
  $('collapse-all').onclick=()=>folders(false);$('expand-all').onclick=()=>folders(true);
  $('tree').addEventListener('keydown',event=>{
    const row=event.target.closest('.tree-row');if(!row)return;
    const rows=[...$('tree').querySelectorAll('.tree-row')].filter(item=>item.getClientRects().length);
    const index=rows.indexOf(row);
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();rows[Math.min(rows.length-1,Math.max(0,index+(event.key==='ArrowDown'?1:-1)))]?.focus();}
    if(event.key==='ArrowRight'&&row.dataset.kind==='directory'){event.preventDefault();toggleFolder(row,true);row.nextElementSibling.querySelector('.tree-row')?.focus();}
    if(event.key==='ArrowLeft'){event.preventDefault();if(row.dataset.kind==='directory'&&row.getAttribute('aria-expanded')==='true')toggleFolder(row,false);else if(row.parentElement.getAttribute('role')==='group')row.parentElement.previousElementSibling.focus();}
  });
  $('quick-open').onclick=()=>search('files');$('find-symbol').onclick=()=>search('symbols');
  $('symbol-search').oninput=()=>{clearTimeout(timer);state.searchId++;state.results=[];$('symbol-results').replaceChildren();timer=setTimeout(searchSymbols,250);};
  $('symbol-search').onkeydown=event=>{
    if(event.key==='ArrowDown'||event.key==='ArrowUp'){event.preventDefault();if(state.results.length){state.resultIndex=(state.resultIndex+(event.key==='ArrowDown'?1:-1)+state.results.length)%state.results.length;renderResults();}}
    if(event.key==='Enter'){event.preventDefault();if(state.results.length)openSearchResult(state.resultIndex);else {clearTimeout(timer);searchSymbols();}}
  };
  $('search-dialog').addEventListener('close',()=>{state.searchId++;clearTimeout(timer);});
  $('type-select').onchange=selectType;$('member-select').onchange=()=>{if($('member-select').value)jumpTo(Number($('member-select').value));};
  $('nav-back').onclick=()=>navigateHistory(-1);$('nav-forward').onclick=()=>navigateHistory(1);
  $('go-line').onclick=()=>{const line=Number($('line-input').value);if(Number.isInteger(line)&&line>=1&&line<=Math.max(state.current.lineCount,1))jumpTo(line);else status('Enter a line inside this file.',true);};
  $('focus-code').onclick=()=>setFocus(!state.focus);$('exit-focus').onclick=async()=>{if(document.fullscreenElement)await document.exitFullscreen();setFocus(false);};$('full-screen').onclick=fullscreen;
  document.addEventListener('fullscreenchange',()=>{const active=!!document.fullscreenElement;$('full-screen').textContent=active?'Exit full screen':'Full screen';if(!active&&state.fullscreenOwned)setFocus(false);});
  $('wrap-code').onclick=()=>{const active=document.body.classList.toggle('wrap');$('wrap-code').setAttribute('aria-pressed',String(active));status(active?'Line wrapping on; line-number gutter hidden to avoid misaligned numbers.':'Line wrapping off.');};
  $('find-in-file').onclick=showFind;$('file-find').onsubmit=event=>{event.preventDefault();findText();};$('previous-match').onclick=()=>findText(-1);
  $('file-query').oninput=()=>{state.matchIndex=-1;};$('close-find').onclick=()=>{$('file-find').classList.add('hidden');$('code-wrap').focus();};
  $('copy-link').onclick=async()=>{try{await navigator.clipboard.writeText(location.href);status('Code location link copied.');}catch{status('Clipboard unavailable. Copy the address from the browser.',true);}};
  $('copy-code').onclick=async()=>{try{await navigator.clipboard.writeText(state.current.content);status('Current file copied.');}catch{status('Clipboard unavailable. Select code and copy it.',true);}};
  document.addEventListener('keydown',event=>{
    if(event.key==='Escape'){
      const dialog=$('search-dialog').open?$('search-dialog'):$('project-dialog').open?$('project-dialog'):null;
      if(dialog){event.preventDefault();dialog.close();return;}
      if(document.fullscreenElement){event.preventDefault();document.exitFullscreen().catch(report);return;}
      if(state.focus&&!document.fullscreenElement)setFocus(false);return;
    }
    if($('project-dialog').open||$('search-dialog').open)return;
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='p'&&state.ready){event.preventDefault();search(event.shiftKey&&!state.scope.sessionKey?'symbols':'files');}
    if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='f'&&state.current){event.preventDefault();showFind();}
  });
  (async()=>{
    try{
      const roots=await api('roots');for(const root of roots){const option=new Option(`${root.name} — ${root.path}`,root.id);$('root-select').add(option);}
      const params=new URLSearchParams(location.search),sessionKey=params.get('sessionKey'),file=params.get('file');const line=Number(params.get('line')||1);
      if(!Number.isInteger(line)||line<1)throw new Error('Invalid line number.');
      if(sessionKey){
        if(!/^artifacts\/[^/].*\.cs$/i.test(file||''))throw new Error('A session C# artifact path is required.');
        const root=await api('session-root',{sessionKey});await openScope({sessionKey},root.name,{path:file.replace(/^artifacts\//i,''),line});
      }else if(params.has('root')){
        const root=roots.find(item=>item.id===params.get('root'));if(!root)throw new Error('The selected source location is unavailable. Open another project.');
        const projectPath=params.get('project')||'';
        await openScope({rootId:root.id,projectPath},root.name+(projectPath?' / '+projectPath:''),file?{path:file,line}:null);
      }else picker();
    }catch(error){report(error);}
  })();
})();
