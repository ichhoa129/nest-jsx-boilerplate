import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { AuthCredentialsDto } from '../dto/auth-credentials.dto';
import { CreateUserDto } from '../../users/dto/create.dto';
import { AuthService } from '../service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { AuthResult } from '../dto/auth-result.dto';
import { AuthGoogleDto } from '../dto/auth-google.dto';
import { AuthGoogleGuard } from '@common/guards/google.guard';
import { GetGoogleUser } from '@common/decorators/get-google-user.decorator';
import { UpdateSelfUserDto } from '@app/users/dto/update-self.dto';
import { UsersService } from '@app/users/service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    public authService: AuthService,
    public usersService: UsersService,
  ) {}

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user by token' })
  @Get('/me')
  @UseGuards(JwtAuthGuard)
  getProfile(@GetUser() user: any): any {
    return this.authService.getMe(user.id)
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Edit current user' })
  @Patch('/me')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @GetUser() user: any,
    @Body() dto: UpdateSelfUserDto,
  ): any {
    return this.usersService.updateSelf(user, dto)
  }
  
  @ApiOperation({ summary: 'Login with email & password' })
  @ApiBody({ type: AuthCredentialsDto })
  @Post('/login')
  @UseGuards(AuthGuard('local'))
  login(@GetUser() user: any): AuthResult {
    return this.authService.login(user)
  }

  @ApiOperation({ summary: 'Login with google' })
  @ApiBody({ type: AuthGoogleDto })
  @Post('/login/google')
  @UseGuards(new AuthGoogleGuard())
  async loginGoogle(@GetGoogleUser() user: any): Promise<AuthResult> {
    return this.authService.loginGoogle(user)
  }

  @ApiOperation({ summary: 'Sign up User' })
  @Post('/signup')
  async signUp(
    @Body() dto: CreateUserDto
  ): Promise<AuthResult> {
    return this.authService.signUp(dto)
  }
}
