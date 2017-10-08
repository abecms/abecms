window.addEventListener('click', function (ev) {
  if (ev.altKey || ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.defaultPrevented || self.location == top.location) {
    console.log('avoided');
    return true;
  }

  var anchor = null;
  for (var n = ev.target; n.parentNode; n = n.parentNode) {
    if (n.nodeName === 'A') {
        anchor = n;
        break;
    }
  }
  if (!anchor) return true;

  var link = document.createElement('a');
  link.setAttribute('href', anchor.getAttribute('href'));

  if (link.host && link.host !== location.host) return true;
  
  ev.preventDefault();
  
  var gotoUrl = location.protocol + '//' + location.host + '/abe/editor' + link.pathname + (link.search || '') + (link.hash || '') ;
  link = null;
  top.location.href = gotoUrl  
});
