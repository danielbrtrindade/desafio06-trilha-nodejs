import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../../../users/useCases/createUser/ICreateUserDTO";
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";


let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let createStatementUseCase: CreateStatementUseCase;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let getStatementOperationUseCase: GetStatementOperationUseCase;

enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
}

describe("Get Statement Operation", () => {
    beforeEach(() => {
        inMemoryUsersRepository = new InMemoryUsersRepository();
        createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
        inMemoryStatementsRepository = new InMemoryStatementsRepository();
        createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
        getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    });

    it("should be able to get a statement operation", async () => {
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

        const statement = await createStatementUseCase.execute(deposit);

        const { type } = await getStatementOperationUseCase.execute({
            user_id: createdUser.id as string,
            statement_id: statement.id as string
        });

        expect(type).toBe(OperationType.DEPOSIT);
    });

    it("should not be able to get a statement operation from a non-existent user", async () => {
        await expect(
            getStatementOperationUseCase.execute({ user_id: 'test user', statement_id: 'statement test' })
        ).rejects.toEqual(new GetStatementOperationError.UserNotFound());
    });

    it("should not be able to get a statement operation from a non-existent statement", async () => {
        const user: ICreateUserDTO = {
            name: "testName",
            email: "test@test.com",
            password: "pass123"
        };
        const createdUser = await createUserUseCase.execute(user);

        await expect(
            getStatementOperationUseCase.execute({ user_id: createdUser.id as string, statement_id: 'statement test' })
        ).rejects.toEqual(new GetStatementOperationError.StatementNotFound());
    });
})