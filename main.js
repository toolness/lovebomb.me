function absolutifyURL(relativeURL) {
  var a = $('<a></a>');
  a.attr("href", relativeURL);
  return a[0].href;
}

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
  }).click();
});
