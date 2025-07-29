# FullVideoEditAPI: API de Edição de Vídeo com Templates Dinâmicos e Nó de Comunidade n8n

## 1. Introdução

Este documento apresenta o **FullVideoEditAPI**, uma solução abrangente para a automação da criação de vídeos dinâmicos. O projeto integra uma API robusta de edição de vídeo com um nó de comunidade para o n8n, permitindo que usuários gerem vídeos personalizados a partir de vídeos, textos e áudios fornecidos, com a saída acessível via URL. Nosso foco é na funcionalidade de edição de vídeo programática, inspirados nas melhores práticas de ferramentas como o Placid.app, mas com um escopo otimizado para automação via API.

## 2. Visão Geral do Projeto

O FullVideoEditAPI visa capacitar criadores de conteúdo, profissionais de marketing e desenvolvedores a automatizar a produção de vídeos em escala. Inicialmente concebido para uso pessoal e otimização de fluxos de trabalho, o projeto tem a visão de ser disponibilizado publicamente no futuro, com um modelo de monetização. Ao fornecer uma API poderosa e uma integração nativa com o n8n, eliminamos a necessidade de conhecimento aprofundado em edição de vídeo ou programação complexa, tornando a criação de vídeos dinâmicos acessível e eficiente.

### 2.1. Componentes Principais

O projeto FullVideoEditAPI é composto por dois componentes principais:

*   **FullVideoEditAPI (Backend)**: Uma API RESTful responsável por receber as requisições de edição de vídeo, processar os dados de entrada (vídeos, áudios, textos), aplicar os templates dinâmicos e renderizar o vídeo final.
*   **Nó de Comunidade n8n**: Um nó personalizado para o n8n que permite aos usuários interagir facilmente com a FullVideoEditAPI, configurando os parâmetros de edição de vídeo diretamente dentro de seus fluxos de trabalho do n8n.

## 3. Instalação e Configuração

### 3.1. Instalação do Nó de Comunidade n8n

Para instalar o nó `FullVideoEditAPI` em sua instância n8n, siga as instruções de instalação de nós de comunidade do n8n. Você pode instalar o nó diretamente via npm:

```bash
npm install n8n-nodes-video-editor
```

Após a instalação, reinicie sua instância n8n para que o nó seja reconhecido.

### 3.2. Configuração das Credenciais da API

Para utilizar o nó `FullVideoEditAPI`, você precisará configurar as credenciais da sua instância da FullVideoEditAPI. Siga estes passos no n8n:

1.  No n8n, clique em **Credentials** no menu lateral.
2.  Clique em **New Credential**.
3.  Procure por **Video Editor API** e selecione-o.
4.  Preencha os seguintes campos:
    *   **API Base URL**: A URL base da sua FullVideoEditAPI (ex: `https://your-fullvideoeditapi.com`).
    *   **API Key**: Sua chave de autenticação para acessar a API. Esta chave é usada para autorizar suas requisições à API.
5.  Clique em **Save**.

## 4. Operações e Funcionalidades

O nó `FullVideoEditAPI` no n8n oferece uma operação principal para a geração de vídeos dinâmicos:

### 4.1. Gerar Vídeo (Generate Video)

Esta operação permite que você envie dados para a FullVideoEditAPI para compor e renderizar um novo vídeo. O nó é projetado para ser flexível, suportando tanto uma configuração simplificada quanto um controle avançado via JSON.

#### 4.1.1. Parâmetros do Nó

Os seguintes parâmetros podem ser configurados no nó `FullVideoEditAPI` para a operação `Gerar Vídeo`:

*   **Credenciais da API**: (Configurado na seção 3.2)
*   **Video URLs (Lista)**: Uma lista de URLs para os arquivos de vídeo de entrada. Cada item da lista pode incluir:
    *   `URL`: A URL do arquivo de vídeo (obrigatório).
    *   `Start Time (Optional)`: Tempo de início do clipe no vídeo final (em segundos). Útil para usar apenas uma parte de um vídeo maior.
    *   `End Time (Optional)`: Tempo de fim do clipe no vídeo final (em segundos). Se 0, o clipe será usado até o final ou até a duração do vídeo principal.
