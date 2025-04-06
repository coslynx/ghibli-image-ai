<div class="hero-icon" align="center">
  <img src="https://raw.githubusercontent.com/PKief/vscode-material-icon-theme/ec559a9f6bfd399b82bb44393651661b08aaf7ba/icons/folder-markdown-open.svg" width="100" />
</div>

<h1 align="center">
ghibli-image-ai
</h1>
<h4 align="center">Transforms user-uploaded images into the enchanting Studio Ghibli art style using the OpenAI DALL-E API.</h4>
<h4 align="center">Developed with the software and tools below.</h4>
<div class="badges" align="center">
  <img src="https://img.shields.io/badge/Framework-React_19-61DAFB?logo=react" alt="Framework: React 19">
  <img src="https://img.shields.io/badge/Language-TypeScript_5-3178C6?logo=typescript" alt="Language: TypeScript 5">
  <img src="https://img.shields.io/badge/Frontend-Vite_|_Tailwind_CSS-646CFF?logo=vite" alt="Frontend: Vite | Tailwind CSS">
  <img src="https://img.shields.io/badge/Backend-Node.js_|_Vercel_Functions-339933?logo=nodedotjs" alt="Backend: Node.js | Vercel Functions">
  <img src="https://img.shields.io/badge/AI_API-OpenAI_DALL·E_2-412991?logo=openai" alt="AI API: OpenAI DALL-E 2">
</div>
<div class="badges" align="center">
  <img src="https://img.shields.io/github/last-commit/coslynx/ghibli-image-ai?style=flat-square&color=5D6D7E" alt="git-last-commit" />
  <img src="https://img.shields.io/github/commit-activity/m/coslynx/ghibli-image-ai?style=flat-square&color=5D6D7E" alt="GitHub commit activity" />
  <img src="https://img.shields.io/github/languages/top/coslynx/ghibli-image-ai?style=flat-square&color=5D6D7E" alt="GitHub top language" />
</div>

## 📑 Table of Contents
- 📍 Overview
- 📦 Features
- 📂 Structure
- 💻 Installation
- 🏗️ Usage
- 🌐 Hosting
- 📜 API Documentation
- 📄 License
- 👏 Authors

## 📍 Overview
The `ghibli-image-ai` repository contains a Minimum Viable Product (MVP) that allows users to upload an image and receive a transformed version mimicking the distinct visual style of Studio Ghibli films. This is achieved by leveraging OpenAI's DALL-E 2 image editing capabilities via a simple web interface. The tech stack includes React (with Vite) for the frontend, Tailwind CSS for styling, TypeScript for type safety, and a Node.js backend deployed as a Vercel Serverless Function to handle communication with the OpenAI API securely.

## 📦 Features
|    | Feature            | Description                                                                                                                                |
|----|--------------------|--------------------------------------------------------------------------------------------------------------------------------------------|
| ⚙️ | **Architecture**   | Frontend built with React & Vite, styled with Tailwind CSS. Backend is a Node.js Vercel Serverless Function interacting with the OpenAI API. Follows a component-based UI structure with custom hooks for state management. |
| 🖼️ | **Image Upload**   | User-friendly drag-and-drop or click-to-select image uploader (`react-dropzone`) with validation for file type (PNG, JPEG, WEBP) and size (Max 4MB/5MB Frontend). |
| ✨ | **AI Transformation**| Utilizes OpenAI's DALL-E 2 `images.createEdit` API endpoint to apply a "Studio Ghibli style" prompt to the uploaded image.                       |
| 🖥️ | **Result Display** | Displays the generated Ghibli-style image upon successful processing or shows clear error messages if the process fails.                     |
| 🔄 | **Loading State**  | Provides visual feedback (loading spinner) to the user while the image is being processed by the backend and OpenAI.                     |
| 🔒 | **Security**       | Handles the OpenAI API key securely on the backend (via environment variables) and implements basic input validation on both client and server. |
| 🧪 | **Testing**        | Includes unit/integration tests using Vitest and React Testing Library for the core API endpoint (`api/generate.ts`) and key UI components (`ImageUploader.tsx`). |
| 📄 | **Documentation**  | This README provides an overview, setup instructions, usage guide, and API details. Code includes JSDoc/TSDoc comments.                |
| 🔗 | **Dependencies**   | Key dependencies include `react`, `react-dom`, `openai`, `axios`, `react-dropzone`, `vite`, `tailwindcss`, `typescript`, `@vercel/node`.      |
| 🧩 | **Modularity**     | Well-structured codebase with separate directories for components (`src/components`), hooks (`src/hooks`), types (`src/types`), styles (`src/styles`), API logic (`api`), and tests (`tests`). |
| 🚀 | **Deployment**     | Designed for easy deployment on the Vercel platform, leveraging serverless functions for the backend logic.                            |
| ⚡️  | **Performance**    | Frontend performance optimized by Vite. Backend performance depends on Vercel function execution and OpenAI API response times.       |

