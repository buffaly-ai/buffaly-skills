(function(global){
	function ensureKScriptMode(CodeMirror){
		CodeMirror.defineSimpleMode("kscript-code",{
			start:[
				{regex:/\b(class|function|redefinefunction|return|declare|returnex|if)\b/i,token:"keyword"},
				{regex:/".*?"/,token:"string"},
				{regex:/'.*?'/,token:"string"},
				{regex:/\s+/,token:null},
				{regex:/.*/,token:null}
			]
		});

		CodeMirror.defineMode("kscript",function(config){
			return CodeMirror.multiplexingMode(
				CodeMirror.getMode(config,"htmlmixed"),
				{
					open:"<"+"%",
					close:"%"+">",
					mode:CodeMirror.getMode(config,"kscript-code"),
					delimStyle:"delimit"
				}
			);
		});

		function findMatchingClose(cm,line,ch){
			var depth=0,max=cm.lastLine();
			for(var i=line;i<=max;i++){
				var text=cm.getLine(i);
				for(var pos=(i===line?ch:0);;){
					var open=text.indexOf("{%>",pos);
					var close=text.indexOf("<%}",pos);
					var next=open===-1?close:close===-1?open:Math.min(open,close);
					if(next===-1)break;
					if(text.startsWith("{%>",next))depth++;
					if(text.startsWith("<%}",next)){
						if(depth===0)return{line:i,ch:next};
						depth--;
					}
					pos=next+3;
				}
			}
			return null;
		}

		["htmlmixed","kscript","kscript-code"].forEach(function(modeName){
			CodeMirror.registerHelper("fold",modeName,function(cm,start){
				var text=cm.getLine(start.line);
				var openPos=text.indexOf("{%>");
				if(openPos===-1)return;
				var end=findMatchingClose(cm,start.line,openPos+3);
				if(!end)return;
				if(end.line===start.line&&end.ch===openPos)return;
				return{
					from:CodeMirror.Pos(start.line,openPos+3),
					to:CodeMirror.Pos(end.line,end.ch)
				};
			});
		});
	}

	global.createKScriptEditor=function(textareaId,options){
		ensureKScriptMode(CodeMirror);
		var defaults={
			mode:"kscript",
			indentWithTabs:true,
			smartIndent:true,
			lineNumbers:true,
			matchBrackets:true,
			matchTags:{bothTags:true},
			autofocus:true,
			lineSeparator:"\n",
			extraKeys:{
				"Ctrl-F":"findPersistent",
				"Ctrl-H":"replace",
				"F3":"findPersistentNext",
				"Shift-F3":"findPersistentPrev",
				"Esc":function(cm){
					if(cm.getOption("fullScreen"))cm.setOption("fullScreen",false);
					else if(cm.state.search)cm.execCommand("clearSearch");
				},
				"F11":function(cm){cm.setOption("fullScreen",!cm.getOption("fullScreen"));}
			},
			highlightSelectionMatches:{showToken:/\w/,annotateScrollbar:true},
			foldGutter:true,
			gutters:["CodeMirror-linenumbers","CodeMirror-foldgutter"]
		};
		var cfg=Object.assign({},defaults,options||{});
		var cm=CodeMirror.fromTextArea(document.getElementById(textareaId),cfg);
		cm.on("change",function(c){c.save();});
		return cm;
	};
})(window);
