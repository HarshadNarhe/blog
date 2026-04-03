import { IsNotEmpty, IsOptional, IsString } from "class-validator";


export class UpdateArticleDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'Title cannot be empty' })
    title?: string;

    @IsOptional()
    @IsString()
    description?: string;
    
    @IsOptional()
    @IsString()
    body?: string;
}