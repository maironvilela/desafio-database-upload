import { getRepository } from 'typeorm';

import Category from '../models/Category';
import Transaction from '../models/Transaction';

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
    const transactionRepository = getRepository(Transaction);

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

    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category_id,
    });

    const transactionSave = await transactionRepository.save(transaction);

    return transactionSave;
  }
}

export default CreateTransactionService;
