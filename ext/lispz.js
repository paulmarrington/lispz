window.lispz_modules={}

lispz_modules['core']=function anonymous(__module_ready__
/**/) {
/*macro debug*///#core:1
//#core:2
//#core:3

/*macro lambda*///#core:4

/*macro =>*///#core:5

/*macro *arguments*///#core:6

/*macro global*///#core:9

/*macro closure*///#core:10

/*macro return*///#core:11

/*macro return?*///#core:12

/*macro return-if*///#core:13

/*macro new*///#core:14
//#core:15
//#core:16

/*macro set!*///#core:17

/*macro var*///#core:18

/*macro dict.update!*///#core:19
//#core:20
//#core:21

/*macro get*///#core:22
//#core:23
//#core:24

/*macro not*///#core:25

/*macro in*///#core:26
//#core:27
//#core:28

/*macro empty?*///#core:29

/*macro defined?*///#core:30

/*macro cond*///#core:31

/*macro else*///#core:32

/*macro contains*///#core:33

/*macro while*///#core:35
//#core:36

lispz.globals.default_u_=(function(value,default_value){switch(false){case !value:return value
}
return default_value
//#core:38
})//#core:8

/*macro default?*///#core:39
//#core:40
//#core:41

/*macro length*///#core:42

/*macro first*///#core:43

/*macro rest*///#core:44

/*macro last*///#core:45

lispz.globals.slice=(function(list,from,to){return [].slice.call(list,from,to)
})//#core:8

/*macro slice*///#core:46
//#core:47

/*macro using*///#core:49
//#core:50
//#core:51

/*macro export*///#core:52

__module_ready__({})//#core:53
//#core:54

/*macro delay*///#core:55

/*macro yield*///#core:56

/*macro do*///#core:57
//#core:63

/*macro contain*///#core:64
//#core:67

lispz.globals.random=(function(range){return Math.floor((Math.random()*range))
})//#core:8

/*macro random*///#core:68
//# sourceURL=core.lispz

}

lispz_modules['list']=function anonymous(__module_ready__
/**/) {
var sequential=(function(list,for_each_q__g_,on_complete_q__g_){switch(false){case !!(list):return on_complete_q__g_()
}//#list:5

var list=lispz.globals.slice(list);//#list:6

var each_q__g_=(function(){switch(false){case !!(list.length):return on_complete_q__g_()
}//#list:8

for_each_q__g_(list.shift(),each_q__g_)//#list:9
});
each_q__g_()//#list:10
});//#list:11
//#list:12

__module_ready__({'sequential':sequential})//#list:13
//# sourceURL=list.lispz

}

lispz_modules['dict']=function anonymous(__module_ready__
/**/) {
var insert=(function(target,dictionaries){dictionaries.forEach((function(dictionary){Object.keys(dictionary).forEach((function(key){target[key]=dictionary[key];//#dict:4
}))//#dict:5
}))//#dict:6

return target
//#dict:7
});//#dict:8
//#dict:12

var merge=(function(dictionaries){return insert({},[].slice.call(arguments,0))
//#dict:14
});//#dict:15

var insert_$_=(function(target,dictionaries){return insert(target,[].slice.call(arguments,0))
//#dict:17
});//#dict:18
//#dict:19

var from_list=(function(list,key){var dictionary={};//#dict:21

switch(false){case !list:list.forEach((function(item){dictionary[item[key]]=item;}))//#dict:23
}//#dict:24

return dictionary
//#dict:25
});//#dict:26
//#dict:27

var for_each=(function(dict,action){Object.keys(dict)
.forEach((function(k){action(k,dict[k])}))//#dict:29
});//#dict:30
//#dict:33

var sequential=(function(dict,for_each_q__g_,on_complete_q__g_){switch(false){case !!(dict):return on_complete_q__g_()
}//#dict:35

var list=Object.keys(dict);//#dict:36

var each_q__g_=(function(){switch(false){case !!(list.length):return on_complete_q__g_()
}//#dict:38

var key=list.shift();//#dict:39

for_each_q__g_(key,dict[key],each_q__g_)//#dict:40
});
each_q__g_()//#dict:41
});//#dict:42
//#dict:43

__module_ready__({'merge':merge,'from_list':from_list,'insert_$_':insert_$_,'for_each':for_each,'sequential':sequential})//# sourceURL=dict.lispz

}

lispz_modules['dom']=function anonymous(__module_ready__
/**/) {
lispz.load("dict"//#core:48
,(function(){var dict=lispz.cache["dict"];
var append_$_=(function(parent,element){document.querySelector(parent)
.appendChild(element)//#dom:3
});//#dom:4
//#dom:5

var element=(function(tag_name,attributes){var elem=document.createElement(tag_name);//#dom:7

dict.for_each(attributes,(function(k,v){elem.setAttribute(k,v)}))//#dom:8

return elem
//#dom:9
});//#dom:10
//#dom:11

var event_throttle=(function(element,event,action){var add=null,listener=(function(event){element.removeEventListener(event,listener)//#dom:14

timeout=setTimeout((function(){add}),66);//#dom:15

action(event)//#dom:16
});//#dom:17

var add=(function(){element.addEventListener(event,listener)});//#dom:18
});//#dom:19
//#dom:20

__module_ready__({'append_$_':append_$_,'element':element,'event_throttle':event_throttle})//#dom:21
}))//# sourceURL=dom.lispz

}

lispz_modules['net']=function anonymous(__module_ready__
/**/) {
lispz.load("list,dom"//#core:48
,(function(){var list=lispz.cache["list"],dom=lispz.cache["dom"];
var script=(function(uri,next_step_q__g_){var el=dom.element("script",{'type':"text/javascript"});//#net:3

dom.append_$_("head",el)//#net:4

el.addEventListener("load",(function(evt){setTimeout((function(){next_step_q__g_(evt)}),20)//#net:6
}))//#net:7

el.addEventListener("error",(function(evt){console.log(evt)//#net:9

setTimeout((function(){next_step_q__g_(evt)}),20)//#net:10
}))//#net:11

el.src=uri;//#net:12
});//#net:13
//#net:14

var css=(function(uri){var el=dom.element("link",{'type':"text/css",'rel':"stylesheet",'href':uri});//#net:18

dom.append_$_("head",el)//#net:19
});//#net:20
//#net:21

var http_get=(function(uri,next_step_q__g_){lispz.http_request(uri,"GET",next_step_q__g_)//#net:23
});//#net:24
//#net:25

var json_request=(function(uri,next_step_q__g_){http_get(uri,(function(response){next_step_q__g_(JSON.parse(response.text))//#net:28
}))//#net:29
});//#net:30
//#net:31

__module_ready__({'script':script,'css':css,'http_get':http_get,'json_request':json_request})//#net:34
}))//#net:35
//# sourceURL=net.lispz

}

