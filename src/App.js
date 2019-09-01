import React from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import PrivateRoute from './helpers/PrivateRoute';
import { AuthenticationContextProvider } from "./contexts/AuthenticationContext";
import { ApolloProvider } from '@apollo/react-hooks';
import { graphQLClient } from "./helpers/graphql";
import SignIn from "./components/authentication/SignIn";
import NavBar from "./components/layout/NavBar";
import Device from "./components/device/Device";
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
                                <ConversationContextProvider>
                                    <PrivateRoute exact path="/" component={Device}/>
                                </ConversationContextProvider>
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
