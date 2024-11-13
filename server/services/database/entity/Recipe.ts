import { Column, Entity, JoinTable, OneToMany, PrimaryGeneratedColumn } from "typeorm"
import { RecipeIngredient } from "./RecipeIngredient"

@Entity()
export class Recipe {

    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    name!: string

    @Column()
    description!: string

    @OneToMany(() => RecipeIngredient, recipeToIngredient => recipeToIngredient.recipe, {
        eager: true, 
        cascade: true
    })
    @JoinTable()
    recipeIngredients!: RecipeIngredient[]

}