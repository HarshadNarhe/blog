import { UserEntity } from "@/user/user.entity";
import { Injectable } from "@nestjs/common";
import { CreateArticleDto } from "./dto/createArticle.dto";
import { ArticleEntity } from "./article.entity";
import { InjectRepository } from "@nestjs/typeorm";
import slugify from "slugify";
import { Repository } from "typeorm";
import { IArticleResponse } from "./types/articleResponse.interface";


@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(ArticleEntity)
        private readonly articleRepository: Repository<ArticleEntity>
        ){} 

    async createArticle(user: UserEntity, createArticleDto: CreateArticleDto):Promise<ArticleEntity> {

        const article = new ArticleEntity();

        Object.assign(article, createArticleDto);

        if(!article.tagList) {
            article.tagList = [];
        }

        article.slug = this.genrateSlug(article.title);
        article.author = user;

        return await this.articleRepository.save(article);
        
    }

    genrateSlug(title: string): string {
        const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
        return `${slugify(title,{lower: true})}-${id}`;
    }


    generatteArticleResponse(article: ArticleEntity): IArticleResponse {
        return {
            article
        }
    }
}