*   **Audio URLs (Lista)**: Uma lista de URLs para os arquivos de áudio de entrada (música de fundo, narração). Cada item da lista pode incluir:
    *   `URL`: A URL do arquivo de áudio (obrigatório).
    *   `Volume (Optional)`: Volume do áudio (valor entre 0.0 e 1.0). Padrão é 1.0.
    *   `Loop (Optional)`: Booleano. Se `true`, o áudio será repetido para preencher a duração total do vídeo.
*   **Text Overlays (Lista)**: Uma lista de objetos de texto a serem sobrepostos no vídeo. Cada item da lista pode incluir:
    *   `Text`: O conteúdo do texto a ser exibido (obrigatório).
    *   `Font (Optional)`: Nome da fonte a ser utilizada (ex: `Arial`, `Roboto`). Padrão é `Arial`.
    *   `Color (Optional)`: Cor do texto em formato hexadecimal (ex: `#FFFFFF` para branco). Padrão é `#FFFFFF`.
    *   `Position X (Optional)`: Posição horizontal do texto (em porcentagem, 0-100). Padrão é 50 (centro).
    *   `Position Y (Optional)`: Posição vertical do texto (em porcentagem, 0-100). Padrão é 50 (centro).
    *   `Start Time (Optional)`: Tempo de início da exibição do texto (em segundos). Padrão é 0.
    *   `End Time (Optional)`: Tempo de fim da exibição do texto (em segundos). Se 0, o texto será exibido até o final do vídeo.
    *   `Animation (Optional)`: Tipo de animação para o texto (ex: `none`, `fade-in`, `slide-up`, `slide-down`). Padrão é `none`.
*   **Template Structure (JSON)**: Um campo JSON para definir a estrutura completa do template. Este campo oferece controle granular sobre a composição do vídeo e é ideal para cenários complexos. O formato JSON deve seguir a especificação da FullVideoEditAPI.
*   **Output Format (Optional)**: Formato do vídeo de saída (ex: `mp4`, `webm`, `avi`). Padrão é `mp4`.
*   **Resolution (Optional)**: Resolução do vídeo de saída (ex: `1920x1080`, `1280x720`, `854x480`, `640x360`). Padrão é `1920x1080`.
*   **Webhook URL (Optional)**: Uma URL para onde a FullVideoEditAPI deve enviar uma notificação HTTP POST com o resultado final da geração do vídeo (incluindo a URL do vídeo gerado) após a conclusão do processamento assíncrono.

#### 4.1.2. Saída do Nó

Após a execução da operação `Gerar Vídeo`, o nó retornará um objeto JSON contendo as seguintes informações:

*   `status`: O status atual da operação de geração de vídeo (ex: `processing`, `completed`, `failed`).
*   `jobId`: Um identificador único para a tarefa de geração de vídeo. Este ID pode ser usado para rastrear o progresso da tarefa na FullVideoEditAPI.
*   `videoUrl`: A URL pública para o vídeo gerado. Este campo estará disponível apenas quando o `status` for `completed`.
*   `errorMessage (Optional)`: Uma mensagem de erro detalhada, presente se o `status` for `failed`.

## 5. Recursos em Destaque

O FullVideoEditAPI e seu nó n8n foram projetados com recursos que otimizam a automação e a flexibilidade na criação de vídeos:

### 5.1. Upload de Arquivos Binários (Via API)

Embora o nó n8n envie URLs para os arquivos de mídia, a FullVideoEditAPI (backend) pode ser estendida para aceitar uploads diretos de arquivos binários (vídeos, imagens, áudios) via API. Isso permite que os usuários do n8n que manipulam dados binários em seus workflows enviem esses arquivos diretamente para a API de edição de vídeo, que os armazenará temporariamente ou permanentemente antes do processamento.

### 5.2. Vídeos com Múltiplos Clipes

A API e o nó n8n suportam a combinação de múltiplos clipes de vídeo em um único vídeo final. Isso é ideal para criar compilações, sequências narrativas ou vídeos promocionais que utilizam diversas fontes de vídeo.

### 5.3. Integração Dinâmica com Templates (JSON)

O campo `Template Structure (JSON)` no nó n8n oferece uma poderosa capacidade de integração dinâmica. Ele permite que os usuários enviem uma estrutura JSON complexa que define precisamente como os elementos (vídeos, áudios, textos) devem ser combinados e posicionados no vídeo final. Isso proporciona flexibilidade máxima para criar templates personalizados e adaptáveis a diversas necessidades.

