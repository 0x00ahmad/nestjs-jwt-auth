import {
    ForbiddenException,
    HttpException,
    HttpStatus,
    Injectable,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Prisma, User } from "@prisma/client";
import { UsersService } from "../users/users.service";
import {
    ApiResponse,
    AuthDto,
    DebugSignUpDto,
    DeleteAccountDto,
    ResetAccountPasswordDto,
    SessionObject,
    SignUpDto,
} from "../common/dto";
import { Constants } from "../constants";
import { TwofaService } from "../twofa/twofa.service";
import { hashData, verifyHash } from "../crypto_funcs";
import { Tokens } from "./types";
import { RequestUser } from "../common/types";

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private twoFaService: TwofaService
    ) {}

    async signUpLocal(dto: DebugSignUpDto): Promise<ApiResponse> {
        if (await this.usersService.findUser(dto.usernameId)) {
            throw new HttpException("User already exists", HttpStatus.BAD_REQUEST);
        }
        await this.usersService.createUser({
            email: dto.email,
            createdAt: new Date(),
            updatedAt: new Date(),
            passwordHash: await hashData(dto.password),
            usernameId: dto.usernameId,
        });
        return { detail: "User successfully created" };
    }

    async createUser(dto: SignUpDto): Promise<ApiResponse> {
        const user = await this.usersService.findUser(dto.usernameId);
        if (user) throw new HttpException("User Already Exists", HttpStatus.BAD_REQUEST);
        await this.usersService.createUser({
            email: dto.email,
            createdAt: new Date(),
            updatedAt: new Date(),
            passwordHash: await hashData(dto.password),
            usernameId: dto.usernameId,
        });
        return { detail: "User successfully created" };
    }

    async loginLocal(dto: AuthDto, ip: string, userAgent: string): Promise<Tokens> {
        const user = await this.usersService.findUser(dto.usernameId);
        if (!user) throw new ForbiddenException("Access Denied");
        await this.validatePassword(user.passwordHash, dto.password);
        const tokens = await this.getTokens(user.id, user);
        await this.parseSession(user, tokens, ip, userAgent);
        return tokens;
    }

    async refreshToken(id: number, rt: string, ip: string, userAgent: string) {
        const user = await this.usersService.findUser(id);
        if (!user) throw new ForbiddenException("Access Denied");
        const sessionObject = await this.findRTSessionObject(
            user.liveSessions,
            ip,
            userAgent
        );
        if (!sessionObject) throw new ForbiddenException("Access Denied");
        const isMatched = await verifyHash(sessionObject.refreshTokenHash, rt);
        if (!isMatched) throw new ForbiddenException("Access Denied");
        return this.getTokens(user.id, user);
    }

    async logOut(userId: number, ip: string, userAgent: string) {
        const user = await this.usersService.findUser(userId);
        const rt = await this.findRTSessionObject(user.liveSessions, ip, userAgent);
        if (!rt) throw new ForbiddenException("Session not present");
        await this.removeSession(user, rt.refreshTokenHash);
        return { detail: "Session successfully logged out" };
    }

    async resetPassword(user: RequestUser, dto: ResetAccountPasswordDto) {
        const matching = await this.usersService.findUsers({
            where: { id: user.sub  },
        });
        if (!matching.length)
            throw new HttpException("Access Denied", HttpStatus.BAD_REQUEST);
        const instance = matching[0];
        await this.validatePassword(instance.passwordHash, dto.password);

        // * remove every session as a password was reset
        await this.usersService.updateFields(user.sub, {
            liveSessions: [],
            passwordHash: dto.newPassword,
        });
        return { detail: "Password reset successfull" };
    }

    async deleteAccount(userId: number, rt: string, dto: DeleteAccountDto) {
        const user = await this.usersService.findUser(userId);
        if (!user) throw new ForbiddenException("Access Denied");
        await this.validatePassword(user.passwordHash, dto.password);
        const isRtValid = await this.findSessionFromRT(user.liveSessions, rt);
        if (!isRtValid) throw new ForbiddenException("Access Denied");
        if (user.is2FaVerified) {
            const { verified } = await this.twoFaService.validate2FARequest(
                user.email,
                dto.twoFaCode
            );
            if (!verified) throw new ForbiddenException("Access Denied");
        }
        await this.usersService.deleteUser(user.id);
        return { detail: "Account successfully deleted" };
    }

    // private methods

    private async validatePassword(
        passwordHash: string,
        password: string
    ): Promise<void> {
        const isVerfied = await verifyHash(passwordHash, password);
        if (!isVerfied) throw new ForbiddenException("Access Denied");
    }

    private async getTokens(id: number, user: User): Promise<Tokens> {
        return this.generateTokens(id, user);
    }

    private async parseSession(
        user: User,
        tokens: Tokens,
        ip: string,
        userAgent: string
    ): Promise<void> {
        // * it's only gonna record an ip
        let currSessions: any = user.liveSessions || undefined;
        const targetObject = {
            ip,
            userAgent,
            refreshTokenHash: await hashData(tokens.refresh_token),
            loggedInAt: new Date().toISOString(),
        };
        if (
            currSessions &&
            currSessions.filter((e: any) => {
                return e.ip === ip || e.userAgent === userAgent;
            }).length > 0
        )
            throw new HttpException(
                "Already logged in with the same IP and device",
                HttpStatus.OK
            );
        if (currSessions?.length > 0) {
            currSessions.push(targetObject);
        } else {
            currSessions = [targetObject];
        }
        await this.usersService.updateFields(user.id, {
            liveSessions: currSessions,
        });
    }

    private async findRTSessionObject(
        liveSessions: Prisma.JsonValue,
        ip: string,
        userAgent: string
    ): Promise<false | SessionObject> {
        const currLiveSessions = liveSessions as Array<any>;
        for (const e of currLiveSessions) {
            if (e.ip === ip && e.userAgent === userAgent) return e;
        }
        return false;
    }

    private async findSessionFromRT(liveSessions: Prisma.JsonValue, rt: string) {
        const currLiveSessions = liveSessions as Array<any>;
        for (const obj of currLiveSessions) {
            if (await verifyHash(obj.refreshTokenHash, rt)) return obj;
        }
        return false;
    }

    private async removeSession(user: User, rt: string): Promise<void> {
        const updatedLiveSessions = [] as Prisma.JsonArray;
        const currLiveSessions = user?.liveSessions as Array<any>;
        for (const obj of currLiveSessions) {
            if (obj.refreshTokenHash !== rt) updatedLiveSessions.push(obj);
        }
        await this.usersService.updateJsonField(user.id, {
            liveSessions: updatedLiveSessions,
        });
    }

    private async generateTokens(sub: number, user: User): Promise<Tokens> {
        const [at, rt] = await Promise.all([
            this.jwtService.signAsync(
                {
                    sub,
                    email: user.email,
                    usernameId: user.usernameId,
                },
                { secret: Constants.at_signing_key, expiresIn: "15m" } // this gives us 15 minutes
            ),
            this.jwtService.signAsync(
                {
                    sub,
                    email: user.email,
                    usernameId: user.usernameId,
                },
                { secret: Constants.rt_signing_key, expiresIn: "7 days" } // this gives us 7 days
            ),
        ]);

        return { access_token: at, refresh_token: rt };
    }
}
