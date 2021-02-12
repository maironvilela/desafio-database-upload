import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Category from '../models/Category';
import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  categoryText: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    categoryText,
  }: Request): Promise<Transaction> {
    let category_id: string;
    const categoryRepository = getRepository(Category);
    const transactionRepository = new TransactionRepository();
    const repository = getRepository(Transaction);

    // verificar se a transação e do tipo outcome
    if (type === 'outcome') {
      const balance = await transactionRepository.getBalance();
      if (value > balance.income) {
        throw new AppError('Saldo Insuficiente', 400);
      }
    }

    // Verificar se consta no banco de dados a categoria informada
    const category = await categoryRepository.findOne({
      where: { title: categoryText },
    });

    if (category) {
      category_id = category.id;
    } else {
      const categoryToSave = categoryRepository.create({
        title: categoryText,
      });
      const categorySave = await categoryRepository.save(categoryToSave);
      category_id = categorySave.id;
    }

    const transaction = repository.create({
      title,
      type,
      value,
      category_id,
    });

    const transactionSave = await repository.save(transaction);

    return transactionSave;
  }
}

export default CreateTransactionService;
