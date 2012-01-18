var PositionerReflection = (function(Positioner, CodeMirror, Editor) {
  var utils = Positioner.utils;
  var self = {
    mergeCss: function(oldCss, newCss) {
      var newRules = utils.parseCss(newCss);

      // Assumptions:
      // newCss is generated by Positioner.
      // oldCss is arbitrary user CSS and might even be malformed. 

      var cssMode = CodeMirror.getMode({
        indentUnit: 2
      }, "css");
      var state = cssMode.startState();
      var mergedCssLines = [];
      var currentSelector = null;
      var currentDeclaration = null;

      oldCss.split('\n').forEach(function(line) {
        var stream = new CodeMirror.StringStream(line);
        var lastPos = 0;
        var lineParts = [];
        while (!stream.eol()) {
          var styleName = cssMode.token(stream, state);
          var token = line.slice(lastPos, stream.pos);
          if (state.stack.length == 0) {
            if (currentSelector && !styleName && token == "}") {
              // End of rule.
              var decls = [];
              for (var decl in newRules[currentSelector])
                decls.push(decl + ": " + newRules[currentSelector][decl]);
              if (decls.length)
                token = "; " + decls.join("; ") + " }";
              delete newRules[currentSelector];
              currentSelector = null;
            }
            if (styleName == "atom" && token in newRules) {
              // It's an id selector, e.g. #foo
              currentSelector = token;
              currentDeclaration = null;
            }
          } else if (state.stack.length && currentSelector) {
            if (styleName == "variable" &&
                token in newRules[currentSelector]) {
              // It's the name of a CSS property.
              currentDeclaration = token;
            } else if (styleName == "number" && currentDeclaration) {
              // It's the value of a CSS property.
              token = newRules[currentSelector][currentDeclaration];
              delete newRules[currentSelector][currentDeclaration];
              currentDeclaration = null;
            }
          }
          lineParts.push(token);
          lastPos = stream.pos;
        }
        mergedCssLines.push(lineParts.join(''));
      });

      for (var selector in newRules) {
        var decls = [];
        for (var decl in newRules[selector]) {
          decls.push(decl + ": " + newRules[selector][decl]);
        }
        mergedCssLines.push(selector + " { " + decls.join('; ') + " }");
      }
      
      return mergedCssLines.join('\n');
    },
    updateHtml: function(html, rules) {
      var styleRe = /\<\s*style\s+id="positioner-data"\s*\>((?:.*\n?)*?)\<\/\s*style\s*\>/mi;
      var styleMatch = html.match(styleRe);
      if (styleMatch) {
        var newRules = self.mergeCss(styleMatch[1].trim(), rules);
        return html.replace(styleRe, utils.makeStyleHtml(newRules));
      }
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
})(Positioner, CodeMirror, window.Editor);
