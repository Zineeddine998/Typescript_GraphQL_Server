import {Resolver, Mutation, InputType, Field, Arg, Ctx} from 'type-graphql';
import {MyContext} from "../types";
import argon2 from 'argon2';
import {User} from "../entities/User";

@InputType()
class UsernamePasswordInput {
    @Field()
    username : string;
    @Field()
    password : string;
}

@Resolver()
export class UserResolver {
    @Mutation(() => User)
    async register(
        @Arg("options", () => UsernamePasswordInput) options : UsernamePasswordInput,
        @Ctx() {em} : MyContext
    ) {
        const hashedPassword = await argon2.hash(options.password);
       const user =  em.create(User, {
           username : options.username,
           password : hashedPassword
       });
       await em.persistAndFlush(user);
       return user;
    }
}
