import { createBrowserHistory } from 'history';
import React from 'react';
import { render } from 'react-dom';
import { initDiagnostics } from 'Diagnostics/diagnosticsEvents';
import createAppStore from 'Store/createAppStore';
import App from './App/App';

import 'Diag/ConsoleApi';

export async function bootstrap() {
  const history = createBrowserHistory();
  const store = createAppStore(history);

  initDiagnostics(store, history);

  render(
    <App store={store} history={history} />,
    document.getElementById('root')
  );
}
