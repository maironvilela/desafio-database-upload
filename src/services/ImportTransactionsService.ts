import fs from 'fs';
import csvParse from 'csv-parse';
import path from 'path';
import { getRepository, In } from 'typeorm';

import Transaction from '../models/Transaction';
import uploadConfig from '../config/upload';
import Category from '../models/Category';

interface Request {
  fileName: string;
}
interface TransactionCSV {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class ImportTransactionsService {
  async execute({ fileName }: Request): Promise<Transaction[]> {
    const csvFilePath = path.join(uploadConfig.tmpDirectory, fileName);
    const readCSVStream = fs.createReadStream(csvFilePath);

    const transactionsReturn: Transaction[] = [];
    const categories: string[] = [];
    const transactionsCSV: TransactionCSV[] = [];

    const categoryRepository = getRepository(Category);
    const transactionRepository = getRepository(Transaction);

    const parseStream = csvParse({
      delimiter: ',',
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    parseCSV.on('data', line => {
      // [ 'Loan;income;1500;Others' ]
      const [title, type, value, category] = line.map((cell: string) =>
        cell.trim(),
      );
      // Verificar se consta no banco de dados a categoria informada

      const transaction = { title, type, value, category };
      transactionsCSV.push(transaction);
      categories.push(category);
    });

    await new Promise(resolve => parseCSV.on('end', resolve));

    const existentCategories = await categoryRepository.find({
      select: ['title'],
      where: {
        title: In(categories),
      },
    });

    const existentCategoriesTitle = existentCategories.map(
      (category: Category) => category.title,
    );

    const addCategoryTitles = categories
      .filter(category => !existentCategoriesTitle.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);

    const newCategories = categoryRepository.create(
      addCategoryTitles.map(title => ({
        title,
      })),
    );

    await categoryRepository.save(newCategories);

    const findCategories = await categoryRepository.find();

    const createdTransactions = transactionRepository.create(
      transactionsCSV.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: findCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );

    await transactionRepository.save(createdTransactions);

    await fs.promises.unlink(csvFilePath);

    return createdTransactions;
  }
}
export default ImportTransactionsService;
