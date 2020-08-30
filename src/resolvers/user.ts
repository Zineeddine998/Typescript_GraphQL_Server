import {Resolver, Mutation, InputType, Field, Arg, Ctx, ObjectType} from 'type-graphql';
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

@ObjectType()
class FieldError {
    @Field()
    field : string;

    @Field()
    message : string;

}

@ObjectType()
class  UserResponse {
    @Field(() => [FieldError], {nullable : true})
    errors? : FieldError[];

    @Field(() => User , { nullable : true})
    user? : User;
}

@Resolver()
export class UserResolver {
    @Mutation(() => UserResponse)
    async register(
        @Arg("options", () => UsernamePasswordInput) options : UsernamePasswordInput,
        @Ctx() {em} : MyContext
    ): Promise<UserResponse> {
        if(options.username.length  <= 2) {
            return {
                errors: [
                    {
                        field : 'username',
                        message : 'length of the username must be longer than 2'
                    }
                ]
            }
        }
        if(options.password.length  <= 2) {
            return {
                errors: [
                    {
                        field : 'username',
                        message : 'length of the password must be longer than 2'
                    }
                ]
            }
        }
        const hashedPassword = await argon2.hash(options.password);
       const user =  em.create(User, {
           username : options.username,
           password : hashedPassword
       });
       try {
           await em.persistAndFlush(user);
       }catch (err) {
           if(err.code === '23505'){
               return {
                   errors : [
                       {
                           field :  'username',
                           message : 'the username already exist'
                       }
                   ]
               }
           }
           //console.log('message : ' + err.message);
       }

       return {
           user,
       }
    }



    @Mutation(() => UserResponse)
    async login(
        @Arg("options", () => UsernamePasswordInput) options : UsernamePasswordInput,
        @Ctx() {em} : MyContext
    )  : Promise<UserResponse>{
        const user = await em.findOne(User, {username: options.username});

        if(!user){
            return {
                errors : [
                    {
                        field : 'username',
                        message  : 'the user do not exist'
                    },
                ],
            };

        }


        const validator = await argon2.verify(user.password, options.password);

        if(!validator){
            return {
                errors : [
                    {
                        field : 'password',
                        message : 'incorrect password'
                    }
                ]
            }
        }

        return {
            user,
        }


    }
}
