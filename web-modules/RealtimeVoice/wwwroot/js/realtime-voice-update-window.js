(function(root,factory){'use strict';const exported=factory();if(typeof module==='object'&&module.exports)module.exports=exported;else root.RealtimeVoiceUpdateWindow=exported.RealtimeVoiceUpdateWindow;})(typeof globalThis!=='undefined'?globalThis:this,function(){
	'use strict';
	class RealtimeVoiceUpdateWindow{
		constructor(delayMs,onDecision,setTimer,clearTimer){this.delayMs=delayMs;this.onDecision=onDecision;this.setTimer=setTimer||((fn,delay)=>globalThis.setTimeout(fn,delay));this.clearTimer=clearTimer||(id=>globalThis.clearTimeout(id));this.pending=[];this.ids=new Set();this.timer=null;this.userSpeaking=false;this.activeResponseId='';}
		admit(item){if(!item||!item.QueueItemId||this.ids.has(item.QueueItemId))return false;this.ids.add(item.QueueItemId);this.pending.push(item);this.schedule();return true;}
		speechStarted(){this.userSpeaking=true;this.cancelTimer();}
		speechStopped(){this.userSpeaking=false;return this.takePending();}
		responseStarted(responseId){if(!responseId)throw new Error('responseId is required.');this.activeResponseId=responseId;this.cancelTimer();}
		responseCompleted(responseId){if(responseId!==this.activeResponseId)return false;this.activeResponseId='';this.schedule();return true;}
		responseInterrupted(responseId){if(!responseId||responseId!==this.activeResponseId)return false;this.activeResponseId='';this.schedule();return true;}
		takePending(){if(this.activeResponseId||this.pending.length===0)return [];this.cancelTimer();const batch=this.pending.splice(0);for(const item of batch)this.ids.delete(item.QueueItemId);return batch;}
		reset(){this.cancelTimer();this.pending=[];this.ids.clear();this.userSpeaking=false;this.activeResponseId='';}
		schedule(){if(this.userSpeaking||this.activeResponseId||this.pending.length===0)return;this.cancelTimer();this.timer=this.setTimer(()=>{this.timer=null;if(this.userSpeaking||this.activeResponseId)return;const batch=this.pending.splice(0);for(const item of batch)this.ids.delete(item.QueueItemId);this.onDecision(batch);},this.delayMs);}
		cancelTimer(){if(this.timer!==null){this.clearTimer(this.timer);this.timer=null;}}
	}
	return {RealtimeVoiceUpdateWindow};
});
