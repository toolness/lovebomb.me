Love Bomb Builder is a [Hackasaurus][] experiment that builds on Mimi Ito's concept of [interest-based learning][] by attempting to make it easy to create a "Love Bomb" for a friend using basic HTML and CSS.

Like an online greeting card site, users who visit the Love Bomb Builder at [lovebomb.me][] are presented with a variety of templates to base their Love Bomb on. However, instead of filling out form fields, they are presented with a simple HTML document to tinker with. Templates range in difficulty from beginner to expert, so someone who has never seen HTML before can start out with a simple template and move on to more complex ones.

## Technical Details

Presently the app works on the latest versions of all major browsers: Chrome, Firefox, Internet Explorer, Opera, and Safari.

The app consists entirely of static files and uses the [hackpub][] API to publish documents for users.

The [CodeMirror][] library is used for HTML editing.

## Template Guidelines

1. Any "boring" or complex CSS that is hard to make sense of should be put in a separate CSS file and linked to. The downside here is that users won't be able to edit it.

2. Conversely, the template's inline CSS should be only interesting and easy to understand rules that HTML/CSS newcomers might have fun tinkering with. For now, unfortunately, this means that vendor-prefixed CSS rules are discouraged, since they're likely to be confusing to people.

3. the HTML structure of the page should be [W3C compliant HTML5][].

4. The HTML structure of the page should include as few semantically meaningless elements as possible. That means e.g. 3 layers of wrapper DIVs that are solely used to vertically center the content on the screen are discouraged.

5. The template only needs to render properly on the latest versions of Opera, Firefox, Chrome, Safari, and Internet Explorer. Don't worry about e.g. IE8, as supporting such browsers usually means adding shims or browser-specific logic that will confuse newcomers.

## Development

Just enter the root directory of the repository and run `python server.py`, a trivial local webserver, and browse to http://localhost:8000.

  [Hackasaurus]: http://hackasaurus.org
  [interest-based learning]: http://commonspace.wordpress.com/2011/09/27/friends-and-mentors/
  [lovebomb.me]: http://lovebomb.me
  [hackpub]: https://github.com/hackasaurus/hackpub
  [CodeMirror]: http://codemirror.net/
  [W3C compliant HTML5]: http://html5.validator.nu/
