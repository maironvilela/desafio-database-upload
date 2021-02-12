import { Router } from 'express';
import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import CreateTransactionService from '../services/CreateTransactionService';

// import TransactionsRepository from '../repositories/TransactionsRepository';
// import CreateTransactionService from '../services/CreateTransactionService';
// import DeleteTransactionService from '../services/DeleteTransactionService';
// import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const repository = getRepository(Transaction);
  const transactions = await repository.find({
    select: ['title', 'value', 'type', 'created_at', 'updated_at'],
    relations: ['category'],
  });
  return response.json(transactions);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransactionService = new CreateTransactionService();
  const transaction = await createTransactionService.execute({
    title,
    type,
    value,
    categoryText: category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  // TODO
});

transactionsRouter.post('/import', async (request, response) => {
  // TODO
});

export default transactionsRouter;
