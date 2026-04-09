import { ILoginInput, ILoginResult, IUserPublic } from '../interfaces';
export declare class AuthService {
    /**
     * Validates credentials and returns a signed JWT + public user object.
     * Throws a plain Error with a message on failure — controller decides HTTP status.
     */
    login(input: ILoginInput): Promise<ILoginResult>;
    /**
     * Returns the public profile of the currently authenticated user.
     */
    getMe(userId: string): Promise<IUserPublic>;
}
//# sourceMappingURL=auth.service.d.ts.map