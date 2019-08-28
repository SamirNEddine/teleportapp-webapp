import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import PrivateRoute from './helpers/PrivateRoute';
import { AuthenticationContextProvider } from "./contexts/AuthenticationContext";
import { AgoraContextProvider } from "./contexts/AgoraContext";
import { ApolloProvider } from '@apollo/react-hooks';
import { graphQLClient } from "./helpers/graphql";
import NavBar from "./components/layout/NavBar";
import ContactList  from './components/contacts/ContactList'
import SignIn from "./components/authentication/SignIn";
import Conversation from "./components/conversation/Conversation";
import {ConversationContextProvider} from "./contexts/ConversationContext";

function App() {
    return (
        <ApolloProvider client={graphQLClient}>
            <BrowserRouter>
                <div className="App">
                    <Switch>
                        <AuthenticationContextProvider>
                            <NavBar/>
                            <div className="app-content">
                                <AgoraContextProvider>
                                    <ConversationContextProvider>
                                        <PrivateRoute exact path="/" component={ContactList}/>
                                        <PrivateRoute path="/conversation" component={Conversation}/>
                                    </ConversationContextProvider>
                                </AgoraContextProvider>
                            </div>
                            <Route exact path="/signin" component={SignIn}/>
                        </AuthenticationContextProvider>
                    </Switch>
                </div>
            </BrowserRouter>
        </ApolloProvider>
    );
}

export default App;
