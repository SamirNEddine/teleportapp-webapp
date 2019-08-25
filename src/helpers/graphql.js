import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
// import { onError } from 'apollo-link-error';
// import { ApolloLink } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import { setContext } from 'apollo-link-context';
import { getAuthenticationToken } from "./localStorage";

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

export const graphQLClient = new ApolloClient({
    link:authLink.concat(httpLink),
    cache: new InMemoryCache()
});