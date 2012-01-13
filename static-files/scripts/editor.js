var Editor = (function() {
  var delay;
  var editor;
  var templateURL;
  var DELAY_MS = 300;
  var inSilentUpdate = false;
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
        onChange: function schedulePreviewRefresh() {
          if (!inSilentUpdate) {
            clearTimeout(delay);
            delay = setTimeout(updatePreview, DELAY_MS);
          }
        }
      });
    return editor;
  }
  
  return {
    undo: function() { getEditor().undo(); },
    redo: function() { getEditor().redo(); },
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
        inSilentUpdate = true;
        getEditor().setValue(content);
        inSilentUpdate = false;
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
          getEditor().setValue(mungeTemplate(data, id));
          updatePreview();
        });
      }
    }
  };
})();
