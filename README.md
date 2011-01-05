## Jisp - a dialect of Lisp in JavaScript

Brian Morearty
May 10, 2006 (with major additions July, 2007)

Jisp is a new dialect of Lisp that I invented.

I realized that JavaScript has so many similarities with Lisp
that it would be easy to write a JavaScript-based Lisp language that uses the browser's JavaScript parser
rather than writing my own parser. It turned out to be even easier than I expected--it took me an evening to 
create the basic language. (It's not a complete Lisp implementation, of course.) It looks a little different 
from most Lisp dialects. (Uses brackets instead of parentheses and uses commas between list elements) because
of its basis in JavaScript.

Here is a sample Jisp expression that adds two numbers. This expression does not
have side-effects (such as UI output)--it just returns a result:

    [plus, 7, 3]

I have tested it in IE6, IE7, and Firefox 1.5, 2.0, and 3.x.

To evaluate a Jisp expression or sequence of expressions, call the jisp() function from JavaScript. Here are some more samples.

### Calling a JavaScript function from Jisp

Jisp can call functions that were defined in JavaScript. JavaScript can also call functions that were defined 
(uh, defun'd) in Jisp. This page has a JavaScript-defined function called 'append' that was defined in the normal JavaScript syntax:

code:

    function append(style, html)
    {
      ...
    }

We can call the append function from Jisp just like any other function:

    jisp(
      ['append',
       { indented: true, preformatted: true, output: true },
         "Text goes here..."]

output:

    Text goes here...
    
### Calling a built-in Jisp function (minus) from Jisp

Jisp comes with a set of predefined functions. These include Lisp-like function such as `car` and `cdr`, as well as mathematical 
functions and others. Here is how you call a built-in math function from Jisp

code:

    [minus, 3, 1]

output:

    3

### Calling a function with its name in quotes ('+')

Sometimes you need to call a function whose name already has a meaning in JavaScript, such as '+'. 
To call such a function, simply put its name in quotes.

code:

    ['+', 1, 2]

output:

    3

If your function name does not have punctuation or is not a reserved JavaScript word, you can still put
its name in quotes if you like. The following two calls are equivalent:

    jisp( [ minus , 3, 1] ) 
    jisp( ['minus', 3, 1] )

### Creating and calling a user-defined function

This is how you create your own function:

code:

    [defun,                       // Define a function
     'functionname',              // Put the name in quotes 
     ['param1', 'param2', etc.],  // Then a comma-separated list of parameters in quotes. 
     [body goes here]             // This is the body of the function. 
    ]

Note that the function name has to be in quotes in the function definition but once it is defined, 
the calls don't need quotes.

The parameters (x in this case) must also be in quotes, both in the formal parameter list as well 
as in all references to them, to prevent a JavaScript error.

code:

    [defun,           // Define a function 
     'inc',           // whose name is inc 
     ['x'],           // and that has one parameter named x. 
     [plus, 'x', 1]]  // This is the body of the function 

Now call the function.

code:

    jisp( [inc, 5] )

output:

    6

### Declare a function using [defun] but write its implementation in JavaScript

You can use [defun] to declare a function but still write the body in JavaScript. Here's how. 
In this example I'm declaring a function called Sqrt that calls JavaScript's Math.sqrt function.

    [defun, 
     'sqrt', 
     function(x) 
     { 
       return Math.sqrt(x) 
     } 
    ]

Now call it from Jisp.

code:

    jisp( [sqrt, 6.25] )

output:

    2.5

### Quote a list using 'qt' so its first element is treated as a value, not a function

First, define a function. I used JavaScript syntax but wrote its implementation in Jisp. This function takes 
a *single* argument. The argument is a list of numbers.

    function sumlist(list) 
    { 
      return jisp( 
          ['if', ['null', [cdr, list]], 
                 [car, list], 
                 [plus, [car, list], [sumlist, [cdr, list]]] 
          ] 
      ) 
    }

Now call it, passing a single list of four numbers to it. Use '_qt_' to quote a list (i.e. don't treat its first element as a function call).

code:

    [sumlist, [qt, 1, 2, 3, 4]]

output:

    10

### Call a function that takes any number of arguments

First, define a function that takes an undefined number of arguments. This function returns the sum of 
all its arguments. Contrast this with the 'sumlist' function in the previous example--this new function 
takes multiple arguments instead of a single list of values. (But I cheated by implementing the 
function in JavaScript--there isn't yet a way to access a variable-argument list for a function written using [defun]).

    [defun, 'sum', 
     function () 
     { 
       var result = 0; 
       for (var i = 0; i < arguments.length; i++) 
         result = result + arguments[i] 
       return result 
     }
    ]

Now call it, passing a series of five numbers to it:

code:

    jisp( [sum, 1, 2, 3, 4, 5] )

output:

    15

### Summary

Jisp is a work in progress. I've done a lot of cool stuff but there's still more that I'd like to implement. 
Just a few examples of unimplemented language features are: 
* Multi-line functions
* A 'setq' function to assign a value to a variable
* A way to pass a variable number of arguments to a [defun]'d function

I'd love to hear your thoughts. Please send feedback and comments to *Jisp@ducklet.com*.
