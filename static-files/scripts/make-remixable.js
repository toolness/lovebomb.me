(function() {
  function openRemixWindow(url) {
    var remixWindow = window.open(url);
    var req = new XMLHttpRequest();
    var myURL = window.location.href;
    req.open('GET', myURL);
    req.addEventListener("load", function() {
      remixWindow.postMessage(JSON.stringify({
        html: req.responseText,
        originalURL: myURL
      }), "*");
    }, false);
    req.send(null);
  }

  function onRemixLinkClick(cb) {  
    var anchors = document.getElementsByTagName('a');
    for (var i = 0; i < anchors.length; i++) {
      var anchor = anchors[i];
      if (anchor.href.match(/#editor\.remix$/)) {
        anchor.addEventListener('click', cb, false);
        break;
      }
    }
  }
  
  onRemixLinkClick(function(event) {
    openRemixWindow(this.href);
    event.preventDefault();
  });
})();
