$(window).load(function() {
  function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      if (pair[0] == variable) {
        return unescape(pair[1]);
      }
    }
  }

  function retargetLinksToNewTab() {
    $("a").each(function() {
      var href = $(this).attr("href");
      if (href && href.length && href[0] != '#')
        $(this).attr("target", "_blank");
    });
  }
  
  var remixURL = getQueryVariable('remix');
  
  if (remixURL && !window.location.hash) {
    // This is a weird Safari bug; for some reason the hash isn't
    // passed to us from the remix, so we'll default to the editor
    // mode.
    window.location.hash = "#editor.remix";
  }

  retargetLinksToNewTab();  
  $("#editor").bind("navshow", function(event, templateID) {
    if (templateID == "remix") {
      if (remixURL)
        Editor.remix(remixURL);
    } else {
      Editor.loadTemplate(templateID);
    }
  });
  $("#publish").click(function() { Publish.publish(Editor.getContent()); });
  $("#undo").click(function() { Editor.undo(); });
  $("#redo").click(function() { Editor.redo(); });
  Navigation.init();
  Publish.init();
  
  jQuery.ajax({
    type: 'GET',
    url: "http://etherpad-export.appspot.com/",
    data: {
      server: "etherpad.mozilla.org",
      port: "80",
      pad: "opennews-webmaking101-copywriting-html",
      format: "txt"
    },
    dataType: "text",
    crossDomain: true,
    success: function(data) {
      $("#instructions").html(data);
    },
    error: function(jqXHR, status) {
      $("#instructions").text("ERROR: " + status + " " + jqXHR.status +
                              " " + jqXHR.responseText);
    }
  });
  
});
