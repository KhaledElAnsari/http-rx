var buble = require("buble");
var Observable = require('rxjs/Observable').Observable;
var source = require("./index.js");
var result = buble.transform();
console.log(result);