## 6. Arquitetura Técnica

### 6.1. FullVideoEditAPI (Backend)

*   **Linguagem/Framework**: Python com `FastAPI` (recomendado para alta performance e facilidade de desenvolvimento de APIs assíncronas) ou Node.js com `Express`/`NestJS`.
*   **Processamento de Vídeo**: `FFmpeg` é a ferramenta fundamental para todas as operações de manipulação de vídeo e áudio. Bibliotecas como `MoviePy` (Python) ou `fluent-ffmpeg` (Node.js) serão utilizadas como wrappers para interagir programaticamente com o FFmpeg, simplificando a criação de comandos complexos para concatenação, sobreposição, mixagem, etc.
*   **Fila de Mensagens**: Para gerenciar a natureza assíncrona e intensiva em recursos da geração de vídeo, uma fila de mensagens é essencial. Opções incluem `Celery` com `RabbitMQ` ou `Redis` (para Python) ou `BullMQ` (para Node.js). A API receberá a requisição, validará os dados e publicará uma mensagem na fila. 
*   **Workers de Processamento**: Serviços independentes que consomem mensagens da fila. Cada worker será responsável por baixar os arquivos de mídia, executar as operações de FFmpeg para renderizar o vídeo, e fazer o upload do vídeo final para o armazenamento. Isso permite escalabilidade horizontal e resiliência.
*   **Armazenamento de Ativos**: Um serviço de armazenamento de objetos compatível com S3 (ex: `Backblaze B2`, `Cloudflare R2`, `AWS S3`, `Google Cloud Storage`). Para ambientes de desenvolvimento ou auto-hospedagem, `Minio` é uma excelente alternativa. Os vídeos gerados serão armazenados aqui, garantindo durabilidade, alta disponibilidade e acessibilidade via URL pública.
*   **Autenticação**: Implementação de um sistema de autenticação baseado em chaves de API ou tokens (ex: JWT) para proteger os endpoints da API.

### 6.2. Nó de Comunidade n8n

*   **Linguagem**: TypeScript (padrão para desenvolvimento de nós n8n).
*   **Estrutura**: Segue a arquitetura de nós do n8n, com arquivos de credenciais (`.credentials.ts`) e o arquivo principal do nó (`.node.ts`).
*   **Comunicação**: Utiliza o `requestWithAuthentication` do n8n para fazer requisições HTTP POST para a FullVideoEditAPI, enviando os parâmetros configurados pelo usuário.
*   **Tratamento de Erros**: Implementa lógica para capturar e exibir erros da API de forma clara na interface do n8n, facilitando a depuração para o usuário.

### 6.3. Estratégia de Implantação (VPS Ubuntu com EasyPanel)

O FullVideoEditAPI será implantado em uma VPS (Virtual Private Server) rodando Ubuntu, utilizando o EasyPanel para gerenciamento de containers. Esta abordagem oferece um ambiente controlado e otimizado para a execução da API e seus workers.

*   **VPS**: Hostinger (ou provedor similar) com sistema operacional Ubuntu.
*   **EasyPanel**: Será utilizado para orquestrar os containers Docker da FullVideoEditAPI (API, workers, fila de mensagens, Minio - se auto-hospedado).
*   **Containerização**: Todos os componentes da FullVideoEditAPI (API, workers, fila de mensagens) serão empacotados em containers Docker para facilitar a implantação, escalabilidade e isolamento.
*   **N8n Container**: O n8n já está rodando em um container, o que simplifica a integração, pois a comunicação entre o nó n8n e a FullVideoEditAPI será feita via rede interna ou externa do Docker, conforme a configuração do EasyPanel.

## 7. Roadmap de Desenvolvimento

Este roadmap é uma estimativa e pode ser ajustado conforme o progresso e os desafios encontrados.

### Fase 1: Revisão e Consolidação de Requisitos e Tecnologias (1 semana)
*   Revisar e validar todos os requisitos funcionais e não funcionais.
*   Confirmar as escolhas tecnológicas (linguagens, frameworks, bibliotecas).
*   Detalhar a estrutura do payload da API e do template de vídeo.

