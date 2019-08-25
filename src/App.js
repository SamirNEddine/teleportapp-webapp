import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import PrivateRoute from './helpers/PrivateRoute';
import AuthenticationContextProvider from "./contexts/AuthenticationContext";
import AgoraContextProvider from "./contexts/AgoraContext";
import { ApolloProvider } from '@apollo/react-hooks';
import { graphQLClient } from "./helpers/graphql";
import ContactList  from './components/contacts/ContactList'
import SignIn from "./components/authentication/SignIn";
import Conversation from "./components/conversation/Conversation";

function App() {
    return (
        <ApolloProvider client={graphQLClient}>
            <BrowserRouter>
                <div className="App">
                    <Switch>
                        <AuthenticationContextProvider>
                            <PrivateRoute exact path="/" component={ContactList}/>
                            <AgoraContextProvider>
                                <PrivateRoute path="/conversation" component={Conversation}/>
                            </AgoraContextProvider>
                            <Route exact path="/signin" component={SignIn}/>
                        </AuthenticationContextProvider>
                    </Switch>
                </div>
            </BrowserRouter>
        </ApolloProvider>
    );
}

export default App;
