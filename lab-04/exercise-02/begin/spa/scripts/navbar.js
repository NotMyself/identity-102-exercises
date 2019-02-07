(async function() {
  const expensesLink = document.getElementById('expenses-link');
  const profilePicture = document.getElementById('profile-picture');
  const userFullname = document.getElementById('user-fullname');
  const logInButton = document.getElementById('log-in');
  const logOutButton = document.getElementById('log-out');

  logInButton.onclick = async () => {
    await auth0Client.loginWithRedirect({
      redirect_uri: 'http://localhost:5000/#callback'
    });
  };

  logOutButton.onclick = () => {
    auth0Client.logout({
      returnTo: 'http://localhost:5000/'
    });
  };

  const isAuthenticated = await auth0Client.isAuthenticated();
  if (isAuthenticated) {
    const user = await auth0Client.getUser();
    profilePicture.src = user.picture;
    userFullname.innerText = user.name;

    logOutButton.style.display = 'inline-block';
    expensesLink.style.display = 'inline-block';
  } else {
    logInButton.style.display = 'inline-block';
  }
})();
