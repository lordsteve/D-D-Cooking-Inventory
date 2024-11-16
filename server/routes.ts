import { read } from 'fs';
import http from 'http';
import { Database } from 'services';

export default async function routes(req: http.IncomingMessage, res: http.ServerResponse) {
        const url = req.url?.replace(/\/data\//, '/');
        if (!url) {
            return {
                response: '404 Not Found',
                header: 'text/plain',
                status: 404
            }
        }
        const recipeRepository = Database.getRepository('Recipe');
        const ingredientRepository = Database.getRepository('Ingredient');
        const recipeIngredientRepository = Database.getRepository('RecipeIngredient');

        switch (url) {
            case '/get-recipes':
                return Database.initialize().then(async () => {
                    const recipes = await recipeRepository.find();
                    return {
                        response: JSON.stringify(recipes),
                        header: 'application/json',
                        status: 200
                    }
                }).catch(async error => {
                    console.log(error);
                    return {
                        response: error,
                        header: 'text/plain',
                        status: 500
                    }
                }).finally(async () => {
                    await Database.destroy();
                });
            case '/get-ingredients':
                return Database.initialize().then(async () => {
                    const ingredients = await ingredientRepository.find();
                    return {
                        response: JSON.stringify(ingredients),
                        header: 'application/json',
                        status: 200
                    }
                }).catch(async error => {
                    console.log(error);
                    return {
                        response: error,
                        header: 'text/plain',
                        status: 500
                    }
                }).finally(async () => {
                    await Database.destroy();
                });
            case '/add-ingredient':
                if (req.method !== 'POST') {
                    return {
                        response: '405 Method Not Allowed',
                        header: 'text/plain',
                        status: 405
                    }
                }
                const body = await readBody(req);
                if (
                    !body.recipeId || !body.ingredientName || !body.ingredientQuantity || !body.ingredientDescription ||
                    !(typeof body.recipeId === 'string') || !(typeof body.ingredientName === 'string') || !(typeof body.ingredientQuantity === 'string') || !(typeof body.ingredientDescription === 'string')
                ) {
                    return {
                        response: '400 Bad Request',
                        header: 'text/plain',
                        status: 400
                    }
                }
                return Database.initialize().then(async () => {
                    const recipe = await recipeRepository.findOneBy({id:body.recipeId});
                    let ingredient = await ingredientRepository.findOneBy({name:body.ingredientName});
                    if (!ingredient)
                    ingredient = ingredientRepository.create({
                        name: body.ingredientName,
                        description: body.ingredientDescription
                    });
                    await ingredientRepository.save(ingredient);
                    const recipeIngredient = recipeIngredientRepository.create({
                        recipe,
                        ingredient,
                        quantity: body.ingredientQuantity
                    });
                    await recipeIngredientRepository.save(recipeIngredient);
                    return {
                        response: JSON.stringify(recipeIngredient),
                        header: 'application/json',
                        status: 200
                    }
                }).catch(async error => {
                    console.log(error);
                    return {
                        response: error,
                        header: 'text/plain',
                        status: 500
                    }
                }).finally(async () => {
                    await Database.destroy();
                });
            case '/delete-ingredient':
                if (req.method !== 'DELETE') {
                    return {
                        response: '405 Method Not Allowed',
                        header: 'text/plain',
                        status: 405
                    }
                }
                const deleteBody: any = await readBody(req);
                if (!deleteBody.id) {
                    return {
                        response: '400 Bad Request',
                        header: 'text/plain',
                        status: 400
                    }
                }
                return Database.initialize().then(async () => {;
                    await Database.createQueryBuilder().delete().from('RecipeIngredient').where('id = :id', { id: deleteBody.id }).execute();
                    return {
                        response: '200 OK',
                        header: 'text/plain',
                        status: 200
                    }
                }).catch(async error => {
                    console.log(error);
                    return {
                        response: error,
                        header: 'text/plain',
                        status: 500
                    }
                }).finally(async () => {
                    await Database.destroy();
                });
            case '/add-recipe':
                if (req.method !== 'POST') {
                    return {
                        response: '405 Method Not Allowed',
                        header: 'text/plain',
                        status: 405
                    }
                }
                const recipeBody = await readBody(req);
                if (!recipeBody.name || !recipeBody.description || !(typeof recipeBody.name === 'string') || !(typeof recipeBody.description === 'string')) {
                    return {
                        response: '400 Bad Request',
                        header: 'text/plain',
                        status: 400
                    }
                }
                return Database.initialize().then(async () => {
                    const recipeInsert = recipeRepository.create({
                        name: recipeBody.name,
                        description: recipeBody.description,
                        skillCheck: '',
                        benefits: '',
                        downside: '',
                        isHidden: true
                    });
                    await recipeRepository.save(recipeInsert);
                    return {
                        response: JSON.stringify(recipeInsert),
                        header: 'application/json',
                        status: 200
                    }
                }).catch(async error => {
                    console.log(error);
                    return {
                        response: error,
                        header: 'text/plain',
                        status: 500
                    }
                }).finally(async () => {
                    await Database.destroy();
                });
            case '/delete-recipe':
                if (req.method !== 'DELETE') {
                    return {
                        response: '405 Method Not Allowed',
                        header: 'text/plain',
                        status: 405
                    }
                }
                const deleteRecipeBody = await readBody(req);
                if (!deleteRecipeBody?.id) {
                    return {
                        response: '400 Bad Request',
                        header: 'text/plain',
                        status: 400
                    }
                }
                return Database.initialize().then(async () => {
                    await Database.createQueryBuilder().delete().from('Recipe').where('id = :id', { id: deleteRecipeBody.id }).execute();
                    return {
                        response: '200 OK',
                        header: 'text/plain',
                        status: 200
                    }
                }).catch(async error => {
                    console.log(error);
                    return {
                        response: error,
                        header: 'text/plain',
                        status: 500
                    }
                }).finally(async () => {
                    await Database.destroy();
                });
            case '/get-inventory':
                return {
                    response: JSON.stringify({
                        SHEET_ID: process.env.SHEET_ID,
                        API_KEY: process.env.API_KEY
                    }),
                    header: 'text/plain',
                    status: 200
                }
            case '/update-recipe':
                if (req.method !== 'PUT') {
                    return {
                        response: '405 Method Not Allowed',
                        header: 'text/plain',
                        status: 405
                    }
                }
                const updateRecipeBody = await readBody(req);
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
                    console.log(error);
                    return {
                        response: error,
                        header: 'text/plain',
                        status: 500
                    }
                }).finally(async () => {
                    await Database.destroy();
                });
            case '/update-recipe-ingredient':
                if (req.method !== 'PUT') {
                    return {
                        response: '405 Method Not Allowed',
                        header: 'text/plain',
                        status: 405
                    }
                }
                const updateRecipeIngredientBody = await readBody(req);
                if (!updateRecipeIngredientBody.id) {
                    return {
                        response: '400 Bad Request',
                        header: 'text/plain',
                        status: 400
                    }
                }
                return Database.initialize().then(async () => {
                    const recipeIngredient = await recipeIngredientRepository.findOneBy({id:updateRecipeIngredientBody.id});
                    if (!recipeIngredient) {
                        throw 'RecipeIngredient not found';
                    }
                    recipeIngredient.quantity = updateRecipeIngredientBody.quantity ?? recipeIngredient.quantity;
                    await recipeIngredientRepository.save(recipeIngredient);
                    return {
                        response: JSON.stringify(recipeIngredient),
                        header: 'application/json',
                        status: 200
                    }
                }).catch(async error => {
                    console.log(error);
                    return {
                        response: error,
                        header: 'text/plain',
                        status: 500
                    }
                }).finally(async () => {
                    await Database.destroy();
                });
            default:
                return {
                    response: '404 Not Found',
                    header: 'text/plain',
                    status: 404
                }
        }
}

function readBody(req: http.IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
        let body: any;
        req.on('readable', () => {
            let i;
            while (null !== (i = req.read())) {
                body = JSON.parse(i);
            }
        });
        req.on('end', () => {
            resolve(body);
        });
    });
}