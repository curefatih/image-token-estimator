# OpenAI Image Token Calculator

A web application that helps calculate token usage for images in OpenAI's vision models. This tool is particularly useful for estimating costs and token consumption when working with GPT-4 Vision and other OpenAI models that support image input.

## Features

* Calculate token usage for images based on dimensions and model settings
* Support for multiple OpenAI models including GPT-4.1, GPT-4O, O1, O3, and more
* Adjustable detail levels (high/low) for token calculation
* Manual dimension input for planning purposes
* Image upload with automatic dimension detection
* Real-time token estimation updates
* Dark mode support
* Responsive design for all screen sizes

## Supported Models

* GPT-4.1
* GPT-4.1 Mini
* GPT-4.1 Nano
* GPT-4O
* GPT-4O Mini
* O1
* O1 Pro
* O3
* O4 Mini
* CUA

## How It Works

The calculator uses OpenAI's official token calculation methodology to estimate token usage for images. The calculation takes into account:

* Image dimensions
* Selected model's base token cost
* Detail level (high/low)
* Model-specific multipliers and tile costs

For high-detail images, the calculator:
* Scales images to fit within a 2048x2048 square
* Ensures the shortest side is at least 768px
* Calculates token usage based on 512px tiles

## Development

This project is built with:

* React + TypeScript
* Vite for fast development and building
* Tailwind CSS for styling
* ESLint for code quality

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is open source and available under the MIT License.

## Disclaimer

These estimates are based on [OpenAI's documentation](https://platform.openai.com/docs/guides/images-vision?api-mode=responses#calculating-costs). We do not accept any responsibility for the accuracy of these estimates.