### Fase 2: Desenvolvimento do Backend da FullVideoEditAPI (4-6 semanas)
*   Configuração do ambiente de desenvolvimento (Python/Node.js, FFmpeg).
*   Criação da estrutura do projeto API (FastAPI/Express).
*   Implementação do endpoint `/generate-video`.
*   Desenvolvimento da lógica de composição de vídeo (concatenação, sobreposição de texto, mixagem de áudio) com `MoviePy`/`fluent-ffmpeg`.
*   Implementação de um sistema de fila de mensagens (ex: Celery com RabbitMQ para Python, ou BullMQ para Node.js).
*   Criação de workers para processamento assíncrono de vídeo.

### Fase 3: Implementação de Armazenamento e Geração de URL na API (2-3 semanas)
*   Configuração de um serviço de armazenamento de objetos S3-compatível.
*   Implementação da lógica de upload do vídeo final para o armazenamento.
*   Desenvolvimento da funcionalidade de geração de URLs públicas para os vídeos.
*   Implementação do sistema de autenticação da API.

### Fase 4: Desenvolvimento do Nó de Comunidade n8n (3-4 semanas)
*   Configuração do ambiente de desenvolvimento de nós n8n.
*   Criação do arquivo de credenciais (`VideoEditorApi.credentials.ts`).
*   Desenvolvimento do arquivo principal do nó (`VideoEditor.node.ts`) com todos os parâmetros definidos.
*   Implementação da lógica de comunicação com a FullVideoEditAPI.
*   Desenvolvimento do mecanismo de webhook para notificação de conclusão.

### Fase 5: Desenvolvimento da Aplicação Web (Site/App) (4-6 semanas)
*   Definição da arquitetura da aplicação web (frontend e, se necessário, um backend dedicado para gerenciamento de usuários/monetização).
*   Desenvolvimento da interface de usuário para gerenciamento de templates, visualização de vídeos gerados e configurações de conta.
*   Implementação de funcionalidades de autenticação e autorização para usuários.
*   Integração com a FullVideoEditAPI para exibir o histórico de vídeos gerados e permitir o download.
*   Desenvolvimento de um sistema de gerenciamento de usuários e planos de monetização (se aplicável).

### Fase 6: Testes Integrados e Preparação para Implantação (2-3 semanas)
*   Testes unitários para o backend da API, nó n8n e aplicação web.
*   Testes de integração entre todos os componentes do sistema.
*   Testes de ponta a ponta, simulando cenários reais de uso com o n8n e a aplicação web.
*   Testes de performance e escalabilidade da API e da aplicação web.
*   Identificação e correção de bugs.
*   Preparação dos containers Docker para implantação no EasyPanel.

### Fase 7: Criação da Documentação Completa do Projeto FullVideoEditAPI (2 semanas)
*   Documentação detalhada da API (endpoints, payloads, respostas, erros, autenticação).
*   Documentação do nó n8n (instalação, configuração, uso, exemplos).
*   Guia de implantação para o backend da API, nó n8n e aplicação web (com foco em EasyPanel).
*   READMEs para os repositórios GitHub.

### Fase 8: Entrega dos Resultados ao Usuário (1 semana)
*   Apresentação do projeto completo, incluindo código, documentação e demonstrações.

## 8. Requisitos de Equipe

Para o desenvolvimento do FullVideoEditAPI, uma equipe multidisciplinar é recomendada:

*   **Desenvolvedores Backend (1-2)**: Experiência em Python/Node.js, desenvolvimento de APIs RESTful, processamento de mídia (FFmpeg, MoviePy/fluent-ffmpeg), sistemas de fila de mensagens, bancos de dados e armazenamento em nuvem (S3).
*   **Desenvolvedor Frontend/n8n (1)**: Experiência em TypeScript, desenvolvimento de nós n8n, e familiaridade com a plataforma n8n. Responsável também pelo desenvolvimento da aplicação web.
*   **Engenheiro de DevOps/Infraestrutura (1)**: Experiência em implantação em nuvem (Docker, Kubernetes, CI/CD), gerenciamento de infraestrutura e monitoramento de sistemas, com foco em EasyPanel e Ubuntu.
*   **Gerente de Projeto (1)**: Para coordenação, planejamento e acompanhamento do projeto.

## 9. Desafios Potenciais

