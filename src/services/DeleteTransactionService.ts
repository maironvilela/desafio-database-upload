import { ParamsDictionary } from 'express-serve-static-core';
import { getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';

interface Request {
  id: ParamsDictionary;
}
class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    try {
      const transactionRepository = getRepository(Transaction);
      await transactionRepository.delete(id);
    } catch (err) {
      throw new AppError('Falha ao remover recurso');
    }
  }
}

export default DeleteTransactionService;
