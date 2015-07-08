// todo: macro needs to parse strings (tkre them)
// need to build s-expression them process it
// add implicit brackets in repl if needed
var lispz = function() { var alias;
  // characters that are not space separated atoms (n becomes linefeed in regex)
  var delimiters = "(){}[];'`|n".split('');
  var not_delimiters = delimiters.join("\\"); delimiters = delimiters.join('|\\')
  // Keep state stack for when we start a new inner list ()[]{}
  var push_state=function(env) {env.stack.push(env.list);env.list=[env.atom]};
  var pop_state=function(env){var list=env.list;(env.list=env.stack.pop()).push(list);}
  // when a list is closed we process it given the opening command/type
  var list2js = function(env,list){return env.list2js[list[0]](env, list)}
  // processing pairs of list elements - use with bind
  var pairs = function(env,fore,tween,aft){return function(env,list){
    var el=[]; for(var i=1,l=list.length;i<l;i+=2){
      el.push(list2js(env,list[i])+tween+list2js(env,list[i+1]))};
    return fore+el.join(',')+aft}}
  // Convert a list of lists to a list of js fragments
  var lists2list=function(env,lists){return lists.map(function(list){
    return list2js(env,list)})};
  // convert a list to a javascript call
  var call2js=function(env,list){var params=lists2list(env,list.slice(2).slice(1));
    return " "+list[1]+"("+params.join(',')+');'}
  // Take symbols javascript doesn't recognise and convert
  replacements = {'!':"$bang$",'#':"$hash$",'%':"$percent$",'&':"$ampersand",
    '*':"$star$",'+':"$plus$",'-':"$dash$",'/':"$slash$",':':"$colon$",
    ';':"$semicolon$",'<':"$less$",'=':"$equal",'>':"$greater$",
    '?':"$question$",'@':"$at$",'\\':"$slosh$",'^':"$caret$",'~':"$tilde$"}
  var jsify = function(atom) { return atom.replace(/\W/g, function(symbol){
    var rep=replacements[symbol]; return rep ? rep : symbol})}
  // convert a list to a function definition
  var lambda2js=function(env,list){params=list[1].slice(1).map(function(p){
    return jsify(p[1])});return "(function("+params.join(',')+"){return "+
      lists2list(env,list.slice(2)).join(",")+"})"};
  // macros and other list2js functions need an delimit method as well.
  var delimit=function(env,atom) {
    env.delimit[atom]=function(env){env.list[0] = env.atom;}}
  // Environment under which a lispz command executes
  var env = {lno:1,skip:false,atom:"",stack:[],list:[],'lambda2js': lambda2js,
    // We find atoms using this regex - fast in a good js system
    tkre: new RegExp('(".*?[^\\\\]"|""|\\'+delimiters+"|[^\\s"+not_delimiters+"]+)",'g'),
    // Called for delimiters when they are found in the input stream
      delimit: { // start gathering a list or performing other delimiter function
        '(': push_state,   '[': push_state,   '{': push_state,
        ')': pop_state, ']': pop_state, '}': pop_state,
        ';': function(env) {env.skip=true}
    // called for closing delimiters when encountered in the stream
    }, list2js: { // process a list once gathered.
         '(':   function(env, list) {call2js(env, list)},
         '[':   function(env, list) { // list of atoms (array)
           return '['+lists2list(env,list.slice(1)).join(',')+']'},
         '{':   pairs(env,'{',    ':', '}'),   // {a:1,b:2}
         'var': pairs(env,'var ', '=', ';\n'), // var a=1,b=2;
         'lambda': function(env,list) {return lambda2js(env,list)},
         'macro': function(env,list) {nm=list2js(env,list[1]);delimit(env,nm);
           env.list2js[nm]=new Function("env,list", "return env.lambda2js(env,"+
              lambda2js(env,list.slice(1))+".apply(env,list))")
console.log(env.list2js[nm].toString())
},
         'alias':  alias, 'atom': function(env,list){return jsify(list[1])}
    }, alias: { }};
  // add all standard binary operations (+, -, etc)
  var binop = function(ops){ops.forEach(function(op){env.list2js[op]=
    function(env,list){ return '('+lists2list(env,list.slice(1)).join(op)+')'}})}
  binop("+,-,*,/(1,2),&&,||,==,===,<=,>=,!=".split(','));
  // use a different name for a lambdas, such as and for &&
  var alias=function(env,list){for(var i=0,l=list.length;i<l;i+=2)env.alias[list[i]]=list[i+1]}
  alias(env, "and,&&,or,||,is,==,isnt,!=,not,!".split(','));
  // macros and other list2js functions process a list on list close
  // For built-in ones we need to set the related delimit so closers are called
  for (var atom in env.list2js) {if (!env.delimit[atom]) delimit(env,atom)};
  // generate javascript from lispz
  var compile = function(source) {
    env.tkre.lastIndex = 0; env.source = source;
    while ((env.atom = env.tkre.exec(env.source)) != null) {
      if (env.alias[env.atom=env.atom[1]]) env.atom=env.alias[env.atom]
      if (env.skip) { if (env.atom === '\n') { env.skip = false; }
      } else { if (env.delimit[env.atom]) { env.delimit[env.atom](env)
        } else {env.list.push(["atom",env.atom])} }
    };
    js = list2js(env,env.list[0]);
    env.list=[];env.stack=[];return js;
  }; return {compile:compile} }()
