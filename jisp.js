/*
 * Jisp, by Brian Morearty
 * http://github.com/BMorearty/jisp
 */
var functions
function jisp(list)
{
  switch (list[0])
  {
  case 'if':    list[0] = iffunc; return jisp(list)
  case 'null':  list[0] = nullfunc; return jisp(list)
  case 'not':   list[0] = nullfunc; return jisp(list)
  case '+':     list[0] = plus; return jisp(list)
  case '-':     list[0] = minus; return jisp(list)
  case '*':     list[0] = times; return jisp(list)
  case '/':     list[0] = dividedby; return jisp(list)
  case defun:   
  case 'defun': return defun(list.slice(1))
  default:      return evaluate(list)
  }
}

function defun(list)
{
  var funcName = list[0]
  if (typeof(list[1]) == "function")
  {
    var funcString = list[1].toString()
    var paren = funcString.indexOf('(');
    var argsAndBody = funcString.substring(paren)
    var funcDecl = '<script type="text/javascript">function ' + funcName + argsAndBody + '</script>'
    //alert(funcDecl)
    document.write(funcDecl)
  }
  else
  {
    var params = list[1]
    var body = list[2]
    
    // function header
    var func = "function " + funcName + "("
    for (var i = 0; i < params.length; i++)
    {
      if (i > 0)
      {
        func = func + ", "
      }
      func = func + params[i]
    }
    func = func + ") {"
    
    // body
    func = func + "return jisp(["
    for (i = 0; i < body.length; i++)
    {
      if (i > 0)
      {
        func = func + ","
      }

      var paramRef = false
      for (var whichParam = 0; whichParam < params.length; whichParam++)
      {
        if (body[i] == params[whichParam])
        {
          func = func + body[i]
          paramRef = true
        }
      }
      
      if (!paramRef)
      {
        if (typeof(body[i]) == "string")
        {
          func = func + '"' + body[i] + '"'
        }
        else if (isArray(body[i]))
        {
          func = func + "[" + body[i] + "]"
        }
        else
        {
          func = func + body[i]
        }
      }
    }
    
    func = func + "])"
    
    // Doesn't work because it doesn't treat variables differently from strings:
    //  func = func + "return jisp([" + list[2] + "])"
    
    // close out the function
    func = func + "}"
    
    // alert(func)
    
    document.write('<script type="text/javascript">' + func + '</script>')
  }
}

function isAlien(a) {
   return isObject(a) && typeof a.constructor != 'function';
}
function isArray(a) {
    return isObject(a) && a.constructor == Array;
}
function isBoolean(a) {
    return typeof a == 'boolean';
}
function isEmpty(o) {
    var i, v;
    if (isObject(o)) {
        for (i in o) {
            v = o[i];
            if (isUndefined(v) && isFunction(v)) {
                return false;
            }
        }
    }
    return true;
}
function isFunction(a) {
    return typeof a == 'function';
}
function isNull(a) {
    return typeof a == 'object' && !a;
}
function isNumber(a) {
    return typeof a == 'number' && isFinite(a);
}
function isObject(a) {
    return (a && typeof a == 'object') || isFunction(a);
}
function isString(a) {
    return typeof a == 'string';
}
function isUndefined(a) {
    return typeof a == 'undefined';
} 

function evaluate(list)
{
  if (isArray(list[0]))
  {
    // If multiple lists are passed in, process them in sequence.
    // The last lists's return value gets returned to the caller
    var ret = null
    for (var i = 0; i < list.length; i++)
    {
      ret = jisp(list[i])
    }
    return ret
  }
  else
  {
    var thisObj = this
    var func = list[0]
    var funcName = list[0].toString()
    if (typeof(func) == "string")
    {
      // 'obj.func' syntax must be in quotes
      
      var dot = funcName.lastIndexOf('.')
      if (dot != -1)
      {
        thisObj = eval(funcName.slice(0, dot))
        funcName = funcName.slice(dot+1)
      }
      
      func = eval(func)
      // alert(typeof(func) + " & constructor = " + func.constructor.toString())
      
      if (func.constructor == null)
      {
        return evaluateNative(list)
      }
    }
    else if (typeof(func) != "function")
    {
      alert("Error: first element of list is not a string or a function: " + func.toString())
    }

    // var func = eval(func) // list.shift());
    var args = list.slice(1)
    // Ugly hack -- the "if" function is special.  Don't evaluate its parameters til you're inside it
    if (func != iffunc)
    {
      var start = 0;
      
      for (var i = 0; i < args.length; i++)
      {
        if (i >= start && isArray(args[i]) && args[i].jispQuotedList != true)
        {
          args[i] = jisp(args[i])
        }
      }
    }
    return func.apply(thisObj, args)
  }
}

// Need this to call native functions like document.write().  IE doesn't like
// it when you call apply() on a native function.
function evaluateNative(list)
{
  if (isArray(list[0]))
  {
    // If multiple lists are passed in, process them in sequence.
    // Which return value does Lisp return to the caller? First or last?
    var ret = jisp(list[0])
    if (list.length > 1)
    {
      ret = jisp(list.slice(1))
    }
    return ret
  }
  else
  {
    var funcName = list[0]
    if (typeof funcName == "function" || (typeof funcName == "object" && type (funcName.apply) == "function"))
    {
      // Get the function's name
      var s = funcName.toString();
      var space = s.indexOf(' ') + 1;
      var paren = s.indexOf('(');
      funcName = s.substr(space, paren-space)
      alert("typeof " + funcName + " (" + list[0] + ") = " + typeof list[0])
    }
    else if (typeof funcName != "string")
    {
      // 'obj.func' syntax must be in quotes
      funcName = list[0]
    }

    var call = funcName + "("

    for (var i = 1; i < list.length; i++)
    {
      if (i > 1)
      {
        call = call + ", "
      }
        
      if (typeof(list[i]) == "string")
      {
        call = call + '"' + list[i] + '"'
      }
      else if (isArray(list[i]))
      {
        call = call + 'jisp([' + list[i] + '])'
      }
      else
      {
        // number or function or something else
        call = call + list[i]
      }
    }
    
    call = call + ")"
    
    // alert(call)
    
    // Call it
    return eval(call)
  }
}

jisp(  [defun, 'plus',    function(a,b)     { return a+b } ]  )
jisp(  [defun, 'minus',   function(a,b)     { return a-b } ]  )
jisp(  [defun, 'times',   function(a,b)     { return a*b } ]  )
jisp(  [defun, 'dividedby',   function(a,b) { return a/b } ]  )
jisp(  [defun, 'nullfunc',function(list)    { return list.length==0 } ] )
jisp(  [defun, 'iffunc',  function(condition,thenlist,elselist) { if (jisp(condition)) return jisp(thenlist); else return jisp(elselist) } ] )
jisp(  [defun, 'qt',      // quote, don't evaluate
  function()     
  {  
    var args = []; 
    for (var i=0; i<arguments.length; i++) 
    { 
      args[i] = arguments[i] 
    }
    args.jispQuotedList = true; 
    return args 
  } ] )
jisp(  [defun, 'car',     function(list) { return list[0] } ] )
jisp(  [defun, 'cdr',     function(list) { var ret = list.slice(1); ret.jispQuotedList = true; return ret } ] )
//jisp(  [defun, 'alias',   function(newName, oldFunc) { functions[newName] = oldFunc } ] )
//jisp(  [alias, '+', plus] )


// TODO: Implement a setq function for variable assignment
//jisp(  [defun, 'setq',    function(lhs, value) 
//{ 
// var assignment = variableName + " = " + value;
// eval(assignment);
//} ] )

