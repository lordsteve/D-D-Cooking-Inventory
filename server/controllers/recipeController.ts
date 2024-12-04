import http from "http";
import { Database, GoogleSheetsService, Log } from "services";
import { Recipe } from "services/database/entity/Recipe";
import { RecipeIngredient } from "services/database/entity/RecipeIngredient";
import BaseController from "./baseController";

const recipeRepository = Database.getRepository('Recipe');

export default class RecipeController extends BaseController {
    static async getRecipes(req: http.IncomingMessage, res: http.ServerResponse) {
        const isAdmin = this.parseUrlQuery(req.url).admin === 'true';
        const inventory = await GoogleSheetsService.fetchInventory();

        return Database.initialize().then(async () => {
            const recipes = await recipeRepository
                .createQueryBuilder('recipe')
                .leftJoinAndSelect('recipe.recipeIngredients', 'recipeIngredients')
                .leftJoinAndSelect('recipeIngredients.ingredient', 'ingredient')
                .where(isAdmin ? '1=1' : 'recipe.isHidden = false')
                .orderBy('recipe.name')
                .getMany() as RecipeList[];

            for (const recipe of recipes) {
                for (const recipeIngredient of recipe.recipeIngredients || []) {
                    recipeIngredient.have = inventory[recipeIngredient.ingredient.name.toLowerCase()] || 0;
                }
                recipe.canMake = recipe.recipeIngredients?.every(ingredient => ingredient.have >= ingredient.quantity);
            }

            // sort recipes by canMake
            recipes.sort((a, b) => {
                if (a.canMake && !b.canMake) {
                    return -1;
                } else if (!a.canMake && b.canMake) {
                    return 1;
                }
                return 0;
            });

            return {
                response: JSON.stringify(recipes),
                header: 'application/json',
                status: 200
            }
        }).catch(error => {
            Log.write(error);
            return {
                response: JSON.stringify(error),
                header: 'text/plain',
                status: 500
            }
        }).finally(() => Database.destroy());
    }

    static async addRecipe(req: http.IncomingMessage, res: http.ServerResponse) {
        const body = await this.readBody<Partial<Recipe>>(req);
        if (
            !body.name || !body.description ||
            !(typeof body.name === 'string') || !(typeof body.description === 'string')
        ) {
            return {
                response: '400 Bad Request',
                header: 'text/plain',
                status: 400
            }
        }
        return Database.initialize().then(async () => {
            const recipe = recipeRepository.create({
                name: body.name,
                description: body.description
            });
            await recipeRepository.save(recipe);
            return {
                response: JSON.stringify(recipe),
                header: 'application/json',
                status: 200
            }
        }).catch(async error => {
            Log.write(error);
            return {
                response: JSON.stringify(error),
                header: 'text/plain',
                status: 500
            }
        }).finally(() => Database.destroy());
    }

    static async deleteRecipe(req: http.IncomingMessage, res: http.ServerResponse) {
        const deleteRecipeBody = await this.readBody<Partial<Recipe>>(req);
        if (!deleteRecipeBody?.id) {
            return {
                response: '400 Bad Request',
                header: 'text/plain',
                status: 400
            }
        }
        return Database.initialize().then(async () => {
            await Database.createQueryBuilder()
                .delete().from('Recipe')
                .where('id = :id', { id: deleteRecipeBody.id })
                .execute();

            return {
                response: '200 OK',
                header: 'text/plain',
                status: 200
            }
        }).catch(async error => {
            Log.write(error);
            return {
                response: JSON.stringify(error),
                header: 'text/plain',
                status: 500
            }
        }).finally(() => Database.destroy());
    }

    static async updateRecipe(req: http.IncomingMessage, res: http.ServerResponse) {
        const updateRecipeBody = await this.readBody<Partial<Recipe>>(req);
        if (!updateRecipeBody.id) {
            return {
                response: '400 Bad Request',
                header: 'text/plain',
                status: 400
            }
        }
        return Database.initialize().then(async () => {
            const recipe = await recipeRepository.findOneBy({id:updateRecipeBody.id});
            if (!recipe) {
                throw 'Recipe not found';
            }
            recipe.name = updateRecipeBody.name ?? recipe.name;
            recipe.description = updateRecipeBody.description ?? recipe.description;
            recipe.skillCheck = updateRecipeBody.skillCheck ?? recipe.skillCheck;
            recipe.benefits = updateRecipeBody.benefits ?? recipe.benefits;
            recipe.downside = updateRecipeBody.downside ?? recipe.downside;
            recipe.isHidden = updateRecipeBody.isHidden ?? recipe.isHidden;
            await recipeRepository.save(recipe);
            return {
                response: JSON.stringify(recipe),
                header: 'application/json',
                status: 200
            }
        }).catch(async error => {
            Log.write(error);
            return {
                response: JSON.stringify(error),
                header: 'text/plain',
                status: 500
            }
        }).finally(() => Database.destroy());
    }
}

class RecipeList extends Recipe {
    canMake: boolean = false;
    recipeIngredients: RecipeIngredientList[] = [];
}
class RecipeIngredientList extends RecipeIngredient {
    have: number = 0;
}