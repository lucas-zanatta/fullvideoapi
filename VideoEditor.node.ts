import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeConnectionType,
	NodeOperationError,
} from 'n8n-workflow';

export class VideoEditor implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Video Editor',
		name: 'videoEditor',
		icon: 'file:videoEditor.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Generate dynamic videos from templates',
		defaults: {
			name: 'Video Editor',
		},
		inputs: [{ type: NodeConnectionType.Main }],
		outputs: [{ type: NodeConnectionType.Main }],
		credentials: [
			{
				name: 'videoEditorApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: '={{$credentials.baseUrl}}',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Generate Video',
						value: 'generateVideo',
						description: 'Generate a video from template and media files',
						action: 'Generate a video',
					},
				],
				default: 'generateVideo',
			},
			{
				displayName: 'Video URLs',
				name: 'videoUrls',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
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
								required: true,
								description: 'URL of the video file',
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
								description: 'End time of the clip in seconds (0 = full duration)',
							},
						],
					},
				],
				displayOptions: {
					show: {
						operation: ['generateVideo'],
					},
				},
			},
			{
				displayName: 'Audio URLs',
				name: 'audioUrls',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
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
								required: true,
								description: 'URL of the audio file',
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
								default: 1,
								description: 'Audio volume (0.0 to 1.0)',
							},
							{
								displayName: 'Loop',
								name: 'loop',
								type: 'boolean',
								default: false,
								description: 'Whether to loop the audio to fill video duration',
							},
						],
					},
				],
				displayOptions: {
					show: {
						operation: ['generateVideo'],
					},
				},
			},
			{
				displayName: 'Text Overlays',
				name: 'textOverlays',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				default: {},
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
								required: true,
								description: 'Text content to overlay',
							},
							{
								displayName: 'Font',
								name: 'font',
								type: 'string',
								default: 'Arial',
								description: 'Font family name',
							},
							{
								displayName: 'Color',
								name: 'color',
								type: 'color',
								default: '#FFFFFF',
								description: 'Text color',
							},
							{
								displayName: 'Position X',
								name: 'positionX',
								type: 'number',
								default: 50,
								description: 'Horizontal position (percentage)',
							},
							{
								displayName: 'Position Y',
								name: 'positionY',
								type: 'number',
								default: 50,
								description: 'Vertical position (percentage)',
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
									{
										name: 'None',
										value: 'none',
									},
									{
										name: 'Fade In',
										value: 'fade-in',
									},
									{
										name: 'Slide Up',
										value: 'slide-up',
									},
									{
										name: 'Slide Down',
										value: 'slide-down',
									},
								],
								default: 'none',
								description: 'Text animation type',
							},
						],
					},
				],
				displayOptions: {
					show: {
						operation: ['generateVideo'],
					},
				},
			},
			{
				displayName: 'Template Structure (JSON)',
				name: 'templateStructure',
				type: 'json',
				default: '{}',
				description: 'Advanced template configuration as JSON',
				displayOptions: {
					show: {
						operation: ['generateVideo'],
					},
				},
			},
			{
				displayName: 'Output Format',
				name: 'outputFormat',
				type: 'options',
				options: [
					{
						name: 'MP4',
						value: 'mp4',
					},
					{
						name: 'WebM',
						value: 'webm',
					},
					{
						name: 'AVI',
						value: 'avi',
					},
				],
				default: 'mp4',
				description: 'Output video format',
				displayOptions: {
					show: {
						operation: ['generateVideo'],
					},
				},
			},
			{
				displayName: 'Resolution',
				name: 'resolution',
				type: 'options',
				options: [
					{
						name: '1920x1080 (Full HD)',
						value: '1920x1080',
					},
					{
						name: '1280x720 (HD)',
						value: '1280x720',
					},
					{
						name: '854x480 (SD)',
						value: '854x480',
					},
					{
						name: '640x360',
						value: '640x360',
					},
				],
				default: '1920x1080',
				description: 'Output video resolution',
				displayOptions: {
					show: {
						operation: ['generateVideo'],
					},
				},
			},
			{
				displayName: 'Webhook URL',
				name: 'webhookUrl',
				type: 'string',
				default: '',
				description: 'URL to receive completion notification (optional)',
				displayOptions: {
					show: {
						operation: ['generateVideo'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let i = 0; i < items.length; i++) {
			try {
				const operation = this.getNodeParameter('operation', i) as string;

				if (operation === 'generateVideo') {
					// Get parameters
					const videoUrls = this.getNodeParameter('videoUrls.videoUrl', i, []) as Array<{
						url: string;
						startTime?: number;
						endTime?: number;
					}>;

					const audioUrls = this.getNodeParameter('audioUrls.audioUrl', i, []) as Array<{
						url: string;
						volume?: number;
						loop?: boolean;
					}>;

					const textOverlays = this.getNodeParameter('textOverlays.textOverlay', i, []) as Array<{
						text: string;
						font?: string;
						color?: string;
						positionX?: number;
						positionY?: number;
						startTime?: number;
						endTime?: number;
						animation?: string;
					}>;

					const templateStructure = this.getNodeParameter('templateStructure', i, '{}') as string;
					const outputFormat = this.getNodeParameter('outputFormat', i, 'mp4') as string;
					const resolution = this.getNodeParameter('resolution', i, '1920x1080') as string;
					const webhookUrl = this.getNodeParameter('webhookUrl', i, '') as string;

					// Prepare request body
					const requestBody = {
						videoUrls,
						audioUrls,
						textOverlays,
						templateStructure: JSON.parse(templateStructure),
						outputSettings: {
							format: outputFormat,
							resolution,
						},
						webhookUrl: webhookUrl || undefined,
					};

					// Make API request
					const response = await this.helpers.requestWithAuthentication.call(
						this,
						'videoEditorApi',
						{
							method: 'POST',
							url: '/generate-video',
							body: requestBody,
						},
					);

					returnData.push({
						json: response,
						pairedItem: {
							item: i,
						},
					});
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error instanceof Error ? error.message : String(error),
						},
						pairedItem: {
							item: i,
						},
					});
					continue;
				}
				throw new NodeOperationError(this.getNode(), error instanceof Error ? error : new Error(String(error)), {
					itemIndex: i,
				});
			}
		}

		return [returnData];
	}
}

