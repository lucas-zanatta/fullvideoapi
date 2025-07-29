# n8n-nodes-video-editor

This is an n8n community node that allows you to generate dynamic videos from templates using a Video Editor API.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Usage](#usage)  
[Resources](#resources)  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

- **Generate Video**: Create a dynamic video by combining video clips, audio files, and text overlays according to a template structure.

## Credentials

This node requires credentials for your Video Editor API:

- **API Base URL**: The base URL of your Video Editor API
- **API Key**: Your API authentication key

## Compatibility

- Minimum n8n version: 0.175.0
- Tested against n8n version: 1.0.0+

## Usage

1. Add the Video Editor node to your workflow
2. Configure your API credentials
3. Set up your video generation parameters:
   - **Video URLs**: List of video files to include
   - **Audio URLs**: Background music or audio tracks
   - **Text Overlays**: Dynamic text to overlay on the video
   - **Template Structure**: Advanced JSON configuration for complex layouts
   - **Output Settings**: Format and resolution preferences

The node will return a response containing the status and URL of the generated video.

## Resources

- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)
- [Video Editor API Documentation](https://your-video-editor-api.com/docs)

## License

[MIT](https://github.com/your-username/n8n-nodes-video-editor/blob/master/LICENSE.md)

