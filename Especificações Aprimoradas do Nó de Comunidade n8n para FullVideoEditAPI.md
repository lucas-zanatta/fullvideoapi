# Especificações Aprimoradas do Nó de Comunidade n8n para FullVideoEditAPI

## 1. Visão Geral das Melhorias

Com base na análise do repositório `n8n-nodes-placid` e nas diretrizes de implantação em VPS Ubuntu com EasyPanel, este documento detalha as especificações aprimoradas para o nó de comunidade n8n do FullVideoEditAPI.

## 2. Estrutura Aprimorada do Projeto

### 2.1. Organização de Arquivos

```
n8n-nodes-fullvideoeditapi/
├── credentials/
│   └── FullVideoEditApiCredentials.credentials.ts
├── nodes/
│   └── FullVideoEditApi/
│       ├── FullVideoEditApi.node.ts
│       ├── FullVideoEditApi.node.json
│       ├── descriptions/
│       │   ├── VideoGenerationDescription.ts
│       │   └── TemplateDescription.ts
│       └── methods/
│           ├── loadOptions.ts
│           └── credentialTest.ts
├── package.json
├── tsconfig.json
├── .eslintrc.js
├── .prettierrc.js
├── gulpfile.js
├── README.md
├── CHANGELOG.md
└── examples/
    ├── basic-video-generation.json
    ├── advanced-template.json
    └── webhook-integration.json
```

### 2.2. Package.json Aprimorado

```json
{
  "name": "n8n-nodes-fullvideoeditapi",
  "version": "1.0.0",
  "description": "n8n community node for FullVideoEditAPI - Generate dynamic videos with templates",
  "keywords": [
    "n8n-community-node-package",
    "video-editing",
    "automation",
    "template",
    "ffmpeg"
  ],
  "license": "MIT",
  "homepage": "https://github.com/your-username/n8n-nodes-fullvideoeditapi",
  "author": {
    "name": "Your Name",
    "email": "your.email@example.com"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/n8n-nodes-fullvideoeditapi.git"
  },
  "engines": {
    "node": ">=18.10",
    "pnpm": ">=8.1"
  },
  "packageManager": "pnpm@8.6.2",
  "main": "index.js",
  "scripts": {
    "build": "tsc && gulp build:icons",
    "dev": "tsc --watch",
    "format": "prettier nodes credentials --write",
    "lint": "eslint nodes credentials package.json",
    "lintfix": "eslint nodes credentials package.json --fix",
    "prepublishOnly": "npm run build && npm run lint -s"
  },
  "files": [
    "dist"
  ],
  "n8n": {
    "n8nNodesApiVersion": 1,
    "credentials": [
      "dist/credentials/FullVideoEditApiCredentials.credentials.js"
    ],
    "nodes": [
      "dist/nodes/FullVideoEditApi/FullVideoEditApi.node.js"
    ]
  },
  "devDependencies": {
    "@typescript-eslint/parser": "^5.45.0",
    "eslint-plugin-n8n-nodes-base": "^1.11.0",
    "gulp": "^4.0.2",
    "n8n-workflow": "*",
    "prettier": "^2.7.1",
    "typescript": "^4.8.4"
  }
}
```

## 3. Credenciais Aprimoradas

### 3.1. FullVideoEditApiCredentials.credentials.ts

```typescript
import {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from 'n8n-workflow';

export class FullVideoEditApiCredentials implements ICredentialType {
  name = 'fullVideoEditApiCredentials';
  displayName = 'FullVideoEditAPI Credentials';
  documentationUrl = 'https://docs.fullvideoeditapi.com/authentication';
  properties: INodeProperties[] = [
    {
      displayName: 'API Base URL',
      name: 'apiBaseUrl',
      type: 'string',
      default: 'https://api.fullvideoeditapi.com',
      placeholder: 'https://api.fullvideoeditapi.com',
      description: 'The base URL of your FullVideoEditAPI instance',
      required: true,
    },
    {
      displayName: 'API Key',
      name: 'apiKey',
      type: 'string',
      typeOptions: {
        password: true,
      },
      default: '',
      placeholder: 'fve_1234567890abcdef...',
      description: 'Your FullVideoEditAPI key. You can find it in your account settings.',
      required: true,
    },
  ];

  authenticate: IAuthenticateGeneric = {
    type: 'generic',
    properties: {
      headers: {
        Authorization: '=Bearer {{$credentials.apiKey}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: '={{$credentials.apiBaseUrl}}',
      url: '/health',
      method: 'GET',
    },
  };
}
```

