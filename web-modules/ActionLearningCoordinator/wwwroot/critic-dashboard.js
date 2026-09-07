(function(root){
"use strict";
const time=value=>{const parsed=Date.parse(value);return Number.isFinite(parsed)?parsed:null;};
function sortEntries(entries,mode){return [...entries].sort((a,b)=>{if(mode==="recent"){const x=time(a.SourceUpdatedUtc),y=time(b.SourceUpdatedUtc);if(x!==null&&y!==null&&x!==y)return y-x;if(x!==null&&y===null)return -1;if(x===null&&y!==null)return 1;}return String(a.SourceSessionName||a.SourceSessionKey).localeCompare(String(b.SourceSessionName||b.SourceSessionKey),undefined,{sensitivity:"base"});});}
function caughtUp(entry){return entry.FreshnessVerified===true&&entry.CaughtUp===true;}
function status(entry){return entry.FreshnessVerified===true?(caughtUp(entry)?"Caught up":entry.ProcessingState||"Behind"):entry.LastError?"Error":"Unchecked";}
function summarize(results){const counts={Queued:0,AlreadyQueued:0,AlreadyCurrent:0,Failed:0};for(const row of results){if(!Object.hasOwn(counts,row.Status))throw new Error(`Unexpected catch-up status: ${row.Status}`);counts[row.Status]++;}return counts;}
const api={sortEntries,caughtUp,status,summarize};if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.CriticDashboard=api;
})(globalThis);
