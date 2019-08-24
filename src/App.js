import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import PrivateRoute from './helpers/PrivateRoute';
import { ContactList } from './components/contacts/contactList'
import { SignIn } from "./components/authentication/signIn";

function App() {
    return (
        <BrowserRouter>
            <div className="App">
                <Switch>
                    <PrivateRoute exact path="/" component={ContactList}/>
                    <Route exact path="/signin" component={SignIn}/>
                </Switch>
            </div>
        </BrowserRouter>
    );
}

export default App;
