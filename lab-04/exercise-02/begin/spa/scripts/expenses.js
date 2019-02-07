(async function() {
  if (!await allowAccess()) return;

  const consentNeeded = document.getElementById('consent-needed');
  const expensesDiv = document.getElementById('expenses-container');
  const expensesList = document.getElementById('expenses-list');
  const loadExpensesButton = document.getElementById('load-expenses');
  const loadingExpenses = document.getElementById('loading-expenses');

  const expensesAPIOptions = {
    audience: 'https://expenses-api',
    scope: 'read:reports',
  };

  try {
    const accessToken = await auth0Client
      .getTokenSilently(expensesAPIOptions);
    await loadExpenses(accessToken);
  } catch (err) {
    if (err.error !== 'consent_required') {
      alert('Error while fetching access token. Check browser logs.');
      return console.log(err);
    }
    loadExpensesButton.onclick = async () => {
      accesstoken = await
        auth0Client.getTokenWithPopup(expensesAPIOptions);
      await loadExpenses(accesstoken);
    };

    consentNeeded.style.display = 'block';
    loadExpensesButton.style.display = 'inline-block';
    loadingExpenses.style.display = 'none';
  }


async function loadExpenses(accesstoken) {
  try {
    const response = await fetch('http://localhost:3001/', {
      method: 'GET',
      headers: {
        authorization: `Bearer ${accesstoken}`,
      }
    });
    if (!response.ok) throw 'Request status: ' + response.status;
    const expenses = await response.json();
    displayExpenses(expenses);
  } catch (err) {
    console.log(err);
    alert('Error while fetching expenses. Check browser logs.');
  }
}


  function displayExpenses(expenses) {
    expenses.forEach(expense => {
      const newItem = document.createElement('li');
      const description = `$ ${expense.value.toFixed(2)} ` +
        `- ${expense.description}`;
      const newItemDescription = document.createTextNode(description);
      newItem.appendChild(newItemDescription);
      expensesList.appendChild(newItem);
    });

    loadingExpenses.style.display = 'none';
    consentNeeded.style.display = 'none';
    loadExpensesButton.style.display = 'none';
    expensesDiv.style.display = 'block';
  }
})();
