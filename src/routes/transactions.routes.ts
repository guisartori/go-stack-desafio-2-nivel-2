/* eslint-disable no-await-in-loop */
import { Router } from 'express';
import { getRepository, getCustomRepository } from 'typeorm';
import multer from 'multer';
import CreateTransactionService from '../services/CreateTransactionService';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import uploadConfig from '../config/upload';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionsRepository.find({
    relations: ['category'],
  });
  const balance = await transactionsRepository.getBalance();
  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;
  const createTransactionService = new CreateTransactionService();
  const transaction = await createTransactionService.execute({
    title,
    value,
    type,
    category,
  });

  return response.status(201).json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const transactionsRepository = getRepository(Transaction);
  const { id } = request.params;
  await transactionsRepository.delete(id);
  return response.status(202).send('ok');
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactions = new ImportTransactionsService();

    const transactions = await importTransactions.execute({
      fileName: request.file.filename,
    });

    const newTransactions: Transaction[] = [];
    const createTransaction = new CreateTransactionService();

    // eslint-disable-next-line no-plusplus
    for (let i = 0; i < transactions.length; i++) {
      await createTransaction
        .execute({
          title: transactions[i].title,
          value: transactions[i].value,
          type: transactions[i].type,
          category: transactions[i].category,
        })
        .then(teste => newTransactions.push(teste));
    }

    return response.status(201).json(newTransactions);
  },
);

export default transactionsRouter;
