import jwt_decode from "jwt-decode";
import cookies from "js-cookies";


export type UserClaims = {
    authorized: boolean,
    role: number,
    user: string,
    id: number
}

export const getUserClaims = () => {
    const token = cookies.getItem("jwt");
    
    if (token) {
        const decoded: UserClaims = jwt_decode(token)

        const claims: UserClaims = {
            authorized: true,
            id: decoded.id,
            user: decoded.user,
            role: decoded.role
        } 

        return claims
    }
    
    const claims: UserClaims = {
        authorized: false,
        id: 0,
        user: "",
        role: 0
    } 

    return claims
}