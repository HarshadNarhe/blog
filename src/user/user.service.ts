import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateUserDto } from "@/user/dto/createUser.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "./user.entity";
import { Repository } from "typeorm";
import { IUserResponse } from "./types/userResopnse.interface";
import {sign} from 'jsonwebtoken';
import { LoginDto } from "./dto/loginUser.dto";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity) 
        private readonly userRepository: Repository<UserEntity>,
) {}
    async createUser(createUserDto: CreateUserDto): Promise<IUserResponse> {
        const newUser = new UserEntity();
        Object.assign(newUser, createUserDto);

        const userByEmail = await this.userRepository.findOne({
            where: {
                email: createUserDto.email
            }
        })

        const userByUsername = await this.userRepository.findOne({
            where: {
                username: createUserDto.username
            }
        })

        if (userByEmail || userByUsername) {
            throw new HttpException(
                'User with this email or username already exists',
                HttpStatus.BAD_REQUEST
            );
        }

        const savedUser = await this.userRepository.save(newUser);
        return this.generateUserResponse(savedUser);
    }

    async loginUser(loginUserDto: LoginDto): Promise<UserEntity> {

        const user = await this.userRepository.findOne({
            where: {
                email: loginUserDto.email
            }
        });
        if (!user) {
            throw new HttpException(
                'Invalid email or password',
                HttpStatus.UNAUTHORIZED
            );
        }

        delete user.password;

        return user;
    }

    async findById(id: number): Promise<UserEntity> {
        const user = await this.userRepository.findOne({
            where: {
                id,
            },
        })

        if (!user) {
            throw new HttpException(
                `User with ID ${id} not found`,
                HttpStatus.NOT_FOUND
            );
        }

        return user;
    }

    generatwToken(user: UserEntity): string {
        return sign(
            {
                id: user.id,
                username: user.username,
                email: user.email,
            },
            process.env.JWT_SECRET,
        );
    }

    generateUserResponse(user: UserEntity):IUserResponse {
        if (!user.id) {
            throw new HttpException('User data is missing', HttpStatus.BAD_REQUEST);
        }
        return {
            user:{
                ...user,
                token: this.generatwToken(user),
            }
        };
    }
}