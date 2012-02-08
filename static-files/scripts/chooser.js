(function(jQuery) {
  //var BASE_URL = "http://bjb.io:9123/";
  var BASE_URL = "http://localhost:8080/";
  $(window).ready(function() {
    var val = "";
    var req = null;
    setInterval(function() {
      var newVal = $("section#chooser input").val();
      if (newVal.trim().length && val != newVal) {
        val = newVal;
        $("section#chooser img.big-throbber").show();
        $("section#chooser .result").hide();
        if (req)
          req.abort();
        req = jQuery.ajax({
          url: BASE_URL + 'article',
          data: {
            url: val,
          },
          success: function(data) {
            console.log("success", data);
            window.localStorage['customHtml'] = data.trim();
            window.location.hash = "#editor.custom";
          },
          error: function(jqXHR, textStatus) {
            if (textStatus == "abort")
              return;
            $("section#chooser .error.result").fadeIn();
            console.log("error", textStatus);
          },
          complete: function() {
            $("section#chooser img.big-throbber").hide();
            req = null;
          },
          timeout: 10000
        });
      }
    }, 100);
  });
})(jQuery);
