import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";


let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
}

describe("Create Statement", () => {
    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
        inMemoryStatementsRepository = new InMemoryStatementsRepository();
        createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    });

    it("should be able to do a deposit", async () => {
        const user: ICreateUserDTO = {
            name: "testName",
            email: "test@test.com",
            password: "pass123"
        };
        const createdUser = await createUserUseCase.execute(user);

        const deposit: ICreateStatementDTO = {
            user_id: createdUser.id as string,
            type: OperationType.DEPOSIT,
            amount: 100.00,
            description: 'test'
        }

        const deposited = await createStatementUseCase.execute(deposit);

        expect(deposited).toHaveProperty("id");
    });

    it("should be able to do a withdraw", async () => {
        const user: ICreateUserDTO = {
            name: "testName",
            email: "test@test.com",
            password: "pass123"
        };
        const createdUser = await createUserUseCase.execute(user);

        const deposit: ICreateStatementDTO = {
            user_id: createdUser.id as string,
            type: OperationType.DEPOSIT,
            amount: 100.00,
            description: 'test'
        }

        await createStatementUseCase.execute(deposit);

        const withdraw: ICreateStatementDTO = {
            user_id: createdUser.id as string,
            type: OperationType.WITHDRAW,
            amount: 50.00,
            description: 'test'
        }

        const withdrawn = await createStatementUseCase.execute(withdraw);

        expect(withdrawn).toHaveProperty("id");
    });

    it("should not be able to a withdraw without credit", async () => {
        const user: ICreateUserDTO = {
            name: "testName",
            email: "test@test.com",
            password: "pass123"
        };
        const createdUser = await createUserUseCase.execute(user);

        const deposit: ICreateStatementDTO = {
            user_id: createdUser.id as string,
            type: OperationType.DEPOSIT,
            amount: 100.00,
            description: 'test'
        }

        await createStatementUseCase.execute(deposit);

        const withdraw: ICreateStatementDTO = {
            user_id: createdUser.id as string,
            type: OperationType.WITHDRAW,
            amount: 150.00,
            description: 'test'
        }

        await expect(
            createStatementUseCase.execute(withdraw)
        ).rejects.toEqual(new CreateStatementError.InsufficientFunds());
    });

    it("should not be able to a deposit without user", async () => {
        const deposit: ICreateStatementDTO = {
            user_id: 'user fake',
            type: OperationType.DEPOSIT,
            amount: 100.00,
            description: 'test'
        }

        await expect(
            createStatementUseCase.execute(deposit)
        ).rejects.toEqual(new CreateStatementError.UserNotFound());
    });
})