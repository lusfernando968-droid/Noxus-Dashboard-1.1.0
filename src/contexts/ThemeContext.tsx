import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSoundEffects } from "@/hooks/useSoundEffects";

type Theme = "light" | "dark" | "system";
type ColorTheme = "noxus" | "default" | "ocean" | "sunset" | "forest" | "purple" | "rose" | "black" | "custom";

type ThemeContextType = {
  theme: Theme;
  colorTheme: ColorTheme;
  customColor: string;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  setColorTheme: (colorTheme: ColorTheme) => void;
  setCustomColor: (color: string) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { playSound } = useSoundEffects();
  const location = useLocation();
  
  const [theme, setThemeState] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    return savedTheme ?? "system";
  });

  // Armazena o tema atual do sistema (claro/escuro)
  const [systemTheme, setSystemTheme] = useState<Exclude<Theme, "system">>(() =>
    window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
  );

  const [colorTheme, setColorThemeState] = useState<ColorTheme>(() => {
    const savedColorTheme = localStorage.getItem("colorTheme") as ColorTheme;
    // Define "noxus" como tema padrão caso não haja preferência salva
    return savedColorTheme || "noxus";
  });

  const [customColor, setCustomColorState] = useState<string>(() => {
    const savedCustomColor = localStorage.getItem("customColor");
    return savedCustomColor || "#3b82f6";
  });

  // Computa o tema efetivo que será aplicado à UI
  const effectiveTheme = useMemo<Exclude<Theme, "system">>(() => (theme === "system" ? systemTheme : theme), [theme, systemTheme]);

  // Observa alterações do tema do SO quando em modo 'system'
  useEffect(() => {
    const mq = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
    if (!mq) return;

    const handler = (e: MediaQueryListEvent) => setSystemTheme(e.matches ? "dark" : "light");
    // Atualiza imediatamente para garantir consistência
    setSystemTheme(mq.matches ? "dark" : "light");

    if (theme === "system") {
      mq.addEventListener?.("change", handler);
    }

    return () => mq.removeEventListener?.("change", handler);
  }, [theme]);

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove todas as classes de tema
    root.classList.remove("light", "dark");
    root.classList.remove(
      "theme-noxus",
      "theme-ocean",
      "theme-sunset",
      "theme-forest",
      "theme-purple",
      "theme-rose",
      "theme-black",
      "theme-custom"
    );
    
    // Adiciona o tema de luz/escuridão efetivo
    root.classList.add(effectiveTheme);

    // Comunica ao navegador os esquemas de cor suportados e o esquema atual
    // Isso melhora controles nativos (inputs, scrollbar, etc.)
    root.style.setProperty("color-scheme", effectiveTheme);
    
    // Adiciona o tema de cor se não for default
    if (colorTheme !== "default") {
      root.classList.add(`theme-${colorTheme}`);
    }

    // Se for tema customizado, aplica a cor personalizada
    if (colorTheme === "custom") {
      const hsl = hexToHsl(customColor);
      root.style.setProperty("--primary", `${hsl.h} ${hsl.s}% ${hsl.l}%`);
      root.style.setProperty("--primary-foreground", hsl.l > 50 ? "0 0% 0%" : "0 0% 100%");
    } else {
      // Remove propriedades customizadas se não for tema custom
      root.style.removeProperty("--primary");
      root.style.removeProperty("--primary-foreground");
    }
    
    localStorage.setItem("theme", theme);
    localStorage.setItem("colorTheme", colorTheme);
    localStorage.setItem("customColor", customColor);
  }, [effectiveTheme, theme, colorTheme, customColor]);

  // Varia a cor do tema NOXUS conforme o módulo/rota atual
  useEffect(() => {
    const root = window.document.documentElement;

    // Apenas aplicar variação quando o tema de cor for "noxus"
    if (colorTheme !== "noxus") {
      // Limpa possíveis overrides quando o usuário trocar de tema
      root.style.removeProperty("--primary");
      root.style.removeProperty("--accent");
      root.style.removeProperty("--ring");
      return;
    }

    const path = location.pathname.toLowerCase();

    // Mapeia rotas para variáveis da paleta Noxus
    const moduleVar = path.startsWith("/clientes")
      ? "--clients"
      : path.startsWith("/projetos")
      ? "--projects"
      : path.startsWith("/agendamentos")
      ? "--schedules"
      : path.startsWith("/financeiro")
      ? "--finance"
      : path.startsWith("/vendas")
      ? "--sales"
      : path.startsWith("/perfil")
      ? "--metas"
      : "--projects"; // página inicial e demais

    // Sobrescreve as variáveis principais com a cor do módulo ativo
    root.style.setProperty("--primary", `var(${moduleVar})`);
    root.style.setProperty("--accent", `var(${moduleVar})`);
    root.style.setProperty("--ring", `var(${moduleVar})`);
    // Foreground permanece como branco para garantir contraste
    root.style.setProperty("--primary-foreground", "0 0% 100%");
  }, [location.pathname, colorTheme]);

  const toggleTheme = () => {
    setThemeState((prev) => {
      const newTheme = prev === "light" ? "dark" : "light";
      playSound(newTheme === "dark" ? "darkMode" : "toggle");
      return newTheme;
    });
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    playSound(newTheme === "dark" ? "darkMode" : "toggle");
  };

  const setColorTheme = (newColorTheme: ColorTheme) => {
    setColorThemeState(newColorTheme);
    playSound("chime");
  };

  const setCustomColor = (color: string) => {
    setCustomColorState(color);
    playSound("pop");
  };

  return (
    <ThemeContext.Provider value={{ theme, colorTheme, customColor, toggleTheme, setTheme, setColorTheme, setCustomColor }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Helper function to convert hex to HSL
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }

    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