## 📂 Structure
```text
ghibli-image-ai/
├── api/
│   └── generate.ts         # Vercel Serverless Function for OpenAI interaction
├── public/
│   └── favicon.ico         # Application favicon
├── src/
│   ├── components/         # Reusable React UI components
│   │   ├── ErrorMessage.tsx
│   │   ├── ImageDisplay.tsx
│   │   ├── ImageUploader.tsx
│   │   └── LoadingSpinner.tsx
│   ├── hooks/              # Custom React hooks
│   │   └── useImageGenerator.ts # Hook for managing generation state and API calls
│   ├── styles/             # Styling files
│   │   └── global.css      # Global CSS and Tailwind directives
│   ├── types/              # TypeScript type definitions
│   │   └── api.ts          # API request/response types
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Application entry point
├── tests/
│   ├── api/
│   │   └── generate.test.ts # Tests for the API handler
│   └── components/
│       └── ImageUploader.test.tsx # Tests for the ImageUploader component
├── .env                    # Local environment variables (GITIGNORED!)
├── .eslintrc.cjs           # ESLint configuration
├── .gitignore              # Git ignore rules
├── .prettierrc             # Prettier configuration
├── package.json            # Project dependencies and scripts
├── postcss.config.js       # PostCSS configuration (for Tailwind/Autoprefixer)
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration (frontend)
├── tsconfig.node.json      # TypeScript configuration (backend/Node.js)
├── vite.config.js          # Vite configuration
├── README.md               # This file
└── (other config files like yarn.lock or package-lock.json)
```

