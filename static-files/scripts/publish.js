// Taken from https://github.com/hackasaurus/webxray/blob/master/static-files/uproot-dialog.html

function DeferredTimeout(ms) {
  var deferred = jQuery.Deferred();
  
  setTimeout(function() { deferred.resolve(); }, ms);
  return deferred;
}

function DeferredPublish(html, originalURL, hackpubURL) {
  var method = 'POST';
  var url = hackpubURL + "publish";
  var data = {
    'html': html,
    'original-url': originalURL
  };
  
  // If we're on MSIE, use their funky way of doing things.
  if (typeof(XDomainRequest) == "function") {
    var deferred = new jQuery.Deferred();
    var req = new XDomainRequest();
    req.open(method.toLowerCase(), url);
    req.onerror = function() {
      deferred.reject();
    };
    req.onload = function() {
      deferred.resolve([JSON.parse(req.responseText)]);
    };
    req.send(jQuery.param(data));
    return deferred;
  }

  return jQuery.ajax({
    type: method,
    url: url,
    data: data,
    crossDomain: true,
    dataType: 'json'
  });
}

function publish(options) {
  var html = options.html;
  var templateURL = options.templateURL;
  var hackpubURL = options.hackpubURL || "http://hackpub.hackasaurus.org/";
  if (html.length) {
    $("div.overlay-outer").fadeIn();
    $("div.overlay-outer .throbber").fadeIn();
    var timeout = DeferredTimeout(1000);
    var publish = DeferredPublish(html, templateURL, hackpubURL);
    jQuery.when(publish, timeout).then(function onSuccess(publishArgs) {
      var data = publishArgs[0];
      var url = data['published-url'];
      $("div.overlay-outer .throbber").fadeOut(function() {
        $(".published-url a").attr("href", url).text(url);
        $("div.overlay-outer .done").addClass("visible");
      });
    },
    function onFailure() {
      $("div.overlay-outer .close").click();
    });
  }
}

$(window).ready(function() {
  $("div.overlay-outer .close").click(function() {
    $("div.overlay-outer").fadeOut(function() {
      $("div.overlay-outer .done").removeClass("visible");
    });
  });
});
