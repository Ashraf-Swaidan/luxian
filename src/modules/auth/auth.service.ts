import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;

  constructor(private readonly prisma: PrismaService, 
    private jwtService: JwtService
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, firstName, lastName } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    try {
      const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });

      const tokens = await this.generateTokens(user.id, user.email);

      return {
        ...tokens,
        user,
      };
    } catch (error) {
      throw new InternalServerErrorException('Failed to register user');
    }
  }

  private async generateTokens(userId: string, email: string):
   Promise<{accessToken: string, refreshToken: string}> {
    const payload = { sub: userId, email };
    const refreshId = randomBytes(16).toString('hex');
    const [accessToken, refreshToken] = await Promise.all([
        this.jwtService.signAsync(payload, {expiresIn: '15m'}),
        this.jwtService.signAsync({...payload, refreshId}, { expiresIn: '7d' }),
      ]);
      return {
        accessToken,
        refreshToken,
      };
    }


    async login(loginDto: LoginDto): Promise<AuthResponseDto>{
     const {email, password} = loginDto;
     
     const user = await this.prisma.user.findUnique({
      where: {email}
     })

    if(!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    if(!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const tokens = await this.generateTokens(user.id, user.email);

    const safeUser = {
      id: user.id,
      email:user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    }
    return { ...tokens, user:safeUser };
  }

  
  }

