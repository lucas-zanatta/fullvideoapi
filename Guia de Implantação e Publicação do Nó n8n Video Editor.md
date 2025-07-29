# Guia de Implantação e Publicação do Nó n8n Video Editor

## Introdução

Este documento fornece instruções detalhadas para implantar, testar e publicar o nó de comunidade n8n Video Editor. O nó permite que usuários do n8n automatizem a criação de vídeos dinâmicos através de uma API de edição de vídeo.

## Pré-requisitos

Antes de prosseguir com a implantação, certifique-se de que você possui:

1. **Node.js** versão 18.10 ou superior
2. **npm** ou **pnpm** instalado
3. **n8n** instalado localmente para testes
4. Uma **API de edição de vídeo** funcionando (conforme especificado no plano de clonagem do Placid)
5. Conta no **npm registry** para publicação

## Estrutura do Projeto

O projeto está organizado da seguinte forma:

```
n8n-video-editor-node/
├── credentials/
│   └── VideoEditorApi.credentials.ts
├── nodes/
│   └── VideoEditor/
│       └── VideoEditor.node.ts
├── dist/ (gerado após build)
├── package.json
├── tsconfig.json
├── gulpfile.js
├── .eslintrc.js
├── .prettierrc.js
└── README.md
```

## Passos para Implantação

### 1. Preparação do Ambiente

Primeiro, certifique-se de que todas as dependências estão instaladas:

```bash
cd n8n-video-editor-node
npm install
```

### 2. Build do Projeto

Compile o TypeScript e prepare os arquivos para distribuição:

```bash
npm run build
```

Este comando irá:
- Compilar os arquivos TypeScript para JavaScript
- Gerar arquivos de declaração (.d.ts)
- Copiar ícones e outros assets para o diretório dist/

### 3. Validação e Linting

Execute as verificações de qualidade do código:

```bash
npm run lint
npm run format
```

### 4. Teste Local

Para testar o nó localmente com n8n:

#### Opção A: Link Local
```bash
# No diretório do nó
npm link

# No diretório global do n8n ou em uma instalação local
npm link n8n-nodes-video-editor
```

#### Opção B: Instalação Direta
```bash
# Instalar diretamente do diretório local
npm install /caminho/para/n8n-video-editor-node
```

### 5. Configuração da API de Edição de Vídeo

Antes de testar o nó, certifique-se de que sua API de edição de vídeo está funcionando e acessível. A API deve ter:

- Endpoint `/health` para teste de credenciais
- Endpoint `/generate-video` para geração de vídeos
- Suporte para autenticação via Bearer token
- Capacidade de processar os parâmetros definidos no nó

## Testes

### Teste de Credenciais

1. Abra o n8n
2. Adicione o nó "Video Editor" ao seu workflow
3. Configure as credenciais:
   - **API Base URL**: URL da sua API de edição de vídeo
   - **API Key**: Sua chave de autenticação
4. Teste a conexão - o n8n deve validar as credenciais automaticamente

### Teste de Geração de Vídeo

1. Configure os parâmetros do nó:
   - Adicione URLs de vídeos de teste
   - Configure textos para sobreposição
   - Defina configurações de saída
2. Execute o workflow
3. Verifique se o nó retorna:
   - Status da operação
   - URL do vídeo gerado (quando concluído)
   - ID da tarefa para rastreamento

## Publicação no npm

### 1. Preparação para Publicação

Antes de publicar, atualize as informações no `package.json`:

```json
{
  "name": "n8n-nodes-video-editor",
  "version": "0.1.0",
  "description": "n8n community node for dynamic video editing with templates",
  "author": {
    "name": "Seu Nome",
    "email": "seu.email@exemplo.com"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/seu-usuario/n8n-nodes-video-editor.git"
  },
  "homepage": "https://github.com/seu-usuario/n8n-nodes-video-editor"
}
```

### 2. Build Final

Execute um build limpo antes da publicação:

```bash
npm run build
npm run lint
```

### 3. Publicação

```bash
# Login no npm (se necessário)
npm login

# Publicar o pacote
npm publish
```

### 4. Verificação

Após a publicação, verifique se o pacote está disponível:

```bash
npm view n8n-nodes-video-editor
```

## Submissão ao Repositório de Nós da Comunidade n8n

Para que o nó apareça na lista oficial de nós da comunidade n8n:

1. **Fork** do repositório oficial: https://github.com/n8n-io/n8n-nodes-registry
2. **Adicione** seu nó ao arquivo `nodes.json`
3. **Submeta** um Pull Request com as informações do seu nó

Formato para adicionar ao `nodes.json`:
```json
{
  "name": "n8n-nodes-video-editor",
  "description": "Generate dynamic videos from templates",
  "author": "Seu Nome",
  "keywords": ["video", "editing", "automation", "templates"],
  "repository": "https://github.com/seu-usuario/n8n-nodes-video-editor",
  "packageName": "n8n-nodes-video-editor"
}
```

## Manutenção e Atualizações

### Versionamento

Siga o padrão de versionamento semântico (SemVer):
- **MAJOR**: Mudanças incompatíveis na API
- **MINOR**: Novas funcionalidades compatíveis
- **PATCH**: Correções de bugs

### Atualizações

Para publicar atualizações:

1. Atualize a versão no `package.json`
2. Execute os testes
3. Faça o build
4. Publique: `npm publish`

### Suporte

Mantenha documentação atualizada e responda a issues no repositório GitHub. Considere criar:

- Exemplos de uso
- Troubleshooting guide
- Changelog detalhado

## Considerações de Segurança

- **Nunca** inclua chaves de API ou credenciais no código
- Use o sistema de credenciais do n8n adequadamente
- Valide todas as entradas do usuário
- Implemente rate limiting se necessário
- Mantenha dependências atualizadas

## Conclusão

Este guia fornece todos os passos necessários para implantar e publicar com sucesso o nó de comunidade n8n Video Editor. Seguindo estas instruções, você terá um nó funcional que permite aos usuários do n8n automatizar a criação de vídeos dinâmicos através de sua API de edição de vídeo.

