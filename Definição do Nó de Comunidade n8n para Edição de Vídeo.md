# Definição do Nó de Comunidade n8n para Edição de Vídeo

Este documento descreve a funcionalidade e os parâmetros do nó de comunidade n8n para integração com a aplicação de edição de vídeo com templates dinâmicos.

## 1. Nome do Nó

`VideoEditorAPI` (ou um nome mais descritivo como `DynamicVideoEditor`)

## 2. Descrição do Nó

O nó `VideoEditorAPI` permite que os usuários do n8n automatizem a criação de vídeos dinâmicos, combinando vídeos, textos e áudios fornecidos. Ele se integra com uma API externa de edição de vídeo, enviando os dados necessários e recebendo uma URL para o vídeo final gerado.

## 3. Operações do Nó

O nó terá uma operação principal:

### 3.1. Gerar Vídeo (Generate Video)

Esta operação enviará uma requisição para a API de edição de vídeo para compor um novo vídeo com base nos dados fornecidos.

## 4. Parâmetros do Nó (para a operação 'Gerar Vídeo')

Os seguintes parâmetros serão configuráveis no nó n8n, correspondendo aos dados esperados pela API de edição de vídeo:

*   **Credenciais da API (API Credentials)**:
    *   `API Base URL`: URL base da API de edição de vídeo (ex: `https://your-video-editor-api.com`).
    *   `API Key`: Chave de autenticação para acessar a API (se necessário).

*   **Dados do Vídeo (Video Data)**:
    *   `Video URLs (Array)`: Uma lista de URLs para os arquivos de vídeo de entrada. O nó deve permitir adicionar múltiplos itens.
        *   `URL`: URL do arquivo de vídeo.
        *   `Start Time (Optional)`: Tempo de início do clipe no vídeo final (em segundos).
        *   `End Time (Optional)`: Tempo de fim do clipe no vídeo final (em segundos).
    *   `Audio URLs (Array)`: Uma lista de URLs para os arquivos de áudio de entrada (música de fundo, narração). O nó deve permitir adicionar múltiplos itens.
        *   `URL`: URL do arquivo de áudio.
        *   `Volume (Optional)`: Volume do áudio (0.0 a 1.0).
        *   `Loop (Optional)`: Se o áudio deve ser repetido para preencher a duração do vídeo.
    *   `Text Overlays (Array)`: Uma lista de objetos de texto a serem sobrepostos no vídeo. O nó deve permitir adicionar múltiplos itens.
        *   `Text`: O conteúdo do texto.
        *   `Font (Optional)`: Nome da fonte.
        *   `Color (Optional)`: Cor do texto (ex: `#FFFFFF`).
        *   `Position X (Optional)`: Posição horizontal (em pixels ou porcentagem).
        *   `Position Y (Optional)`: Posição vertical (em pixels ou porcentagem).
        *   `Start Time (Optional)`: Tempo de início da exibição do texto (em segundos).
        *   `End Time (Optional)`: Tempo de fim da exibição do texto (em segundos).
        *   `Animation (Optional)`: Tipo de animação (ex: `fade-in`, `slide-up`).
    *   `Template Structure (JSON)`: Um campo JSON para definir a estrutura do template, permitindo flexibilidade para layouts mais complexos que a API de vídeo possa suportar. Isso pode incluir a ordem dos clipes, transições, duração total, etc.

*   **Configurações de Saída (Output Settings)**:
    *   `Output Format (Optional)`: Formato do vídeo de saída (ex: `mp4`, `webm`).
    *   `Resolution (Optional)`: Resolução do vídeo (ex: `1920x1080`).
    *   `Webhook URL (Optional)`: URL para onde a API de edição de vídeo deve enviar um webhook com o resultado final (URL do vídeo gerado).

## 5. Saída do Nó

Após a execução bem-sucedida, o nó retornará um objeto JSON contendo:

*   `status`: O status da operação (ex: `processing`, `completed`, `failed`).
*   `videoUrl`: A URL pública para o vídeo gerado (disponível quando o status for `completed`).
*   `jobId`: Um ID único para a tarefa de geração de vídeo, útil para rastreamento.
*   `errorMessage (Optional)`: Mensagem de erro em caso de falha.

## 6. Tratamento de Erros

O nó deve capturar e propagar erros da API de edição de vídeo, fornecendo mensagens claras para o usuário do n8n. Isso inclui erros de validação de parâmetros, falhas na comunicação com a API externa ou erros durante o processamento do vídeo.

## 7. Considerações Adicionais

*   **Assincronicidade**: A geração de vídeo é um processo que pode levar tempo. O nó deve ser projetado para lidar com operações assíncronas, possivelmente retornando um `jobId` imediatamente e dependendo de um webhook para o resultado final, ou implementando um mecanismo de polling.
*   **Autenticação**: O nó precisará gerenciar as credenciais da API de forma segura, utilizando os recursos de credenciais do n8n.
*   **Testes**: Testes abrangentes serão cruciais para garantir que o nó se comunica corretamente com a API de edição de vídeo e lida com diferentes cenários de entrada e saída.


