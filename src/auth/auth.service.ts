import {
  // ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginDto } from './dto/login.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  //Metodo login
  async login(credentials: LoginDto) {
    const { email, password } = credentials;

    //Buscar usuario en la base de datos
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new HttpException(
        `Credenciales incorrectas`,
        HttpStatus.UNAUTHORIZED,
      );
    }

    const payload = { userId: user.id, email: user.email };
    const token = this.jwtService.sign(payload, { expiresIn: '24h' });

    return {
      user: { userId: user.id, email: user.email },
      accessToken: token,
    };
  }

  //Registro de usuario
  async registerUser(createAuthDto: CreateAuthDto) {
    try {
      //Generar un hash de la contraseña antes de guardarla
      const hashedPassword = await bcrypt.hash(createAuthDto.password, 10);

      const user = await this.prisma.user.create({
        data: {
          ...createAuthDto,
          password: hashedPassword,
        },
      });

      //Devolver el usuario sin la contraseña
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new HttpException(`Usuario ya existe.`, HttpStatus.CONFLICT);
      }

      //Manejo de errores genericos
      console.error('Error al registrar usuario:', error);
      throw new HttpException(
        'Ocurrió un error al registrar el usuario, Inténtalo de nuevo más tarde',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  findAllUsers() {
    return this.prisma.user.findMany();
  }

  async updateUser(id: number, updateAuthDto: UpdateAuthDto) {
    //Verificar que solo el campo password esta presente
    if (!updateAuthDto.password) {
      throw new HttpException(
        `Solo se permite actualizar la contraseña`,
        HttpStatus.BAD_REQUEST,
      );
    }

    //Hashear la nueva contraseña
    const hashedPassword = await bcrypt.hash(updateAuthDto.password, 10);

    const userFound = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        password: hashedPassword,
      },
    });

    if (!userFound) {
      throw new HttpException(
        `User with id ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return userFound;
  }

  async removeUser(id: number) {
    const deletedUser = await this.prisma.user.delete({ where: { id } });

    if (!deletedUser) {
      throw new HttpException(
        `Usuario con id ${id} no encontrado`,
        HttpStatus.NOT_FOUND,
      );
    }
    return deletedUser;
  }
}
