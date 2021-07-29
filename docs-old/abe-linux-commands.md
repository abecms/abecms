# Replace some text in all your data directory

In a Nutshell:

- Write the regex between single quotes.
- Use '\'' to end up with a single quote in the regex.
- Put a backslash before $.*/[\]^ and only those characters.

## Mac

```bash
find . -type f -name '*.json' -exec sed -i '' 's/My text to replace/My text replaced/g' {} \;
```

## Linux

```bash
find . -type f -name "*.json" -exec sed -i 's/My text to replace/My text replaced/g' {} \;
```
