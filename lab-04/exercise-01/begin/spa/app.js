const content = document.getElementById('content');
const navbar = document.getElementById('navbar-container');
const loadingIndicator = document.getElementById('loading-indicator');
const auth0Client = new Auth0Login({
  domain: 'iamnotmyself.auth0.com',
  client_id: 'tqzRziFwBv6JcAsCeY0RYiGHWQV623KJ'
});


window.onload = async function() {
  let requestedView = window.location.hash;

  if (requestedView === '#callback') {
    await auth0Client.handleRedirectCallback();
    window.history.replaceState({}, document.title, '/');
  } else {
    await auth0Client.init();
  }

  await loadView('#navbar', navbar);

  window.location.hash = requestedView;
};

window.onhashchange = async function() {
  let requestedView = window.location.hash;

  if (requestedView !== '#home' && requestedView !== '#expenses') {
    requestedView = '#home'
  }

  await loadView(requestedView, content);
};

async function loadView(viewName, container) {
  container.innerHTML = '';
  viewName = viewName.substring(1);
  window.history.replaceState({}, document.title, `/#${viewName}`);
  const response = await fetch(`/views/${viewName}.html`);
  container.innerHTML = await response.text();

  var scriptTag = document.createElement('script');
  scriptTag.src = `/scripts/${viewName}.js`;

  container.appendChild(scriptTag);

  loadingIndicator.style.display = 'none';
  container.style.display = 'block';
}

async function allowAccess() {
  if (!await auth0Client.isAuthenticated()) {
    await loadView('#home', content);
    return false;
  }
  return true;
}
