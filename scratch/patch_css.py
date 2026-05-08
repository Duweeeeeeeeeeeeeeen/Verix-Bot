import os

path = r'dashboard\client\src\styles\globals.css'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Check if font import already exists
if not any('@import' in line and 'Outfit' in line for line in lines):
    lines.insert(0, "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Outfit:wght@400;500;600;700;800;900&display=swap');\n\n")

# Find the end of the first :root block
root_end = -1
for i, line in enumerate(lines):
    if line.strip() == '}':
        root_end = i
        break

if root_end != -1:
    v2_tokens = [
        "  /* V2 Premium Tokens */\n",
        "  --shadow-premium: 0 20px 50px rgba(0, 0, 0, 0.3);\n",
        "  --shadow-lift: 0 30px 60px rgba(0, 0, 0, 0.4);\n",
        "  --ease-premium: cubic-bezier(0.2, 0, 0, 1);\n",
        "  --primary-glow: rgba(99, 102, 241, 0.15);\n"
    ]
    # Check if tokens already exist
    if not any('--shadow-premium' in line for line in lines[:root_end]):
        for j, token_line in enumerate(v2_tokens):
            lines.insert(root_end + j, token_line)

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Globals CSS patched successfully.")