lispz_modules['firebase']=function anonymous(__module_ready__
/**/) {
lispz.load("net"//#core:48
,(function(){var net=lispz.cache["net"];
var databases=JSON.parse((localStorage.getItem("firebases")||"{}"));//#firebase:2
//#firebase:3

var register=(function(key,uri){databases[key]=uri;//#firebase:5

localStorage.setItem("firebases",JSON.stringify(databases))//#firebase:6
});//#firebase:7
//#firebase:8

var encode=(function(before){var uri=before.replace(/\./g,":");//#firebase:10

var uri=uri.replace(/#/g,"_hash_");//#firebase:11

var uri=uri.replace(/\$/g,"_dollar_");//#firebase:12

return uri
//#firebase:13
});//#firebase:14
//#firebase:15

var attach=(function(collection,db){var uri=databases[(db||"default")];//#firebase:17

switch(false){case !!(uri):return null
}//#firebase:18

return (new Firebase((uri+"/"+encode(collection))))
//#firebase:19
});//#firebase:20
//#firebase:21

net.script("https://cdn.firebase.com/js/client/2.2.9/firebase.js",(function(){__module_ready__({'register':register,'attach':attach,'databases':databases})//#firebase:24
}))//#firebase:25
}))//#firebase:26
//# sourceURL=firebase.lispz

}

lispz_modules['message']=function anonymous(__module_ready__
/**/) {
var store={},expecting={};//#message:1
//#message:2

var exchange=(function(address){var envelope=store[address];//#message:4

switch(false){case !envelope:return envelope
}//#message:5

return store[address]=[];
//#message:6
});//#message:7
//#message:8

var add=(function(address,envelope){var envelopes=exchange(address);//#message:10

envelopes.push(envelope)//#message:11

switch(false){case !((envelopes.length===1)&&expecting[address])//#message:12
:expecting[address]()
delete(expecting[address])}//#message:13
});//#message:14
//#message:15

var remove=(function(recipient){exchange[address]=exchange(address).filter((function(possibility){return (recipient!==possibility)
//#message:20
}))//#message:21
;//#message:22
});//#message:23
//#message:24

var send=(function(address,packet,reply_q__g_){var reply=lispz.globals.default_u_(reply_q__g_,(function(){}));//#message:26

exchange(address).slice().forEach((function(recipient){setTimeout((function(){reply(recipient.listener_q__g_(packet))}),0)//#message:29

switch(false){case !recipient.once:remove(recipient)}//#message:30
}))//#message:31
});//#message:32
//#message:33

var expect=(function(address,listener_q__g_){add(address,{'once':true,'listener_q__g_':listener_q__g_})//#message:35
});//#message:36
//#message:37

var wait_for=(function(address,listener_q__g_){switch(false){case !exchange(address).length:return listener_q__g_()
}//#message:40

expecting[address]=listener_q__g_;//#message:41
});//#message:42
//#message:43

var listen=(function(address,listener_q__g_){add(address,{'listener_q__g_':listener_q__g_})//#message:45
});//#message:46
//#message:47

var dispatch=(function(address,actions){listen(address,(function(packet){var action=actions[packet.action];//#message:50

switch(false){case !!(action):return false
}//#message:51

action(packet)//#message:52
}))//#message:53
});//#message:54
//#message:55

var log=(function(text){var parts=text.split(/\s*:\s*/);//#message:57

switch(false){case !(1===parts.length):parts.unshift("message")}//#message:58

send("logging",{'level':parts[0],'text':parts[1]})//#message:59
});//#message:60
//#message:61

listen("logging",(function(packet){console.log(packet.level,"-",packet.text)//#message:63
}))//#message:64
//#message:65

__module_ready__({'exchange':exchange,'send':send,'expect':expect,'listen':listen,'dispatch':dispatch,'wait_for':wait_for})//#message:66
//# sourceURL=message.lispz

}

lispz_modules['cdnjs']=function anonymous(__module_ready__
/**/) {
lispz.load("net,github"//#core:48
,(function(){var net=lispz.cache["net"],github=lispz.cache["github"];
__module_ready__({'build':(function(target_repo,name,sources,built_q__g_){github.builder(target_repo,name,sources,built_q__g_,{'list_all':(function(repo,path,ready_q__g_){net.json_request(("http://api.cdnjs.com/libraries?fields=assets&search="+repo.name)//#cdnjs:8
,(function(json){var filtered=json.results.filter((function(it){return (it.name===repo.name)
//#cdnjs:11
}));//#cdnjs:12

filtered[0].assets.some((function(it){switch(false){case !(-1!==it.version.indexOf("alpha")):return false
}//#cdnjs:14

repo.base=("https://cdnjs.cloudflare.com/ajax/libs/"+repo.name+"/"+it.version+"/");//#cdnjs:18

ready_q__g_(null,it.files)//#cdnjs:19

return true
//#cdnjs:20
}))//#cdnjs:21
})//#cdnjs:22
)//#cdnjs:23
})//#cdnjs:24
,'read':(function(repo,path,ready_q__g_){var uri=(repo.base+path);//#cdnjs:26

net.http_get(uri,(function(response){ready_q__g_(null,response.text)//#cdnjs:28
}))//#cdnjs:29
})//#cdnjs:30
,'repo':(function(target_repo,name){return {'name':name,'lispz':{}}
})//#cdnjs:31
})//#cdnjs:32
})//#cdnjs:33
})//#cdnjs:34
}))//#cdnjs:35
//# sourceURL=cdnjs.lispz

}

lispz_modules['jquery']=function anonymous(__module_ready__
/**/) {
lispz.load("net,cdnjs"//#core:48
,(function(){var net=lispz.cache["net"],cdnjs=lispz.cache["cdnjs"];
net.script("ext/jquery.js",(function(){__module_ready__({'build':(function(target_repo,built_q__g_){cdnjs.build(target_repo,"jquery",[{'repo':"jquery",'files':[{'exclude':/\.map$|\.min.js$/}//#jquery:7
]}//#jquery:8
])//#jquery:9
})//#jquery:10
})//#jquery:11
}))//#jquery:12
}))//#jquery:13
//# sourceURL=jquery.lispz

}

lispz_modules['riot']=function anonymous(__module_ready__
/**/) {
lispz.load("net,list,github,dict"//#core:48
,(function(){var net=lispz.cache["net"],list=lispz.cache["list"],github=lispz.cache["github"],dict=lispz.cache["dict"];
var compile=(function(html,to_js){return riot.compile(html,to_js)
});//#riot:2
//#riot:3

var tags={};//#riot:4
//#riot:5

var load=(function(name,uri,next_step_q__g_){var mount=(function(){tags[name]=true;//#riot:8

tags[uri]=true;//#riot:9

riot.mount(name)//#riot:10

next_step_q__g_()//#riot:11
});//#riot:12

switch(false){case !tags[name]:next_step_q__g_()//#riot:14
;break;case !lispz.tags[name]:lispz.tags[name]()
mount()//#riot:15
;break;case !true:net.http_get(uri,(function(response){compile(response.text)
mount()}))//#riot:17
}//#riot:18
});//#riot:19
//#riot:20

var build=(function(target_repo,built_q__g_){github.build(target_repo,"riot",[{'repo':"riot/riot",'files':[{'include':/^riot\+compiler.js$/}//#riot:24
]}//#riot:25
],built_q__g_)//#riot:26
});//#riot:27
//#riot:28

var mount=(function(tags){riot.mount(tags)});//#riot:29
//#riot:30

net.script("ext/riot.js",(function(){switch(false){case !!(window.riot):return __module_ready__({'build':build})
}//#riot:32

riot.parsers.js.lispz=(function(source){return lispz.compile("riot-tags",source).join("\n")
});//#riot:34

list.sequential(document.getElementsByClassName("riot")//#riot:35
,(function(element,next_element_q__g_){var name=element.tagName;//#riot:37

var uri=(element.getAttribute("uri")//#riot:38
||(name.toLowerCase()+".riot.html"));//#riot:39

load(name,uri,next_element_q__g_)//#riot:40
})//#riot:41
,(function(){__module_ready__({'build':build,'compile':compile,'load':load,'mount':mount})})//#riot:42
)//#riot:43
}))//#riot:44
}))//#riot:45
//# sourceURL=riot.lispz

}

lispz_modules['diff_match_patch']=function anonymous(__module_ready__
/**/) {
lispz.load("net,github"//#core:48
,(function(){var net=lispz.cache["net"],github=lispz.cache["github"];
net.script("ext/diff_match_patch.js",(function(){__module_ready__({'build':(function(target_repo,built_q__g_){github.build(target_repo,"diff_match_patch",[{'repo':"tanaka-de-silva/google-diff-match-patch-js",'files':[{'base':"",'include':/^diff_match_patch_uncompressed.js$/}//#diff_match_patch:7
]}//#diff_match_patch:8
])//#diff_match_patch:9
})//#diff_match_patch:10
})//#diff_match_patch:11
}))//#diff_match_patch:12
}))//#diff_match_patch:13
//# sourceURL=diff_match_patch.lispz

}

lispz_modules['bootstrap']=function anonymous(__module_ready__
/**/) {
lispz.load("net,github"//#core:48
,(function(){var net=lispz.cache["net"],github=lispz.cache["github"];
net.css("ext/bootstrap.css")//#bootstrap:2

net.script("ext/bootstrap.js",(function(){__module_ready__({'build':(function(target_repo,built_q__g_){github.build(target_repo,"bootstrap",[{'repo':"twbs/bootstrap",'files':[{'base':"dist",'exclude':/\.map$|\.min\.|npm.js$/}//#bootstrap:8
,{'base':"dist/fonts",'copy_to':"fonts"}//#bootstrap:9
]}//#bootstrap:10
],built_q__g_)//#bootstrap:11
})//#bootstrap:12
})//#bootstrap:13
}))//#bootstrap:14
}))//#bootstrap:15
//# sourceURL=bootstrap.lispz

}

lispz_modules['codemirror']=function anonymous(__module_ready__
/**/) {
lispz.load("net,diff_match_patch,message,dict,github"//#core:48
,(function(){var net=lispz.cache["net"],diff_match_patch=lispz.cache["diff_match_patch"],message=lispz.cache["message"],dict=lispz.cache["dict"],github=lispz.cache["github"];
var options=localStorage.getItem("CodeMirror-options");//#codemirror:2

switch(false){case !options:var options=JSON.parse(options);//#codemirror:3
;break;case !true:var options={'lineNumbers':true,'foldGutter':true,'lint':true,'matchBrackets':true,'autoCloseBrackets':true,'matchTags':true,'showTrailingSpace':true,'inputStyle':"textarea",'autofocus':true,'dragDrop':false,'smartIndent':true,'indentUnit':2,'indentWithTabs':false,'cursorScrollMargin':5,'scrollbarStyle':"overlay",'extraKeys':{'Cmd-Left':"goLineStartSmart",'Ctrl-Q':"fold_at_cursor",'Ctrl-Space':"autocomplete",'Ctrl-/':"toggleComment",'Ctrl-<':"goColumnLeft",'Ctrl->':"goColumnRight",'Ctrl-Shift-F':"clearSearch",'Ctrl-=':"toMatchingTag",'Alt-S':"view_source",'Ctrl-`':"insertSoftTab",'Ctrl-,':"delLineLeft",'Ctrl-.':"killLine",'Shift-Ctrl-,':"delWrappedLineLeft",'Shift-Ctrl-.':"delWrappedLineRight",'Ctrl-9':"delWordBefore",'Ctrl-0':"delWordAfter",'Ctrl-6':"transposeChars",'Ctrl-Left':"goWordLeft",'Ctrl-Right':"goWordRight",'Ctrl-Home':"goLineLeft",'Ctrl-Shift-Home':"goLineLeftSmart",'Ctrl-End':"goLineRight",'Backspace':"subpar_backward_delete",'Delete':"subpar_forward_delete",'Ctrl-D':"subpar_forward_delete",'Shift-9':"subpar_open_bracket",'[':"subpar_open_square_bracket",'Shift-[':"subpar_open_braces",'Shift-0':"subpar_close_bracket",']':"subpar_close_square_bracket",'Shift-]':"subpar_close_braces",'Shift-\'':"subpar_double_quote",'Ctrl-Alt-F':"subpar_forward",'Ctrl-Alt-B':"subpar_backward",'Ctrl-Alt-U':"subpar_backward_up",'Ctrl-Alt-D':"subpar_forward_down",'Ctrl-Alt-P':"subpar_backward_down",'Ctrl-Alt-N':"subpar_forward_up",'Shift-Ctrl-[':"subpar_backward_barf",'Ctrl-Alt-Right':"subpar_backward_barf",'Ctrl-]':"subpar_backward_barf",'Shift-Ctrl-]':"subpar_forward_barf",'Ctrl-Left':"subpar_forward_barf",'Shift-Ctrl-9':"subpar_backward_slurp",'Ctrl-Alt-Left':"subpar_backward_slurp",'Ctrl-[':"subpar_backward_slurp",'Shift-Ctrl-0':"subpar_forward_slurp",'Ctrl-Right':"subpar_forward_slurp",'Alt-Up':"subpar_splice_delete_backward",'Alt-Down':"subpar_splice_delete_forward",'Alt-S':"subpar_splice",'Ctrl-Alt-/':"subpar_indent_selection",'Alt-Enter':"lispz_run_selection"}//#codemirror:87
};}//#codemirror:88

var update_options=(function(){localStorage.setItem("CodeMirror-options",JSON.stringify(options))//#codemirror:91
});//#codemirror:92

var topic="CodeMirror-command";//#codemirror:94

var menu=[{'title':"Edit",'children':[{'topic':topic,'meta':"autocomplete",'title':"Auto-Complete"}//#codemirror:100
,{'topic':topic,'meta':"redo",'title':"Redo"}//#codemirror:101
,{'topic':topic,'meta':"undo",'title':"Undo"}//#codemirror:102
,{'topic':topic,'meta':"redoSelection",'title':"Redo Selection"}//#codemirror:103
,{'topic':topic,'meta':"undoSelection",'title':"Undo Selection"}//#codemirror:104
,{'divider':true}//#codemirror:105
,{'topic':topic,'meta':"toggleOverwrite",'title':"Insert/Overwrite"}//#codemirror:106
,{'topic':topic,'meta':"toggleComment",'title':"Comment/Uncomment"}//#codemirror:107
,{'topic':topic,'meta':"insertSoftTab",'title':"Insert Soft Tab"}//#codemirror:108
,{'topic':topic,'meta':"defaultTab",'title':"Tab or Indent"}//#codemirror:109
,{'title':"Delete",'children':[{'topic':topic,'meta':"deleteLine",'title':"Line"}//#codemirror:111
,{'topic':topic,'meta':"killLine",'title':"Line Right"}//#codemirror:112
,{'topic':topic,'meta':"delLineLeft",'title':"Line Left"}//#codemirror:113
,{'divider':true}//#codemirror:114
,{'topic':topic,'meta':"delWrappedLineLeft",'title':"Wrapped Line Left"}//#codemirror:115
,{'topic':topic,'meta':"delWrappedLineRight",'title':"Wrapped Line Right"}//#codemirror:116
,{'divider':true}//#codemirror:117
,{'topic':topic,'meta':"delWordBefore",'title':"Word Left"}//#codemirror:118
,{'topic':topic,'meta':"delWordAfter",'title':"Word Right"}//#codemirror:119
,{'divider':true}//#codemirror:120
,{'topic':topic,'meta':"delGroupBefore",'title':"Group Before"}//#codemirror:121
,{'topic':topic,'meta':"delGroupAfter",'title':"Group After"}//#codemirror:122
,{'divider':true}//#codemirror:123
,{'topic':topic,'meta':"delCharBefore",'title':"Character Left"}//#codemirror:124
,{'topic':topic,'meta':"delCharAfter",'title':"Character Right"}//#codemirror:125
]}//#codemirror:126
,{'topic':topic,'meta':"indentAuto",'title':"Auto Indent"}//#codemirror:127
,{'topic':topic,'meta':"indentLess",'title':"Indent Left"}//#codemirror:128
,{'topic':topic,'meta':"indentMore",'title':"Indent Right"}//#codemirror:129
,{'topic':topic,'meta':"newlineAndIndent",'title':"New line and indent"}//#codemirror:130
,{'divider':true}//#codemirror:131
,{'topic':topic,'meta':"transposeChars",'title':"Transpose Characters"}//#codemirror:132
,{'divider':true}//#codemirror:133
,{'topic':topic,'meta':"selectAll",'title':"Select All"}//#codemirror:134
,{'topic':topic,'meta':"singleSelection",'title':"Single Selection"}//#codemirror:135
]}//#codemirror:136
,{'title':"Go",'children':[{'topic':topic,'meta':"goDocStart",'title':"Document Start"}//#codemirror:138
,{'topic':topic,'meta':"goDocEnd",'title':"Document End"}//#codemirror:139
,{'divider':true}//#codemirror:140
,{'topic':topic,'meta':"goCharLeft",'title':"Char Left"}//#codemirror:141
,{'topic':topic,'meta':"goCharRight",'title':"Char Right"}//#codemirror:142
,{'divider':true}//#codemirror:143
,{'topic':topic,'meta':"goColumnLeft",'title':"Column Left"}//#codemirror:144
,{'topic':topic,'meta':"goColumnRight",'title':"Column Right"}//#codemirror:145
,{'divider':true}//#codemirror:146
,{'topic':topic,'meta':"goGroupLeft",'title':"Group Left"}//#codemirror:147
,{'topic':topic,'meta':"goGroupRight",'title':"Group Right"}//#codemirror:148
,{'divider':true}//#codemirror:149
,{'topic':topic,'meta':"goWordLeft",'title':"Word Left"}//#codemirror:150
,{'topic':topic,'meta':"goWordRight",'title':"Word Right"}//#codemirror:151
,{'divider':true}//#codemirror:152
,{'topic':topic,'meta':"goLineStart",'title':"Line Start"}//#codemirror:153
,{'topic':topic,'meta':"goLineStartSmart",'title':"Smart Line Start"}//#codemirror:154
,{'topic':topic,'meta':"goLineEnd",'title':"Line End"}//#codemirror:155
,{'divider':true}//#codemirror:156
,{'topic':topic,'meta':"goLineLeft",'title':"Line Left"}//#codemirror:157
,{'topic':topic,'meta':"goLineLeftSmart",'title':"Smart Line Left"}//#codemirror:158
,{'topic':topic,'meta':"goLineRight",'title':"Line Right"}//#codemirror:159
,{'divider':true}//#codemirror:160
,{'topic':topic,'meta':"goLineUp",'title':"Line Up"}//#codemirror:161
,{'topic':topic,'meta':"goLineDown",'title':"Line Down"}//#codemirror:162
,{'divider':true}//#codemirror:163
,{'topic':topic,'meta':"goPageUp",'title':"Page Up"}//#codemirror:164
,{'topic':topic,'meta':"goPageDown",'title':"Page Down"}//#codemirror:165
]}//#codemirror:166
,{'title':"Search",'children':[{'topic':topic,'meta':"find",'title':"Find..."}//#codemirror:168
,{'topic':topic,'meta':"findNext",'title':"Find Next"}//#codemirror:169
,{'topic':topic,'meta':"findPrev",'title':"Find Previous"}//#codemirror:170
,{'topic':topic,'meta':"clearSearch",'title':"Clear Search"}//#codemirror:171
,{'divider':true}//#codemirror:172
,{'topic':topic,'meta':"replace",'title':"Replace"}//#codemirror:173
,{'topic':topic,'meta':"replaceAll",'title':"Replace All"}//#codemirror:174
]}//#codemirror:177
,{'title':"View",'children':[{'topic':topic,'meta':"view_keyboard_shortcuts",'title':"Keyboard Shortcuts"}//#codemirror:179
,{'topic':topic,'meta':"fold_at_cursor",'title':"Fold at Cursor"}//#codemirror:180
,{'title':"Theme",'children':[{'title':"Dark",'children':[{'topic':topic,'meta':"set_option,theme,3024-night",'title':"3024"}//#codemirror:183
,{'topic':topic,'meta':"set_option,theme,ambiance",'title':"Ambience"}//#codemirror:184
,{'topic':topic,'meta':"set_option,theme,ambiance-mobile",'title':"Ambience (mobile)"}//#codemirror:185
,{'topic':topic,'meta':"set_option,theme,base16-dark",'title':"Base 16"}//#codemirror:186
,{'topic':topic,'meta':"set_option,theme,blackboard",'title':"Blackboard"}//#codemirror:187
,{'topic':topic,'meta':"set_option,theme,cobalt",'title':"Cobalt"}//#codemirror:188
,{'topic':topic,'meta':"set_option,theme,colorforth",'title':"Colour Forth"}//#codemirror:189
,{'topic':topic,'meta':"set_option,theme,erlang-dark",'title':"Erlang Dark"}//#codemirror:190
,{'topic':topic,'meta':"set_option,theme,lesser-dark",'title':"Lesser Dark"}//#codemirror:191
,{'topic':topic,'meta':"set_option,theme,mbo",'title':"MBO"}//#codemirror:192
,{'topic':topic,'meta':"set_option,theme,midnight",'title':"Midnight"}//#codemirror:193
,{'topic':topic,'meta':"set_option,theme,monokai",'title':"Monokai"}//#codemirror:194
,{'topic':topic,'meta':"set_option,theme,night",'title':"Night"}//#codemirror:195
,{'topic':topic,'meta':"set_option,theme,paraiso-dark",'title':"Paraiso"}//#codemirror:196
,{'topic':topic,'meta':"set_option,theme,pastel-on-dark",'title':"Pastel"}//#codemirror:197
,{'topic':topic,'meta':"set_option,theme,rubyblue",'title':"Ruby Blue"}//#codemirror:198
,{'topic':topic,'meta':"set_option,theme,the-matrix",'title':"The Matrix"}//#codemirror:199
,{'topic':topic,'meta':"set_option,theme,tomorrow-night-bright",'title':"Tomorrow Night"}//#codemirror:200
,{'topic':topic,'meta':"set_option,theme,tomorrow-night-eighties",'title':"Tomorrow Night Eighties"}//#codemirror:201
,{'topic':topic,'meta':"set_option,theme,twilight",'title':"Twilight"}//#codemirror:202
,{'topic':topic,'meta':"set_option,theme,vibrant-ink",'title':"Vibrant Ink"}//#codemirror:203
,{'topic':topic,'meta':"set_option,theme,xq-dark",'title':"XQ Dark"}//#codemirror:204
,{'topic':topic,'meta':"set_option,theme,zenburn",'title':"Zenburn"}//#codemirror:205
]}//#codemirror:206
,{'title':"Light",'children':[{'topic':topic,'meta':"set_option,theme,3024-day",'title':"3024"}//#codemirror:208
,{'topic':topic,'meta':"set_option,theme,base16-light",'title':"Base 16"}//#codemirror:209
,{'topic':topic,'meta':"set_option,theme,default",'title':"Default"}//#codemirror:210
,{'topic':topic,'meta':"set_option,theme,eclipse",'title':"Eclipse"}//#codemirror:211
,{'topic':topic,'meta':"set_option,theme,elegant",'title':"Elegant"}//#codemirror:212
,{'topic':topic,'meta':"set_option,theme,mdn-line",'title':"MDN"}//#codemirror:213
,{'topic':topic,'meta':"set_option,theme,neat",'title':"Neat"}//#codemirror:214
,{'topic':topic,'meta':"set_option,theme,neo>Neo"}//#codemirror:215
,{'topic':topic,'meta':"set_option,theme,paraiso-light",'title':"Paraiso"}//#codemirror:216
,{'topic':topic,'meta':"set_option,theme,solarized",'title':"Solarized"}//#codemirror:217
,{'topic':topic,'meta':"set_option,theme,xq-light",'title':"XQ Light"}//#codemirror:218
]}//#codemirror:219
]}//#codemirror:220
]}//#codemirror:221
,{'title':"Settings",'children':[{'title':"Keyboard",'children':[{'topic':topic,'meta':"set_mode,default",'title':"Code Mirror"}//#codemirror:224
,{'topic':topic,'meta':"set_mode,emacs",'title':"Emacs"}//#codemirror:225
,{'topic':topic,'meta':"set_mode,sublime",'title':"Sublime"}//#codemirror:226
,{'topic':topic,'meta':"set_mode,vim",'title':"Vi"}//#codemirror:227
]}//#codemirror:228
,{'divider':true}//#codemirror:229
,{'topic':topic,'meta':"toggle_option,smartIndent",'title':"Auto-indent"}//#codemirror:230
,{'title':"Indent",'children':[{'topic':topic,'meta':"set_option,indentUnit,2",'title':"2"}//#codemirror:232
,{'topic':topic,'meta':"set_option,indentUnit,4",'title':"4"}//#codemirror:233
]}//#codemirror:234
,{'topic':topic,'meta':"toggle_option,autoCloseBrackets",'title':"Close Brackets"}//#codemirror:235
,{'topic':topic,'meta':"toggle_option,matchBrackets",'title':"Match Brackets"}//#codemirror:236
,{'topic':topic,'meta':"toggle_option,matchTags",'title':"Match Tags"}//#codemirror:237
,{'divider':true}//#codemirror:238
,{'title':"Scroll Margin",'children':[{'topic':topic,'meta':"set_option,cursorScrollMargin,0",'title':"0"}//#codemirror:240
,{'topic':topic,'meta':"set_option,cursorScrollMargin,2",'title':"2"}//#codemirror:241
,{'topic':topic,'meta':"set_option,cursorScrollMargin,4",'title':"4"}//#codemirror:242
]}//#codemirror:243
,{'topic':topic,'meta':"toggle_option,continueComments",'title':"Comment Continuation"}//#codemirror:244
,{'topic':topic,'meta':"toggle_option,showTrailingSpace",'title':"Show Trailing Spaces"}//#codemirror:245
,{'topic':topic,'meta':"toggle_option,dragDrop",'title':"Toggle Drag and Drop"}//#codemirror:246
,{'topic':topic,'meta':"toggle_option,lineNumbers",'title':"Toggle Line Numbers"}//#codemirror:247
,{'topic':topic,'meta':"toggle_option,lineWrapping",'title':"Toggle Line Wrap"}//#codemirror:248
]}//#codemirror:249
];//#codemirror:250

var listener=(function(cm,data){var args=data.item.meta.split(",");//#codemirror:252

var command=args.shift();//#codemirror:253

args.unshift(cm)//#codemirror:254

CodeMirror.commands[command].apply(CodeMirror,args)//#codemirror:255
});//#codemirror:256

var open=(function(owner,wrapper){var cm=CodeMirror(wrapper,options);//#codemirror:258

cm.listener=(function(data){listener(cm,data)});//#codemirror:259

message.send("CodeMirror-menu",menu)//#codemirror:260

message.listen((owner+"-"+"CodeMirror-command"),cm.listener)//#codemirror:261

return cm
//#codemirror:262
});//#codemirror:263

var close=(function(cm){message.remove(cm.listener)//#codemirror:265
});//#codemirror:266

var spaces="                ";//#codemirror:267

var extra_commands={'view_keyboard_shortcuts':(function(cm){var keys=[];//#codemirror:270

var one_map=(function(map){Object.keys(map).forEach((function(key){switch(false){case !(key==="fallthrough"):var more=map[key];//#codemirror:275

switch(false){case !(typeof(more)==="string"):var more=[more];}//#codemirror:276

more.forEach((function(map){one_map(CodeMirror.keyMap[map])}))//#codemirror:278
//#codemirror:279
;break;case !true:keys.push((key+": "+map[key]))//#codemirror:280
}//#codemirror:281
}))//#codemirror:282
});//#codemirror:283

one_map(cm.options.extraKeys)//#codemirror:284

var core=CodeMirror.keyMap[cm.options.keyMap];//#codemirror:285

switch(false){case !!(core.fallthrough)//#codemirror:286
:core.fallthrough=CodeMirror.keyMap.default.fallthrough;}//#codemirror:287

one_map(core)//#codemirror:288

window.open(("data:text/html,"+encodeURIComponent(keys.join("<br>")))//#codemirror:290
,"Keys","width=300,height=600")//#codemirror:291
})//#codemirror:292
,'fold_at_cursor':(function(cm){cm.foldCode(cm.getCursor())//#codemirror:294
})//#codemirror:295
,'toggle_option':(function(cm,name){CodeMirror.commands.set_option(cm,name,!(cm.getOption(name)))//#codemirror:297
})//#codemirror:298
,'set_option':(function(cm,name,value){cm.setOption(name,value)//#codemirror:300

options[name]=value;//#codemirror:301

update_options()//#codemirror:302
})//#codemirror:303
,'set_mode':(function(cm,mode){CodeMirror.commands.set_option(cm,"keyMap",mode)//#codemirror:305
})//#codemirror:306
,'auto_complete':(function(cm){var not_only=(function(){var result=CodeMirror.hint.anyword.apply(null,arguments);//#codemirror:309

switch(false){case !(result.list.length!==1):return result
}//#codemirror:310

var size=(result.to.ch-result.from.ch);//#codemirror:311

switch(false){case !(list[0]
.length!==size):return result
}//#codemirror:312

result.list=[];//#codemirror:313

return result
//#codemirror:314
});//#codemirror:315
})//#codemirror:316
};//#codemirror:317

var mode_extensions={'apl':"apl",'as3':"apl",'asf':"apl",'c':"clike",'cpp':"clike",'h':"clike",'cs':"clike",'chh':"clike",'hh':"clike",'h__':"clike",'hpp':"clike",'hxx':"clike",'cc':"clike",'cxx':"clike",'c__':"clike",'"c++"':"c++",'':"clike",'stl':"clike",'sma':"clike",'java':"clike",'scala':"clike",'clj':"clojure",'cpy':"cobol",'cbl':"cobol",'cob':"cobol",'coffee':"coffeescript",'coffeescript':"coffeescript",'"gwt.coffee"':"gwt.coffee",'':"coffeescript",'vlx':"commonlisp",'fas':"commonlisp",'lsp':"commonlisp",'el':"commonlisp",'css':"css",'less':"css",'dl':"d",'d':"d",'diff':"diff",'dtd':"dtd",'dylan':"dylan",'ecl':"ecl",'e':"eiffel",'erl':"erlang",'hrl':"erlang",'f':"fortran",'for':"fortran",'FOR':"fortran",'f95':"fortran",'f90':"fortran",'f03':"fortran",'gas':"gas",'gfm':"gfm",'feature':"gherkin",'go':"go",'groovy':"groovy",'"html.haml"':"html.haml",'':"haml",'hx':"haxe",'lhs':"haskell",'gs':"haskell",'hs':"haskell",'asp':"htmlembedded",'jsp':"htmlembedded",'ejs':"htmlembedded",'http':"http",'html':"htmlmixed",'htm':"htmlmixed",'".py.jade"':".py.jade",'':"jade",'js':"javascript",'json':"javascript",'jinja2':"jinja2",'jl':"julia",'ls':"livescript",'lua':"lua",'markdown':"markdown",'mdown':"markdown",'mkdn':"markdown",'md':"markdown",'mkd':"markdown",'mdwn':"markdown",'mdtxt':"markdown",'mdtext':"markdown",'mdx':"mirc",'dcx':"mirc",'ml':"mllike",'fs':"mllike",'fsi':"mllike",'mli':"mllike",'fsx':"mllike",'fsscript':"mllike",'nginx':"nginx",'nt':"ntriples",'mex':"octave",'pas':"pascal",'pegjs':"pegjs",'ps':"perl",'php':"php",'"lib.php"':"lib.php",'':"php",'pig':"pig",'ini':"properties",'properties':"properties",'pp':"puppet",'py':"python",'q':"q",'r':"r",'rpm':"rpm",'"src.rpm"':"src.rpm",'':"rpm",'rst':"rst",'rb':"ruby",'rs':"rust",'sass':"sass",'scm':"scheme",'ss':"scheme",'sh':"shell",'sieve':"sieve",'sm':"smalltalk",'st':"smalltalk",'tpl':"smartymixed",'solr':"solr",'sparql':"sparql",'sql':"sql",'stex':"stex",'tex':"stex",'tcl':"tcl",'tw':"tiddlywiki",'tiki':"tiki",'toml':"toml",'ttl':"turtle",'vb':"vb",'bas':"vbscript",'vbs':"vbscript",'vtl':"velocity",'v':"verilog",'xml':"xml",'xquery':"xquery",'xq':"xquery",'xqy':"xquery",'yaml':"yaml",'yml':"yaml",'z80':"z80",'asm':"z80"};//#codemirror:365

var saved_mode_extensions=localStorage.CodeMirror_mode_extensions;//#codemirror:366

switch(false){case !saved_mode_extensions:var mode_extensions=dict.merge(mode_extensions,saved_mode_extensions)//#codemirror:368
;}//#codemirror:369
//#codemirror:370

var set_mode=(function(cm,name){var try_mode=(function(exts){var ext=exts.join(".");//#codemirror:373

switch(false){case !mode_extensions[ext]:return mode_extensions[ext]
}//#codemirror:374

switch(false){case !CodeMirror.modes[ext]:return ext
}//#codemirror:375

return false
//#codemirror:376
});//#codemirror:377

var mode=(function(){var parts=name.split(".");//#codemirror:379

switch(false){case !(parts.length>2):switch(false){case !try_mode(parts.slice(-2)):return try_mode(parts.slice(-2))
}}//#codemirror:380

switch(false){case !try_mode(parts.slice(-1)):return try_mode(parts.slice(-1))
}//#codemirror:381

return "text"
//#codemirror:382
})();//#codemirror:383

cm.setOption("mode",mode)//#codemirror:384

CodeMirror.autoLoadMode(cm,mode)//#codemirror:385
});//#codemirror:386
//#codemirror:387

var init_lispz_mode=(function(){CodeMirror.defineSimpleMode("lispz",{'start':[{'regex':/""/,'token':"string"}//#codemirror:392
,{'regex':/"/,'next':"string",'token':"string"}//#codemirror:393
,{'regex':/\'(?:[^\\]|\\.)*?\'/,'token':"variable-2"}//#codemirror:394
,{'regex':/###/,'next':"comment",'token':"comment"}//#codemirror:395
,{'regex':/(\()([!\s\(\[\{\)\}\]]*?!)/,'indent':true,'token':[null,"error"]}//#codemirror:397
,{'regex':/(\()([^\s\(\[\{\)\}\]]+)/,'indent':true,'token':[null,"keyword"]}//#codemirror:399
,{'regex':/true|false|null|undefined|debugger/,'token':"atom"}//#codemirror:400
,{'regex':/0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i,'token':"number"}//#codemirror:402
,{'regex':/## .*/,'token':"comment"}//#codemirror:403
,{'regex':/[\{\(\[]/,'indent':true}//#codemirror:404
,{'regex':/[\}\)\]]/,'dedent':true}//#codemirror:405
,{'regex':/[^\s\(\{\[\)\]\}]+/,'token':"variable"}//#codemirror:406
,{'regex':/\s+/,'next':"start"}//#codemirror:407
],'comment':[{'regex':/###/,'token':"comment",'next':"start"}//#codemirror:410
,{'regex':/.*/,'token':"comment"}//#codemirror:411
],'string':[{'regex':/[^\\]"/,'token':"string",'next':"start"}//#codemirror:414
,{'regex':/./,'token':"string"}//#codemirror:415
],'meta':{'lineComment':"## ",'dontIndentStates':["comment","string"]}//#codemirror:417
})//#codemirror:418

CodeMirror.defineMIME("text/lispz","lispz")//#codemirror:419

switch(false){case !(typeof(CodeMirror.mimeModes["text/html"])==="string")//#codemirror:421
:CodeMirror.mimeModes["text/html"]={'name':"htmlmixed"};}//#codemirror:422

var mode=CodeMirror.mimeModes["text/html"];//#codemirror:423

switch(false){case !!(mode.scriptTypes):mode.scriptTypes=[];}//#codemirror:424

mode.scriptTypes.push({'matches':/^text\/lispz$/,'mode':"lispz"})//#codemirror:425

CodeMirror.mimeModes.htmlmixed=mode;//#codemirror:426
//#codemirror:427

var lisp_modes={'lispz':true,'clojure':true,'commonlisp':true,'scheme':true};//#codemirror:429

subpar.core.run_selection=(function(cm){switch(false){case !cm.somethingSelected():var source=cm.doc.getSelection();//#codemirror:431
;break;case !true:var source=cm.doc.getValue();//#codemirror:432
}//#codemirror:433

console.log(lispz.run("lispz-repl",source))//#codemirror:434
});//#codemirror:435

var subpart=(function(cmd,opt){return (function(cm){var mode=cm.getModeAt(cm.getCursor());//#codemirror:438

switch(false){case !lisp_modes[mode.name]:subpar.core[cmd](cm,opt)//#codemirror:439
;break;case !true:return CodeMirror.Pass
//#codemirror:440
}//#codemirror:441
})
//#codemirror:442
});//#codemirror:443

dict.insert_$_(CodeMirror.commands,{'subpar_backward_delete':subpart("backward_delete")//#codemirror:446
,'subpar_forward_delete':subpart("forward_delete")//#codemirror:447
,'subpar_forward_delete':subpart("forward_delete")//#codemirror:448
//#codemirror:449
,'subpar_open_bracket':subpart("open_expression","()")//#codemirror:450
,'subpar_open_square_bracket':subpart("open_expression","[]")//#codemirror:451
,'subpar_open_braces':subpart("open_expression","{}")//#codemirror:452
//#codemirror:453
,'subpar_close_bracket':subpart("close_expression",")")//#codemirror:454
,'subpar_close_square_bracket':subpart("close_expression","]")//#codemirror:455
,'subpar_close_braces':subpart("close_expression","}")//#codemirror:456
//#codemirror:457
,'subpar_double_quote':subpart("double_quote")//#codemirror:458
//#codemirror:459
,'subpar_forward':subpart("forward")//#codemirror:460
,'subpar_backward':subpart("backward")//#codemirror:461
,'subpar_backward_up':subpart("backward_up")//#codemirror:462
,'subpar_forward_down':subpart("forward_down")//#codemirror:463
,'subpar_backward_down':subpart("backward_down")//#codemirror:464
,'subpar_forward_up':subpart("forward_up")//#codemirror:465
//#codemirror:466
,'subpar_backward_barf':subpart("backward_barf")//#codemirror:467
,'subpar_backward_barf':subpart("backward_barf")//#codemirror:468
,'subpar_backward_barf':subpart("backward_barf")//#codemirror:469
//#codemirror:470
,'subpar_forward_barf':subpart("forward_barf")//#codemirror:471
,'subpar_forward_barf':subpart("forward_barf")//#codemirror:472
//#codemirror:473
,'subpar_backward_slurp':subpart("backward_slurp")//#codemirror:474
,'subpar_backward_slurp':subpart("backward_slurp")//#codemirror:475
,'subpar_backward_slurp':subpart("backward_slurp")//#codemirror:476
//#codemirror:477
,'subpar_forward_slurp':subpart("forward_slurp")//#codemirror:478
,'subpar_forward_slurp':subpart("forward_slurp")//#codemirror:479
//#codemirror:480
,'subpar_splice_delete_backward':subpart("splice_delete_backward")//#codemirror:481
,'subpar_splice_delete_forward':subpart("splice_delete_forward")//#codemirror:482
,'subpar_splice':subpart("splice")//#codemirror:483
,'subpar_indent_selection':subpart("indent_selection")//#codemirror:484
//#codemirror:485
,'lispz_run_selection':subpart("run_selection")//#codemirror:486
})//#codemirror:487
});//#codemirror:488
//#codemirror:489

var build=(function(target_repo,built_q__g_){github.build(target_repo,"codemirror",[{'repo':"codemirror/CodeMirror",'files':[{'base':"lib",'include':/codemirror\.(js|css)$/}//#codemirror:495
,{'base':"addon/mode",'include':/^simple.js$/}//#codemirror:496
,{'base':"keymap"}//#codemirror:497
,{'base':"addon",'exclude':/test.js$|node.js$|standalone.js$|\/tern\//}//#codemirror:498
,{'base':"mode/htmlmixed",'include':/css$|js$/}//#codemirror:499
,{'base':"mode/javascript",'include':/css$|js$/}//#codemirror:500
,{'base':"mode/css",'include':/css$|js$/}//#codemirror:501
]}//#codemirror:502
,{'repo':"achengs/subpar",'files':[{'base':"resources/public/js",'include':/subpar.core.js/}//#codemirror:504
]}//#codemirror:505
],(function(){github.build(target_repo,"codemirror-themes",[{'repo':"codemirror/CodeMirror",'files':[{'base':"theme"}//#codemirror:509
]}//#codemirror:510
],(function(){github.build(target_repo,"codemirror-modes",[{'repo':"codemirror/CodeMirror",'files':[{'base':"mode",'exclude':/htmlmixed|javascript|css|elm.js$|test.js$/}//#codemirror:514
]}//#codemirror:515
],built_q__g_)//#codemirror:516
}))}))});//#codemirror:517
//#codemirror:518

net.css("ext/codemirror.css")//#codemirror:519

net.script("ext/codemirror.js",(function(){switch(false){case !window.CodeMirror:net.script("ext/codemirror-modes.js",(function(){}))//#codemirror:522

Object.keys(extra_commands).forEach((function(key){CodeMirror.commands[key]=extra_commands[key];//#codemirror:524
}))//#codemirror:525

init_lispz_mode()//#codemirror:526
}//#codemirror:527

__module_ready__({'options':options,'open':open,'close':close,'set_mode':set_mode,'build':build})//#codemirror:528
}))//#codemirror:529

setTimeout((function(){net.css("ext/codemirror-themes.css")}),100)//#codemirror:530
}))//#codemirror:531
//# sourceURL=codemirror.lispz

}

lispz_modules['firepad']=function anonymous(__module_ready__
/**/) {
lispz.load("net,github"//#core:48
,(function(){var net=lispz.cache["net"],github=lispz.cache["github"];
net.css("ext/firepad.css")//#firepad:2

net.script("ext/firepad.js",(function(){__module_ready__({'build':(function(target_repo,built_q__g_){github.grunt(target_repo,"firebase/firepad",(function(grunt,data){grunt.build({'target':"firepad.js",'pre':data.concat.firepadjs.options.banner,'post':data.concat.firepadjs.options.footer,'files':data.concat.firepadjs.src},(function(){grunt.copy(data.copy.toBuild.files,built_q__g_)//#firepad:13
}))//#firepad:14
}))//#firepad:15
})//#firepad:16
})//#firepad:17
}))//#firepad:18
}))//#firepad:19
//# sourceURL=firepad.lispz

}

lispz_modules['github']=function anonymous(__module_ready__
/**/) {
lispz.load("net,dict,list"//#core:48
,(function(){var net=lispz.cache["net"],dict=lispz.cache["dict"],list=lispz.cache["list"];
var cdn_uri=(function(project,filepath){return ("https://cdn.rawgit.com/"+project+"/master/"+filepath)
//#github:3
});//#github:4

var release_uri=(function(project,version,filename){return ("https://github.com/"+project+"/releases/download/"+version+"/"+filename)
//#github:7
});//#github:8

net.script("ext/github.js",(function(){var repo=(function(username,password,project){var github=(new Github({'username':username,'password':password,'auth':"basic"}));//#github:11

var repo=github.getRepo.apply(null,project.split("/"));//#github:12

repo.lispz={'github':github,'username':username,'password':password,'project':project,'branch':"master"};//#github:13

return repo
//#github:14
});//#github:15

var branch=(function(repo,branch_name,ready_q__g_){repo.lispz.branch=branch_name;//#github:18

repo.branch(branch_name,ready_q__g_)//#github:19
});//#github:20

var list_dir=(function(repo,path,ready_q__g_){repo.contents(repo.lispz.branch,path,ready_q__g_)//#github:23
});//#github:24

var list_all=(function(repo,path,single_level,ready_q__g_){var result=[];//#github:26

var _h_list_all=(function(path,level_done_q__g_){list_dir(repo,path,(function(err,data){switch(false){case !err:console.log(err)
throw("Error accessing GitHub")}//#github:29

list.sequential(data,(function(entry,next_q__g_){switch(false){case !("dir"===entry.type)//#github:31
:switch(false){case !single_level:_h_list_all(entry.path,next_q__g_)}//#github:32
;break;case !("file"===entry.type)//#github:33
:result.push(entry.path)
next_q__g_()//#github:34
}//#github:35
}),level_done_q__g_)//#github:36
}))//#github:37
});
_h_list_all(path,(function(){ready_q__g_(null,result)}))//#github:38
});//#github:39

var read=(function(repo,path,ready_q__g_){repo.read(repo.lispz.branch,path,ready_q__g_)//#github:41
});//#github:42

var update=(function(repo,ready_q__g_){switch(false){case !(repo.lispz.branch===repo.lispz.username):return ready_q__g_()
}//#github:44

var branch_name=lispz.globals.default_u_(repo.lispz.username,"master");//#github:45

branch(repo,branch_name,ready_q__g_)//#github:46
});//#github:47

var write=(function(repo,path,contents,comment,complete_q__g_){repo.write(repo.lispz.branch,path,contents,comment,complete_q__g_)//#github:49
});//#github:50

var preprocessors={'lispz':(function(name,code){return {'ext':"js",'code':window.lispz.compile(name,code)}
//#github:54
})//#github:55
};//#github:56

var preprocess=(function(path,code){var ext=path.split(".").slice(-1)[0];//#github:58

var preprocessor=preprocessors[ext];//#github:59

switch(false){case !!(preprocessor):return {'ext':ext,'code':code}
}//#github:60

return preprocessor(path,code)
//#github:61
});//#github:62

var retriever=(function(target_repo,sources,actors,retrieved_q__g_){var code={'js':[],'css':[],'copies':{},'from':["Gathered from: "]};//#github:65

list.sequential(sources,(function(source,source_read_q__g_){var source_repo=actors.repo(target_repo,source.repo);//#github:67

code.from.push(source.repo)//#github:68

list.sequential(source.files,(function(meta,file_set_read_q__g_){var base=lispz.globals.default_u_(meta.base,"");//#github:70

actors.list_all(source_repo,base,meta.single_level,(function(err,file_list){var files=file_list;//#github:72

switch(false){case !meta.include:var files=files.filter((function(file){return meta.include.test(file)
//#github:75
}));//#github:76
}//#github:77

switch(false){case !meta.exclude:var files=files.filter((function(file){return !(meta.exclude.test(file))
//#github:80
}));//#github:81
}//#github:82

list.sequential(files,(function(path,next_file_q__g_){actors.read(source_repo,path,(function(err,data){var entry=preprocess(path,data);//#github:85

var saver=code[entry.ext];//#github:86

switch(false){case !saver:saver.push(("\n\n/*"+path+"*/\n\n"))//#github:88

saver.push(entry.code)//#github:89
;break;case !meta.copy_to:var filename=path.split("/").slice(-1)[0];//#github:91

code.copies[(meta.copy_to+"/"+filename)]=data;//#github:92
}//#github:93

next_file_q__g_()//#github:94
}))//#github:95
}),file_set_read_q__g_)//#github:96
}))//#github:97
}),source_read_q__g_)//#github:98
}),(function(){retrieved_q__g_(code)}))//#github:99
});//#github:100

var builder=(function(target_repo,name,sources,actors,built_q__g_){retriever(target_repo,sources,actors,(function(code){var comment=code.from.join(" ");//#github:103

var save=(function(ext,done_q__g_){update(target_repo,(function(){var source=code[ext];//#github:105

switch(false){case !!(source.length):return done_q__g_()
}//#github:106

write(target_repo,("ext/"+name+"."+ext)//#github:107
,unescape(encodeURIComponent(source.join("")))//#github:108
,comment,done_q__g_)//#github:110
}))});//#github:111

save("js",(function(){save("css",(function(){dict.sequential(code.copies,(function(path,contents,next_file_q__g_){write(target_repo,path,unescape(encodeURIComponent(contents)),comment,next_file_q__g_)//#github:115
}),built_q__g_)//#github:116
}))}))//#github:117
}))//#github:118
});//#github:119

var github_actors={'list_all':list_all,'read':read,'repo':(function(target_repo,name){return repo(target_repo.lispz.username,target_repo.lispz.password,name)
//#github:125
})//#github:126
};//#github:127

var build=(function(target_repo,name,sources,built_q__g_){builder(target_repo,name,sources,github_actors,built_q__g_)//#github:129
});//#github:130

var grunt=(function(target_repo,source_project,process_q__g_){var source_repo=github_actors.repo(target_repo,source_project);//#github:132

var comment=("from "+source_project);//#github:133

var sources=[{'repo':source_project,'files':[{'include':/^Gruntfile.js$/,'single_level':true}//#github:136
]}//#github:137
];//#github:138

retriever(target_repo,sources,github_actors,(function(code){var grunt_config=Function(("var module={};"+code.js.slice(-1)[0]+"return module.exports"))();//#github:141

grunt_config({'loadNpmTasks':(function(){}),'registerTask':(function(){})//#github:143
,'initConfig':(function(config_data){var grunt={'build':(function(meta,built_q__g_){var js=[lispz.globals.default_u_(meta.pre,"")];//#github:147

var read_file=(function(path,next_q__g_){github_actors.read(source_repo,path,(function(err,data){js.push(data)
next_q__g_()//#github:150
}))//#github:151
});//#github:152

list.sequential(meta.files,read_file,(function(){js.push(lispz.globals.default_u_(meta.post,""))//#github:154

write(target_repo,("ext/"+meta.target)//#github:155
,unescape(encodeURIComponent(js.join("\n"))),comment,built_q__g_)//#github:156
}))//#github:157
})//#github:158
,'copy':(function(files,built_q__g_){var copy_q__g_=(function(item,next_q__g_){var path=lispz.globals.default_u_(item.src,item);//#github:161

github_actors.read(source_repo,path,(function(err,data){write(target_repo,("ext/"+path.split("/").slice(-1)[0])//#github:163
,unescape(encodeURIComponent(data)),comment,next_q__g_)//#github:164
}))//#github:165
});//#github:166

list.sequential(files,copy_q__g_,built_q__g_)//#github:167
})//#github:168
};//#github:169

update(target_repo,(function(){process_q__g_(grunt,config_data)}))//#github:170
})//#github:171
})//#github:172
}))//#github:173
});//#github:174

var build_github=(function(target_repo,built_q__g_){var sources=[{'repo':"michael/github",'files':[{'include':/github.js$/}//#github:178
]}//#github:179
];//#github:180

build(target_repo,"github",sources,built_q__g_)//#github:181
});//#github:182

__module_ready__({'branch':branch,'list_all':list_all,'list_dir':list_dir,'cdn_uri':cdn_uri,'build':build,'builder':builder,'repo':repo,'read':read,'write':write,'update':update,'build_github':build_github,'release_uri':release_uri,'retriever':retriever,'grunt':grunt,'preprocessors':preprocessors,'move':(function(repo,from,to,ready_q__g_){repo.move(repo.lispz.branch,from,to,complete_q__g_)//#github:187
})//#github:188
,'delete':(function(repo,path,ready_q__g_){repo.remove(repo.lispz.branch,path,complete_q__g_)//#github:190
})//#github:191
})//#github:192
}))//#github:193
}))//#github:194
//# sourceURL=github.lispz

}

lispz_modules['dev']=function anonymous(__module_ready__
/**/) {
lispz.load("net,github,dict,list,riot"//#core:48
,(function(){var net=lispz.cache["net"],github=lispz.cache["github"],dict=lispz.cache["dict"],list=lispz.cache["list"],riot=lispz.cache["riot"];
var manifest=(function(){var text=["CACHE MANIFEST"];//#dev:3

lispz.manifest.forEach((function(uri){text.push(uri)}))//#dev:4

text.push("NETWORK:","*")//#dev:5

return text.join("\n")
//#dev:6
});//#dev:7
//#dev:8

var package=(function(lispz_repo,packaged_q__g_){github.update(lispz_repo,(function(){github.list_dir(lispz_repo,"",(function(err,meta_list){var modules=[],riots=[];//#dev:11

meta_list.forEach((function(entry){switch(false){case !!(("file"===entry.type)):return !(("file"===entry.type))
}//#dev:13

var parts=entry.name.split(".");//#dev:14

var ext=parts.slice(-1)[0];//#dev:15

switch(false){case !(ext==="lispz"):modules.push(parts[0])//#dev:17
;break;case !(lispz.globals.slice(parts,-2).join(".")==="riot.html"):riots.push(entry.name)//#dev:18
}//#dev:19
}))//#dev:20

lispz.load(modules.join(","),(function(){github.read(lispz_repo,"lispz.js",(function(err,lispz_js){var source=["window.lispz_modules={}"];//#dev:23

dict.for_each(lispz.cache,(function(key,value){var contents=lispz_modules[key].toString();//#dev:25

source.push("\n\nlispz_modules['",key,"']=",contents)//#dev:26
}))//#dev:27

source.push("\n/*lispz.js*/\n",lispz_js,"//# sourceURL=lispz.js\n")//#dev:28

list.sequential(riots,(function(path,next_q__g_){github.read(lispz_repo,path,(function(err,data){source.push(("\n\n/*"+path+"*/\n\nlispz.tags['"+path+"']=function(){")//#dev:32
,riot.compile(data,true)//#dev:33
,"}//# sourceURL=",path,"\n")//#dev:35

next_q__g_()//#dev:36
}))//#dev:37
}),(function(){github.write(lispz_repo,("ext/lispz.js")//#dev:39
,unescape(encodeURIComponent(source.join("")))//#dev:40
,"lispz release code",packaged_q__g_)//#dev:42
}))//#dev:43
}))//#dev:44
}))//#dev:45
}))//#dev:46
}))});//#dev:47
//#dev:48

var distribute=(function(target_repo){});//#dev:50
//#dev:51

__module_ready__({'manifest':manifest,'package':package,'distribute':distribute})//#dev:52
}))//#dev:53
//# sourceURL=dev.lispz

}

lispz_modules['dexie']=function anonymous(__module_ready__
/**/) {
lispz.load("net,github"//#core:48
,(function(){var net=lispz.cache["net"],github=lispz.cache["github"];
var build=(function(target_repo,built_q__g_){github.build(target_repo,"dexie",[{'repo':"dfahlander/Dexie.js",'files':[{'base':"dist/latest",'include':/Dexie.js$/}//#dexie:6
]}//#dexie:7
],built_q__g_)//#dexie:8
});//#dexie:9
//#dexie:10

net.script("ext/dexie.js",(function(){__module_ready__({'build':build})}))//#dexie:11
}))//#dexie:12
//# sourceURL=dexie.lispz

}
/*lispz.js*/
var lispz = function() {
  var delims = "(){}[]n".split(''), // characters that are not space separated atoms
  not_delims = delims.join("\\"), delims = delims.join('|\\'),
  stringRE =
    "''|'[\\s\\S]*?[^\\\\]':?|" +
    '""|"(?:.|\\r*\\n)*?[^\\\\]"|' +
    '###+(?:.|\\r*\\n)*?###+|' + '##\\s+.*?\\r*\\n|',
  tkre = new RegExp('(' + stringRE + '\\' + delims + "|[^\\s" + not_delims + "]+)", 'g'),
  opens = new Set("({["), closes = new Set(")}]"), ast_to_js, slice = [].slice, contexts = [],
  module = {line:0, name:"boot"}, globals = {}, load_index = 0,
  synonyms = {and:'&&',or:'||',is:'===',isnt:'!=='},
  jsify = function(atom) {
    if (/^'.*'$/.test(atom)) return atom.slice(1, -1).replace(/\\n/g, '\n')
    if (/^"(?:.|\r*\n)*"$/.test(atom)) return atom.replace(/\r*\n/g, '\\n')
    switch (atom[0]) {
      case '-': return atom // unary minus or negative number
      default:  return atom.replace(/\W/g, function(c) {
        var t = "$hpalcewqgutkri"["!#%&+:;<=>?@\\^~".indexOf(c)];
        return t ? ("_"+t+"_") : (c === "-") ? "_" : c })
    }
  },
  call_to_js = function(func, params) {
    params = slice.call(arguments, 1)
    contexts.some(function(pre){if (macros[pre+'.'+func]) {func = pre+'.'+func; return true}})
    if (synonyms[func]) func = synonyms[func]
    if (macros[func]) return macros[func].apply(lispz, params)
    func = ast_to_js(func)
    if (params[0] && params[0][0] === '.') func += params.shift()
    return func + '(' + params.map(ast_to_js).join(',') + ')'
  },
  macro_to_js = function(name, pnames, body) {
    body = slice.call(arguments, 2)
    if (pnames[0] === "\n") pnames = pnames.slice(3) // drop line number component
    macros[name] = function(pvalues) {
      pvalues = slice.call(arguments)
      if (pvalues[0] === "\n") pvalues = pvalues.slice(3) // drop line number component
      var args = {}
      pnames.slice(1).forEach(function(pname, i) {
        args[pname] = (pname[0] === '*') ? ["list"].concat(pvalues.slice(i)) :
                      (pname[0] === '&') ? ["["].concat(pvalues.slice(i)) : pvalues[i]
      })
      var expand = function(ast) {
        return (ast instanceof Array) ? ast.map(expand) : args[ast] || ast
      }
      contexts.unshift(name)
      var js = ast_to_js(expand((body.length > 1) ? ["list"].concat(body) : body[0]))
      contexts.shift()
      return js
    }
    return "/*macro "+name+"*/"
  },
  array_to_js = function() {
    var its = slice.call(arguments)
    if (arguments.length === 1 && arguments[0][0] === '[') {
      return "[" + its.map(ast_to_js).join(',') + "]"
    }
    return its.map(ast_to_js).join(',')
  },
  list_to_js = function(its) {
    return slice.call(arguments).map(ast_to_js).join('\n')
  },
  // A dictionary can be a symbol table or k-value pair
  dict_to_js = function(kvp) {
    var dict = []; kvp = slice.call(arguments)
    for (var key, i = 0, l = kvp.length; i < l; i++) {
      if ((key = kvp[i])[kvp[i].length - 1] === ":") {
        dict.push("'"+jsify(key.slice(0, -1))+"':"+ast_to_js(kvp[++i]));
      } else {
        dict.push("'"+jsify(key)+"':"+ast_to_js(key));
      }
    }
    return "{" + dict.join(',') + "}";
  },
  join_to_js = function(sep, parts) {
    parts = slice.call((arguments.length > 2) ? arguments : parts, 1)
    return parts.map(ast_to_js).join(ast_to_js(sep))
  },
  immediate_to_js = function() {
    return slice.call(arguments).map(ast_to_js).map(eval)
  },
  // processing pairs of list elements
  pairs_to_js = function(pairs, tween, sep) {
    var el = [], tween = ast_to_js(tween);
    if (!(pairs.length % 2)) throw {message:"Unmatched pairs"}
    for (var i = 1, l = pairs.length; i < l; i += 2) {
        el.push(ast_to_js(pairs[i]) + tween + ast_to_js(pairs[i + 1]))
    }
    return el.join(ast_to_js(sep))
  },
  binop_to_js = function(op) {
    macros[op] = function(list) { return '(' + slice.call(arguments).map(ast_to_js).join(op) + ')' }
  },
  /*
   * When there was a new-line in the source, we inject it into the prior non-atom
   * if possible. Now we are generating JavaScript we find and process it. This is
   * because comments can't have their own atom or they will screw up argument lists.
   */
  eol_to_js = function(name, number) {
    module = {name:name, line:number}
    var ast = slice.call(arguments, 2)
    var line = ast_to_js(ast)
    if (ast[0] !== "[" && (ast[0] !== "\n" || ast[3] !== "[")) {
      line += "//#" + name + ":" + number + "\n"
    }
    return line
  },
  parsers = [
    [/^(\(|\{|\[)$/, function(env) {
      env.stack.push(env.node)
      env.node = [env.atom]
    }],
    [/^(\)|\}|\])$/, function(env) {
      var f = env.node;
      try { (env.node = env.stack.pop()).push(f) }
      catch(e) { compile_error("Unmatched closing bracket") }
    }],
    /*
     * Record line number for JS comment. Can't add a new element,
     * so only do it if last compiled is not an atom.
     */
    [/^\n$/, function(env) {
      if (!env.node.length) return
      var atom = env.node[env.node.length - 1]
      if (!(atom instanceof Array)) return
      atom.unshift('\n', module.name, module.line)
    }]
  ],
  comment = function(atom) {
    return atom[0] === "#" && atom[1] === "#" && (atom[2] === '#' || atom[2] == ' ')
  },
  compile_error = function(msg, data) {
    var errloc = module.name+".lispz:"+module.line
    console.log(errloc, msg, data)
    return ['throw "compile error for ' + errloc.replace(/["\n]/g," ") +
            " -- " + msg.replace(/"/g,"'") + '"\n']
  },
  parse_to_ast = function(source) {
    var env = { ast: [], stack: [] }
    env.node = env.ast
    tkre.lastIndex = 0
    while ((env.atom = tkre.exec(source.toString())) && (env.atom = env.atom[1])) {
      module.line += (env.atom.match(/\n/g) || []).length
      if (!comment(env.atom) && !parsers.some(function(parser) {
          if (!parser[0].test(env.atom)) return false
          parser[1](env)
          return true
        })) { env.node.push(env.atom); } }
    if (env.stack.length != 0) return compile_error("missing close brace", env)
    return env.ast
  },
  ast_to_js = function(ast) {
    return (ast instanceof Array) ? macros[ast[0]] ?
      macros[ast[0]].apply(this, ast.slice(1)) : list_to_js(ast) : jsify(ast)
  },
  compile = function(name, source) {
    try {
      var last_module = module
      module = {name:name, line:0}
      var js = parse_to_ast(source).map(ast_to_js)
      module = last_module
      return js
    } catch (err) { return compile_error(err.message, source) }
  },
  run = function(name, source) { return compile(name, source).map(eval) },
  //######################### Script Loader ####################################//
  cache = {}, manifest = [], pending = {}, modules = {}
  http_request = function(uri, type, callback) {
    var req = new XMLHttpRequest()
    req.open(type, uri, true)
    if (lispz.debug && uri.indexOf(":") == -1)
      req.setRequestHeader("Cache-Control", "no-cache")
    req.onerror = function(err) {
      callback({ uri: uri, error: err })
    }
    req.onload = function() {
      manifest.push(req.responseURL)
      if (req.status === 200) callback({ uri:uri, text: req.responseText })
      else                    req.onerror(req.statusText)
    }
    req.send()
  },
  module_init = function(uri, on_readies) {
    modules[uri](function(exports) {
      cache[uri.split('/').pop()] = cache[uri] = exports
      delete pending[uri]
      on_readies.forEach(function(call_module) {call_module(exports)})
    })
  }
  load_one = function(uri, on_ready) {
    if (cache[uri]) return on_ready()
    if (pending[uri]) return pending[uri].push(on_ready)
    if (modules[uri]) return module_init(uri, [on_ready])
    pending[uri] = [on_ready]; var js = ""
    http_request(uri + ".lispz", 'GET', function(response) {
      try {
        var name = uri.split('/').pop()
        if (!response.text) return on_ready(response) // probably an error
        js = compile(uri, response.text).join('\n') +
          "//# sourceURL=" + name + ".lispz\n"
        modules[uri] = new Function('__module_ready__', js)
        module_init(uri, pending[uri])
      } catch (e) {
        delete pending[uri]
        throw e
      }
    })
  },
  // Special to set variables loaded with requires
  requires_to_js = function(list) {
    list = list.slice(list.indexOf("[") + 1)
    return 'var ' + list.map(function(module) {
      var name = module.trim().split('/').pop()
      return jsify(name) + '=lispz.cache["' + name + '"]'
    }) + ';'
  },
  load = function(uris, on_all_ready) {
    uris = uris.split(",")
    var next_uri = function() {
      if (uris.length) load_one(uris.shift().trim(), next_uri)
      else if (on_all_ready) on_all_ready()
    }
    next_uri()
  }
  if (window) window.onload = function() {
    var q = document.querySelector('script[src*="lispz.js"]').getAttribute('src').split('#')
    load(((q.length == 1) ? "core" : "core," + q.pop()),
      function() {
        slice.call(document.querySelectorAll('script[type="text/lispz"]')).forEach(
          function (script) { run("script", script.textContent) })
    })
  }
  //#########################    Helpers    ####################################//
  var clone = function (obj) {
    var target = {};
    for (var i in obj) if (obj.hasOwnProperty(i)) target[i] = obj[i];
    return target;
  }
  //#########################   Interface   ####################################//
  var macros = {
    '(': call_to_js, '[': array_to_js, '{': dict_to_js, 'macro': macro_to_js,
    '#join': join_to_js, '#pairs': pairs_to_js, '#binop': binop_to_js,
    '#requires': requires_to_js, 'list': list_to_js,
    '\n': eol_to_js, 'immediate': immediate_to_js
  }
  // add all standard binary operations (+, -, etc)
  "+,-,*,/,&&,||,==,===,<=,>=,!=,!==,<,>,^,%".split(',').forEach(binop_to_js)

  return { compile: compile, run: run, parsers: parsers, load: load,
           macros: macros, cache: cache, http_request: http_request,
           clone: clone, manifest: manifest, modules: modules,
           synonyms: synonyms, globals: globals, tags: {} }
}()
//# sourceURL=lispz.js


/*bootstrap.riot.html*/

lispz.tags['bootstrap.riot.html']=function(){riot.tag('panel', ' <div class="panel { context }" name=outer> <div class=panel-heading if="{ opts.heading }" name=heading ><bars-menu align=right name="{ opts.menu }" owner="{ opts.owner }"></bars-menu> <h3 class=panel-title>{ opts.heading }</h3></div> <div class="panel-body" name=body><yield></yield></div> <div class=panel-footer if="{ opts.footer }" name=footer >{ opts.footer }</div> </div>', 'panel .panel { position: relative; } panel .panel-title { cursor: default; } panel .panel-body { position: absolute; top: 40px; bottom: 10px; left: 0; right: 0; }', function(opts) {var tag=this;//#riot-tags:2

tag.context=("panel-"+(opts.context||"default"));//#riot-tags:3

tag.on("mount",(function(){switch(false){case !opts.height:var px=opts.height;//#riot-tags:6

switch(false){case !("%"===opts.height.slice(-1))//#riot-tags:7
:var px=((window.innerHeight*opts.height.slice(0,-1))/100);//#riot-tags:8
}//#riot-tags:9

tag.outer.style.height=(px+"px");//#riot-tags:10
}//#riot-tags:11
}))//#riot-tags:12

});

riot.tag('bars-menu', '<div name=dropdown class="dropdown { right: opts.align === \'right\' }"> <a style="text-decoration: none" data-toggle="dropdown" name=bars class="glyphicon glyphicon-menu-hamburger dropdown-toggle" aria-hidden="true" ></a> <ul class="dropdown-menu { dropdown-menu-right: opts.align === \'right\' }"> <li each="{ items }" class="{ dropdown-header: header && title, divider: divider, disabled: disabled }"><a onclick="{ goto }" href="#"> <span class="pointer right float-right" if="{ children }"></span> { title } </a></li> </ul> </div>', 'bars-menu > div.right { float: right } bars-menu span.caret { margin-left: -11px } bars-menu a.dropdown-toggle { cursor: pointer }', function(opts) {var tag=this,root=null;//#riot-tags:2

lispz.load("message"//#core:48
,(function(){var message=lispz.cache["message"];
message.listen(opts.name,(function(items){root=(items||[]);//#riot-tags:5

tag.items=items;//#riot-tags:6

tag.update()//#riot-tags:7
}))//#riot-tags:8
//#riot-tags:9

tag.on("mount",(function(){$(tag.dropdown).on("show.bs.dropdown",(function(){tag.items=root;//#riot-tags:12

tag.update()//#riot-tags:13
}))//#riot-tags:14
}))//#riot-tags:15
//#riot-tags:16

tag.goto=(function(ev){switch(false){case !ev.item.topic:message.send((opts.owner+"-"+ev.item.topic)//#riot-tags:19
,{'item':ev.item,'owner':opts.owner,'action':"select"})}//#riot-tags:20

switch(false){case !ev.item.children:tag.items=ev.item.children;//#riot-tags:22

ev.currentTarget.blur()//#riot-tags:23

ev.stopPropagation()//#riot-tags:24
}//#riot-tags:25
});//#riot-tags:26
}))//#riot-tags:27

});

riot.tag('tree', '<tree-component name=base></tree-component>', function(opts) {var tag=this;//#riot-tags:2

lispz.load("message"//#core:48
,(function(){var message=lispz.cache["message"];
message.listen(opts.name,(function(items){tag.children={'base':{'children':items}};//#riot-tags:5

tag.update()
tag.update()//#riot-tags:6
}))//#riot-tags:7
}))//#riot-tags:8

});

riot.tag('tree-component', '<ul class="dropdown-menu"> <li each="{ item, i in items }" class="{ dropdown-header: item.header && item.title, divider: item.divider, disabled: item.disabled }" ><a onclick="{ parent.goto }" href="#"> <span if="{ item.children }" class="glyphicon glyphicon-triangle-right" aria-hidden="true"></span>{ item.title }</a> <tree-component if="{ item.children }" name="{ item.title }"> </li> </ul>', 'tree-component ul { display: inherit !important; position: inherit !important; } tree-component:not([name=base]) > ul { display: none !important; } tree-component:not([name=base]).open > ul { margin-left: 9px; margin-right: 9px; display: inherit !important; } tree-component span.glyphicon { margin-left: -18px; }', function(opts) {var tag=this;//#riot-tags:2

lispz.load("message,dict"//#core:48
,(function(){var message=lispz.cache["message"],dict=lispz.cache["dict"];
tag.on("update",(function(data){switch(false){case !(opts.name&&tag.parent.children):tag.items=tag.parent.children[opts.name]["children"];//#riot-tags:6

switch(false){case !(tag.items&&tag.items.length)//#riot-tags:7
:tag.children=dict.from_list(tag.items,"title");//#riot-tags:8
}//#riot-tags:9
}//#riot-tags:10
}))//#riot-tags:11
//#riot-tags:12

tag.goto=(function(ev){var item=ev.item.item;//#riot-tags:14

var topic=(item.topic||item.title);//#riot-tags:15

switch(false){case !topic:message.send(topic,{'item':item,'action':"select"})}//#riot-tags:17

switch(false){case !item.children:var tree=ev.currentTarget.nextElementSibling;//#riot-tags:19

tree.classList.toggle("open")//#riot-tags:20

tree.parentElement.classList.toggle("bg-info")//#riot-tags:21
}//#riot-tags:22

ev.stopPropagation()//#riot-tags:23
});//#riot-tags:24
}))//#riot-tags:25

});

riot.tag('sidebar', '<a aria-hidden="true" name=hamburger class="glyphicon glyphicon-menu-hamburger"></a> <div id=sidebar class="container bg-primary"><yield></yield></div>', 'sidebar > a { text-decoration: none !important; position: absolute !important; z-index: 2000; } #sidebar { z-index: 1000; position: fixed; width: 0; height: 100%; overflow-y: auto; -webkit-transition: all 0.5s ease; -moz-transition: all 0.5s ease; -o-transition: all 0.5s ease; transition: all 0.5s ease; padding-right: 0; overflow: hidden; } #sidebar.toggled { width: auto; padding-right: 15px; }', function(opts) {var tag=this;//#riot-tags:2

lispz.load("message,dom"//#core:48
,(function(){var message=lispz.cache["message"],dom=lispz.cache["dom"];
tag.hamburger.onclick=(function(){tag.sidebar.classList.toggle("toggled")//#riot-tags:5

setTimeout((function(){message.send("page-content-wrapper-padding",tag.sidebar.offsetWidth)//#riot-tags:7
}),300)//#riot-tags:8
});//#riot-tags:9

tag.on("mount",setTimeout((function(){message.send("page-content-wrapper-padding",tag.sidebar.offsetWidth)//#riot-tags:11
}),300))//#riot-tags:12
}))//#riot-tags:13

});

riot.tag('page-content', '<div id=page_content_wrapper> <div class="{ container-fluid: opts.fluid, container: !opts.fluid }"> <yield></yield> </div> </div>', '#page_content_wrapper { width: 100%; position: absolute; }', function(opts) {var tag=this;//#riot-tags:2

lispz.load("message"//#core:48
,(function(){var message=lispz.cache["message"];
message.listen("page-content-wrapper-padding",(function(px){tag.page_content_wrapper.style.paddingLeft=(px+"px");//#riot-tags:5
}))//#riot-tags:6
}))//#riot-tags:7

});

riot.tag('bootstrap', '<div id=page-wrapper><yield></yield></div>', '.pointer { border: 5px solid transparent; display: inline-block; width: 0; height: 0; vertical-align: middle; } .pointer.float-right { float: right; margin-top: 5px; } .pointer.up { border-bottom: 5px solid; } .pointer.right { border-left: 5px solid; } .pointer.down { border-top: 5px solid; } .pointer.left { border-right: 5px solid; }', function(opts) {var tag=this;//#riot-tags:2

lispz.load("dom,net,jquery,riot,message,bootstrap"//#core:48
,(function(){var dom=lispz.cache["dom"],net=lispz.cache["net"],jquery=lispz.cache["jquery"],riot=lispz.cache["riot"],message=lispz.cache["message"],bootstrap=lispz.cache["bootstrap"];
var bootswatch_themes=["cerulean","cosmo","cyborg","darkly","flatly","journal","lumen","paper","readable","sandstone","simplex","slate","spacelab","superhero","united","yeti"];//#riot-tags:6
//#riot-tags:11

message.listen("change-bootstrap-theme",(function(theme){switch(false){case !!((typeof(theme)!=="undefined"))//#riot-tags:13
:var theme=bootswatch_themes[lispz.globals.random(bootswatch_themes.length)];//#riot-tags:14
}//#riot-tags:15

net.css(("https://bootswatch.com/"+theme+"/bootstrap.css"))//#riot-tags:16
}))//#riot-tags:17

dom.append_$_("head",dom.element("meta",{'name':"viewport",'content':"width=device-width, initial-scale=1"}//#riot-tags:19
))//#riot-tags:20
}))//#riot-tags:21

});
}//# sourceURL=bootstrap.riot.html


/*codemirror.riot.html*/

lispz.tags['codemirror.riot.html']=function(){riot.tag('codemirror', '<div name=wrapper> </div>', function(opts) {var tag=this;//#riot-tags:2

lispz.load("codemirror"//#core:48
,(function(){var codemirror=lispz.cache["codemirror"];
tag.cm=CodeMirror(tag.wrapper,opts);//#riot-tags:4
}))//#riot-tags:5

});
}//# sourceURL=codemirror.riot.html


/*firepad.riot.html*/

lispz.tags['firepad.riot.html']=function(){riot.tag('firepad', ' <panel height="{ opts.height }" heading="{ heading }" menu="{ menu }" owner="{ _id }"> <div name=wrapper class=wrapper></div> </panel>', 'firepad .wrapper { position: absolute; top: 0; bottom: 0; left: 0; right: 0; height: initial; } firepad .CodeMirror { position: absolute; top: 0; bottom: 0; left: 5px; right: 0; height: initial; } a.powered-by-firepad { display: none; } div.firepad-toolbar { margin-top: -25px; }', function(opts) {var tag=this;//#riot-tags:2

tag.menu="CodeMirror-menu";//#riot-tags:3

tag.heading="Edit";//#riot-tags:4

lispz.load("firebase,codemirror,firepad,message,dict"//#core:48
,(function(){var firebase=lispz.cache["firebase"],codemirror=lispz.cache["codemirror"],firepad=lispz.cache["firepad"],message=lispz.cache["message"],dict=lispz.cache["dict"];
var filename_key=("codemirror/"+opts.name+"/filename");//#riot-tags:6

var cm=codemirror.open(tag._id,tag.tags.panel.wrapper);//#riot-tags:7

var pad={'setText':(function(contents){cm.setValue(contents)})//#riot-tags:9
,'on_ready':(function(act){act()})//#riot-tags:10
};//#riot-tags:11
//#riot-tags:12

var open=(function(packet){codemirror.set_mode(cm,packet.key)//#riot-tags:14

tag.heading=packet.key.split("/").slice(-1)[0];//#riot-tags:15

localStorage[filename_key]=packet.key;//#riot-tags:16

switch(false){case !packet.contents:pad.setText(packet.contents)}//#riot-tags:17

tag.update()//#riot-tags:18
});//#riot-tags:19
//#riot-tags:20

switch(false){case !opts.db:var db=firebase.attach(("firepads/"+opts.name),opts.db);//#riot-tags:23

pad=Firepad.fromCodeMirror(db,cm,{'richTextShortcuts':false,'richTextToolbar':false}//#riot-tags:25
);//#riot-tags:26

pad.on_ready=(function(act){pad.on("ready",act)});//#riot-tags:27
;break;case !true:var contents=("codemirror/"+opts.name+"/contents");//#riot-tags:29

var filename=localStorage[filename_key];//#riot-tags:30

switch(false){case !filename:setTimeout((function(){open({'key':filename,'contents':localStorage[contents]})//#riot-tags:33
}),100)}//#riot-tags:34

cm.on("change",(function(){localStorage[contents]=cm.getValue();//#riot-tags:36
}))//#riot-tags:37
//#riot-tags:38
}//#riot-tags:39
//#riot-tags:40

pad.on_ready((function(){message.dispatch(("firepad/"+opts.name),{'open':open})//#riot-tags:42
}))//#riot-tags:43
}))//#riot-tags:44

});
}//# sourceURL=firepad.riot.html


/*lispz-repl.riot.html*/

lispz.tags['lispz-repl.riot.html']=function(){riot.tag('lispz-repl', '<div id=lispz_repl_div class="{ hidden:hidden }"> <input type=text name=usings autocomplete=on size=20 placeholder="(package-list (* to reload))"> <input type=text name=code autocomplete=on size=50 placeholder="(Lispz code - enter to execute)"> </div>', 'lispz-repl {position: absolute; bottom: 0;} lispz-repl .hidden {display: none}', function(opts) {var tag=this;//#riot-tags:2

tag.hidden=true;//#riot-tags:3

var run=(function(){var source=tag.usings.value.split(" ").map((function(pkg){switch(false){case !(pkg[0]==="*"):var pkg=pkg.slice(1);//#riot-tags:7

delete(lispz.cache[pkg])//#riot-tags:8

delete(lispz.cache[pkg.split("/").slice(-1)[0]])//#riot-tags:9
}//#riot-tags:10

return pkg
//#riot-tags:11
})).join(",");//#riot-tags:12

switch(false){case !source:var source=("(using ["+source+"] "+tag.code.value+")");//#riot-tags:14
;break;case !true:var source=tag.code.value;//#riot-tags:15
}//#riot-tags:16

console.log(lispz.run("lispz-repl",source))//#riot-tags:17

tag.code.select()//#riot-tags:18
});//#riot-tags:19
//#riot-tags:20

var toggle_show_repl=(function(){tag.hidden=!(tag.hidden);
tag.update()//#riot-tags:22

tag.code.focus()
tag.code.select()//#riot-tags:23
});//#riot-tags:24
//#riot-tags:25

document.body.addEventListener("keydown",(function(ev){switch(false){case !(ev.altKey&&ev.shiftKey&&(ev.keyCode===82)):toggle_show_repl()//#riot-tags:27
}}))//#riot-tags:28

tag.code.addEventListener("keypress",(function(ev){switch(false){case !(ev.keyCode===13):run()}}))//#riot-tags:30

});
}//# sourceURL=lispz-repl.riot.html
