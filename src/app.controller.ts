import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Render,
} from '@nestjs/common';
import { Hash } from 'crypto';
import { DataSource } from 'typeorm';
import { AppService } from './app.service';
import RegisterDTO from './register.dto';
import User from './user.entity';
import * as bcrypt from 'bcrypt';
import ChangeUserDTO from './changeuser.dto';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private dataSource: DataSource,
  ) {}

  @Get()
  @Render('index')
  index() {
    return { message: 'Welcome to the homepage' };
  }
  @Get('api/reg')
  async listCsavar() {
    const repo = this.dataSource.getRepository(User);
    return await repo.find();
  }

  @Post('/register')
  async register(@Body() registerdto: RegisterDTO) {
    if (!registerdto.email.includes('@')) {
      throw new BadRequestException('Email must contain a @ character');
    }
    if (registerdto.password !== registerdto.passwordAgain) {
      throw new BadRequestException('The two passwords must match');
    }
    if (registerdto.password.length < 8) {
      throw new BadRequestException(
        'The password must be at least 8 characters long',
      );
    }
    const userRepo = this.dataSource.getRepository(User);
    const user = new User();
    user.email = registerdto.email;
    user.password = await bcrypt.hash(registerdto.password, 15);
    await userRepo.save(user);
    delete user.password;
    return user;
  }
  @Patch('users/:id')
  async patchUser(
    @Body() changeuserdto: ChangeUserDTO,
    @Param('id') id: number,
  ) {
    if (!changeuserdto.email.includes('@')) {
      throw new BadRequestException('Email must contain a @ character');
    }
    const userRepo = this.dataSource.getRepository(User);
    //userRepo.update(id,)
    const user = await userRepo.findOneBy({ id: id });
    user.email = changeuserdto.email;
    user.password = await bcrypt.hash(changeuserdto.password, 15);
    await userRepo.save(user);
    delete user.password;
    return user;
  }
}
