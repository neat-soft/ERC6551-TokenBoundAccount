import http from "./http";
const apiEndpoints = {
    ownedTokens: '/tokens'
}
export const getOwnedTokens = ({ queryKey }) => {
    const [_, address] = queryKey;
    return http.get(wallet.apiEndpoints.ownedTokens + "/" + address);
}