import { UserEntity } from "@/user/user.entity";
import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateArticleDto } from "./dto/createArticle.dto";
import { ArticleEntity } from "./article.entity";
import { InjectRepository } from "@nestjs/typeorm";
import slugify from "slugify";
import { Repository } from "typeorm";
import { IArticleResponse } from "./types/articleResponse.interface";
import { DeleteResult } from "typeorm/browser";
import { UpdateArticleDto } from "./dto/updateArticle.dto";
import { IArticlesResponse } from "./types/articlesResponse.interface";


@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(ArticleEntity)
        private readonly articleRepository: Repository<ArticleEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
        ){} 

        async findAll(query: any):Promise<IArticlesResponse> {
  const queryBuilder = this.articleRepository
    .createQueryBuilder('articles')
    .leftJoinAndSelect('articles.author', 'author');

  if (query.tag) {
    queryBuilder.andWhere('articles.tagList LIKE :tag', {
      tag: `%${query.tag}%`,
    });
  }

  if (query.username) {
    queryBuilder.andWhere('author.username = :username', {
      username: query.username,
    });
  }

  if (query.id) {
    queryBuilder.andWhere('articles.id = :id', {
      id: query.id,
    });
  }

  queryBuilder.orderBy('articles.createdAt', 'DESC');

  if(query.limit) {
    queryBuilder.limit(query.limit);
  }

  if(query.offset) {
    queryBuilder.offset(query.offset);
  }


  const articles = await queryBuilder.getMany();
  const articlesCount = await queryBuilder.getCount();

  return { articles, articlesCount };
}

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

    async addToFavouriteArticle(currentUserId: number, slug: string): Promise<IArticleResponse> {
        const user = await this.userRepository.findOne({
            where: {
                id: currentUserId
            },
            relations: ['favourites']
        })

        const currentArticle = await this.findBySlug(slug);

        const isNotFavourited = !user?.favourites.find(article => article.slug === currentArticle.slug);

        if(isNotFavourited) {
            currentArticle.favoritesCount++;
            user?.favourites.push(currentArticle);
            await this.userRepository.save(user!);
            await this.articleRepository.save(currentArticle);
        }

        console.log(user);
        return this.generatteArticleResponse(currentArticle);
    }

    async getSingleArticle(slug: string): Promise<ArticleEntity> {
            const article = await this.findBySlug(slug)

            return article;
    }

    async deleteArticle(slug: string, currentUserId: number): Promise<DeleteResult> {
        const article = await this.findBySlug(slug);

        if(article.author.id !== currentUserId) {
            throw new HttpException('You are not an author of this article', HttpStatus.FORBIDDEN);
        }
        return await this.articleRepository.delete({slug });
    }

    async updateArticle(slug: string, currentUserId: number, updateArticleDto: UpdateArticleDto): Promise<ArticleEntity> {
        const article = await this.findBySlug(slug);

        if(article.author.id !== currentUserId) {
            throw new HttpException('You are not an author of this article', HttpStatus.FORBIDDEN);
        }
        if(updateArticleDto.title) {
            article.slug = this.genrateSlug(updateArticleDto.title);
        }

        Object.assign(article, updateArticleDto);

        return await this.articleRepository.save(article);
    }

    async findBySlug(slug: string): Promise<ArticleEntity> {
        const article = await this.articleRepository.findOne({
                where: {
                    slug,
                }
            });
            if(!article) {
                throw new HttpException('Article not found', HttpStatus.NOT_FOUND);
            }

            return article;
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