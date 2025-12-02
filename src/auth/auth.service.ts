import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Knex } from 'knex';
import * as bcrypt from 'bcrypt';
import { KNEX_CONNECTION } from '../database/knex.tokens';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './user.type';

@Injectable()
export class AuthService {
  private readonly usersTable = 'users';

  constructor(
    @Inject(KNEX_CONNECTION) private readonly knex: Knex,
    private readonly jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto): Promise<Omit<User, 'password_hash'>> {
    const existing = await this.knex<User>(this.usersTable)
      .where({ email: dto.email })
      .first();

    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const [user] = await this.knex<User>(this.usersTable).insert(
      {
        id: this.knex.raw('gen_random_uuid()'),
        email: dto.email,
        password_hash: passwordHash,
        full_name: dto.fullName ?? null,
        role: 'USER',
        created_at: this.knex.fn.now(),
        updated_at: this.knex.fn.now(),
      },
      '*',
    );

    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.knex<User>(this.usersTable)
      .where({ email })
      .first();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    const user = await this.validateUser(dto.email, dto.password);
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);
    return { accessToken, user  };
  }
}
