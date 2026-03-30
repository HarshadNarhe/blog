import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/createUser.dto";
import { 
    Body,
    Controller, 
    Get, 
    Post, 
    Put, 
    UseGuards, 
    UsePipes, 
    ValidationPipe 
} from "@nestjs/common";
import { IUserResponse } from "./types/userResopnse.interface";
import { LoginDto } from "./dto/loginUser.dto";
import { User } from "./decorators/user.decorator";
import { AuthGuard } from "./guards/auth.guard";
import { UpdateUserDto } from "./dto/updateUser.dto";



@Controller()
export class UserController {
    constructor (private readonly userService: UserService){}

    @Post('users')
    @UsePipes(new ValidationPipe()) 
    async createUser(
        @Body('user') createUserDto: CreateUserDto,
        ): Promise<IUserResponse> {
        return await this.userService.createUser(createUserDto);
    }

    @Post('users/login')
    @UsePipes(new ValidationPipe())
    async loginUser(
        @Body('user') loginUserDto: LoginDto,
    ): Promise<IUserResponse>{
        const user = await this.userService.loginUser(loginUserDto);
        return this.userService.generateUserResponse(user);
    }

    @Put('user')
    @UseGuards(AuthGuard)
    async updateUser(@User('id') userId: number,
     @Body('user') updateUserDto: UpdateUserDto,
    ): Promise<IUserResponse> {
        const updatedUser = await this.userService.updateUser(userId, updateUserDto);
        return this.userService.generateUserResponse(updatedUser);

    }

    @Get('user')
    @UseGuards(AuthGuard)
    async getCurrentUser(@User() user): Promise<IUserResponse> {
        return this.userService.generateUserResponse(user);
    }
}
