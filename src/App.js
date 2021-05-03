import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';

import './App.css';
import Header from './components/Header';
import SearchList from './components/SearchList';

// pages
import Preview3d from './pages/PreviewPage';

function App() {
  return (
    <BrowserRouter basename={process.env.REACT_APP_ROUTER_BASE || ''}>
      <Switch>
        <Route path="/" component={Preview3d} exact />
        <Redirect from="/" to={
          <>
            <Header />
            <SearchList />
          </>
          }/>
      </Switch>
    </BrowserRouter>
  );
}

export default App;
