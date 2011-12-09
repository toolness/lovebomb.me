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
    next.show().removeClass("out-on-right");
    next.prevAll(".out-on-right")
      .hide().removeClass("out-on-right").addClass("out-on-left");
  } else {
    current.addClass("out-on-right");
    next.show().removeClass("out-on-left");
    next.prevAll(".out-on-left")
      .hide().removeClass("out-on-left").addClass("out-on-right");
  }
}

function goToHash() {
  var hash = window.location.hash;
  if (hash.length < 2)
    hash = "#intro";
  goTo(hash);
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

$(window).ready(function() {
  $("#get-started").click(function() {
    $("section.intro").addClass("out-on-left");
    //$("section.chooser").removeClass("out-on-right");
    $("section.editor").removeClass("out-on-right");

    var id = 'atul';
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
  });
  goToHash();
});
