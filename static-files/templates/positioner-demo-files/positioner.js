var Positioner = (function(window) {
  var inQuasimode = false;
  var isEnabled = true;
  var overlay;
  
  // From http://stevenbenner.com/2010/03/javascript-regex-trick-parse-a-query-string-into-an-object/
  function parseQueryString(str) {
    var queryString = {};
    str.replace(
        new RegExp("([^?=&]+)(=([^&]*))?", "g"),
        function($0, $1, $2, $3) { queryString[$1] = decodeURIComponent($3); }
    );
    return queryString;
  }

  function getSizeObjForElement(element) {
    var dims = {};
    var dimsFilled = 0;

    if (element && element.style.position == "absolute") {
      var re = /^(.+)px$/;
      ['top', 'left', 'width', 'height'].forEach(function(name) {
        if (element.style[name]) {
          var match = element.style[name].match(re);
          if (match) {
            dims[name] = parseFloat(match[1]);
            dimsFilled++;
          }
        }
      });
      if (dimsFilled == 4)
        return dims;
    }
  }

  function findRelativeParent(element) {
    if (element === document.documentElement)
      return element;
    var style = window.getComputedStyle(element.parentNode);
    if (style.position != "static")
      return element.parentNode;
    return findRelativeParent(element.parentNode);
  }
  
  function initSizeForElement(element) {
    var parentRect = findRelativeParent(element).getBoundingClientRect();
    var rect = element.getBoundingClientRect();
    element.style.position = "absolute";
    element.style.top = (rect.top - parentRect.top) + "px";
    element.style.left = (rect.left - parentRect.left) + "px";
    element.style.width = rect.width + "px";
    element.style.height = rect.height + "px";
  }
  
  function makeCssRules(root) {
    var rules = [];

    function traverse(element) {
      if (element.id) {
        var cssRule = utils.makeCss(element);
        if (cssRule)
          rules.push(cssRule);
      }
      
      for (var i = 0; i < element.childNodes.length; i++) {
        var child = element.childNodes[i];
        if (child.nodeType == child.ELEMENT_NODE) {
          traverse(child);
        }
      }
    }
    
    traverse(root || document.body);
    return rules.join('\n');
  }
  
  function makeQueryString(root) {
    var qs = parseQueryString(window.location.search);
    var parts = [];
    
    qs.positioner_data = makeCssRules(root);
    for (var name in qs)
      parts.push(name + '=' + encodeURIComponent(qs[name]));
    return parts.join('&');
  }

  function applyCssRules(rules) {
    rules = utils.parseCss(rules);
    for (var selector in rules) {
      var element = document.querySelector(selector);
      utils.applyCss(rules, element);
    }
  }

  function onQueryStringChange() {
    var qs = parseQueryString(window.location.search);
    if (qs.positioner_data)
      applyCssRules(qs.positioner_data);
    overlay.style.display = "none";
  }

  function positionOnMouseDown(event) {
    var target = utils.closestElementWithId(event.target);
    
    if (!target)
      return;

    var startX = event.pageX;
    var startY = event.pageY;
    var isResize = event.altKey;
    var isMove = (!event.altKey && !event.shiftKey);
    var startDims = getSizeObjForElement(target);

    if (!startDims) {
      initSizeForElement(target);
      startDims = getSizeObjForElement(target);
    }
    
    function onMouseUp(event) {
      window.removeEventListener("mouseup", onMouseUp, false);
      window.removeEventListener("mousemove", onMouseMove, false);
      if (window.parent === window)
        window.history.pushState({}, "", "?" + makeQueryString() +
                                 window.location.hash);
      event.preventDefault();
      inQuasimode = false;
    }

    function onMouseMove(event) {
      var delta = {
        x: event.pageX - startX,
        y: event.pageY - startY
      };
      if (isResize) {
        target.style.width = (startDims.width + delta.x) + "px";
        target.style.height = (startDims.height + delta.y) + "px";
      } else if (isMove) {
        target.style.left = (startDims.left + delta.x) + "px";
        target.style.top = (startDims.top + delta.y) + "px";
      }
      event.preventDefault();
      setOverlay(target);
    }

    if (isResize && isMove)
      return;

    if (isResize || isMove) {
      overlay.style.display = "none";
      window.addEventListener("mouseup", onMouseUp, false);
      window.addEventListener("mousemove", onMouseMove, false);
      event.preventDefault();
      inQuasimode = true;
    }
  }
  
  function showCssOnClick(event) {
    if (event.shiftKey && event.altKey) {
      var html = '<!-- Paste this into your HTML. -->\n\n' +
                 utils.makeStyleHtml(makeCssRules());
      var url = 'data:text/plain,' + encodeURIComponent(html);
      window.open(url);
    }
  }
  
  window.addEventListener("DOMContentLoaded", function() {
    if (!isEnabled)
      return;
    var styleElement = document.getElementById('positioner-data');
    if (styleElement)
      applyCssRules(styleElement.textContent);
    initOverlay();
    onQueryStringChange();
    window.addEventListener("popstate", onQueryStringChange, false);
    window.addEventListener("click", showCssOnClick, true);
    window.addEventListener("mousedown", positionOnMouseDown, true);
  }, false);

  function initOverlay() {
    overlay = document.createElement("div");
    document.documentElement.appendChild(overlay);
    overlay.className = "positioner-overlay";
    overlay.style.display = "none";
    overlay.style.position = "absolute";
    overlay.style.pointerEvents = "none";
    overlay.style.zIndex = "999999";
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';

    window.addEventListener("mouseover", function(event) {
      var closest = utils.closestElementWithId(event.target);
      if (closest)
        setOverlay(closest);
    }, false);
    window.addEventListener("mouseout", function(event) {
      if (!inQuasimode)
        overlay.style.display = "none";
    }, false);
  }
  
  function setOverlay(element) {
    var rect = element.getBoundingClientRect();
    overlay.style.top = rect.top + "px";
    overlay.style.left = rect.left + "px";
    overlay.style.width = rect.width + "px";
    overlay.style.height = rect.height + "px";
    overlay.style.display = "block";
  }

  var utils = {
    parseCss: function(str) {
      function getStyleProperties(style) {
        var props = {};
        for (var i = 0; i < style.length; i++) {
          var name = style[i];
          props[name] = style.getPropertyValue(name);
        }
        return props;
      }

      var style = document.createElement("style");
      style.textContent = str;
      document.body.appendChild(style);
      var rules = {};
      for (var i = 0; i < style.sheet.cssRules.length; i++) {
        var rule = style.sheet.cssRules[i];
        rules[rule.selectorText] = getStyleProperties(rule.style);
      }
      document.body.removeChild(style);
      return rules;
    },
    applyCss: function(rules, element) {
      var rule = rules['#' + element.id];
      element.style.position = "absolute";
      element.style.top = rule.top;
      element.style.left = rule.left;
      element.style.width = rule.width;
      element.style.height = rule.height;
    },
    makeCss: function(element) {
      var dims = getSizeObjForElement(element);
      if (dims)
        return "#" + element.id + " { " + 
          "position: absolute; " +
          "top: " + dims.top + "px; " +
          "left: " + dims.left + "px; " +
          "width: " + dims.width + "px; " +
          "height: " + dims.height + "px" +
          " }";
    },
    closestElementWithId: function(element) {
      while (element && element != document.documentElement) {
        if (element.id)
          return element;
        element = element.parentNode;
      }
    },
    makeStyleHtml: function(rules) {
      return '<style id="positioner-data">\n' + rules + '\n</style>';
    },
    makeCssRules: makeCssRules
  };
  
  return {
    utils: utils,
    disable: function() {
      isEnabled = false;
    },
    isInQuasimode: function() {
      return inQuasimode;
    }
  };
})(window);