## 4. Nó Principal Aprimorado

### 4.1. FullVideoEditApi.node.ts (Estrutura Principal)

```typescript
import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeOperationError,
} from 'n8n-workflow';

import { videoGenerationFields } from './descriptions/VideoGenerationDescription';
import { templateFields } from './descriptions/TemplateDescription';

export class FullVideoEditApi implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'FullVideoEditAPI',
    name: 'fullVideoEditApi',
    icon: 'file:fullvideoeditapi.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
    description: 'Generate dynamic videos with templates using FullVideoEditAPI',
    defaults: {
      name: 'FullVideoEditAPI',
    },
    inputs: ['main'],
    outputs: ['main'],
    credentials: [
      {
        name: 'fullVideoEditApiCredentials',
        required: true,
      },
    ],
    requestDefaults: {
      baseURL: '={{$credentials.apiBaseUrl}}',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
    properties: [
      {
        displayName: 'Resource',
        name: 'resource',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Video',
            value: 'video',
          },
          {
            name: 'Template',
            value: 'template',
          },
        ],
        default: 'video',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['video'],
          },
        },
        options: [
          {
            name: 'Generate',
            value: 'generate',
            description: 'Generate a new video from template and assets',
            action: 'Generate a video',
          },
          {
            name: 'Get Status',
            value: 'getStatus',
            description: 'Get the status of a video generation job',
            action: 'Get video generation status',
          },
        ],
        default: 'generate',
      },
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        displayOptions: {
          show: {
            resource: ['template'],
          },
        },
        options: [
          {
            name: 'Create',
            value: 'create',
            description: 'Create a new video template',
            action: 'Create a template',
          },
          {
            name: 'Get',
            value: 'get',
            description: 'Get a template by ID',
            action: 'Get a template',
          },
          {
            name: 'List',
            value: 'list',
            description: 'List all templates',
            action: 'List templates',
          },
        ],
        default: 'create',
      },
      ...videoGenerationFields,
      ...templateFields,
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    const resource = this.getNodeParameter('resource', 0) as string;
    const operation = this.getNodeParameter('operation', 0) as string;

    for (let i = 0; i < items.length; i++) {
      try {
        let responseData;

        if (resource === 'video') {
          if (operation === 'generate') {
            responseData = await this.generateVideo(i);
          } else if (operation === 'getStatus') {
            responseData = await this.getVideoStatus(i);
          }
        } else if (resource === 'template') {
          if (operation === 'create') {
            responseData = await this.createTemplate(i);
          } else if (operation === 'get') {
            responseData = await this.getTemplate(i);
          } else if (operation === 'list') {
            responseData = await this.listTemplates(i);
          }
        }

        if (Array.isArray(responseData)) {
          returnData.push(...responseData);
        } else {
          returnData.push({
            json: responseData,
            pairedItem: { item: i },
          });
        }
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: error.message },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }

  private async generateVideo(itemIndex: number) {
    const configurationMode = this.getNodeParameter('configurationMode', itemIndex) as string;
    
    let requestBody: any;

    if (configurationMode === 'simple') {
      // Modo simples - construir payload a partir dos campos individuais
      requestBody = await this.buildSimpleVideoRequest(itemIndex);
    } else {
      // Modo avançado - usar JSON direto
      const jsonPayload = this.getNodeParameter('jsonPayload', itemIndex) as string;
      try {
        requestBody = JSON.parse(jsonPayload);
      } catch (error) {
        throw new NodeOperationError(this.getNode(), 'Invalid JSON payload', {
          itemIndex,
        });
      }
    }

    const response = await this.helpers.requestWithAuthentication.call(
      this,
      'fullVideoEditApiCredentials',
      {
        method: 'POST',
        url: '/api/v1/generate-video',
        body: requestBody,
      },
    );

    return response;
  }

  private async buildSimpleVideoRequest(itemIndex: number) {
    const videoUrls = this.getNodeParameter('videoUrls', itemIndex) as any[];
    const audioUrls = this.getNodeParameter('audioUrls', itemIndex, []) as any[];
    const textOverlays = this.getNodeParameter('textOverlays', itemIndex, []) as any[];
    const outputFormat = this.getNodeParameter('outputFormat', itemIndex, 'mp4') as string;
    const resolution = this.getNodeParameter('resolution', itemIndex, '1920x1080') as string;
    const webhookUrl = this.getNodeParameter('webhookUrl', itemIndex, '') as string;

    return {
      videoUrls: videoUrls.map(video => ({
        url: video.url,
        startTime: video.startTime || 0,
        endTime: video.endTime || 0,
      })),
      audioUrls: audioUrls.map(audio => ({
        url: audio.url,
        volume: audio.volume || 1.0,
        loop: audio.loop || false,
      })),
      textOverlays: textOverlays.map(text => ({
        text: text.text,
        font: text.font || 'Arial',
        color: text.color || '#FFFFFF',
        positionX: text.positionX || 50,
        positionY: text.positionY || 50,
        startTime: text.startTime || 0,
        endTime: text.endTime || 0,
        animation: text.animation || 'none',
      })),
      outputSettings: {
        format: outputFormat,
        resolution: resolution,
      },
      ...(webhookUrl && { webhookUrl }),
    };
  }

  private async getVideoStatus(itemIndex: number) {
    const jobId = this.getNodeParameter('jobId', itemIndex) as string;

    const response = await this.helpers.requestWithAuthentication.call(
      this,
      'fullVideoEditApiCredentials',
      {
        method: 'GET',
        url: `/api/v1/job/${jobId}/status`,
      },
    );

    return response;
  }

  private async createTemplate(itemIndex: number) {
    const templateName = this.getNodeParameter('templateName', itemIndex) as string;
    const templateDescription = this.getNodeParameter('templateDescription', itemIndex, '') as string;
    const templateStructure = this.getNodeParameter('templateStructure', itemIndex) as string;

    let structure;
    try {
      structure = JSON.parse(templateStructure);
    } catch (error) {
      throw new NodeOperationError(this.getNode(), 'Invalid template structure JSON', {
        itemIndex,
      });
    }

    const response = await this.helpers.requestWithAuthentication.call(
      this,
      'fullVideoEditApiCredentials',
      {
        method: 'POST',
        url: '/api/v1/templates',
        body: {
          name: templateName,
          description: templateDescription,
          structure,
        },
      },
    );

    return response;
  }

  private async getTemplate(itemIndex: number) {
    const templateId = this.getNodeParameter('templateId', itemIndex) as string;

    const response = await this.helpers.requestWithAuthentication.call(
      this,
      'fullVideoEditApiCredentials',
      {
        method: 'GET',
        url: `/api/v1/templates/${templateId}`,
      },
    );

    return response;
  }

  private async listTemplates(itemIndex: number) {
    const response = await this.helpers.requestWithAuthentication.call(
      this,
      'fullVideoEditApiCredentials',
      {
        method: 'GET',
        url: '/api/v1/templates',
      },
    );

    return response;
  }
}
```

