import bcrypt from "bcrypt"

type verifyPasswordProps = {
    password: string ,
    hash: string| null
}

export async function verifyPassword({password,hash}:verifyPasswordProps){
    if(hash === null) return false
    try {
        const passwordIsCorrect = await bcrypt.compare(password, hash)
        return passwordIsCorrect
    } catch (error) {
        return false
    }
    
}