import * as fs from 'fs';
import * as path from 'path';

export function generateEdgeHandler(apiKey: string) {
  const templatePath = path.join(__dirname, '../lambda/edge-handler.template.ts');
  const outputPath = path.join(__dirname, '../lambda.bundle/edge-handler.ts');

  const template = fs.readFileSync(templatePath, 'utf8');
  const replaced = template.replace('__API_KEY__', apiKey);

  // lambda.bundle ディレクトリを作成
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, replaced);
}
