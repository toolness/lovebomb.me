(function(jQuery) {
  $(window).ready(function() {
    $("section#chooser li").mouseenter(function() {
      if ($(this).find("iframe").length)
        return;

      var a = $(this).find("a");
      var template = a.attr("href").match(/^#editor\.(.+)$/)[1];
      var iframe = $('<iframe scrolling="no"></iframe>');
      var curtain = $('<div class="iframe-curtain"></div>');
      iframe.attr("src", "templates/" + template + ".html");
      $(this).append(iframe).append(curtain);
    });
  });
})(jQuery);
