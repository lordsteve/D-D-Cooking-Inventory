import http from 'http';
import { Database } from 'services';

export default async function routes(req: http.IncomingMessage, res: http.ServerResponse) {
    if (Database.isInitialized) {
        await Database.destroy();
    }
    return Database.initialize().then(async () => {
        console.log('Database initialized')

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
                const recipes = await recipeRepository.find();
                return {
                    response: JSON.stringify(recipes),
                    header: 'application/json',
                    status: 200
                }
            case '/get-ingredients':
                const ingredients = await ingredientRepository.find();
                return {
                    response: JSON.stringify(ingredients),
                    header: 'application/json',
                    status: 200
                }
            case '/add-ingredient':
                if (req.method !== 'POST') {
                    return {
                        response: '405 Method Not Allowed',
                        header: 'text/plain',
                        status: 405
                    }
                }
                const body = JSON.parse(req.read());
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
            case '/delete-ingredient':
                if (req.method !== 'DELETE') {
                    return {
                        response: '405 Method Not Allowed',
                        header: 'text/plain',
                        status: 405
                    }
                }
                const deleteBody = JSON.parse(req.read());
                if (!deleteBody.id) {
                    return {
                        response: '400 Bad Request',
                        header: 'text/plain',
                        status: 400
                    }
                }
                await Database.createQueryBuilder().delete().from('RecipeIngredient').where('id = :id', { id: deleteBody.id }).execute();
                return {
                    response: '200 OK',
                    header: 'text/plain',
                    status: 200
                }
            case '/add-recipe':
                if (req.method !== 'POST') {
                    return {
                        response: '405 Method Not Allowed',
                        header: 'text/plain',
                        status: 405
                    }
                }
                const recipeBody = JSON.parse(req.read());
                if (!recipeBody.name || !recipeBody.description || !(typeof recipeBody.name === 'string') || !(typeof recipeBody.description === 'string')) {
                    return {
                        response: '400 Bad Request',
                        header: 'text/plain',
                        status: 400
                    }
                }
                const recipeInsert = recipeRepository.create({
                    name: recipeBody.name,
                    description: recipeBody.description
                });
                await recipeRepository.save(recipeInsert);
                return {
                    response: JSON.stringify(recipeInsert),
                    header: 'application/json',
                    status: 200
                }
            case '/delete-recipe':
                if (req.method !== 'DELETE') {
                    return {
                        response: '405 Method Not Allowed',
                        header: 'text/plain',
                        status: 405
                    }
                }
                const deleteRecipeBody = JSON.parse(req.read());
                if (!deleteRecipeBody.id) {
                    return {
                        response: '400 Bad Request',
                        header: 'text/plain',
                        status: 400
                    }
                }
                await Database.createQueryBuilder().delete().from('Recipe').where('id = :id', { id: deleteRecipeBody.id }).execute();
                return {
                    response: '200 OK',
                    header: 'text/plain',
                    status: 200
                }
            default:
                return {
                    response: '404 Not Found',
                    header: 'text/plain',
                    status: 404
                }
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
}