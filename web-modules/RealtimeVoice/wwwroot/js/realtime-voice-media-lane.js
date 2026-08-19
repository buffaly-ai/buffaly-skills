(function(root,factory){
	'use strict';
	const exported=factory();
	if(typeof module==='object'&&module.exports)module.exports=exported;
	else root.RealtimeVoiceMediaLane=exported.RealtimeVoiceMediaLane;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
	'use strict';
	class RealtimeVoiceMediaLane{
		constructor(audio,sendCancel,writeEvent,now){this.audio=audio;this.sendCancel=sendCancel;this.writeEvent=writeEvent;this.now=now||(()=>Date.now());this.playbackGeneration=0;this.acceptedGeneration=0;this.responseGenerations=new Map();this.activeResponseId='';this.responseStartedAt=0;this.playoutActive=false;this.playoutResponseId='';this.playoutStartedAt=0;}
		responseStarted(responseId){if(!responseId)throw new Error('responseId is required.');this.playbackGeneration=Math.max(this.playbackGeneration+1,this.acceptedGeneration);this.acceptedGeneration=this.playbackGeneration;this.activeResponseId=responseId;this.responseStartedAt=this.now();this.responseGenerations.set(responseId,this.playbackGeneration);this.audio.dataset.generation=String(this.playbackGeneration);this.audio.muted=false;const play=this.audio.play();if(play&&typeof play.catch==='function')play.catch(error=>this.writeEvent({EventType:'RemoteAudioPlayFailed',Message:error.message}));return this.playbackGeneration;}
		playoutStarted(responseId){this.playoutActive=true;this.playoutResponseId=responseId||this.activeResponseId;this.playoutStartedAt=this.now();this.writeEvent({EventType:'RemoteAudioPlayoutStarted',ResponseId:this.playoutResponseId});}
		playoutStopped(responseId,reason){if(!this.playoutActive)return;const activeResponseId=this.playoutResponseId;this.playoutActive=false;this.playoutResponseId='';this.playoutStartedAt=0;this.writeEvent({EventType:'RemoteAudioPlayoutStopped',ResponseId:responseId||activeResponseId,Reason:reason||'output-buffer-stopped'});}
		isPlayoutActive(){return this.playoutActive;}
		classifyTranscript(transcript,currentOutput,startedDuringPlayout){const normalize=value=>String(value||'').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();const input=normalize(transcript);if(!input)return 'noise';if(!startedDuringPlayout)return 'speech';const output=normalize(currentOutput);return output&&(input===output||input.includes(output)||output.includes(input))?'echo':'speech';}
		acceptsSpeechStart(){if(!this.playoutActive)return true;const elapsedMs=this.now()-this.playoutStartedAt;this.writeEvent({EventType:'ActivePlaybackSpeechStartSuppressed',ResponseId:this.playoutResponseId,ElapsedMs:elapsedMs});return false;}
		interrupt(){const responseId=this.activeResponseId;const oldGeneration=this.acceptedGeneration;this.acceptedGeneration=Math.max(this.playbackGeneration+1,oldGeneration+1);this.audio.muted=true;this.audio.pause();this.playoutStopped(responseId,'interrupted');this.audio.dataset.generation=String(this.acceptedGeneration);if(responseId)this.sendCancel(responseId);this.activeResponseId='';this.writeEvent({EventType:'LocalPlaybackCancelled',OldGeneration:oldGeneration,NewGeneration:this.acceptedGeneration,ResponseId:responseId});return {ResponseId:responseId,Generation:this.acceptedGeneration};}
		acceptsCompletion(responseId){const generation=this.responseGenerations.get(responseId);this.responseGenerations.delete(responseId);if(generation!==this.acceptedGeneration){this.writeEvent({EventType:'StaleResponseDoneIgnored',ResponseId:responseId,Generation:generation||0,AcceptedGeneration:this.acceptedGeneration});return false;}if(this.activeResponseId===responseId)this.activeResponseId='';return true;}
		reset(){this.audio.muted=true;this.audio.pause();this.activeResponseId='';this.responseStartedAt=0;this.playoutActive=false;this.playoutResponseId='';this.playoutStartedAt=0;this.responseGenerations.clear();this.playbackGeneration=0;this.acceptedGeneration=0;this.audio.dataset.generation='0';}
	}
	return {RealtimeVoiceMediaLane};
});
