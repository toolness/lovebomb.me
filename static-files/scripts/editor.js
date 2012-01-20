var Editor = (function() {
  var delay;
  var editor;
  var templateURL;
  var DELAY_MS = 300;
  var nextUpdateIsSilent = false;
  var nextUpdateIsInstant = false;
  var changeListeners = [];
  
  function absolutifyURL(relativeURL) {
    var a = $('<a></a>');
    a.attr("href", relativeURL);
    return a[0].href;
  }

  function updatePreview() {
    function update() {
      var previewDocument = $("#preview").contents()[0];
      previewDocument.open();
      previewDocument.write(editor.getValue());
      previewDocument.close();

      // Insert a BASE TARGET tag so that links don't open in
      // the iframe.
      var baseTag = previewDocument.createElement('base');
      baseTag.setAttribute('target', '_blank');
      previewDocument.querySelector("head").appendChild(baseTag);
      
      jQuery.each(changeListeners, function() {
        try {
          this();
        } catch (e) {
          if (window.console && window.console.error)
            window.console.error(e);
        }
      });
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

  function mungeTemplate(html, id) {
    var findString = id + "-files/";
    var regexp = new RegExp(findString, 'g');

    html = html.replace(regexp, absolutifyURL("templates/" + findString));
    html = html.replace(/http:\/\/lovebomb\.me\//g, absolutifyURL("."));

    return html;
  }

  var picker = null;
  var pickerPos = null;
  var inCursorActivity = false;
  var inManualColorChange = false;
  
  function removePicker() {
    if (picker) {
      pickerPos = null;
      picker.colorpicker("close");
      picker.colorpicker("destroy");
      picker.remove();
      picker = null;
    }
  }
  
  function getEditor() {
    if (typeof(editor) == "undefined")
      editor = CodeMirror(function(element) {
        $("#source").append(element);
      }, {
        mode: "text/html",
        theme: "jsbin",
        tabMode: "indent",
        lineWrapping: true,
        lineNumbers: true,
        onCursorActivity: function() {
          if (inCursorActivity)
            return;
          var pos = editor.getCursor();
          var token = editor.getTokenAt(pos);

          function nextToken() {
            var oldToken = token;
            token = editor.getTokenAt({
              line: pos.line,
              ch: token.end + 1
            });
            return token.start != oldToken.start;
          }

          function prevToken() {
            var oldToken = token;
            token = editor.getTokenAt({
              line: pos.line,
              ch: token.start
            });
            return token.start != oldToken.start;
          }

          Editor.currToken = token;
          Editor.currLine = editor.getLine(pos.line);
          if (token.state && token.state.mode == "css" &&
              token.state.localState.stack[0] == "{" &&
              token.state.localState.stack[1] == "rule" &&
              token.className != "variable" &&
              token.string != ";" &&
              token.string != ":") {
            while (token.start != 0 && token.string != ":") {
              prevToken();
            }
            nextToken();
            var tokens = [token];
            var tokensStart = token.start;
            var tokensEnd = token.end;
            while (nextToken() && token.string != ";") {
              tokens.push(token);
              tokensEnd = token.end;
            }
            var cssValue = tokens.map(function(t) {
              return t.string
            }).join("").trim();
            if (pickerPos && pickerPos.line == pos.line &&
                pickerPos.ch == tokensStart) {
              if (pickerPos.lastValue != cssValue) {
                inManualColorChange = true;
                picker.colorpicker("setColor", cssValue);
                inManualColorChange = false;
                pickerPos.lastValue = cssValue;
              }
              return;
            }
            removePicker();
            pickerPos = {
              line: pos.line,
              ch: tokensStart,
              lastValue: cssValue
            };
            //console.log("cssValue is", cssValue);
            picker = $('<div class="picker"></div>').appendTo(document.body);
            picker.colorpicker({
              alpha: true,
              color: cssValue,
              onSelect: function(hex, rgba, inst) {
                if (!pickerPos || inManualColorChange)
                  return;
                var value;
                if (rgba.a == 1) {
                  value = hex;
                } else {
                  value = 'rgba(' + Math.floor(rgba.r * 255) + ', ' +
                                    Math.floor(rgba.g * 255) + ', ' +
                                    Math.floor(rgba.b * 255) + ', ' +
                                    rgba.a.toFixed(3)  + ')';
                }
                inCursorActivity = true;
                editor.replaceRange(value, {
                  line: pos.line,
                  ch: tokensStart + 1
                }, {
                  line: pos.line,
                  ch: tokensEnd
                });
                tokensEnd = tokensStart + 1 + value.length;
                inCursorActivity = false;
              }
            });
            editor.addWidget({
              line: pos.line,
              ch: 0
            }, picker[0], false);
          } else {
            removePicker();
          }
          return;
        },
        onChange: function schedulePreviewRefresh() {
          if (nextUpdateIsSilent) {
            nextUpdateIsSilent = false;
          } else {
            clearTimeout(delay);
            if (nextUpdateIsInstant) {
              nextUpdateIsInstant = false;
              updatePreview();
            } else
              delay = setTimeout(updatePreview, DELAY_MS);
          }
        }
      });
    return editor;
  }
  
  return {
    undo: function() { nextUpdateIsInstant = true; getEditor().undo(); },
    redo: function() { nextUpdateIsInstant = true; getEditor().redo(); },
    remix: function(url) {
      var iframe = $('<iframe></iframe>').attr("src", url)
        .appendTo(document.body).hide();

      function onMessage(event) {
        if (event.source != iframe[0].contentWindow)
          return;
        window.removeEventListener('message', onMessage, false);
        templateURL = url;
        getEditor().setValue(event.data);
        iframe.remove();
      }

      window.addEventListener('message', onMessage, false);
    },
    getContent: function() {
      return {
        html: getEditor().getValue(),
        templateURL: templateURL
      };
    },
    setContentHtml: function(content, options) {
      if (options.silent) {
        nextUpdateIsSilent = true;
        getEditor().setValue(content);
      } else
        getEditor.setValue(content);
    },
    getPreviewWindow: function() {
      return $("#preview")[0].contentWindow;
    },
    onChange: function(cb) {
      changeListeners.push(cb);
    },
    loadTemplate: function(id) {
      var newTemplateURL = absolutifyURL('templates/' + id + '.html');
      if (newTemplateURL != templateURL) {
        templateURL = newTemplateURL;
        var req = jQuery.get(templateURL, undefined, 'text');
        jQuery.when(req).done(function(data) {
          nextUpdateIsInstant = true;
          getEditor().setValue(mungeTemplate(data, id));
        });
      }
    }
  };
})();
