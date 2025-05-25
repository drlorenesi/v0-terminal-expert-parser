# Terminal Export Parser

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/drlorenesis-projects/v0-file-uploader)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/vK857vTY4Vi)

A modern web application built with Next.js that parses and visualizes terminal export data. This tool helps developers and production managers analyze terminal logs and command outputs in a user-friendly interface.

## Features

- **Intuitive Upload Interface**: Upload or drag and drop terminal export files
- **Filtering & Search**: Quickly find specific information within large terminal outputs
- **Export Options**: Save parsed data to Excel format
- **Responsive Design**: Works seamlessly across desktop and mobile devices

## Technologies

- **Framework**: [Next.js](https://nextjs.org/) with App Router
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: React Context API and hooks
- **Parsing Engine**: Custom-built parser with regex pattern matching

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository:

   \`\`\`bash
   git clone https://github.com/yourusername/terminal-export-parser.git
   cd terminal-export-parser
   \`\`\`

2. Install dependencies:

   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. Run the development server:

   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

4. Open http://localhost:3000 in your browser to see the application.

## Usage

1. **Upload Data**: Use the upload area to drag and drop your terminal export file or paste content directly
2. **View Results**: Explore the parsed data in the interactive viewer
3. **Filter & Search**: Use the search bar and filters to find specific information
4. **Export**: Download the parsed data in your preferred format

## Configuration

The application can be configured through environment variables in a .env.local file:

\`\`\`text
## Maximum file size for uploads (in MB)
NEXT_PUBLIC_MAX_UPLOAD_SIZE=10
\`\`\`

To use these environment variables:

Copy the .env.local.example file to .env.local
Modify the values as needed
Restart the development server if it's running
The default maximum upload size is 10 MB if not specified.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (git checkout -b feature/amazing-feature)
3. Commit your changes (git commit -m 'Add some amazing feature')
4. Push to the branch (git push origin feature/amazing-feature)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