## 💻 Installation
  > [!WARNING]
  > ### 🔧 Prerequisites
  > - **Node.js:** v18.0.0 or higher (check `package.json` engines)
  > - **npm** or **yarn:** Package manager
  > - **Vercel CLI:** Required for local development (`npm install -g vercel`)
  > - **OpenAI API Key:** Obtain from [OpenAI Platform](https://platform.openai.com/)

  ### 🚀 Setup Instructions
  1.  **Clone the repository:**
      ```bash
      git clone https://github.com/coslynx/ghibli-image-ai.git
      cd ghibli-image-ai
      ```
  2.  **Install dependencies:**
      ```bash
      npm install
      # or
      yarn install
      ```
  3.  **Configure environment variables:**
      *   Create a `.env` file in the root directory.
      *   Copy the contents from the provided `.env` file structure or create it manually.
      *   Add your OpenAI API key:
          ```env
          # .env
          OPENAI_API_KEY=your_openai_api_key_here
          ```
      > [!IMPORTANT]
      > Ensure the `.env` file is listed in your `.gitignore` file to prevent committing your API key.

## 🏗️ Usage
  ### 🏃‍♂️ Running the MVP Locally
  1.  **Start the development server:**
      This command uses the Vercel CLI to run the frontend (via Vite) and the serverless function locally, mimicking the Vercel environment.
      ```bash
      npm run dev
      # or
      vercel dev
      ```
  2.  **Access the application:**
      *   The Vercel CLI will output the local URL, typically `http://localhost:3000` for the Vercel Functions and `http://localhost:5173` (or similar) for the Vite frontend. Open the Vite frontend URL in your browser. The `vite.config.js` proxy ensures API calls from the frontend reach the local serverless function.

  > [!TIP]
  > ### ⚙️ Configuration
  > - The primary configuration is the `OPENAI_API_KEY` in the `.env` file, required for the backend function to authenticate with OpenAI.
  > - File upload constraints (size, type) are defined in `src/components/ImageUploader.tsx` (frontend validation) and `api/generate.ts` (backend validation).
  > - The specific OpenAI prompt (`GHIBLI_PROMPT`) is defined in `api/generate.ts`.

  ### ✨ How it Works
  1.  Open the application in your web browser.
  2.  Use the drag-and-drop area or click to select a `.png`, `.jpg`, `.jpeg`, or `.webp` image file (max 5MB for frontend check, 4MB backend limit).
  3.  The application uploads the image to the backend `/api/generate` endpoint.
  4.  The backend function sends the image and a predefined "Ghibli style" prompt to the OpenAI DALL-E API.
  5.  While processing, a loading spinner is displayed.
  6.  If successful, the generated Ghibli-style image is displayed.
  7.  If an error occurs (e.g., invalid file, OpenAI issue, server error), an error message is shown.

## 🌐 Hosting
  ### 🚀 Deployment Instructions (Vercel)
  This project is optimized for deployment on [Vercel](https://vercel.com/).

  1.  **Push to GitHub/GitLab/Bitbucket:** Ensure your code, including the `api` directory and all configurations, is pushed to a Git repository.
  2.  **Import Project on Vercel:**
      *   Log in to your Vercel account.
      *   Click "Add New..." -> "Project".
      *   Import the Git repository you just pushed.
  3.  **Configure Project Settings:**
      *   Vercel should automatically detect the framework preset (Vite).
      *   Ensure the "Root Directory" is correctly set (usually the repository root).
      *   The build command (`npm run build` or `yarn build`) and output directory (`dist`) should be detected automatically from `package.json` and `vite.config.js`.
  4.  **Set Environment Variables:**
      *   Navigate to your project's settings on Vercel -> "Environment Variables".
      *   Add the `OPENAI_API_KEY` with your actual OpenAI API key as its value. Ensure it's available for the "Production" environment (and "Preview"/"Development" if needed).
  5.  **Deploy:** Click the "Deploy" button. Vercel will build the frontend and deploy the serverless function.

  ### 🔑 Environment Variables (Production)
  The following environment variable MUST be set in your Vercel project settings for the application to function:

  - `OPENAI_API_KEY`: Your secret OpenAI API key. Required by the `api/generate.ts` serverless function.

## 📜 API Documentation
  ### 🔍 Endpoint

  - **`POST /api/generate`**
    - **Description:** Accepts an image file upload and generates a Ghibli-styled version using OpenAI DALL-E.
    - **Request:**
      - **Method:** `POST`
      - **Headers:** `Content-Type: multipart/form-data`
      - **Body:** Form data containing a single field:
        - `image`: The image file (`.png`, `.jpg`, `.jpeg`). Max size 4MB (enforced by backend).
    - **Response (Success - `200 OK`):**
      - **Content-Type:** `application/json`
      - **Body:** `GenerateSuccessResponse`
        ```json
        {
          "imageUrl": "https://example-openai-url.com/generated-image.png"
        }
        ```
    - **Response (Error):**
      - **Content-Type:** `application/json`
      - **Status Codes:**
        - `400 Bad Request`: Invalid input (no file, wrong type, too large, multiple files).
        - `405 Method Not Allowed`: Request method was not `POST`.
        - `429 Too Many Requests`: Rate limit error from OpenAI (propagated status).
        - `500 Internal Server Error`: Server configuration issue (missing API key), OpenAI API failure, or other unexpected server errors.
      - **Body:** `GenerateErrorResponse`
        ```json
        {
          "error": "Descriptive error message string"
        }
        ```

  ### 🔒 Authentication
  - The `/api/generate` endpoint itself does not require user authentication in this MVP.
  - Authentication with the OpenAI API is handled server-side using the `OPENAI_API_KEY` environment variable within the Vercel Function. **Never expose your OpenAI API key to the frontend.**

  ### 📝 Examples
  Interaction with the API is intended through the web UI. A direct API call example using `curl`:

  ```bash
  # Replace 'path/to/your/image.png' with the actual file path
  # Replace 'YOUR_DEPLOYED_URL' with the URL where the app is hosted
  curl -X POST YOUR_DEPLOYED_URL/api/generate \
    -F "image=@path/to/your/image.png" \
    -o response.json # Save response to a file

  # Example Success (response.json):
  # { "imageUrl": "https://oaidalleapiprodscus.blob.core.windows.net/private/..." }

  # Example Error (response.json):
  # { "error": "Image file too large. Maximum size is 4MB." }
  ```


  > [!NOTE]
  > ## 📜 License & Attribution
  >
  > ### 📄 License
  > This Minimum Viable Product (MVP) is licensed under the [GNU AGPLv3](https://choosealicense.com/licenses/agpl-3.0/) license.
  >
  > ### 🤖 AI-Generated MVP
  > This MVP was entirely generated using artificial intelligence through [CosLynx.com](https://coslynx.com).
  >
  > No human was directly involved in the coding process of the repository: ghibli-image-ai
  >
  > ### 📞 Contact
  > For any questions or concerns regarding this AI-generated MVP, please contact CosLynx at:
  > - Website: [CosLynx.com](https://coslynx.com)
  > - Twitter: [@CosLynxAI](https://x.com/CosLynxAI)

<p align="center">
  <h1 align="center">🌐 CosLynx.com</h1>
</p>
<p align="center">
  <em>Create Your Custom MVP in Minutes With CosLynxAI!</em>
</p>
<div class="badges" align="center">
<img src="https://img.shields.io/badge/Developers-Drix10,_Kais_Radwan-red" alt="">
<img src="https://img.shields.io/badge/Website-CosLynx.com-blue" alt="">
<img src="https://img.shields.io/badge/Backed_by-Google,_Microsoft_&_Amazon_for_Startups-red" alt="">
<img src="https://img.shields.io/badge/Finalist-Backdrop_Build_v4,_v6-black" alt="">
</div>