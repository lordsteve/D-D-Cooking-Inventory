import http from 'http';
import { Database } from 'services';

export default async function routes(req: http.IncomingMessage, res: http.ServerResponse) {
    return Database.initialize().then(async () => {
        console.log('Database initialized');

        const url = req.url?.replace(/\/data\//, '/');
        if (!url) {
            return {
                response: '404 Not Found',
                header: 'text/plain',
                status: 404
            }
        }

        switch (url) {
            case '/get-recipes':
                const recipeRepository = Database.getRepository('Recipe');
                const recipes = await recipeRepository.find();
                return {
                    response: JSON.stringify(recipes),
                    header: 'application/json',
                    status: 200
                }
            case '/get-ingredients':
                const ingredientRepository = Database.getRepository('Ingredient');
                const ingredients = await ingredientRepository.find();
                return {
                    response: JSON.stringify(ingredients),
                    header: 'application/json',
                    status: 200
                }
            default:
                return {
                    response: '404 Not Found',
                    header: 'text/plain',
                    status: 404
                }
        }
    }).catch(error => {
        console.log(error);
        return {
            response: error,
            header: 'text/plain',
            status: 500
        }
    });
}