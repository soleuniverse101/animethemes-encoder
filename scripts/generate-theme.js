import { writeFileSync } from "fs";
import { getColors } from "theme-colors";

// Click the following link and paste the result of a CSS OKLCH export with Themes and Shades enabled
const link = "https://www.realtimecolors.com/?colors=72658c-f5f2fa-9f93b8-caa0b9-319488";

const style = `
:root[data-theme="light"] {
  --text: #72658c;
  --background: #f5f2fa;
  --primary: #9f93b8;
  --secondary: #caa0b9;
  --accent: #319488;
}
:root[data-theme="dark"] {
  --text: #81749a;
  --background: #09060f;
  --primary: #52476c;
  --secondary: #5f354e;
  --accent: #6acdc2;
}
`;

const parts = style.split("}");

function cssFromPart(part) {
  const lines = part.split("\n").slice(2, -1);

  const colors = {};
  for (const line of lines) {
    const name = line.split(":")[0].slice(4);
    const value = line.split(":")[1].slice(1, -1);
    colors[name] = value;
  }

  const varsGroups = [];
  const themeGroups = [];
  for (const [name, base] of Object.entries(colors)) {
    const generatedColors = getColors(base);
    const result = Object.entries(generatedColors)
      .map(([shade, color]) => `    --color-${name}-${shade}: ${color.toLowerCase()};`)
      .join("\n");
    varsGroups.push(result);
    themeGroups.push(
      [
        `  --color-${name}: var(--color-${name}-500);`,
        ...Object.keys(generatedColors).map(
          (shade) => `  --color-${name}-${shade}: var(--color-${name}-${shade});`
        )
      ].join("\n")
    );
  }

  return [varsGroups.join("\n\n"), themeGroups.join("\n\n")];
}

const result = `/* ${link} */
@layer base {
  :root {
${cssFromPart(parts[0])[0]}
  }

  :root[data-theme="dark"] {
${cssFromPart(parts[1])[0]}
  }
}

@theme inline {
${cssFromPart(parts[0])[1]}
}
`;

writeFileSync("./src/style/theme.generated.css", result);
