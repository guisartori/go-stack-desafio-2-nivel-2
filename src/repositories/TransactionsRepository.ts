import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    if (transactions.length > 0) {
      let income = 0;
      let outcome = 0;
      let total = 0;
      transactions.forEach(transaction => {
        if (transaction.type === 'income') {
          income += transaction.value;
          total += transaction.value;
        } else {
          outcome += transaction.value;
          total -= transaction.value;
        }
      });
      return { income, outcome, total };
    }
    return { income: 0, outcome: 0, total: 0 };
  }
}

export default TransactionsRepository;
