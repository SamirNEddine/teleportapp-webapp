import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { onError } from 'apollo-link-error';
import { ApolloLink } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { getAuthenticationToken, clearLocalStorage } from './localStorage';
import authenticationStore from '../stores/authenticationStore';
import { authError } from "../actions/authenticationActions";

const API_STATUS_CODES = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    INTERNAL_SERVER_ERROR: 500
};

const httpLink = createHttpLink({
    uri: process.env.REACT_APP_GRAPHQL_SERVER_URL
});
const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    const token = getAuthenticationToken();
    // return the headers to the context so httpLink can read them
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
        }
    }
});
const errorHandlerLink = onError(({ graphQLErrors, networkError, extensions}) => {
    if (graphQLErrors)
        graphQLErrors.forEach(({ message, status, locations, path, extensions }) => {
            console.debug(`[GraphQL error]: Message: ${message}, Status: ${status}, Location: ${locations}, Path: ${path}, Extensions: ${JSON.stringify(extensions)}`);
            if (extensions && extensions.status === API_STATUS_CODES.UNAUTHORIZED){
                clearLocalStorage();
                authenticationStore.dispatch(authError(message));
            }
        });
    if (networkError) console.log(`[Network error]: ${networkError.message}`);
});

const link = ApolloLink.from([
    errorHandlerLink,
    authLink,
    httpLink
]);

export const graphQLClient = new ApolloClient({
    link:link,
    cache: new InMemoryCache()
});