## 5. Descrições de Campos Organizadas

### 5.1. VideoGenerationDescription.ts

```typescript
import { INodeProperties } from 'n8n-workflow';

export const videoGenerationFields: INodeProperties[] = [
  // Modo de Configuração
  {
    displayName: 'Configuration Mode',
    name: 'configurationMode',
    type: 'options',
    displayOptions: {
      show: {
        resource: ['video'],
        operation: ['generate'],
      },
    },
    options: [
      {
        name: 'Simple',
        value: 'simple',
        description: 'Use individual fields for easy configuration',
      },
      {
        name: 'Advanced (JSON)',
        value: 'advanced',
        description: 'Use raw JSON payload for maximum flexibility',
      },
    ],
    default: 'simple',
    description: 'Choose how to configure the video generation request',
  },

  // Campos do Modo Simples
  {
    displayName: 'Video URLs',
    name: 'videoUrls',
    type: 'fixedCollection',
    displayOptions: {
      show: {
        resource: ['video'],
        operation: ['generate'],
        configurationMode: ['simple'],
      },
    },
    default: {},
    placeholder: 'Add Video URL',
    typeOptions: {
      multipleValues: true,
    },
    options: [
      {
        name: 'videoUrl',
        displayName: 'Video URL',
        values: [
          {
            displayName: 'URL',
            name: 'url',
            type: 'string',
            default: '',
            placeholder: 'https://example.com/video.mp4',
            description: 'URL of the video file',
            required: true,
          },
          {
            displayName: 'Start Time (seconds)',
            name: 'startTime',
            type: 'number',
            default: 0,
            description: 'Start time of the clip in seconds',
          },
          {
            displayName: 'End Time (seconds)',
            name: 'endTime',
            type: 'number',
            default: 0,
            description: 'End time of the clip in seconds (0 = use full video)',
          },
        ],
      },
    ],
    description: 'List of video URLs to include in the generated video',
  },

  {
    displayName: 'Audio URLs',
    name: 'audioUrls',
    type: 'fixedCollection',
    displayOptions: {
      show: {
        resource: ['video'],
        operation: ['generate'],
        configurationMode: ['simple'],
      },
    },
    default: {},
    placeholder: 'Add Audio URL',
    typeOptions: {
      multipleValues: true,
    },
    options: [
      {
        name: 'audioUrl',
        displayName: 'Audio URL',
        values: [
          {
            displayName: 'URL',
            name: 'url',
            type: 'string',
            default: '',
            placeholder: 'https://example.com/audio.mp3',
            description: 'URL of the audio file',
            required: true,
          },
          {
            displayName: 'Volume',
            name: 'volume',
            type: 'number',
            typeOptions: {
              minValue: 0,
              maxValue: 1,
              numberStepSize: 0.1,
            },
            default: 1.0,
            description: 'Audio volume (0.0 to 1.0)',
          },
          {
            displayName: 'Loop',
            name: 'loop',
            type: 'boolean',
            default: false,
            description: 'Whether to loop the audio to fill the video duration',
          },
        ],
      },
    ],
    description: 'List of audio URLs to include in the generated video',
  },

  {
    displayName: 'Text Overlays',
    name: 'textOverlays',
    type: 'fixedCollection',
    displayOptions: {
      show: {
        resource: ['video'],
        operation: ['generate'],
        configurationMode: ['simple'],
      },
    },
    default: {},
    placeholder: 'Add Text Overlay',
    typeOptions: {
      multipleValues: true,
    },
    options: [
      {
        name: 'textOverlay',
        displayName: 'Text Overlay',
        values: [
          {
            displayName: 'Text',
            name: 'text',
            type: 'string',
            default: '',
            placeholder: 'Your text here',
            description: 'Text content to display',
            required: true,
          },
          {
            displayName: 'Font',
            name: 'font',
            type: 'options',
            options: [
              { name: 'Arial', value: 'Arial' },
              { name: 'Helvetica', value: 'Helvetica' },
              { name: 'Times New Roman', value: 'Times New Roman' },
              { name: 'Roboto', value: 'Roboto' },
              { name: 'Impact', value: 'Impact' },
            ],
            default: 'Arial',
            description: 'Font family for the text',
          },
          {
            displayName: 'Color',
            name: 'color',
            type: 'color',
            default: '#FFFFFF',
            description: 'Text color in hexadecimal format',
          },
          {
            displayName: 'Position X (%)',
            name: 'positionX',
            type: 'number',
            typeOptions: {
              minValue: 0,
              maxValue: 100,
            },
            default: 50,
            description: 'Horizontal position as percentage (0-100)',
          },
          {
            displayName: 'Position Y (%)',
            name: 'positionY',
            type: 'number',
            typeOptions: {
              minValue: 0,
              maxValue: 100,
            },
            default: 50,
            description: 'Vertical position as percentage (0-100)',
          },
          {
            displayName: 'Start Time (seconds)',
            name: 'startTime',
            type: 'number',
            default: 0,
            description: 'When to start showing the text',
          },
          {
            displayName: 'End Time (seconds)',
            name: 'endTime',
            type: 'number',
            default: 0,
            description: 'When to stop showing the text (0 = until end)',
          },
          {
            displayName: 'Animation',
            name: 'animation',
            type: 'options',
            options: [
              { name: 'None', value: 'none' },
              { name: 'Fade In', value: 'fade-in' },
              { name: 'Slide Up', value: 'slide-up' },
              { name: 'Slide Down', value: 'slide-down' },
              { name: 'Slide Left', value: 'slide-left' },
              { name: 'Slide Right', value: 'slide-right' },
            ],
            default: 'none',
            description: 'Animation effect for the text',
          },
        ],
      },
    ],
    description: 'List of text overlays to add to the video',
  },

  {
    displayName: 'Output Format',
    name: 'outputFormat',
    type: 'options',
    displayOptions: {
      show: {
        resource: ['video'],
        operation: ['generate'],
        configurationMode: ['simple'],
      },
    },
    options: [
      { name: 'MP4', value: 'mp4' },
      { name: 'WebM', value: 'webm' },
      { name: 'AVI', value: 'avi' },
    ],
    default: 'mp4',
    description: 'Output video format',
  },

  {
    displayName: 'Resolution',
    name: 'resolution',
    type: 'options',
    displayOptions: {
      show: {
        resource: ['video'],
        operation: ['generate'],
        configurationMode: ['simple'],
      },
    },
    options: [
      { name: '4K (3840x2160)', value: '3840x2160' },
      { name: 'Full HD (1920x1080)', value: '1920x1080' },
      { name: 'HD (1280x720)', value: '1280x720' },
      { name: 'SD (854x480)', value: '854x480' },
      { name: 'Mobile (640x360)', value: '640x360' },
    ],
    default: '1920x1080',
    description: 'Output video resolution',
  },

  {
    displayName: 'Webhook URL',
    name: 'webhookUrl',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['video'],
        operation: ['generate'],
        configurationMode: ['simple'],
      },
    },
    default: '',
    placeholder: 'https://your-webhook-url.com/callback',
    description: 'Optional webhook URL to receive completion notification',
  },

  // Modo Avançado (JSON)
  {
    displayName: 'JSON Payload',
    name: 'jsonPayload',
    type: 'json',
    displayOptions: {
      show: {
        resource: ['video'],
        operation: ['generate'],
        configurationMode: ['advanced'],
      },
    },
    default: '{\n  "videoUrls": [],\n  "audioUrls": [],\n  "textOverlays": [],\n  "outputSettings": {\n    "format": "mp4",\n    "resolution": "1920x1080"\n  }\n}',
    description: 'Complete JSON payload for video generation',
    typeOptions: {
      rows: 10,
    },
  },

  // Campo para Get Status
  {
    displayName: 'Job ID',
    name: 'jobId',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['video'],
        operation: ['getStatus'],
      },
    },
    default: '',
    placeholder: 'job_1234567890',
    description: 'ID of the video generation job',
    required: true,
  },
];
```

