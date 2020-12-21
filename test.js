/*
    opensearch.js
    MediaWiki API Demos
    Demo of `Opensearch` module: Search the wiki and obtain
	results in an OpenSearch (http://www.opensearch.org) format
    MIT License
*/

const fetch = require("node-fetch");

var url = "https://de.wikipedia.org/w/api.php?origin=*";
var query = "Hamburg";
var params = {
    action: "opensearch",
    search: query,
    limit: "5",
    namespace: "0",
    format: "json"
};

Object.keys(params).forEach(function(key){url += "&" + key + "=" + params[key];});

fetch(url)
    .then(function(response){return response.json();})
    .then(function(response) {console.log(response[3][0]);
      console.log(response[1][0])})
    .catch(function(error){console.log(error);});
