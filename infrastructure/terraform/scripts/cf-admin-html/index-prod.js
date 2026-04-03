function handler(event) {
  var request = event.request;
  var hostHeader = request.headers ? request.headers.host : null;
  var host = hostHeader && hostHeader.value ? hostHeader.value : '';
  var hosts = ['admin.yamang02.com'];
  var match = false;
  for (var i = 0; i < hosts.length; i++) {
    if (host === hosts[i]) {
      match = true;
      break;
    }
  }
  if (!match) {
    return request;
  }
  var uri = request.uri;
  if (uri === undefined || uri === null || uri === '') {
    uri = '/';
  }
  request.uri = uri;
  if (uri.indexOf('/assets/') === 0) {
    return request;
  }
  if (uri.indexOf('/favicons/') === 0) {
    return request;
  }
  var parts = uri.split('/');
  var last = parts.length > 0 ? parts[parts.length - 1] : '';
  if (last.indexOf('.') > 0) {
    return request;
  }
  request.uri = '/admin.html';
  return request;
}
