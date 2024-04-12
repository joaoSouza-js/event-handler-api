import bcrypt from "bcrypt"

export async function generatePasswordHash(password:string,salt=10){
    const hash = await bcrypt.hash(password,salt)
    return hash
}