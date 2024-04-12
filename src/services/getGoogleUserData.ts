import axios from "axios"
import { USER_GOOGLE_DTO } from "../DTO/USER_GOOGLE_DTO"

export async function getUserData(accessToken: string | null | undefined){
    const url = `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`
    const response = await axios.get(url)
    const user: USER_GOOGLE_DTO = response.data
    return user
}