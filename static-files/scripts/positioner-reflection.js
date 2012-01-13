(function(Editor) {
  Editor.onChange(function() {
    var iframeWindow = Editor.getPreviewWindow();

    iframeWindow.addEventListener("mouseup", function(event) {
      if (!iframeWindow.Positioner)
        return;
      var utils = iframeWindow.Positioner.utils;
      var rules = utils.makeCssRules();
      var html = Editor.getContent().html;
      var finalHtml = utils.addOrReplaceStyleHtmlToPage(html, rules);
      if (finalHtml != html)
        Editor.setContentHtml(finalHtml, {silent: true});
    }, false);
  });
})(Editor);
