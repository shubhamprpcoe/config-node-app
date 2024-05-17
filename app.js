#!/usr/bin/env node

const { execSync } = require('child_process');
const { dir } = require('console');
const fs = require('fs');
const path = require('path');



process.chdir(process.argv[2]);

console.log( process.argv[2])
console.log(process.cwd(),"---->");
console.log(__dirname,"-__dirname--->");



// Get project name and syntax from command line arguments
const projectName = process.argv[3] || 'server';
const syntax = process.argv[4] === 'es7' ? 'es7' : 'es5';

// Create folder with project name
const projectFolderPath = path.join(process.cwd(), projectName);
if (!fs.existsSync(projectFolderPath)) {
  fs.mkdirSync(projectFolderPath);
  console.log(`Folder '${projectName}' created successfully.`);
} else {
  console.log(`Folder '${projectName}' already exists.`);
}

// Change current directory to project folder
process.chdir(projectFolderPath);

// Create .env file and add MONGODB_URI variable
const envFilePath = path.join(projectFolderPath, '.env');
if (!fs.existsSync(envFilePath)) {
  fs.writeFileSync(envFilePath, 'MONGODB_URI=', { encoding: 'utf-8' });
  console.log(`File '${envFilePath}' created successfully.`);
} else {
  console.log(`File '${envFilePath}' already exists.`);
}

// Run npm init -y
console.log('Initializing npm project...');
execSync('npm init -y');

// Add "server" entry in package.json
const packageJsonPath = path.join(projectFolderPath, 'package.json');
const packageJson = require(packageJsonPath);
packageJson.scripts = {
  ...packageJson.scripts,
  server: 'nodemon app.js',
};


// Add "ES7" entry in package.json
if (syntax === 'es7') {
    packageJson.type = 'module';
  }
  
  

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), { encoding: 'utf-8' });
console.log(`Added "server" script to package.json`);

// Install dependencies
console.log('Installing dependencies...');
execSync('npm install express mongoose dotenv cookie-parser nodemon body-parser');

// Database class content
const databaseContentES7 = `
import mongoose from "mongoose";

class Database {
  constructor(uri, options) {
    if (Database.instance) {
      return Database.instance;
    }

    this.uri = uri;
    this.options = options;
    Database.instance = this;
  }

  async connect() {
    try {
      /* await mongoose.connect(this.uri, this.options); 
      console.log(
        \`Connected to database: \${mongoose.connection.db.databaseName}\`
      );
      */
    } catch (error) {
      throw error;
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
      console.log(
        \`Disconnected from database: \${mongoose.connection.db.databaseName}\`
      );
    } catch (error) {
      throw error;
    }
  }
}

export default Database;
`;

const databaseContentES5 = `
const mongoose = require("mongoose");

class Database {
  constructor(uri, options) {
    if (Database.instance) {
      return Database.instance;
    }

    this.uri = uri;
    this.options = options;
    Database.instance = this;
  }

  async connect() {
    try {
      /* await mongoose.connect(this.uri, this.options); 
      console.log(
        \`Connected to database: \${mongoose.connection.db.databaseName}\`
      );
      */
    } catch (error) {
      throw error;
    }
  }

  async disconnect() {
    try {
      await mongoose.disconnect();
      console.log(
        \`Disconnected from database: \${mongoose.connection.db.databaseName}\`
      );
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Database;
`;

const databaseContent = syntax === 'es7' ? databaseContentES7 : databaseContentES5;

const appJsContentES7 = `
import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import Database from './src/config/DB/index.js';
import bodyParser from 'body-parser';

const app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 4000;

const db = new Database(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

db.connect()
  .then(() => {
    /*console.log("Connected to MongoDB");*/
    app.listen(PORT, () => {
      console.log(\`Server running on port \${PORT}\`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to database:", err);
    process.exit(1);
  });

process.on("SIGINT", async () => {
  try {
    await db.disconnect();
    console.log("Disconnected from database.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});
`;

const appJsContentES5 = `
require("dotenv").config();
const express = require("express");
const cookieParser = require('cookie-parser');
const Database = require("./src/config/DB");
var bodyParser = require('body-parser');

const app = express();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 4000;

const db = new Database(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

db.connect()
  .then(() => {
    /*console.log("Connected to MongoDB");*/
    app.listen(PORT, () => {
      console.log(\`Server running on port \${PORT}\`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to database:", err);
    process.exit(1);
  });

process.on("SIGINT", async () => {
  try {
    await db.disconnect();
    console.log("Disconnected from database.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});
`;

const appJsContent = syntax === 'es7' ? appJsContentES7 : appJsContentES5;

// Define folder and file names
const folders = [
  'src',
  'src/controller',
  'src/route',
  'src/model',
  'src/config',
  'src/config/DB',
  'src/config/AWS',
  'src/middlewares',
  'src/middlewares/main',
  'src/services',
  'src/utils',
];

const files = [
  { path: 'src/controller/main.controller.js', content: '// Controller logic for main entity' },
  { path: 'src/route/main.route.js', content: '// Route definitions for main entity' },
  { path: 'src/model/main.model.js', content: '// Model definition for main entity' },
  { path: 'src/config/DB/index.js', content: databaseContent }, // Include Database class content here
  { path: 'src/config/AWS/index.js', content: '// AWS Configuration' },
  { path: 'src/middlewares/main/main.middleware.js', content: '// Middleware logic for main entity' },
  { path: 'src/services/main.services.js', content: '// Service logic for main entity' },
  { path: 'src/utils/index.js', content: '// Utility functions' },
];

// Create folders recursively
folders.forEach((folder) => {
  const folderPath = path.join(projectFolderPath, folder);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`Folder '${folderPath}' created successfully.`);
  } else {
    console.log(`Folder '${folderPath}' already exists.`);
  }
});

// Create files
files.forEach((file) => {
  const filePath = path.join(projectFolderPath, file.path);
  const fileContent = file.content;

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, fileContent, { encoding: 'utf-8' });
    console.log(`File '${filePath}' created successfully.`);
  } else {
    console.log(`File '${filePath}' already exists.`);
  }
});

// Write content to DB/index.js
const dbFilePath = path.join(projectFolderPath, 'src', 'config', 'DB', 'index.js');
if (!fs.existsSync(dbFilePath)) {
  fs.writeFileSync(dbFilePath, databaseContent, { encoding: 'utf-8' });
  console.log(`File '${dbFilePath}' created successfully.`);
} else {
  console.log(`File '${dbFilePath}' already exists.`);
}

// Write content to app.js
const appFilePath = path.join(projectFolderPath, 'app.js');
if (!fs.existsSync(appFilePath)) {
  fs.writeFileSync(appFilePath, appJsContent, { encoding: 'utf-8' });
  console.log(`File '${appFilePath}' created successfully.`);
} else {
  console.log(`File '${appFilePath}' already exists.`);
}
