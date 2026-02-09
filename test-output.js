import { mkdir, writeFile, readFile } from 'fs/promises';
import path from 'path';

async function main() {
  const folderName = 'test';
  const fileName = 'test.md';
  const content = '# hello world';

  const folderPath = `./${folderName}`; // Path for the folder at the root of the workspace
  const filePath = path.join(folderPath, fileName); // Full path for the file

  try {
    // 1. Create the folder named 'test'
    // { recursive: true } ensures that if the folder already exists, it won't throw an error.
    await mkdir(folderPath, { recursive: true });

    // 2. Create a file called 'test.md' inside 'test' and write content
    await writeFile(filePath, content);

    // 3. Read and print the content of test.md to verify it was created correctly
    const fileContent = await readFile(filePath, { encoding: 'utf8' });
    console.log(fileContent);
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

main();