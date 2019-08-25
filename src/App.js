import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import PrivateRoute from './helpers/PrivateRoute';
import { ContactList } from './components/contacts/contactList'
import { SignIn } from "./components/authentication/signIn";
import AuthenticationContextProvider from "./contexts/AuthenticationContext";
import { ApolloProvider } from '@apollo/react-hooks';
import { graphQLClient } from "./helpers/graphql";

function App() {
    return (
        <ApolloProvider client={graphQLClient}>
            <BrowserRouter>
                <div className="App">
                    <Switch>
                        <AuthenticationContextProvider>
                            <PrivateRoute exact path="/" component={ContactList}/>
                            <Route exact path="/signin" component={SignIn}/>
                        </AuthenticationContextProvider>
                    </Switch>
                </div>
            </BrowserRouter>
        </ApolloProvider>
    );
}

export default App;
