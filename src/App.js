import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import PrivateRoute from './helpers/PrivateRoute';
import { ContactList } from './components/contacts/contactList'
import { SignIn } from "./components/authentication/signIn";
import AuthenticationContextProvider from "./contexts/AuthenticationContext";
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';

const graphqlClient = new ApolloClient({
    uri: process.env.REACT_APP_GRAPHQL_SERVER_URL
});

function App() {
    return (
        <ApolloProvider client={graphqlClient}>
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
