import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { RecipeIngredient } from "./RecipeIngredient"

@Entity()
export class Ingredient {

    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    name!: string

    @Column()
    description!: string

    @OneToMany(() => RecipeIngredient, recipeToIngredient => recipeToIngredient.ingredient)
    @JoinTable()
    recipeIngredients!: RecipeIngredient[]
}