#!/usr/bin/env node

import inquirer from "inquirer";
import fs from "fs/promises"; // Using promise-based fs
import path from "path";
import { fileURLToPath } from "url";
import { ensureDir, copy } from "fs-extra";
import chalk from "chalk"; // Importing chalk for console colors

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the directory where templates will be saved
const templatesDir = path.join(__dirname, "templates");

// Ensure that the templates directory exists
await ensureDir(templatesDir);

async function main() {
  try {
    console.log(chalk.blue("Welcome to the Template CLI tool!"));

    // Ask for the template folder location
    const { templateLocation } = await inquirer.prompt([
      {
        type: "input",
        name: "templateLocation",
        message: chalk.cyan("Paste template location:"),
        validate: (input) => (input ? true : "Please enter a valid location."),
      },
    ]);

    // Check if the location exists
    try {
      await fs.access(templateLocation);
    } catch (error) {
      console.log(chalk.red("Template location does not exist."));
      return;
    }

    // Ask if user wants to save it as a template
    const { saveAsTemplate } = await inquirer.prompt([
      {
        type: "confirm",
        name: "saveAsTemplate",
        message: chalk.cyan("Save as template?"),
      },
    ]);

    if (saveAsTemplate) {
      // Ask for the template name
      const { templateName } = await inquirer.prompt([
        {
          type: "input",
          name: "templateName",
          message: chalk.cyan("Template name:"),
          validate: (input) => (input ? true : "Please enter a template name."),
        },
      ]);

      // Copy template folder to the templates directory
      const templatePath = path.join(templatesDir, templateName);
      await copy(templateLocation, templatePath);
      console.log(chalk.green(`Template saved as [${templateName}]!`));
    }

    // Ask for the new project name
    const { projectName } = await inquirer.prompt([
      {
        type: "input",
        name: "projectName",
        message: chalk.cyan("New project name:"),
        validate: (input) => (input ? true : "Please enter a project name."),
      },
    ]);

    // Ask for the template to use
    const availableTemplates = await fs.readdir(templatesDir);
    const { chosenTemplate } = await inquirer.prompt([
      {
        type: "list",
        name: "chosenTemplate",
        message: chalk.cyan("Select a template to create project from:"),
        choices: availableTemplates,
      },
    ]);

    // Copy the chosen template to the new project folder
    const projectPath = path.join(process.cwd(), projectName);
    await copy(path.join(templatesDir, chosenTemplate), projectPath);
    console.log(
      chalk.green(`Creating [${projectName}] from template [${chosenTemplate}]`)
    );
    console.log(chalk.bold.green("Project created successfully!"));
  } catch (err) {
    console.error(chalk.red("An error occurred:"), err);
  }
}

main();
