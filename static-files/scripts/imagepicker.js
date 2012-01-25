var ImagePicker = (function() {
  var DELAY_MS = 300;
  var api_key = 'e59b6a956fe1cdf4dad125cb3c1c1321';
  var delay = null;
  var lastSearch = null;
  
  function showResults() {
    var search = $(".image-picker input").val();
    var searchTerms = encodeURIComponent(search);
    //var license = '&license=1%2C2%2C3%2C4%2C5%2C6%2C7';
    var license = '';
    var perPage = '&per_page=25';
    var url = 'http://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=' + api_key + '&text=' +
              searchTerms + license + perPage + '&format=json&nojsoncallback=1';
    if (!search || search == lastSearch)
      return;
    lastSearch = search;
    $(".image-picker ul.results").empty();
    jQuery.getJSON(url, function(data) {
      data.photos.photo.forEach(function(photo) {
        var url = 'http://farm' + photo.farm + '.staticflickr.com/' +
                  photo.server + '/' + photo.id + '_' + photo.secret;
        var img = $('<img>');
        var page = 'http://www.flickr.com/photos/' + photo.owner +
                   '/' + photo.id;
        img.attr('src', url + '_s.jpg').click(function() {
          $(".image-picker").hide();
          Editor.insertContent(url + '.jpg');
        });
        var li = $('<li></li>');
        li.append(img);
        $(".image-picker ul.results").append(li);
        //img.wrap('<a href="' + page + '"></a>');
      });
    });
  }
  
  $(".image-picker input").keyup(function(event) {
    if (event.keyCode == 27)
      $(".image-picker").hide();
    clearTimeout(delay);
    delay = setTimeout(showResults, DELAY_MS);
  });
  $("#image-picker").click(function() {
    $(".image-picker").show();
    $(".image-picker input").focus();
  });
  $(".image-picker").click(function(event) {
    if (event.target == this)
      $(".image-picker").hide();
  });

  return {};
})();
