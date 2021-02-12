import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const income: number = await this.getIncomeOutcome('income');

    const outcome: number = await this.getIncomeOutcome('outcome');

    const total = income - outcome;

    return { income, outcome, total };
  }

  private async getIncomeOutcome(value: string): Promise<number> {
    const transactionRepositiry = getRepository(Transaction);

    const transactions: Transaction[] = await transactionRepositiry.find();

    const result = transactions.reduce((prevVal, transaction) => {
      const valueTransaction: number = transaction.value;
      return transaction.type === value ? prevVal + valueTransaction : prevVal;
    }, 0);

    return result;
  }
}

export default TransactionsRepository;
