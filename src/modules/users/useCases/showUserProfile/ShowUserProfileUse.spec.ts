import { InMemoryUsersRepository } from "../../repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";


let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;

describe("Create User", () => {
    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
        showUserProfileUseCase = new ShowUserProfileUseCase(inMemoryUsersRepository);
    });

    it("should be able to show an user profile", async () => {
        const user: ICreateUserDTO = {
            name: "testName",
            email: "test@test.com",
            password: "pass123"
        };
        const createdUser = await createUserUseCase.execute(user);

        const profileUser = await showUserProfileUseCase.execute(createdUser.id as string);

        expect(profileUser).toHaveProperty("id");
    });

    it("should not be able to show an user profile", async () => {
        await expect(
            showUserProfileUseCase.execute("id fake")
        ).rejects.toEqual(new ShowUserProfileError());
    });
})