import jwt_decode from "jwt-decode";
import cookies from "js-cookies";


type userClaims = {
    authorized: boolean,
    role: number,
    user: string,
    id: number
}

export const getUserClaims = () => {
    const token = cookies.getItem("jwt");
    
    if (token) {
        const decoded: userClaims = jwt_decode(token)

        const claims: userClaims = {
            authorized: true,
            id: decoded.id,
            user: decoded.user,
            role: decoded.role
        } 

        return claims
    }
    
    const claims: userClaims = {
        authorized: false,
        id: 0,
        user: "",
        role: 0
    } 

    return claims
}