<script id = "jsShort">
  /**
   * while window loading would have been completed
   * wend request to server to get menu block of mailer (Smailic)
   */
  window.onload = function () {
    var runner = google.script.run
      .withSuccessHandler(runScript)
      .withFailureHandler(errorWarning)
      .withUserObject(document.body);
    runner.getMenu('short');
  };
/**
 * Runs script passed as paramenter.
 * Creates new <script> tag, fils it by jscript codes set by string,
 * appends tag to el html element object and executes commands;
 * @param {string} jsString - string with codes
 * @param {object} el - html element's object where script tag appended
 * @return {}
 */
function runScript(jsString, el) {
  var d = window.document;
  var scrpt = d.createElement('SCRIPT');
  scrpt.appendChild(d.createTextNode(jsString));
  el.appendChild(scrpt);
}
/**
 * Checks if div element with id='inf' exists. If not creates it and append to body.
 * Than filles error message into element with id='inf'
 * @param {object Error} e - error object
 */
function errorWarning(e) {
  var inf;
  if (!(document.getElementById('inf'))) {
    inf = document.createElement('DIV');
    inf.id = 'inf';
    document.body.appendChild(inf);
  } else {
    inf = document.getElementById('inf');
  }
  inf.innerHTML = e.message;
}
</script>/</script>