### 5.2. TemplateDescription.ts

```typescript
import { INodeProperties } from 'n8n-workflow';

export const templateFields: INodeProperties[] = [
  // Create Template
  {
    displayName: 'Template Name',
    name: 'templateName',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['template'],
        operation: ['create'],
      },
    },
    default: '',
    placeholder: 'My Video Template',
    description: 'Name of the template',
    required: true,
  },

  {
    displayName: 'Template Description',
    name: 'templateDescription',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['template'],
        operation: ['create'],
      },
    },
    default: '',
    placeholder: 'Description of what this template does',
    description: 'Optional description of the template',
  },

  {
    displayName: 'Template Structure',
    name: 'templateStructure',
    type: 'json',
    displayOptions: {
      show: {
        resource: ['template'],
        operation: ['create'],
      },
    },
    default: '{\n  "scenes": [],\n  "defaultSettings": {\n    "resolution": "1920x1080",\n    "format": "mp4"\n  }\n}',
    description: 'JSON structure defining the template',
    typeOptions: {
      rows: 8,
    },
    required: true,
  },

  // Get Template
  {
    displayName: 'Template ID',
    name: 'templateId',
    type: 'string',
    displayOptions: {
      show: {
        resource: ['template'],
        operation: ['get'],
      },
    },
    default: '',
    placeholder: 'template_1234567890',
    description: 'ID of the template to retrieve',
    required: true,
  },
];
```

