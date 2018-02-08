# Promise Pipeline
Easy to use pipeline executer manager

This is still under development, expect missing documentation!

### Lines
Lines will be executed one by one


Lines example:
```
const cmd1 = () => {return new Promise(function(resolve, reject) {
  setTimeout(function () {
    console.log("Pipe:cmd1");
    resolve();
  }, 1000);
});}

const cmd2 = () => {return new Promise(function(resolve, reject) {
  setTimeout(function () {
    console.log("Pipe:cmd2");
    resolve();
  }, 100);
});}

new Line("Line1", [
  {name: "LineTest"},
  {name: "LineTest2"}
]);
```


### Pipes
Piles will be executed in parallel

Pipe example:
```
const cmd1 = () => {return new Promise(function(resolve, reject) {
  setTimeout(function () {
    console.log("Pipe:cmd1");
    resolve();
  }, 1000);
});}

const cmd2 = () => {return new Promise(function(resolve, reject) {
  setTimeout(function () {
    console.log("Pipe:cmd2");
    resolve();
  }, 100);
});}

new Pipe("Pipe1", [
  {name: "PipeTest"},
  {name: "PipeTest2"}
]);
```

## Common functions:

.run() -> Promise       | Run all
.run("name") -> Promise | Run one promise


*Callbacks:*
.onResolve("name", callback);
.onReject("name", callback);

*Promise array*
{
  name: Name of promise
  func: Function to get promise
  argument: Argument to pass to func
  forwardReturnTo: Name of promise to forward aruments to
}

*forwardReturnTo argument format*
{
  forwarded: Forwared argument in object with forwarders name as key
  original: Argument set by "argument"
}

### Example:

```
const pipeline = require("promise-pipeline");

const cmd1 = () => {return new Promise(function(resolve, reject) {
  setTimeout(function () {
    console.log("Pipe:cmd1");
    resolve();
  }, 1000);
});}

const cmd2 = (r) => {return new Promise(function(resolve, reject) {
  setTimeout(function () {
    console.log("Pipe:cmd2 + arg: "+r);
    resolve();
  }, 100);
});}

const lcmd1 = () => {return new Promise(function(resolve, reject) {
  setTimeout(function () {
    console.log("Line:lcmd1");
    resolve("This is from lcmd1");
  }, 1000);
});}

const lcmd2 = (r) => {return new Promise(function(resolve, reject) {
  setTimeout(function () {
    console.log("Line:lcmd2 + arg: "+r.forwarded["lcmd1"]);
    resolve();
  }, 300);
});}

const pipe = new pipeline.Pipe("pipe1", [
  {name: "pcmd1", func: cmd1},
  {name: "pcmd2", func: cmd2, argument: "hey"},
]);

const line = new pipeline.Line("line1", [
  {name: "lcmd1", func: lcmd1, forwardReturnTo: "lcmd2"},
  {name: "lcmd2", func: lcmd2},
]);

const mainLine = new pipeline.Pipe("mainline", [line, pipe]);
mainLine.onResolve("lcmd1",() => console.log("ON: lcmd1"))
mainLine.run().then((r) => console.log("done"));
```
