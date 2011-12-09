function currentSection() {
  return $("section").not(".out-on-right, .out-on-left")
}

function goTo(sectionID) {
  var next = $("section" + sectionID);
  var current = currentSection();
  if (!next.length || next[0] == current[0])
    return;
  if (next.hasClass("out-on-right")) {
    current.addClass("out-on-left");
    next.show();
    setTimeout(function() {
      next.removeClass("out-on-right");
      next.prevAll(".out-on-right").hide()
        .removeClass("out-on-right").addClass("out-on-left");
    }, 1);
  } else {
    current.addClass("out-on-right");
    next.show();
    setTimeout(function() {
      next.removeClass("out-on-left");
      next.nextAll(".out-on-left").hide()
        .removeClass("out-on-left").addClass("out-on-right");
    }, 1);
  }
}

function parseHash() {
  var hash = window.location.hash;
  if (hash.length < 2)
    hash = "#intro";
  var parts = hash.split('.');
  return {
    base: parts[0],
    arg: parts[1]
  };
}

function goToHash() {
  goTo(parseHash().base);
}

onhashchange = goToHash;

$(window).ready(function() {
  $("section").bind("transitionend oTransitionEnd webkitTransitionEnd", function() {
    if ($(this).is(".out-on-right, .out-on-left")) {
      $(this).hide();
    } else {
      $(this).trigger("show", parseHash().arg);
    }
  });
  $("#editor").bind("show", function(event, templateID) {
    loadTemplate(templateID);
  });
  goToHash();
});