## 6. README.md Aprimorado

```markdown
# n8n-nodes-fullvideoeditapi

![n8n.io - Workflow Automation](https://raw.githubusercontent.com/n8n-io/n8n/master/assets/n8n-logo.png)

This is an n8n community node that allows you to use FullVideoEditAPI in your n8n workflows.

FullVideoEditAPI is a powerful API for generating dynamic videos with templates, perfect for automating video creation workflows.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)  
[Version history](#version-history)  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

1. Go to **Settings > Community Nodes**.
2. Select **Install**.
3. Enter `n8n-nodes-fullvideoeditapi` in **Enter npm package name**.
4. Agree to the [risks](https://docs.n8n.io/integrations/community-nodes/risks/) of using community nodes: select **I understand the risks of installing unverified code from a public source**.
5. Select **Install**.

After installing the node, you can use it like any other node in your workflows.

## Operations

### Video

- **Generate**: Create a new video from templates and assets
- **Get Status**: Check the status of a video generation job

### Template

- **Create**: Create a new reusable video template
- **Get**: Retrieve a template by ID
- **List**: List all available templates

## Credentials

This node requires credentials for FullVideoEditAPI. You'll need:

1. **API Base URL**: The base URL of your FullVideoEditAPI instance
2. **API Key**: Your FullVideoEditAPI authentication key

### How to get credentials

1. Sign up for a FullVideoEditAPI account
2. Navigate to your account settings
3. Generate a new API key
4. Copy the API key and your instance URL

### Setting up credentials in n8n

1. In n8n, go to **Settings > Credentials**
2. Click **Create New**
3. Search for "FullVideoEditAPI" and select it
4. Enter your API Base URL and API Key
5. Click **Save**

## Compatibility

- **n8n version**: 0.208.0 or later
- **Node.js version**: 18.10.0 or later

## Usage

### Basic Video Generation

1. Add the FullVideoEditAPI node to your workflow
2. Select **Video** as the resource and **Generate** as the operation
3. Choose **Simple** configuration mode for easy setup
4. Add your video URLs, audio URLs, and text overlays
5. Configure output settings (format, resolution)
6. Execute the workflow

### Advanced Configuration

For complex video generation scenarios, use the **Advanced (JSON)** configuration mode:

```json
{
  "videoUrls": [
    {
      "url": "https://example.com/video1.mp4",
      "startTime": 0,
      "endTime": 10
    }
  ],
  "audioUrls": [
    {
      "url": "https://example.com/audio.mp3",
      "volume": 0.8,
      "loop": true
    }
  ],
  "textOverlays": [
    {
      "text": "Welcome to FullVideoEditAPI!",
      "font": "Arial",
      "color": "#FFFFFF",
      "positionX": 50,
      "positionY": 20,
      "startTime": 1,
      "endTime": 5,
      "animation": "fade-in"
    }
  ],
  "outputSettings": {
    "format": "mp4",
    "resolution": "1920x1080"
  }
}
```

### Working with Templates

Templates allow you to create reusable video structures:

1. Create a template with your desired structure
2. Use the template ID in video generation requests
3. Override specific parameters as needed

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [FullVideoEditAPI Documentation](https://docs.fullvideoeditapi.com)
- [FullVideoEditAPI GitHub Repository](https://github.com/your-username/fullvideoeditapi)

## Version history

### 1.0.0

- Initial release
- Video generation with multiple clips, audio, and text overlays
- Template management
- Simple and advanced configuration modes
- Webhook support for async notifications
```

