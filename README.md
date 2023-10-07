# Scribo Docs - Google Docs Clone

Scribo Docs is an open-source Google Docs clone that allows multiple users to collaborate and edit documents in real-time. This project is built using React, Socket.io, Quill Editor, Supabase, and more.

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Features

- Real-time collaboration on documents.
- Rich text editing with formatting options.
- Multiple users can collaborate and edit the same document simultaneously.
- Autosave and synchronization of document changes.
- Document sharing via URL.

## Demo

Check out the live demo [here](https://scribo-docs-delta.vercel.app).

## Installation

To run Scribo Docs locally, follow these steps:

1. Clone the repository:

```bash
   git clone https://github.com/your-username/scribo-docs.git
   cd scribo-docs
```

2. Install the dependencies:

```bash
   cd client
   npm install
```

```bash
   cd server
   npm install
```

3. Configuration

To run the Scribo Docs Clone in your local environment, you'll need to make the following configuration changes in the code:

### Server Configuration

In the server/server.js file, update the server configuration to use your local development environment.

```bash
   const io = new Server(3001, {
   cors: {
      origin: "http://localhost:3000", // Update to your local development URL
      methods: ["GET", "POST"],
   },
   });
```

### Client Configuration

In the client/src/TextEditor.js file, update the socket connection to use your local development environment.

```bash
   const s = io("http://localhost:3001"); // Update to your local server URL
```

4. Set up environment variables:

Create a .env file in the server directory and add your Supabase URL and API Key.

```bash
   SUPABASE_URL=your-supabase-url
   SUPABASE_KEY=your-supabase-api-key
```

5. Create a table in Supabase:
   Run the following SQL query in your Supabase database to create a table named documents:

```bash
   CREATE TABLE documents (
      id UUID PRIMARY KEY,
      data JSONB,
      name TEXT
   );
```

6. Start the development server:

- In the client directory:

```bash
   npm start
```

- In the server directory:

```bash
   npm run start
```

7. Visit http://localhost:3000 in your web browser to access Scribo Docs.

## Usage

- Create a new document or share an existing document URL.
- Collaborate with others in real-time by editing the document.
- Document name updates and changes are synchronized across users.
- Use the rich text editor for formatting and styling your content.
- Copy the document URL to share it with others.

## Contributing

Contributions to ScriboDocs are welcome! If you have ideas for improvements or bug fixes, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License.