*   **Complexidade do Processamento de Vídeo**: A manipulação e renderização de vídeo são intensivas em recursos e podem ser complexas, exigindo otimização e tratamento eficiente de erros.
*   **Escalabilidade**: Garantir que a API possa lidar com um grande volume de requisições de geração de vídeo de forma eficiente e sem gargalos, especialmente em ambientes de produção.
*   **Gerenciamento de Templates**: Embora o escopo do editor visual tenha sido removido, a definição e o gerenciamento de templates dinâmicos via JSON ainda exigirão um design cuidadoso.
*   **Manutenção do FFmpeg**: Manter o FFmpeg atualizado e configurado corretamente no ambiente de produção pode ser um desafio.
*   **Integração Assíncrona**: Gerenciar o fluxo de trabalho assíncrono entre a API, a fila de mensagens e os workers de processamento, além de notificar o n8n via webhooks.
*   **Implantação com EasyPanel**: Embora o EasyPanel simplifique, a configuração inicial e a otimização dos containers para o processamento de vídeo podem exigir atenção.
*   **Monetização e Gerenciamento de Usuários**: Implementar um sistema de monetização robusto e seguro, incluindo gerenciamento de usuários, planos e pagamentos.

## 10. Visão de Monetização

Após a validação do uso pessoal e a estabilização da plataforma, o FullVideoEditAPI será disponibilizado para outros usuários. A estratégia de monetização pode incluir:

