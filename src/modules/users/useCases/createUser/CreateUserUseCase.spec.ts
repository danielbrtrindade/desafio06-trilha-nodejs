import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe("Create User", () => {
    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    });

    it("should be able to create an user", async () => {
        const user: ICreateUserDTO = {
            name: "testName",
            email: "test@test.com",
            password: "pass123"
        };
        const createdUser = await createUserUseCase.execute(user);

        expect(createdUser).toHaveProperty("id");
    });

    it("should not be able to create an user if the user already exists", async () => {
        const user: ICreateUserDTO = {
            name: "testName2",
            email: "test2@test.com",
            password: "pass1234"
        };
        await createUserUseCase.execute(user);

        const user2: ICreateUserDTO = {
            name: "testName2",
            email: "test2@test.com",
            password: "pass1234"
        };
        await expect(
            createUserUseCase.execute(user2)
        ).rejects.toEqual(new CreateUserError());
    });
})