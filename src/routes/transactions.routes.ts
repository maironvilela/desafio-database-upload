import multer from 'multer';
import { Router } from 'express';
import { getRepository } from 'typeorm';

import uploadConfig from '../config/upload';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const repository = getRepository(Transaction);
  const transactionsRepository = new TransactionsRepository();

  const transactions = await repository.find({
    select: ['id', 'title', 'value', 'type', 'created_at', 'updated_at'],
    relations: ['category'],
  });

  const balance = await transactionsRepository.getBalance();
  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  try {
    const { title, value, type, category } = request.body;

    const createTransactionService = new CreateTransactionService();
    const transaction = await createTransactionService.execute({
      title,
      type,
      value,
      categoryText: category,
    });

    return response.json(transaction);
  } catch (err) {
    return response
      .status(400)
      .json({ status: 'error', message: 'Saldo Insuficiente' });
  }
});

transactionsRouter.delete('/:id', async (request, response) => {
  const id = request.params;

  const deleteTransactionService = new DeleteTransactionService();
  deleteTransactionService.execute({ id });
  return response.status(204).json();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const fileName = request.file.filename;

    const importTransactionsService = new ImportTransactionsService();
    const transactions = await importTransactionsService.execute({ fileName });

    return response.json(transactions);
  },
);
export default transactionsRouter;
