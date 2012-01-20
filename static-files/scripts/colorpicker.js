var ColorPicker = (function(Editor) {
  var self = {
    // These are for debugging purposes.
    currToken: null,
    currLine: null
  };
  var PICKER_CSS_PROPERTIES = [
    "background",
    "background-color",
    "color"
  ];
  var picker = null;
  var pickerPos = null;
  var inPickerOnSelect = false;
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

  Editor.onCursorActivity(function(editor) {
    if (inPickerOnSelect)
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

    self.currToken = token;
    self.currLine = editor.getLine(pos.line);
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

      var tokenValueStart = token;
      while (token.start != 0 && token.className != "variable")
        prevToken();
      var prop = (token.className == "variable") ? token.string : "";
      if (PICKER_CSS_PROPERTIES.indexOf(prop) == -1) {
        removePicker();
        return;
      }
      token = tokenValueStart;
      
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
          inPickerOnSelect = true;
          editor.replaceRange(value, {
            line: pos.line,
            ch: tokensStart + 1
          }, {
            line: pos.line,
            ch: tokensEnd
          });
          tokensEnd = tokensStart + 1 + value.length;
          inPickerOnSelect = false;
        }
      });
      editor.addWidget({
        line: pos.line,
        ch: 0
      }, picker[0], false);
    } else {
      removePicker();
    }
  });
  
  return self;
})(Editor);
