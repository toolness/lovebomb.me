var PositionerReflection = (function(Positioner, Editor) {
  var utils = Positioner.utils;
  var self = {
    updateHtml: function(html, rules) {
      var styleRe = /\<style id="positioner-data"\>\n(?:.*\n)*?\<\/style\>/m;
      var styleMatch = html.match(styleRe);
      if (styleMatch)
        return html.replace(styleRe, utils.makeStyleHtml(rules));
      var titleCloseIndex = html.indexOf("</title>\n");
      if (titleCloseIndex != -1) {
        titleCloseIndex += "</title>\n".length;
        return html.slice(0, titleCloseIndex) + utils.makeStyleHtml(rules) +
               "\n" + html.slice(titleCloseIndex);
      }
      return html + utils.makeStyleHtml(rules);
    }
  };

  if (Editor)
    Editor.onChange(function() {
      var iframeWindow = Editor.getPreviewWindow();

      iframeWindow.addEventListener("mouseup", function(event) {
        if (!iframeWindow.Positioner)
          return;
        var rules = iframeWindow.Positioner.utils.makeCssRules();
        var html = Editor.getContent().html;
        var finalHtml = self.updateHtml(html, rules);
        if (finalHtml != html)
          Editor.setContentHtml(finalHtml, {silent: true});
      }, false);
    });

  return self;
})(Positioner, window.Editor);
