import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

export function generateOriginRequestHandler(apiKey: string) {
  const templatePath = path.join(__dirname, '../lambda/edge-origin-request.template.ts');
  const outputPath = path.join(__dirname, '../lambda.bundle/edge-origin-request.js');

  const tsCode = fs.readFileSync(templatePath, 'utf8');
  // 引用符ごと置き換え、キーは JSON の文字列リテラルとして埋め込む
  const replaced = tsCode.replace("'__API_KEY__'", () => JSON.stringify(apiKey));

  // TypeScript を JavaScript に変換
  const transpiled = ts.transpileModule(replaced, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  });

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, transpiled.outputText);
}