## 7. Exemplos de Workflow

### 7.1. basic-video-generation.json

```json
{
  "name": "Basic Video Generation",
  "nodes": [
    {
      "parameters": {},
      "name": "When clicking \"Test workflow\"",
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [820, 380]
    },
    {
      "parameters": {
        "resource": "video",
        "operation": "generate",
        "configurationMode": "simple",
        "videoUrls": {
          "videoUrl": [
            {
              "url": "https://example.com/intro.mp4",
              "startTime": 0,
              "endTime": 5
            },
            {
              "url": "https://example.com/main.mp4"
            }
          ]
        },
        "audioUrls": {
          "audioUrl": [
            {
              "url": "https://example.com/background.mp3",
              "volume": 0.6,
              "loop": true
            }
          ]
        },
        "textOverlays": {
          "textOverlay": [
            {
              "text": "Welcome to our product!",
              "font": "Arial",
              "color": "#FFD700",
              "positionX": 50,
              "positionY": 10,
              "startTime": 1,
              "endTime": 4,
              "animation": "fade-in"
            }
          ]
        },
        "outputFormat": "mp4",
        "resolution": "1920x1080"
      },
      "name": "Generate Video",
      "type": "n8n-nodes-fullvideoeditapi.fullVideoEditApi",
      "typeVersion": 1,
      "position": [1040, 380],
      "credentials": {
        "fullVideoEditApiCredentials": {
          "id": "1",
          "name": "FullVideoEditAPI Account"
        }
      }
    }
  ],
  "connections": {
    "When clicking \"Test workflow\"": {
      "main": [
        [
          {
            "node": "Generate Video",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

## 8. Testes e Validação

### 8.1. Testes de Credenciais

```typescript
// methods/credentialTest.ts
import { ICredentialTestFunctions, INodeCredentialTestResult } from 'n8n-workflow';

