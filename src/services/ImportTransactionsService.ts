import fs from 'fs';
import csvParse from 'csv-parse';
import path from 'path';
import Transaction from '../models/Transaction';
import upload from '../config/upload';
import CreateTransactionService from './CreateTransactionService';

interface RequestDTO {
  fileName: string;
}

interface ResponseDTO {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class ImportTransactionsService {
  async execute({ fileName }: RequestDTO): Promise<ResponseDTO[]> {
    const csvFilePath = path.join(upload.directory, fileName);
    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const transactions: ResponseDTO[] = [];

    parseCSV.on('data', async ([title, type, value, category]) => {
      // const createTransaction = new CreateTransactionService();
      // const transaction = await createTransaction.execute({
      //   title,
      //   value,
      //   type,
      //   category,
      // });
      const transaction = { title, type, value: Number(value), category };
      transactions.push(transaction);
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return transactions;
  }
}

export default ImportTransactionsService;
