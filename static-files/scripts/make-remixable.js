(function() {
  var myURL = window.location.href;
  
  if (window.parent != window) {
    // We're being embedded in an iframe which might be
    // an HTML editor, so let's send them our source code.
    var req = new XMLHttpRequest();
    req.open('GET', myURL);
    req.onload = function() {
      window.parent.postMessage(req.responseText, "*");
    };
    req.send(null);
  }
  
  function rewriteRemixLinks() {  
    var anchors = document.getElementsByTagName('a');
    for (var i = 0; i < anchors.length; i++) {
      var anchor = anchors[i];
      var match = anchor.href.match(/(.*)#editor\.remix$/);
      if (match) {
        var baseURL = match[1];
        anchor.href = baseURL + "?remix=" + escape(myURL) + 
                      "#editor.remix";
      }
    }
  }
  
  rewriteRemixLinks();
})();
