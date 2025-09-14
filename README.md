# Excel AI Interviewer

An intelligent, interactive Excel skills assessment platform powered by AI. This application conducts comprehensive technical interviews to evaluate Excel proficiency across multiple domains including conceptual knowledge, practical tasks, explanations, and behavioral scenarios.

![Excel AI Interviewer](https://img.shields.io/badge/Excel-AI%20Interviewer-blue?style=for-the-badge&logo=microsoft-excel)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

## 🚀 Features

### 🤖 AI-Powered Assessment
- **Intelligent Evaluation**: Uses Google Gemini AI to assess responses and provide detailed feedback
- **Adaptive Questioning**: 8 carefully crafted questions covering all aspects of Excel proficiency
- **Real-time Scoring**: Immediate evaluation with detailed reasoning and recommendations

### 📊 Comprehensive Excel Evaluation
- **Conceptual Knowledge (25%)**: Core Excel concepts, functions, and best practices
- **Practical Tasks (50%)**: Hands-on Excel file creation and manipulation
- **Explanations (15%)**: Ability to articulate Excel strategies and approaches
- **Behavioral Assessment (10%)**: Problem-solving and troubleshooting scenarios

### 📁 File Processing Capabilities
- **Excel File Upload**: Support for `.xlsx` and `.xls` files
- **Automated Analysis**: Evaluates formulas, structure, and best practices
- **Template Downloads**: Provides structured templates for practical tasks
- **File Size Limit**: 10MB maximum upload size

### 📈 Progress Tracking
- **Session Management**: Track interview progress across multiple sessions
- **History View**: Review past interviews and scores
- **Detailed Results**: Comprehensive breakdown of performance by category
- **Progress Indicators**: Visual feedback on interview completion status

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **TanStack Query** for state management
- **Wouter** for routing

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Drizzle ORM** for database operations
- **Neon PostgreSQL** for data storage
- **Google Gemini AI** for intelligent evaluation
- **Multer** for file upload handling

### Additional Tools
- **XLSX** library for Excel file processing
- **Cross-env** for environment management
- **ESBuild** for production bundling
- **dotenv** for environment configuration

## 📋 Prerequisites

Before running the application, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **PostgreSQL database** (Neon recommended)
- **Google Gemini API key**
- **Git** for version control

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/excel-interviewer.git
   cd excel-interviewer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   DATABASE_URL=postgresql://username:password@host/database?sslmode=require
   
   # AI Configuration
   GEMINI_API_KEY=your_gemini_api_key_here
   
   # Server Configuration (optional)
   PORT=5000
   NODE_ENV=development
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## 📊 Database Setup

### Using Neon PostgreSQL (Recommended)

1. **Create a Neon account** at [neon.tech](https://neon.tech)
2. **Create a new project** and database
3. **Copy the connection string** from the dashboard
4. **Add to your `.env` file** as `DATABASE_URL`

### Using Local PostgreSQL

1. **Install PostgreSQL** locally
2. **Create a database** for the application
3. **Format connection string**:
   ```
   postgresql://username:password@localhost:5432/your_database_name
   ```

## 🔑 API Keys Setup

### Google Gemini AI

1. **Visit** [Google AI Studio](https://aistudio.google.com)
2. **Create an API key** for Gemini
3. **Add to `.env`** as `GEMINI_API_KEY`

## 🏗️ Project Structure

```
excel-interviewer/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions
│   │   └── types/          # TypeScript type definitions
│   └── index.html
├── server/                 # Backend Express application
│   ├── services/           # Business logic services
│   │   ├── interviewService.ts
│   │   ├── excelProcessor.ts
│   │   └── gemini.ts
│   ├── db.ts              # Database connection
│   ├── storage.ts         # Data access layer
│   ├── routes.ts          # API route definitions
│   └── index.ts           # Server entry point
├── shared/                 # Shared code between client/server
│   └── schema.ts          # Database schema and types
├── uploads/               # Temporary file storage
├── dist/                  # Production build output
└── package.json
```

## 🎯 Usage

### Starting an Interview

1. **Navigate** to the application homepage
2. **Click** "Start Interview" to begin
3. **Respond** to the AI interviewer's welcome message
4. **Answer** 8 questions across different categories

### Question Types

- **Conceptual**: Multiple choice and short answer questions about Excel features
- **Practical**: File upload tasks requiring Excel file creation/modification
- **Explanation**: Describe your approach to solving Excel problems
- **Behavioral**: Scenario-based questions about troubleshooting

### Viewing Results

1. **Complete** all interview questions
2. **Review** your detailed performance breakdown
3. **Access** interview history from the sidebar
4. **Download** certificates or reports (if implemented)

## 🚀 Production Deployment

### Build the Application

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Environment Variables for Production

```env
NODE_ENV=production
DATABASE_URL=your_production_database_url
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```

### Deployment Platforms

The application can be deployed on:
- **Vercel** (recommended for full-stack)
- **Railway**
- **Render**
- **DigitalOcean App Platform**
- **AWS/GCP/Azure**

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes

## 🎨 Customization

### Adding New Questions

Edit `server/services/interviewService.ts`:

```typescript
private static readonly QUESTION_TEMPLATES: InterviewQuestionTemplate[] = [
  {
    category: 'conceptual',
    question: 'Your custom question here',
    expectedAnswer: 'Expected answer for AI evaluation',
  },
  // Add more questions...
];
```

### Modifying AI Evaluation

Update `server/services/gemini.ts` to customize:
- Evaluation criteria
- Scoring algorithms
- Feedback generation

### Styling Changes

- Edit `client/src/index.css` for global styles
- Modify `tailwind.config.ts` for theme customization
- Update component styles in individual `.tsx` files

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Verify `DATABASE_URL` is correct
   - Check network connectivity
   - Ensure database exists

2. **AI Evaluation Not Working**
   - Verify `GEMINI_API_KEY` is valid
   - Check API quota and billing
   - Review network firewall settings

3. **File Upload Issues**
   - Ensure `uploads/` directory exists
   - Check file size limits
   - Verify file format (Excel only)

4. **Build Errors**
   - Run `npm install` to update dependencies
   - Check TypeScript errors with `npm run check`
   - Clear `node_modules` and reinstall if needed

### Debug Mode

Set `NODE_ENV=development` for detailed logging and error messages.

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Maintain test coverage
- Use conventional commit messages
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for intelligent evaluation capabilities
- **Neon** for providing excellent PostgreSQL hosting
- **Radix UI** for accessible component primitives
- **Tailwind CSS** for utility-first styling
- **React** and **Node.js** communities for excellent tooling

## 📞 Support

For support, email [your-email@example.com] or open an issue on GitHub.

---

**Built with ❤️ for Excel enthusiasts and technical recruiters**