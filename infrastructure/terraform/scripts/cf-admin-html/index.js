function handler(event) {
  var request = event.request;
  if (!request.headers) {
    request.headers = {};
  }
  var hostHeader = request.headers.host;
  var host = hostHeader && hostHeader.value ? hostHeader.value : '';
  request.headers['x-cf-site-key'] = { value: host ? host.toLowerCase() : '' };

  var hosts = ['staging.admin.yamang02.com'];
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
  if (uri === '/index.html') {
    request.uri = '/admin.html';
    return request;
  }
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
