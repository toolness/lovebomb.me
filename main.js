function absolutifyURL(relativeURL) {
  var a = $('<a></a>');
  a.attr("href", relativeURL);
  return a[0].href;
}

function currentSection() {
  return $("section").not(".out-on-right, .out-on-left")
}

function goTo(sectionID) {
  var next = $("section" + sectionID);
  var current = currentSection();
  if (!next.length || next[0] == current[0])
    return;
  if (next.hasClass("out-on-right")) {
    current.addClass("out-on-left");
    next.show();
    setTimeout(function() {
      next.removeClass("out-on-right");
      next.prevAll(".out-on-right").hide()
        .removeClass("out-on-right").addClass("out-on-left");
    }, 1);
  } else {
    current.addClass("out-on-right");
    next.show();
    setTimeout(function() {
      next.removeClass("out-on-left");
      next.nextAll(".out-on-left").hide()
        .removeClass("out-on-left").addClass("out-on-right");
    }, 1);
  }
}

function parseHash() {
  var hash = window.location.hash;
  if (hash.length < 2)
    hash = "#intro";
  var parts = hash.split('.');
  return {
    base: parts[0],
    arg: parts[1]
  };
}

function goToHash() {
  goTo(parseHash().base);
}

onhashchange = goToHash;

var delay;
var editor;
var DELAY_MS = 300;

function schedulePreviewRefresh() {
  clearTimeout(delay);
  delay = setTimeout(updatePreview, DELAY_MS);
}

function updatePreview() {
  function update() {
    var previewDocument = $("#preview").contents()[0];
    previewDocument.open();
    previewDocument.write(editor.getValue());
    previewDocument.close();
  }
  
  try {
    update();
  } catch (e) {
    // The user probably clicked on a link in the page and is
    // somewhere else now, so let's reload our blank page.
    var iframeWindow = $("#preview")[0].contentWindow;
    iframeWindow.location = "templates/blank.html";
    $("#preview").one("load", update);
  }
}

function loadTemplate(id) {
  var templateURL = absolutifyURL('templates/' + id + '.html');
  var req = jQuery.get(templateURL, undefined, 'text');
  jQuery.when(req).done(function(data) {
    editor = CodeMirror(function(element) {
      $("#source").append(element);
    }, {
      mode: "text/html",
      theme: "jsbin",
      tabMode: "indent",
      lineWrapping: true,
      value: data,
      onChange: schedulePreviewRefresh
    });
    updatePreview();
  });
}

$(window).ready(function() {
  $("section").bind("transitionend oTransitionEnd webkitTransitionEnd", function() {
    if ($(this).is(".out-on-right, .out-on-left")) {
      $(this).hide();
      console.log("hiding " + this.id);
    } else {
      $(this).trigger("show", parseHash().arg);
    }
  });
  $("#get-started").click(function() {
    window.location.hash = "#chooser";
  });
  $("#editor").bind("show", function(event, templateID) {
    loadTemplate(templateID);
  });
  goToHash();
});
