import jwt from "jsonwebtoken";
import { evn } from "../env";

type generateTokenProps = {
    data: object;
    expiration?: number;
};

export async function generateToken(props: generateTokenProps) {
    const { TOKEN_SECRET } = evn;
    const {
        data,
        expiration = 60 * 60 * 24 * 7, // 7 days
    } = props;

    const dataInStringify = JSON.stringify(data);

    const token = await jwt.sign(
        {
            data: dataInStringify,
        },
        TOKEN_SECRET,
        { expiresIn: expiration }
    );

    return token;
}
