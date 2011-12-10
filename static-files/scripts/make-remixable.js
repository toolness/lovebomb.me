(function() {
  function openRemixWindow(url) {
    var eventsLeft = 2;
    var req = new XMLHttpRequest();
    var myURL = window.location.href;
    var remixWindow;
    
    function maybeSendMessage() {
      eventsLeft--;
      if (!eventsLeft)
        remixWindow.postMessage(JSON.stringify({
          html: req.responseText,
          originalURL: myURL
        }), "*");
    }
    
    function onMessage(event) {
      if (event.source == remixWindow && event.data == 'ping') {
        window.removeEventListener('message', onMessage, false);
        maybeSendMessage();
      }
    }

    window.addEventListener('message', onMessage, false);
    remixWindow = window.open(url);
    req.open('GET', myURL);
    req.onload = maybeSendMessage;
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