*   **Modelo Freemium**: Oferecer um plano gratuito com funcionalidades limitadas (ex: número de vídeos por mês, resolução máxima, marca d'água) para atrair usuários.
*   **Planos Pagos por Assinatura**: Diferentes níveis de planos pagos com base em:
    *   Número de vídeos gerados por mês.
    *   Duração total dos vídeos.
    *   Resolução e qualidade de saída.
    *   Acesso a templates premium.
    *   Prioridade no processamento.
*   **Créditos Pré-pagos**: Usuários podem comprar créditos para gerar vídeos sob demanda, sem a necessidade de uma assinatura mensal.
*   **API para Desenvolvedores**: Oferecer acesso à API para empresas e desenvolvedores que desejam integrar a funcionalidade de edição de vídeo em suas próprias aplicações.

## 11. Conclusão

O projeto FullVideoEditAPI, com sua API de edição de vídeo, o nó de comunidade n8n e a visão de monetização, representa uma solução poderosa e flexível para a automação da criação de vídeos. Ao focar nos componentes essenciais e na integração com uma plataforma de automação popular, o projeto oferece um valor significativo para usuários que buscam otimizar seus fluxos de trabalho de produção de conteúdo visual. O plano detalhado aqui serve como um guia para o desenvolvimento, destacando as tecnologias, fases e desafios envolvidos, com uma clara visão de crescimento e monetização futura.

## 12. Exemplos de Uso

### 12.1. Exemplo de Payload para a FullVideoEditAPI (Endpoint `/generate-video`)

```json
{
  "videoUrls": [
    {
      "url": "https://example.com/video1.mp4",
      "startTime": 0,
      "endTime": 10
    },
    {
      "url": "https://example.com/video2.mp4"
    }
  ],
  "audioUrls": [
    {
      "url": "https://example.com/background_music.mp3",
      "volume": 0.5,
      "loop": true
    },
    {
      "url": "https://example.com/narration.mp3",
      "volume": 1.0
    }
  ],
  "textOverlays": [
    {
      "text": "Bem-vindo ao FullVideoEditAPI!",
      "font": "Impact",
      "color": "#FFD700",
      "positionX": 50,
      "positionY": 10,
      "startTime": 0,
      "endTime": 5,
      "animation": "fade-in"
    },
    {
      "text": "Automação de Vídeo Simplificada",
      "font": "Arial",
      "color": "#FFFFFF",
      "positionX": 50,
      "positionY": 90,
      "startTime": 6,
      "endTime": 15,
      "animation": "slide-up"
    }
  ],
  "templateStructure": {
    "sceneOrder": ["video1", "video2"],
    "transitions": {
      "video1_video2": "crossfade"
    },
    "totalDuration": 20
  },
  "outputSettings": {
    "format": "mp4",
    "resolution": "1920x1080"
  },
  "webhookUrl": "https://your-n8n-instance.com/webhook-test/your-webhook-id"
}
```

### 12.2. Exemplo de Configuração do Nó n8n (Visual)

(Esta seção seria idealmente complementada com screenshots da interface do nó n8n, mostrando os campos preenchidos. Como não podemos gerar imagens aqui, descrevemos o preenchimento)

Imagine a interface do nó `Video Editor` no n8n. Você preencheria os campos da seguinte forma:

*   **Credenciais**: Selecione a credencial `Video Editor API` configurada anteriormente.
*   **Video URLs**:
    *   Item 1:
        *   `URL`: `https://example.com/intro.mp4`
        *   `Start Time`: `0`
        *   `End Time`: `5`
    *   Item 2:
        *   `URL`: `https://example.com/main_content.mp4`
*   **Audio URLs**:
    *   Item 1:
        *   `URL`: `https://example.com/upbeat_music.mp3`
        *   `Volume`: `0.6`
        *   `Loop`: `True`
*   **Text Overlays**:
    *   Item 1:
        *   `Text`: `Nosso Novo Produto!`
        *   `Font`: `Roboto`
        *   `Color`: `#FF0000`
        *   `Position X`: `50`
        *   `Position Y`: `20`
        *   `Start Time`: `1`
        *   `End Time`: `4`
        *   `Animation`: `fade-in`
*   **Template Structure (JSON)**: `{ "layout": "full_screen", "elements": [...] }` (Conteúdo JSON detalhado conforme a API)
*   **Output Format**: `mp4`
*   **Resolution**: `1280x720`
*   **Webhook URL**: `https://your-n8n-instance.com/webhook-test/your-workflow-id`

## 13. Compatibilidade

### 13.1. FullVideoEditAPI (Backend)

*   **Sistemas Operacionais**: Linux (Ubuntu, Debian), macOS, Windows (com WSL2).
*   **FFmpeg**: Versão 4.x ou superior (recomendado 5.x ou 6.x).
*   **Python**: 3.8+ (para FastAPI/MoviePy).
*   **Node.js**: 16.x+ (para Express/NestJS/fluent-ffmpeg).

### 13.2. Nó de Comunidade n8n

*   **n8n**: Versão mínima recomendada 0.208.0 (compatível com n8n 1.x.x e superior).
*   **Node.js**: Versão mínima 18.10.0 (recomendado 20.x.x ou superior).

## 14. Recursos Adicionais

*   **Documentação da FullVideoEditAPI**: [Link para a documentação da API (a ser criada)]
*   **Repositório GitHub do Nó n8n**: [Link para o repositório GitHub do nó n8n (a ser criado)]
*   **Documentação Oficial do n8n (Criação de Nós)**: [https://docs.n8n.io/integrations/creating-nodes/overview/](https://docs.n8n.io/integrations/creating-nodes/overview/)
*   **Comunidade n8n**: [https://community.n8n.io/](https://community.n8n.io/)

## 15. Suporte e Contribuições

### 15.1. Como Obter Ajuda

Se você encontrar problemas ou tiver dúvidas sobre o FullVideoEditAPI ou o nó n8n, por favor:

*   **Relate um Problema**: Abra uma issue no repositório GitHub do projeto (link a ser criado) com uma descrição detalhada do problema, passos para reproduzir e mensagens de erro.
*   **Fórum da Comunidade n8n**: Para dúvidas gerais sobre o uso do n8n ou do nó, você pode postar no fórum da comunidade n8n.

### 15.2. Como Contribuir

Contribuições são bem-vindas! Se você deseja contribuir para o desenvolvimento do FullVideoEditAPI ou do nó n8n, por favor:

*   **Fork o Repositório**: Faça um fork do repositório GitHub do projeto.
*   **Crie uma Branch**: Crie uma nova branch para suas alterações (`git checkout -b feature/sua-feature`).
*   **Implemente suas Mudanças**: Faça suas alterações e certifique-se de que os testes passem.
*   **Envie um Pull Request**: Envie um pull request com uma descrição clara de suas mudanças.

## 16. Histórico de Versões

### 0.1.0 (Data da Primeira Publicação)

*   Primeira versão estável do FullVideoEditAPI e do nó de comunidade n8n.
*   Funcionalidades de geração de vídeo com múltiplos clipes, áudios e sobreposição de texto.
*   Suporte a templates dinâmicos via JSON.
*   Integração com armazenamento S3-compatível.
*   Autenticação via API Key.
*   Webhook para notificação de conclusão.

(Este changelog será atualizado com cada nova versão, detalhando as funcionalidades, melhorias e correções de bugs.)