export async function credentialTest(
  this: ICredentialTestFunctions,
): Promise<INodeCredentialTestResult> {
  try {
    const credentials = await this.getCredentials('fullVideoEditApiCredentials');
    
    const response = await this.helpers.request({
      method: 'GET',
      url: `${credentials.apiBaseUrl}/health`,
      headers: {
        Authorization: `Bearer ${credentials.apiKey}`,
      },
    });

    if (response.status === 'ok') {
      return {
        status: 'OK',
        message: 'Authentication successful',
      };
    }

    return {
      status: 'Error',
      message: 'Invalid API response',
    };
  } catch (error) {
    return {
      status: 'Error',
      message: `Authentication failed: ${error.message}`,
    };
  }
}
```

### 8.2. Load Options para Campos Dinâmicos

```typescript
// methods/loadOptions.ts
import { ILoadOptionsFunctions, INodePropertyOptions } from 'n8n-workflow';

export async function getTemplates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
  const credentials = await this.getCredentials('fullVideoEditApiCredentials');
  
  const response = await this.helpers.request({
    method: 'GET',
    url: `${credentials.apiBaseUrl}/api/v1/templates`,
    headers: {
      Authorization: `Bearer ${credentials.apiKey}`,
    },
  });

  return response.templates.map((template: any) => ({
    name: template.name,
    value: template.id,
    description: template.description,
  }));
}
```

## 9. Deployment e Publicação

### 9.1. Scripts de Build

```json
{
  "scripts": {
    "build": "tsc && gulp build:icons",
    "dev": "tsc --watch",
    "format": "prettier nodes credentials --write",
    "lint": "eslint nodes credentials package.json",
    "lintfix": "eslint nodes credentials package.json --fix",
    "prepublishOnly": "npm run build && npm run lint -s",
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

### 9.2. Publicação no NPM

```bash
# Build do projeto
npm run build

# Testes
npm test

# Publicação
npm publish
```

Esta especificação aprimorada do nó n8n incorpora as melhores práticas observadas no repositório do Placid, oferecendo uma experiência de usuário superior com modos de configuração flexíveis, documentação abrangente e exemplos práticos.

