import os
import fnmatch

TARGETS = {
    "backend": "context_backend.md",
    "frontend": "context_frontend.md",
    "ai-service": "context_ai.md",
    "docker": "context_infrastructure.md",
}
IGNORE_DIRS = {
    ".git",
    ".vs",
    ".vscode",
    ".idea",
    ".github",
    "bin",
    "obj",
    "Properties",
    "node_modules",
    "dist",
    ".angular",
    ".browserslistrc",
    "venv",
    ".venv",
    "env",
    "__pycache__",
    ".pytest_cache",
    "site-packages",
    "logs",
    "coverage",
    "test-results",
    "migrations",
    "Migrations",
    "assets",
    "public",
    ".mypy_cache",
    ".terraform",
    "coverage",
    "lib",
}
IGNORE_FILE_PATTERNS = {
    "package-lock.json",
    "yarn.lock",
    "pnpm-lock.yaml",
    "*.ico",
    "*.png",
    "*.jpg",
    "*.jpeg",
    "*.svg",
    "*.gif",
    "*.bmp",
    "*.tiff",
    "*.dll",
    "*.exe",
    "*.pdb",
    "*.suo",
    "*.user",
    "*.pyc",
    "*.pyo",
    "*.pyd",
    "*.sqlite",
    "*.db",
    "*.db-shm",
    "*.db-wal",
    "*.zip",
    "*.tar",
    "*.gz",
    "*.rar",
    "*.7z",
    "*.pdf",
    "*.doc",
    "*.docx",
    "*.xls",
    "*.xlsx",
    "DS_Store",
    "thumbs.db",
    "*.map",
    "*.min.js",
    "*.min.css",
    "*.Designer.cs",
    "*.generated.cs",
    "LICENSE",
    "*.lock",
}


def should_ignore(name):
    """Проверяет имя файла/папки по списку паттернов."""
    for pattern in IGNORE_FILE_PATTERNS:
        if fnmatch.fnmatch(name, pattern):
            return True
    return False


def is_text_file(file_path):
    """Проверяет, является ли файл текстовым, пытаясь прочитать начало."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            f.read(1024)
        return True
    except (UnicodeDecodeError, PermissionError):
        return False


def get_file_tree(start_path):
    """Генерирует дерево файлов в виде строки."""
    tree_str = []
    for root, dirs, files in os.walk(start_path):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        level = root.replace(start_path, "").count(os.sep)
        indent = "  " * level
        tree_str.append(f"{indent}{os.path.basename(root)}/")
        subindent = "  " * (level + 1)
        for f in files:
            if not should_ignore(f):
                tree_str.append(f"{subindent}{f}")
    return "\n".join(tree_str)


def get_file_language(extension):
    """Определяет язык для подсветки синтаксиса в Markdown."""
    ext_map = {
        ".cs": "csharp",
        ".ts": "typescript",
        ".html": "html",
        ".css": "css",
        ".scss": "scss",
        ".py": "python",
        ".json": "json",
        ".md": "markdown",
        ".yml": "yaml",
        ".yaml": "yaml",
        ".dockerfile": "dockerfile",
        ".sh": "bash",
        ".sql": "sql",
        ".js": "javascript",
    }
    return ext_map.get(extension.lower(), "text")


def process_folder(folder_name, output_file):
    if not os.path.exists(folder_name):
        print(f"Skipping {folder_name} (not found)")
        return
    print(f"Processing {folder_name} -> {output_file}...")
    with open(output_file, "w", encoding="utf-8") as outfile:
        outfile.write(f"# Context for Module: {folder_name.upper()}\n\n")
        outfile.write("## Project Structure Tree\n```text\n")
        outfile.write(get_file_tree(folder_name))
        outfile.write("\n```\n\n")
        outfile.write("## File Contents\n\n")
        file_count = 0
        for root, dirs, files in os.walk(folder_name):
            dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
            for file in files:
                if should_ignore(file):
                    continue
                file_path = os.path.join(root, file)
                if not is_text_file(file_path):
                    continue
                rel_path = os.path.relpath(file_path, ".")
                ext = os.path.splitext(file)[1]
                lang = get_file_language(ext)
                try:
                    with open(
                        file_path, "r", encoding="utf-8", errors="replace"
                    ) as infile:
                        content = infile.read()
                        outfile.write(f"### File: `{rel_path}`\n")
                        outfile.write(f"```{lang}\n")
                        outfile.write(content)
                        outfile.write("\n```\n\n")
                        file_count += 1
                except Exception as e:
                    print(f"Error reading {file_path}: {e}")
    print(f"Done! Saved {file_count} files to {output_file}")


if __name__ == "__main__":
    for folder, outfile in TARGETS.items():
        process_folder(folder, outfile)
    print("\nAll contexts generated successfully.")
