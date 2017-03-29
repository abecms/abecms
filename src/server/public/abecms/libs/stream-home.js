var StreamParent = document.querySelector('.stream');
var streams = [];

var actionsType = {
  PUBLISH: 'publish',
  REVIEW: 'review',
  CREATE: 'create',
  DELETE: 'delete',
};

function timer(){
  setInterval(function () {
    Array.prototype.forEach.call(streams, (stream) => {
      stream.updateTime();
    });
  }, 1000*60);
}

function timeSince(date) {
  var seconds = Math.floor((new Date() - date) / 1000);
  var interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + "y ago";
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + "m ago";
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + "d ago";
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + "h ago";
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + "mn ago";
  return "now";
}

function removeStream(callBack){
  if(streams.length > 3){
    var oldestStream = streams.shift();
    var node = oldestStream.getNode();
    // node.classList.add('remove');
    setTimeout(function () {
      // oldestStream.destroy();
      callBack();
    }, 750);
  }
  else setTimeout(function () {
    callBack();
  }, 100);
}

var StreamItem = function StreamItem (data) {
  this.data = data;
  this.createNode();
};

StreamItem.prototype.getNode = function getNode () {
  return this.streamItem;
};

StreamItem.prototype.updateTime = function updateTime () {
  this.time.textContent = timeSince(new Date(this.time.getAttribute('data-time')));
};

StreamItem.prototype.destroy = function destroy () {
  this.streamItem.parentNode.removeChild(this.streamItem);
};

StreamItem.prototype.createNode = function createNode () {
  // parent stream
  this.streamItem = document.createElement('div');
  this.streamItem.classList.add('stream-item');
  this.streamItem.classList.add('remove');
  this.streamItem.classList.add(this.getActionClass());

  // clock
  this.time = document.createElement('div');
  this.time.classList.add('stream-time');
  this.time.textContent = 'now';
  this.time.setAttribute('data-time', new Date().toISOString());

  // content
  var content = document.createElement('div');
  content.classList.add('stream-content');
  content.innerHTML = '<strong class="name">' + this.data.user + '</strong> ' +
                      '<span class="stream-action">' + this.getTextContent() + '</span> : ' +
                      '<a href="' + this.data.post + '" class="stream-page">' + this.data.post + '</a>';

  this.streamItem.appendChild(this.time);
  this.streamItem.appendChild(content);

  StreamParent.insertBefore(this.streamItem, StreamParent.firstChild);

  setTimeout(function () {
    this.streamItem.classList.remove('remove');
  }.bind(this), 100);
};

StreamItem.prototype.getActionClass = function getActionClass () {
  var action;

  switch(this.data.operation){
    case actionsType.PUBLISH: action = 'published'; break;
    case actionsType.REVIEW: action = 'reviewed'; break;
    case actionsType.CREATE: action = 'created'; break;
    case actionsType.DELETE: action = 'deleted'; break;
    default: action = 'default';
  }

  return action
};

StreamItem.prototype.getTextContent = function getTextContent () {
  var text;

  switch(this.data.operation){
    case actionsType.PUBLISH: text = 'has published a page'; break;
    case actionsType.REVIEW: text = 'has reviewed a page'; break;
    case actionsType.CREATE: text = 'has created a new page'; break;
    case actionsType.DELETE: text = 'has deleted a page'; break;
    default: text = '';
  }

  return text
};

if (!!window.EventSource) {
  var stream = document.querySelector('.stream')
  var source = new EventSource('/abe/rest/activity-stream');
  source.addEventListener('message', (e, data) => {
    var json = JSON.parse(e.data)
    if(json.user != null) streams.push(new StreamItem(json));
    if(streams.length === 1) timer();
  }, false);

  source.addEventListener('open', (e) => {
    // Connection was opened.
  }, false);

  source.addEventListener('error', (e) => {
    if (e.readyState == EventSource.CLOSED) {
      // Connection was closed.
    }
  }, false);
}
