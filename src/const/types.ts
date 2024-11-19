export class Recipe {
    public id!: number
    public name!: string
    public description!: string
    public skillCheck!: string
    public benefits!: string
    public downside!: string
    public isHidden!: boolean
    public canMake!: boolean
    public recipeIngredients!: RecipeIngredient[]
}

export class RecipeIngredient {
    public id!: number
    public quantity!: number
    public ingredient!: Ingredient
    public have!: number
}

export class Ingredient {
    public id!: number
    public name!: string
    public description!: string
}

export class GoogleSheetsData {
    public majorDimension!: string
    public range!: string
    public values!: string[][]
}

export class Inventory {
    [key: string]: number
}