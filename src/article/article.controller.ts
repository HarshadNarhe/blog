import { User } from "@/user/decorators/user.decorator";
import { UserEntity } from "@/user/user.entity";
import { Body, 
    Controller, 
    Delete, 
    Get, 
    Param, 
    Post, 
    UseGuards, 
    UsePipes, 
    ValidationPipe 
} from "@nestjs/common";
import { CreateArticleDto } from "./dto/createArticle.dto";
import { ArticleService } from "./article.service";
import { ArticleEntity } from "./article.entity";
import { AuthGuard } from "@/user/guards/auth.guard";
import { IArticleResponse } from "./types/articleResponse.interface";


@Controller('articles')
export class ArticleController {
    constructor(private readonly articleService: ArticleService    ){} 

    @Post()
    @UsePipes(new ValidationPipe())
    @UseGuards(AuthGuard)
    async createArticle(
        @User() user: UserEntity, 
        @Body('article') createArticleDto: CreateArticleDto,
    ): Promise<IArticleResponse> {
        const newArticle = await this.articleService.createArticle(
            user, 
            createArticleDto
        );
        return this.articleService.generatteArticleResponse(newArticle);
    }

    @Get(':slug')
    async getArticle(@Param('slug') slug: string): Promise<IArticleResponse> {
        const article = await this.articleService.getSingleArticle(slug);
        return this.articleService.generatteArticleResponse(article);
    }

    @Delete(':slug')
    @UseGuards(AuthGuard)
    async deleteArticle(
        @Param('slug') slug: string, 
        @User('id') currentUserId: number)
    {
        return await this.articleService.deleteArticle(slug, currentUserId);
    }
}
