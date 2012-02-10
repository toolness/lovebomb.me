function convertToPlainText(html) {
  var IGNORED_ELEMENTS = ["rss"];
  var div = $('<div></div>');
  var lines = [];
  var currentLine = [];
  div.html(html).appendTo(document.body);

  function pushLine() {
    if (currentLine.length) {
      lines.push(currentLine.join(" "));
      currentLine = [];
    }
  }
  
  function descend(element) {
    var style = window.getComputedStyle(element);
    var display = style.getPropertyValue("display");
    if (display == "block" || display == "list-item")
      pushLine();
    for (var i = 0; i < element.childNodes.length; i++) {
      var child = element.childNodes[i];
      if (child.nodeType == child.ELEMENT_NODE &&
          $.inArray(child.nodeName.toLowerCase(), IGNORED_ELEMENTS) == -1) {
        descend(child);
      } else if (child.nodeType == child.TEXT_NODE) {
        var text = jQuery.trim(child.nodeValue);
        if (text.length)
          currentLine.push(text);
      }
    }
  }
  
  descend(div[0]);
  pushLine();
  div.remove();
  return lines.join('\n\n');
}

(function(jQuery) {
  var BASE_URL = "http://bjb.io:9123/";
  //var BASE_URL = "http://localhost:8080/";
  $(window).ready(function() {
    var val = "";
    var req = null;
    if (!$("section#chooser input").length)
      // We're in the test suite, apparently.
      return;
    setInterval(function() {
      var newVal = $("section#chooser input").val();
      if (newVal.trim().length == 0) {
        val = "";
        return;
      }
      if (val != newVal) {
        val = newVal;
        $("section#chooser img.big-throbber").show();
        $("section#chooser .result").hide();
        if (req)
          req.abort();
        req = jQuery.ajax({
          url: BASE_URL + 'article',
          data: {
            url: val,
            raw: true
          },
          success: function(html) {
            var data = convertToPlainText(html);
            if (data.length == 0) {
              $("section#chooser .error.result").fadeIn();
            } else {
              //console.log("success", data);
              window.localStorage['customHtml'] = data.trim();
              window.location.hash = "#editor.custom";
            }
          },
          error: function(jqXHR, textStatus) {
            if (textStatus == "abort")
              return;
            $("section#chooser .error.result").fadeIn();
            //console.log("error", textStatus);
          },
          complete: function() {
            $("section#chooser img.big-throbber").hide();
            req = null;
          },
          timeout: 10000
        });
      }
    }, 100);
    
    $("#use-default-article").click(function() {
      val = "";
      $('section#chooser input').val('http://www.toolness.com/wp/2011/06/moving-at-internet-speed/');
      return false;
    });
  });
})(jQuery);
