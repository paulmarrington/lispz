window.lispz_modules={}
function (){var _h_callbacks=[];//#core:72

var _h_pledge=(new Promise((function(ok,fail){_h_callbacks={'ok':ok,'fail':fail};})));//#core:73

var resolve_promise=(function(){_h_callbacks.ok.apply(null,[].slice.call(arguments,0))});//#core:74

var reject_promise=(function(err){_h_callbacks.fail(err)});//#core:75

lispz.globals.promise.all(names.map(load_riot)).then((function(){return resolve_promise(source)
//#dev:47
}))//#dev:48

return _h_pledge
//#core:78
}