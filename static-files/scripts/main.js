$(window).ready(function() {
  $("#editor").bind("navshow", function(event, templateID) {
    if (templateID == "remix") {
      Editor.enableRemix();
    } else {
      Editor.loadTemplate(templateID);
    }
  });
  $("#publish").click(function() {
    Publish.publish(Editor.getContent());
  });
  Navigation.init();
  Editor.init();
  Publish.init();
});
